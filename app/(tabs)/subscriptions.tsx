import SubscriptionCard from "@/components/cards/SubscriptionCard";
import SafeAreaView from "@/components/core/StyledSafeAreaView";
import { ALL_SUBSCRIPTIONS } from "@/constants/data";
import { useDebounce } from "@/hooks/useDebounce";
import {
  resolveSubscription,
  useSubscriptionStore,
} from "@/lib/stores/subscription";
import React, { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";

const Subscriptions = () => {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);

  const debouncedSearchFn = useDebounce(
    (value) => setDebouncedSearch(value),
    500,
  );

  const subsData = useMemo(() => {
    return [...subscriptions.map(resolveSubscription), ...ALL_SUBSCRIPTIONS];
  }, [subscriptions]);

  const data = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return subsData;
    return subsData.filter((sub) => sub.name.toLowerCase().includes(query));
  }, [debouncedSearch, subsData]);

  return (
    <SafeAreaView className="safe-view">
      <FlatList
        ListHeaderComponent={
          <View>
            <Text className="list-title">Subscriptions</Text>
            <View className="my-2">
              <TextInput
                value={search}
                className="auth-input"
                placeholder="Search Subscription..."
                onChangeText={(text) => {
                  setSearch(text);
                  debouncedSearchFn(text);
                }}
              />
            </View>
          </View>
        }
        ListHeaderComponentStyle={{ paddingBottom: 16 }}
        ListEmptyComponent={
          <View className="flex-1 items-center">
            <Text className="home-empty-state">No Subscriptions Found...</Text>
          </View>
        }
        data={data}
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
        contentContainerClassName="pb-20"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
