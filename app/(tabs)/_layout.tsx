import TabBarIcon from "@/components/layout/TabBarIcon";
import { tabs } from "@/constants/data";
import { colors, components } from "@/constants/theme";
import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RootTabsLayout = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Math.max(insets.bottom, components.tabBar.horizontalInset),
          marginHorizontal: 16,
          elevation: 0,
          backgroundColor: colors.primary,
          borderRadius: components.tabBar.radius,
          height: components.tabBar.height,
          borderTopWidth: 0,
        },
        tabBarItemStyle: {
          paddingVertical:
            components.tabBar.height / 2 - components.tabBar.iconFrame / 1.6,
        },
        tabBarIconStyle: {
          width: components.tabBar.iconFrame,
          height: components.tabBar.iconFrame,
          alignItems: "center",
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabBarIcon focused={focused} icon={tab.icon} />
            ),
          }}
        />
      ))}
      <Tabs.Screen name="subscriptions/[id]" options={{ href: null }} />
    </Tabs>
  );
};

export default RootTabsLayout;
