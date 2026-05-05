import { icons, type IconKey } from "@/constants/icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type StoredSubscription = {
  id: string;
  iconKey: IconKey;
  name: string;
  plan?: string;
  category?: string;
  paymentMethod?: string;
  status: string;
  startDate: string;
  price: number;
  currency?: string;
  billing: string;
  renewalDate?: string;
  color?: string;
};

export type SubscriptionInput = Omit<StoredSubscription, "id">;

type SubscriptionState = {
  subscriptions: StoredSubscription[];
  addSubscription: (data: SubscriptionInput) => StoredSubscription;
  updateSubscription: (id: string, data: Partial<SubscriptionInput>) => void;
  deleteSubscription: (id: string) => void;
  getSubscriptionById: (id: string) => StoredSubscription | undefined;
};

const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: [],

      addSubscription: (data) => {
        const subscription: StoredSubscription = { ...data, id: generateId() };
        set((state) => ({
          subscriptions: [subscription, ...state.subscriptions],
        }));
        return subscription;
      },

      updateSubscription: (id, data) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, ...data } : s,
          ),
        }));
      },

      deleteSubscription: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        }));
      },

      getSubscriptionById: (id) => get().subscriptions.find((s) => s.id === id),
    }),
    {
      name: "subscriptions-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// Resolve a stored subscription (with iconKey) into the runtime Subscription
// shape (with the actual image source) used by list/card components.
export const resolveSubscription = (
  stored: StoredSubscription,
): Subscription => ({
  ...stored,
  icon: icons[stored.iconKey],
});
