import { clsx } from "clsx";
import React from "react";
import { Image, View } from "react-native";

const TabBarIcon = ({ focused, icon }: TabIconProps) => {
  return (
    <View className="tabs-icon">
      <View className={clsx("tabs-pill", focused && "tabs-active")}>
        <Image source={icon} resizeMode="contain" className="tabs-glyph" />
      </View>
    </View>
  );
};

export default TabBarIcon;
