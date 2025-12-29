import React from "react";
import {
  View,
  Pressable,
  StyleSheet,
} from "react-native";

import BaseText from "../components/BaseText";
import FocusOverlay from "../components/FocusOverlay";
import { colors } from "../theme/colors";
import { spacing, radius, editor } from "../theme/tokens";

/**
 * Slider.tsx
 * ----------
 * Discrete step slider for Editor adjustments.
 *
 * IMPORTANT:
 * - NO continuous gestures
 * - Keypad + touch buttons only
 * - Deterministic values (no float drift)
 * - Base44-style behavior adapted for 3.5" FIG phones
 */

type Props = {
  label: string;
  value: number;          // current value
  min: number;
  max: number;
  step: number;
  focused?: boolean;
  onChange: (value: number) => void;
};

export default function Slider({
  label,
  value,
  min,
  max,
  step,
  focused,
  onChange,
}: Props) {
  const decrease = () => {
    onChange(Math.max(min, value - step));
  };

  const increase = () => {
    onChange(Math.min(max, value + step));
  };

  return (
    <View style={styles.container}>
      <BaseText variant="label">{label}</BaseText>

      <View style={styles.row}>
        <Pressable
          onPress={decrease}
          style={styles.button}
        >
          <BaseText>-</BaseText>
        </Pressable>

        <View style={styles.valueBox}>
          <BaseText variant="body">{value}</BaseText>
          <FocusOverlay focused={!!focused} radiusOverride={radius.sm} />
        </View>

        <Pressable
          onPress={increase}
          style={styles.button}
        >
          <BaseText>+</BaseText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  row: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    width: editor.sliderButtonSize,
    height: editor.sliderButtonSize,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  valueBox: {
    flex: 1,
    marginHorizontal: spacing.sm,
    height: editor.sliderButtonSize,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
});
