import {
    resolveSubscription,
    useSubscriptionStore,
} from "@/lib/stores/subscription";

export const useGetTopSubs = ({
  limit = 4,
}: { limit?: number } = {}): Subscription[] => {
  const subs = useSubscriptionStore((state) => state.subscriptions);

  const normalizePriceByMonth = (price: number, billing: string) => {
    switch (billing) {
      case "yearly":
        return price / 12;
      case "weekly":
        return price * 4.33;
      case "monthly":
      default:
        return price;
    }
  };

  return subs
    .filter((sub) => sub.status === "active")
    .sort((a, b) => {
      const priceA = normalizePriceByMonth(a.price, a.billing);
      const priceB = normalizePriceByMonth(b.price, b.billing);
      return priceB - priceA;
    })
    .slice(0, limit)
    .map(resolveSubscription);
};
