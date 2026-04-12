import images from "@/constants/images";
import React from "react";
import { Image, View } from "react-native";

const Avatar = () => {
  return (
    <View>
      <Image source={images.avatar} className="home-avatar" />
    </View>
  );
};

export default Avatar;
