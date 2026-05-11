import { cn, formatSubStatus } from "@/lib/utils";
import { cva } from "class-variance-authority";
import React from "react";
import { Text, View } from "react-native";

type StatusBadgeProps = {
  status: Status;
  className?: string;
};

const Status = cva("sub-status", {
  variants: {
    status: {
      active: "bg-green-100",
      paused: "bg-yellow-100",
      cancelled: "bg-red-100",
      expired: "bg-gray-100",
    },
  },
});

const StatusDot = cva("size-1.5 rounded-full", {
  variants: {
    status: {
      active: "bg-success",
      paused: "bg-yellow-500",
      cancelled: "bg-destructive",
      expired: "bg-gray-500",
    },
  },
});

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <View className={cn(Status({ status }), className)}>
      <View className={StatusDot({ status })} />
      <Text className="text-sm font-sans-semibold text-muted-foreground">
        {formatSubStatus(status)}
      </Text>
    </View>
  );
};

export default StatusBadge;
