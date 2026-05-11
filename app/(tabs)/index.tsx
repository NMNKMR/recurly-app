import Avatar from "@/components/Avatar";
import SubscriptionCard from "@/components/cards/SubscriptionCard";
import UpcomingSubCard from "@/components/cards/UpcomingSubCard";
import SafeAreaView from "@/components/core/StyledSafeAreaView";
import ListHeading from "@/components/shared/ListHeading";
import { HOME_BALANCE } from "@/constants/data";
import { icons } from "@/constants/icons";
import "@/global.css";
import { useGetUpcomingSubs } from "@/hooks/useGetUpcomingSubs";
import { useGetTopSubs } from "@/hooks/usetGetTopSubs";
import { currencyFormat } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const { user } = useUser();
  const router = useRouter();
  const upcomingSubs = useGetUpcomingSubs();
  const topSubs = useGetTopSubs();

  return (
    <SafeAreaView className="safe-view">
      <View className="flex-1">
        <FlatList
          ListHeaderComponent={
            <View>
              <View className="home-header">
                <View className="home-user">
                  <Avatar
                    avatar={user?.imageUrl}
                    username={user?.firstName || ""}
                  />
                  <Text className="home-user-name">{user?.fullName}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/subscriptions/add")}
                  className="home-add-icon"
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Add subscription"
                  accessibilityHint="Opens the add subscription form"
                >
                  <Image source={icons.add} className="size-8" />
                </TouchableOpacity>
              </View>
              <View className="home-balance-card">
                <Text className="home-balance-label">Balance</Text>
                <View className="home-balance-row">
                  <Text className="home-balance-amount">
                    {currencyFormat(HOME_BALANCE.amount)}
                  </Text>
                  <Text className="home-balance-date">
                    {format(HOME_BALANCE.nextRenewalDate, "dd/MM")}
                  </Text>
                </View>
              </View>
              <View className="mb-2">
                <ListHeading title="Upcoming" link="/insights" />
                <FlatList
                  data={upcomingSubs}
                  renderItem={({ item }) => <UpcomingSubCard {...item} />}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ListEmptyComponent={() => (
                    <Text className="home-empty-state">
                      No Renewal Subscriptions Found...
                    </Text>
                  )}
                />
              </View>
              <ListHeading title="Top Subscriptions" link="/subscriptions" />
            </View>
          }
          data={topSubs}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              onPress={() =>
                setExpandedCardId(expandedCardId === item.id ? null : item.id)
              }
              expanded={expandedCardId === item.id}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="h-4" />}
          ListEmptyComponent={() => (
            <Text className="home-empty-state">No Subscriptions Found...</Text>
          )}
          contentContainerClassName="pb-18"
        />
      </View>
    </SafeAreaView>
  );
}
