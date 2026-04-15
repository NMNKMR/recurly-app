import MyPasswordInput from "@/components/core/MyPasswordInput";
import SafeAreaView from "@/components/core/StyledSafeAreaView";
import Logo from "@/components/shared/Logo";
import { useSignIn } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [localErrors, setLocalErrors] = useState<{ email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState("");

  const isLoading = fetchStatus === "fetching";

  const validate = () => {
    const errs: typeof localErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) errs.email = "Enter a valid email address";
    if (password.length < 8) errs.password = "Password must be at least 8 characters";
    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setGeneralError("");
    try {
      const { error } = await signIn.password({
        emailAddress,
        password,
      });
      if (error) return;

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) return;
            const url = decorateUrl("/(tabs)");
            router.replace(url as Href);
          },
        });
      }
    } catch (err: any) {
      setGeneralError(err?.message || "Something went wrong. Please try again.");
    }
  };

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
            {/* Brand Block */}
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <Logo />
                <View>
                  <Text className="auth-wordmark">Recurly</Text>
                  <Text className="auth-wordmark-sub">SMART BILLING</Text>
                </View>
              </View>

              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">
                Sign in to continue managing your subscriptions
              </Text>
            </View>

            {/* Form Card */}
            <View className="auth-card">
              <View className="auth-form">
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
                  {(localErrors.email || errors?.fields?.identifier) && (
                    <Text className="auth-error">
                      {localErrors.email || errors?.fields?.identifier?.message}
                    </Text>
                  )}
                </View>

                <MyPasswordInput
                  password={password}
                  setPassword={setPassword}
                  error={localErrors.password || errors?.fields?.password?.message || ""}
                />

                {generalError ? (
                  <Text className="auth-error">{generalError}</Text>
                ) : null}

                <TouchableOpacity
                  className={`auth-button ${isLoading || !emailAddress || !password ? "auth-button-disabled" : ""}`}
                  onPress={handleSubmit}
                  disabled={isLoading || !emailAddress || !password}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View className="auth-link-row">
                <Text className="auth-link-copy">New to Recurly?</Text>
                <Link href="/(_auth)/signup" replace>
                  <Text className="auth-link">Create an account</Text>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
