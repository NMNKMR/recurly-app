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
          <Text>{username.charAt(0).toUpperCase()}</Text>
        </View>
      )}
    </View>
  );
};

export default Avatar;
