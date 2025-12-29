import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { textStyles } from "../theme/typography";

/**
 * BaseText.tsx
 * ------------
 * Single source of truth for ALL text rendering in FIG Gallery.
 *
 * Rules:
 * - Defaults to single-line, ellipsized text
 * - Uses Base44-locked typography scale
 * - Optimized for 3.5" FIG phones
 * - Wrapping must be explicitly opted into
 */

export type BaseTextProps = TextProps & {
  variant?: keyof typeof textStyles;
  color?: string;
  lines?: number;
};

export default function BaseText({
  variant = "body",
  color = colors.textPrimary,
  lines = 1,
  style,
  children,
  ...rest
}: BaseTextProps) {
  return (
    <Text
      {...rest}
      numberOfLines={lines}
      ellipsizeMode="tail"
      style={[
        styles.base,
        textStyles[variant],
        { color },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
