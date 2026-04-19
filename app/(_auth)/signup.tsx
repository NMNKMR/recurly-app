import MyPasswordInput from "@/components/core/MyPasswordInput";
import OtpInput from "@/components/core/OtpInput";
import SafeAreaView from "@/components/core/StyledSafeAreaView";
import Logo from "@/components/shared/Logo";
import { colors } from "@/constants/theme";
import { useAuth, useClerk, useSignUp } from "@clerk/expo";
import { clsx } from "clsx";
import * as ImagePicker from "expo-image-picker";
import { type Href, Link, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const avatarUploadRef = useRef<{ base64: string; mimeType: string } | null>(
    null,
  );
  const [localErrors, setLocalErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  }>({});
  const [generalError, setGeneralError] = useState("");

  const isLoading = fetchStatus === "fetching";

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAvatarUri(asset.uri);
      avatarUploadRef.current =
        asset.base64 && asset.mimeType
          ? { base64: asset.base64, mimeType: asset.mimeType }
          : null;
    }
  };

  const validate = () => {
    const errs: typeof localErrors = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress))
      errs.email = "Enter a valid email address";
    if (password.length < 8)
      errs.password = "Password must be at least 8 characters";
    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setGeneralError("");
    try {
      const { error } = await signUp.password({
        emailAddress,
        password,
        firstName,
        lastName,
      });
      if (error) return;

      await signUp.verifications.sendEmailCode();
    } catch (err: any) {
      setGeneralError(
        err?.message || "Something went wrong. Please try again.",
      );
    }
  };

  const handleVerify = async (otpCode: string) => {
    setGeneralError("");
    try {
      await signUp.verifications.verifyEmailCode({ code: otpCode });

      if (signUp.status === "complete") {
        let redirectUrl: Href | null = null;
        let hasCurrentTask = false;

        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              hasCurrentTask = true;
              return;
            }
            redirectUrl = decorateUrl("/(tabs)") as Href;
          },
        });

        if (hasCurrentTask || !redirectUrl) return;

        // Upload avatar before navigating — clerk.user is available after finalize
        if (avatarUploadRef.current && clerk.user) {
          try {
            await clerk.user.setProfileImage({
              file:
                `data:${
                  avatarUploadRef.current.mimeType || "image/jpeg"
                };base64,` + avatarUploadRef.current,
            });
          } catch (err) {
            console.warn("Avatar upload failed:", err);
          }
        }

        router.replace(redirectUrl);
      }
    } catch (err: any) {
      setGeneralError(
        err?.message || "Something went wrong. Please try again.",
      );
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  // Verification step
  const needsVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  if (needsVerification) {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView className="auth-screen" behavior="padding">
          <ScrollView
            className="auth-scroll"
            contentContainerClassName="grow"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="auth-content">
              <View className="auth-brand-block">
                <View className="auth-logo-wrap">
                  <Logo />
                  <View>
                    <Text className="auth-wordmark">Recurly</Text>
                    <Text className="auth-wordmark-sub">SMART BILLING</Text>
                  </View>
                </View>

                <Text className="auth-title">Verify your email</Text>
                <View className="justify-center">
                  <Text className="auth-subtitle">
                    We sent a verification code to
                  </Text>
                  <Text className="auth-subtitle mt-0!">{emailAddress}</Text>
                </View>
              </View>

              <View className="auth-card">
                <View className="auth-form">
                  <OtpInput
                    onComplete={handleVerify}
                    error={generalError || errors?.fields?.code?.message || ""}
                    disabled={isLoading}
                  />

                  {isLoading ? (
                    <ActivityIndicator color={colors.foreground} />
                  ) : null}

                  <View className="auth-divider-row">
                    <View className="auth-divider-line" />
                    <Text className="auth-divider-text">or</Text>
                    <View className="auth-divider-line" />
                  </View>

                  <TouchableOpacity
                    className="auth-secondary-button"
                    onPress={() => signUp.verifications.sendEmailCode()}
                    activeOpacity={0.8}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend code
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Registration step
  const isSubmitDisabled =
    isLoading ||
    !emailAddress ||
    !password ||
    !firstName.trim() ||
    !lastName.trim();

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView className="auth-screen" behavior="padding">
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <Logo />
                <View>
                  <Text className="auth-wordmark">Recurly</Text>
                  <Text className="auth-wordmark-sub">SMART BILLING</Text>
                </View>
              </View>

              <Text className="auth-title">Create account</Text>
              <Text className="auth-subtitle">
                Start managing your subscriptions smarter
              </Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                {/* Avatar Picker */}
                <TouchableOpacity
                  className="self-center items-center gap-2"
                  onPress={pickAvatar}
                  activeOpacity={0.8}
                >
                  {avatarUri ? (
                    <Image
                      source={{ uri: avatarUri }}
                      className="size-20 rounded-full"
                    />
                  ) : (
                    <View className="size-20 items-center justify-center rounded-full bg-background border-2 border-dotted border-border">
                      <Text className="text-4xl text-muted-foreground">+</Text>
                    </View>
                  )}
                  <Text className="auth-helper">Avatar (optional)</Text>
                </TouchableOpacity>

                <View className="flex-row gap-3">
                  <View className="auth-field flex-1">
                    <Text className="auth-label">First name</Text>
                    <TextInput
                      className="auth-input"
                      placeholder="First name"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                    {(localErrors.firstName || errors?.fields?.firstName) && (
                      <Text className="auth-error">
                        {localErrors.firstName ||
                          errors?.fields?.firstName?.message}
                      </Text>
                    )}
                  </View>
                  <View className="auth-field flex-1">
                    <Text className="auth-label">Last name</Text>
                    <TextInput
                      className="auth-input"
                      placeholder="Last name"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      value={lastName}
                      onChangeText={setLastName}
                    />
                    {(localErrors.lastName || errors?.fields?.lastName) && (
                      <Text className="auth-error">
                        {localErrors.lastName ||
                          errors?.fields?.lastName?.message}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className="auth-input"
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  {(localErrors.email || errors?.fields?.emailAddress) && (
                    <Text className="auth-error">
                      {localErrors.email ||
                        errors?.fields?.emailAddress?.message}
                    </Text>
                  )}
                </View>

                <MyPasswordInput
                  password={password}
                  setPassword={setPassword}
                  error={
                    localErrors.password ||
                    errors?.fields?.password?.message ||
                    ""
                  }
                />

                {generalError ? (
                  <Text className="auth-error">{generalError}</Text>
                ) : null}

                <TouchableOpacity
                  className={clsx(
                    "auth-button",
                    isSubmitDisabled && "auth-button-disabled",
                  )}
                  onPress={handleSubmit}
                  disabled={isSubmitDisabled}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.foreground} />
                  ) : (
                    <Text className="auth-button-text">Create account</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View className="auth-link-row">
                <Text className="auth-link-copy">Already have an account?</Text>
                <Link href="/(_auth)/signin" replace>
                  <Text className="auth-link">Sign in</Text>
                </Link>
              </View>

              {/* Required for sign-up flows — Clerk bot protection */}
              <View nativeID="clerk-captcha" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
