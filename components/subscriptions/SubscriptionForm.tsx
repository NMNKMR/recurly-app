import { IconKey, icons } from "@/constants/icons";
import { colors } from "@/constants/theme";
import { SubscriptionInput } from "@/lib/stores/subscription";
import { currencyFormat } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { clsx } from "clsx";
import { addDays, addMonths, addYears, format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SafeAreaView from "../core/StyledSafeAreaView";

type SubscriptionFormProps = {
  mode: "add" | "edit";
  handleSave: (data: SubscriptionInput) => void;
};

const ICON_OPTIONS: { key: string; src: any }[] = [
  { key: "spotify", src: icons.spotify },
  { key: "notion", src: icons.notion },
  { key: "figma", src: icons.figma },
  { key: "github", src: icons.github },
  { key: "claude", src: icons.claude },
  { key: "openai", src: icons.openai },
  { key: "adobe", src: icons.adobe },
  { key: "canva", src: icons.canva },
  { key: "dropbox", src: icons.dropbox },
  { key: "medium", src: icons.medium },
];

const BILLING_CYCLES = ["Weekly", "Monthly", "Yearly"] as const;

const STATUS_OPTIONS = [
  { key: "active", label: "Active", dot: "#16a34a" },
  { key: "paused", label: "Paused", dot: "#eab308" },
  { key: "cancelled", label: "Cancelled", dot: "#dc2626" },
];

const COLOR_OPTIONS = [
  "#eab308",
  "#16a34a",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#ec4899",
  "#9ca3af",
];

const SubscriptionForm = ({ mode, handleSave }: SubscriptionFormProps) => {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    icon: "",
    price: "",
    billingCycle: "",
    startDate: new Date(),
    status: "",
    category: "",
    paymentMethod: "",
    accentColor: "",
  });
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSubmit = () => {
    // Validate all fields are filled
    const requiredFields = [
      form.name,
      form.icon,
      form.price,
      form.billingCycle,
      form.status,
      form.category,
      form.paymentMethod,
      form.accentColor,
    ];
    const isValid = requiredFields.every((field) => field.trim() !== "");

    if (!isValid) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    // Calculate renewal date
    let renewalDate: Date;
    switch (form.billingCycle) {
      case "Weekly":
        renewalDate = addDays(form.startDate, 7);
        break;
      case "Monthly":
        renewalDate = addMonths(form.startDate, 1);
        break;
      case "Yearly":
        renewalDate = addYears(form.startDate, 1);
        break;
      default:
        renewalDate = addMonths(form.startDate, 1); // default to monthly
    }

    // Prepare subscription data
    const subscriptionData = {
      iconKey: form.icon as IconKey,
      name: form.name,
      plan: "",
      category: form.category,
      paymentMethod: form.paymentMethod,
      status: form.status,
      startDate: form.startDate.toISOString(),
      price: parseFloat(form.price.replace(/[^0-9.]/g, "")),
      currency: "INR",
      billing: form.billingCycle,
      renewalDate: renewalDate.toISOString(),
      color: form.accentColor,
    };

    handleSave(subscriptionData);
  };

  const handleFormChange = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Custom header */}
      <View className="flex-row items-center px-5 py-4 border-b border-border">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="absolute left-5 top-4 z-10"
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons
            name="arrow-back-outline"
            size={24}
            color={colors.primary}
          />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-semibold text-foreground">
          {mode === "add" ? "New Subscription" : "Edit Subscription"}
        </Text>
      </View>

      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName={`px-5 pt-6 ${isKeyboardVisible ? "pb-8" : "pb-24"} gap-6`}
          showsVerticalScrollIndicator={false}
        >
          {/* Name */}
          <View className="gap-2">
            <Text className="subs-form-label">Name</Text>
            <TextInput
              className="auth-input"
              placeholder="e.g. Spotify Premium"
              value={form.name}
              onChangeText={(text) => handleFormChange("name", text)}
              placeholderTextColor="rgba(0,0,0,0.35)"
            />
          </View>

          {/* Icon */}
          <View className="gap-2">
            <Text className="subs-form-label">Icon</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3"
              keyboardShouldPersistTaps="handled"
            >
              {ICON_OPTIONS.map((opt) => (
                <Pressable
                  onPress={() => handleFormChange("icon", opt.key)}
                  key={opt.key}
                  className={clsx(
                    "size-14 rounded-full bg-card items-center justify-center",
                    opt.key === form.icon
                      ? "border-accent border-2"
                      : "border-border border",
                  )}
                  accessibilityRole="button"
                  accessibilityLabel={opt.key}
                  hitSlop={10}
                >
                  <Image source={opt.src} className="size-8" />
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Price */}
          <View className="gap-2">
            <Text className="subs-form-label">Price</Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-3xl font-extrabold text-foreground">₹</Text>
              <TextInput
                className="text-3xl font-extrabold text-foreground max-h-16 -my-4"
                placeholder="0.00"
                placeholderTextColor="rgba(0,0,0,0.35)"
                keyboardType="numeric"
                value={form.price}
                onBlur={() =>
                  handleFormChange(
                    "price",
                    form.price ? currencyFormat(Number(form.price), true) : "",
                  )
                }
                onFocus={() =>
                  handleFormChange("price", form.price.replace(/[^0-9.]/g, ""))
                }
                onChangeText={(text) => handleFormChange("price", text)}
              />
            </View>
          </View>

          {/* Billing cycle */}
          <View className="gap-2">
            <Text className="subs-form-label">Billing Cycle</Text>
            <View className="flex-row gap-2">
              {BILLING_CYCLES.map((cycle) => (
                <Pressable
                  key={cycle}
                  onPress={() => handleFormChange("billingCycle", cycle)}
                  accessibilityRole="button"
                  accessibilityLabel={cycle}
                  className={clsx(
                    "px-5 py-2 rounded-full border border-border",
                    "bg-card",
                    cycle === form.billingCycle && "bg-primary",
                  )}
                >
                  <Text
                    className={clsx(
                      form.billingCycle === cycle && "text-white",
                      "text-foreground font-medium",
                    )}
                  >
                    {cycle}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Start date */}
          <View className="gap-2">
            <Text className="subs-form-label">Start Date</Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              accessibilityRole="button"
              accessibilityLabel="Pick start date"
              className="auth-input py-3! flex-row items-center justify-between"
            >
              <Text className="text-foreground">
                {format(form.startDate, "MMM dd, yyyy")}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.primary}
              />
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={form.startDate}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (event.type === "set" && selectedDate) {
                    handleFormChange("startDate", selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Status */}
          <View className="gap-2">
            <Text className="subs-form-label">Status</Text>
            <View className="flex-row gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  onPress={() => handleFormChange("status", opt.key)}
                  accessibilityRole="button"
                  accessibilityLabel={opt.key}
                  className={clsx(
                    "flex-row items-center gap-2 px-4 py-2 rounded-full border border-border",
                    "bg-card",
                    form.status === opt.key && "bg-primary",
                  )}
                >
                  <View
                    style={{ backgroundColor: opt.dot }}
                    className="size-2 rounded-full"
                  />
                  <Text
                    className={clsx(
                      "text-foreground",
                      form.status === opt.key && "text-white",
                      "font-medium",
                    )}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Category */}
          <View className="gap-2">
            <Text className="subs-form-label">Category</Text>
            <TextInput
              className="auth-input"
              placeholder="e.g. Design, Music, Productivity"
              placeholderTextColor="rgba(0,0,0,0.35)"
              value={form.category}
              onChangeText={(text) => handleFormChange("category", text)}
            />
          </View>

          {/* Payment method */}
          <View className="gap-2">
            <Text className="subs-form-label">Payment Method</Text>
            <View className="auth-input-password flex-row items-center gap-3">
              <Ionicons name="card-outline" size={20} color="#081126" />
              <TextInput
                className="flex-1"
                placeholder="Visa ending in 1234"
                placeholderTextColor="rgba(0,0,0,0.35)"
                value={form.paymentMethod}
                onChangeText={(text) => handleFormChange("paymentMethod", text)}
              />
            </View>
          </View>

          {/* Accent color */}
          <View className="gap-2">
            <Text className="subs-form-label">Accent Color</Text>
            <View className="flex-row gap-1 flex-wrap">
              {COLOR_OPTIONS.map((color) => (
                <View
                  key={color}
                  style={{ borderRadius: 1000 }}
                  className={clsx(
                    "justify-center items-center p-0.5 border-2 rounded-full",
                    form.accentColor === color
                      ? "border-primary"
                      : "border-transparent",
                  )}
                >
                  <Pressable
                    style={{ backgroundColor: color }}
                    onPress={() => handleFormChange("accentColor", color)}
                    accessibilityRole="button"
                    accessibilityLabel={color}
                    hitSlop={10}
                    className="size-9 rounded-full justify-center items-center"
                  >
                    {form.accentColor === color && (
                      <Ionicons
                        size={16}
                        color={colors.primary}
                        name="checkmark-outline"
                      />
                    )}
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Sticky save button */}
        <View
          className={clsx(
            isKeyboardVisible ? "" : "absolute",
            "bottom-0 left-0 right-0 px-5 py-3 bg-background border-t border-border",
          )}
        >
          <TouchableOpacity
            className="auth-button"
            activeOpacity={0.8}
            onPress={handleSubmit}
          >
            <Text className="auth-button-text">
              {mode === "add" ? "Save Subscription" : "Update Subscription"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SubscriptionForm;
