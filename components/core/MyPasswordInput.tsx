import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type MyPasswordInputProps = {
  password: string;
  setPassword: (password: string) => void;
  error: string;
};

const MyPasswordInput = ({
  password,
  setPassword,
  error,
}: MyPasswordInputProps) => {
  const [view, setView] = useState(false);

  return (
    <View className="auth-field">
      <Text className="auth-label">Password</Text>
      <View className="flex-row items-center auth-input-password">
        <TextInput
          className="flex-1"
          placeholder="Enter your password"
          placeholderTextColor="rgba(0,0,0,0.35)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!view}
        />
        <Pressable onPress={() => setView(!view)} hitSlop={8}>
          <Ionicons
            name={view ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="rgba(0,0,0,0.5)"
          />
        </Pressable>
      </View>
      {error && <Text className="auth-error">{error}</Text>}
    </View>
  );
};

export default MyPasswordInput;
