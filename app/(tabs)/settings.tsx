import SafeAreaView from "@/components/core/StyledSafeAreaView";
import { colors } from "@/constants/theme";
import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Settings = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.imageUrl || null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setAvatarUri(user.imageUrl || null);
    }
  }, [isLoaded, user]);

  const handleUpdate = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    if (!user) return;

    try {
      setIsLoading(true);
      await user.update({ firstName, lastName });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await signOut();
    } catch (err) {
      console.log(err);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!user || isUpdatingAvatar) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]?.base64) {
      try {
        setIsUpdatingAvatar(true);
        await user.setProfileImage({
          file: "data:image/jpeg;base64," + result.assets[0].base64,
        });
        setAvatarUri(result.assets[0].uri);
      } catch (err) {
        console.log(err);
        setAvatarUri(user?.imageUrl || null);
        alert("Something went wrong. Please try again.");
      } finally {
        setIsUpdatingAvatar(false);
      }
    }
  };

  const isSubmitDisabled =
    isLoading || isUpdatingAvatar || !firstName.trim() || !lastName.trim();

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-24 flex-1"
      >
        <View className="flex-1 justify-between">
          <View className="items-center gap-4">
            <View className="relative">
              <Image
                source={{ uri: avatarUri || user?.imageUrl }}
                className="size-32 rounded-full"
              />
              <Pressable
                hitSlop={8}
                onPress={handleUpdateAvatar}
                disabled={isUpdatingAvatar || isLoading}
                accessibilityRole="button"
                accessibilityLabel="Update Avatar"
                className="absolute shadow bottom-0 right-0 rounded-full size-8 items-center justify-center bg-accent p-2"
              >
                {isUpdatingAvatar ? (
                  <ActivityIndicator size={14} color="white" />
                ) : (
                  <Ionicons name="camera-outline" size={14} color="white" />
                )}
              </Pressable>
            </View>
            <View className="gap-1 items-center">
              <Text className="text-3xl font-extrabold">{user?.fullName}</Text>
              <Text className="text-gray-500">
                {user?.emailAddresses[0].emailAddress}
              </Text>
            </View>
            <View className="w-full auth-card gap-4">
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
                  className="auth-input bg-gray-100! text-gray-500!"
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={user?.emailAddresses[0].emailAddress}
                  readOnly
                />
              </View>

              <TouchableOpacity
                className={clsx(
                  "auth-button",
                  isSubmitDisabled && "auth-button-disabled",
                )}
                disabled={isSubmitDisabled}
                onPress={handleUpdate}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.foreground} />
                ) : (
                  <Text className="auth-button-text">Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View className="mx-2">
            <TouchableOpacity
              className={
                "flex-row gap-2 justify-center items-center p-4 rounded-2xl border border-destructive bg-destructive/15"
              }
              onPress={handleLogout}
              disabled={logoutLoading}
              activeOpacity={0.5}
            >
              {logoutLoading ? (
                <ActivityIndicator color={colors.destructive} />
              ) : (
                <>
                  <Ionicons
                    name="log-out-outline"
                    size={24}
                    color={colors.destructive}
                  />
                </>
              )}
              <Text className="text-destructive font-medium">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
