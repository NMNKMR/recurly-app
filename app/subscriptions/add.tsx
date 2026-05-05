import SubscriptionForm from "@/components/subscriptions/SubscriptionForm";
import {
    SubscriptionInput,
    useSubscriptionStore,
} from "@/lib/stores/subscription";
import { useRouter } from "expo-router";
import React from "react";

const AddSubscription = () => {
  const router = useRouter();
  const addSubscription = useSubscriptionStore(
    (state) => state.addSubscription,
  );

  const handleSave = (data: SubscriptionInput) => {
    addSubscription(data);
    router.back();
  };

  return <SubscriptionForm mode="add" handleSave={handleSave} />;
};

export default AddSubscription;
