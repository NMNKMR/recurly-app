import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, View } from "react-native";

const Avatar = ({
  avatar,
  username,
}: {
  avatar?: string;
  username: string;
}) => {
  return (
    <View>
      {avatar ? (
        <Image source={{ uri: avatar }} className="home-avatar" />
      ) : (
        <View className="home-avatar justify-center items-center text-2xl text-white bg-primary">
          {username ? (
            <Text>{username.charAt(0).toUpperCase()}</Text>
          ) : (
            <Ionicons name="person-outline" size={24} color="white" />
          )}
        </View>
      )}
    </View>
  );
};

export default Avatar;
