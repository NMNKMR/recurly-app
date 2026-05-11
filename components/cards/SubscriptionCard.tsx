import { currencyFormat, formatSubDate } from "@/lib/utils";
import { clsx } from "clsx";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import StatusBadge from "../shared/StatusBadge";

const SubscriptionCard = ({
  billing,
  expanded,
  name,
  price,
  status,
  icon,
  onPress,
  color,
  category,
  paymentMethod,
  plan,
  renewalDate,
  startDate,
}: SubscriptionCardProps) => {
  const details = [
    { label: "Plan", value: plan },
    { label: "Category", value: category },
    { label: "Payment Method", value: paymentMethod },
    { label: "Start Date", value: startDate ? formatSubDate(startDate) : null },
    {
      label: "Renewal Date",
      value: renewalDate ? formatSubDate(renewalDate) : null,
    },
  ];

  return (
    <Pressable
      onPress={onPress}
      className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image source={icon} resizeMode="contain" className="sub-icon" />
          <View className="sub-copy">
            <Text className="sub-title" numberOfLines={1} ellipsizeMode="tail">
              {name}
            </Text>
            <StatusBadge status={status} />
          </View>
        </View>
        <View className="sub-price-box">
          <Text className="sub-price">{currencyFormat(price)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </View>

      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            {details.map((detail, index) => (
              <View key={index} className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">{detail.label}:</Text>
                  <Text className="sub-value">
                    {detail.value?.toString().trim() || "Not provided"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default SubscriptionCard;
