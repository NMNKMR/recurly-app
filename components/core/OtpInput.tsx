import { colors } from "@/constants/theme";
import React, { useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";

type OtpInputProps = {
  length?: number;
  onComplete: (code: string) => void;
  error?: string;
  disabled?: boolean;
};

const OtpInput = ({
  length = 6,
  onComplete,
  error,
  disabled,
}: OtpInputProps) => {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const inputRef = useRef<TextInput>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Hidden input holds the full value — individual boxes are just visual
  const value = digits.join("");

  const handleChange = (text: string) => {
    // Only allow digits
    const cleaned = text.replace(/\D/g, "").slice(0, length);
    const next = Array(length).fill("");
    for (let i = 0; i < cleaned.length; i++) {
      next[i] = cleaned[i];
    }
    setDigits(next);
    setFocusedIndex(Math.min(cleaned.length, length - 1));

    if (cleaned.length === length) {
      onComplete(cleaned);
    }
  };

  return (
    <View className="gap-2">
      <View className="flex-row justify-center gap-2">
        {digits.map((digit, i) => (
          <View
            key={i}
            style={{
              borderColor:
                error && value.length === length
                  ? colors.destructive
                  : i === focusedIndex && !disabled
                    ? colors.accent
                    : colors.border,
              borderWidth: i === focusedIndex && !disabled ? 2 : 1,
            }}
            className="size-12 rounded-2xl items-center justify-center bg-background"
          >
            <Text className="text-xl font-bold text-foreground">{digit}</Text>
          </View>
        ))}

        {/* Hidden input overlays the boxes to capture taps and keyboard */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={length}
          autoFocus
          editable={!disabled}
          onFocus={() => setFocusedIndex(Math.min(value.length, length - 1))}
          onBlur={() => setFocusedIndex(-1)}
          style={{ position: "absolute", width: "100%", height: "100%", opacity: 0 }}
          caretHidden
        />
      </View>

      {error ? <Text className="auth-error text-center">{error}</Text> : null}
    </View>
  );
};

export default OtpInput;
