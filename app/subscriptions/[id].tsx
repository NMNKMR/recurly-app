import SafeAreaView from "@/components/core/StyledSafeAreaView";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text } from "react-native";

const SubscriptionDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView>
      <Text>SubscriptionDetail : {id}</Text>
    </SafeAreaView>
  );
};

export default SubscriptionDetail;
