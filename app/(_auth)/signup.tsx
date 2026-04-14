import MyPasswordInput from "@/components/core/MyPasswordInput";
import SafeAreaView from "@/components/core/StyledSafeAreaView";
import Logo from "@/components/shared/Logo";
import { useAuth, useSignUp, useUser } from "@clerk/expo";
import * as ImagePicker from "expo-image-picker";
import { type Href, Link, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
  const { user } = useUser();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [localErrors, setLocalErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const isLoading = fetchStatus === "fetching";

  // Upload avatar once user becomes available after sign-up
  const pendingAvatarUpload = useRef(false);
  useEffect(() => {
    if (user && pendingAvatarUpload.current && avatarUri) {
      (async () => {
        try {
          const response = await fetch(avatarUri);
          const blob = await response.blob();
          await user.setProfileImage({ file: blob });
        } catch {}
        pendingAvatarUpload.current = false;
      })();
    }
  }, [user, avatarUri]);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const validate = () => {
    const errs: typeof localErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress))
      errs.email = "Enter a valid email address";
    if (password.length < 8)
      errs.password = "Password must be at least 8 characters";
    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    const fName = firstName.trim();
    const lName = lastName.trim();

    if (!fName || !lName) return;
    if (!validate()) return;

    const { error } = await signUp.password({
      emailAddress,
      password,
      firstName,
      lastName,
    });
    if (error) return;

    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      if (avatarUri) {
        pendingAvatarUpload.current = true;
      }
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/(tabs)");
          router.replace(url as Href);
        },
      });
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
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className="auth-input"
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                    />
                    {errors?.fields?.code && (
                      <Text className="auth-error">
                        {errors.fields.code.message}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    className={`auth-button ${isLoading ? "auth-button-disabled" : ""}`}
                    onPress={handleVerify}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Verify email</Text>
                    )}
                  </TouchableOpacity>

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
                  <View className="auth-field grow">
                    <Text className="auth-label">First name</Text>
                    <TextInput
                      className="auth-input"
                      placeholder="First name"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </View>
                  <View className="auth-field grow">
                    <Text className="auth-label">Last name</Text>
                    <TextInput
                      className="auth-input"
                      placeholder="Last name"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      value={lastName}
                      onChangeText={setLastName}
                    />
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

                <TouchableOpacity
                  className={`auth-button ${isLoading || !emailAddress || !password || !firstName.trim() || !lastName ? "auth-button-disabled" : ""}`}
                  onPress={handleSubmit}
                  disabled={
                    isLoading ||
                    !emailAddress ||
                    !password ||
                    !firstName.trim() ||
                    !lastName.trim()
                  }
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#081126" />
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
