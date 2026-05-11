import {
    resolveSubscription,
    useSubscriptionStore,
} from "@/lib/stores/subscription";
import { differenceInDays, isAfter } from "date-fns";

export const useGetUpcomingSubs = ({
  limit = 3,
}: { limit?: number } = {}): UpcomingSubscription[] => {
  const subs = useSubscriptionStore((state) => state.subscriptions);

  return subs
    .filter((sub) =>
      isAfter(new Date(sub.renewalDate || sub.startDate), new Date()),
    )
    .sort((a, b) => {
      const dateA = new Date(a.renewalDate || a.startDate).getTime();
      const dateB = new Date(b.renewalDate || b.startDate).getTime();
      return dateA - dateB;
    })
    .slice(0, limit)
    .map((sub) => {
      const resolvedSub = resolveSubscription(sub);
      return {
        id: sub.id,
        name: sub.name,
        icon: resolvedSub.icon,
        price: sub.price,
        currency: sub.currency,
        daysLeft: differenceInDays(
          new Date(sub.renewalDate || sub.startDate),
          new Date(),
        ),
      };
    });
};
