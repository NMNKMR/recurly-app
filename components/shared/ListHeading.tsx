import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ListHeading = ({ title, link }: ListHeadingProps) => {
  const router = useRouter();

  const handlePress = () => {
    if (link) {
      router.push(link);
    }
  };

  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>
      {link && (
        <TouchableOpacity className="list-action" onPress={handlePress}>
          <Text className="list-action-text">View all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ListHeading;
