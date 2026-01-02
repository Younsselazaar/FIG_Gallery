import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { radius, focus } from "../theme/tokens";

/**
 * FocusOverlay.tsx
 * ----------------
 * Visual focus indicator for keypad / DPAD navigation.
 *
 * Rules:
 * - Visible focus ring (no hover assumptions)
 * - High contrast for 3.5" FIG screens
 * - Overlay only (does not affect layout)
 * - Matches Base44 focus feel
 * - Semi-transparent background for visibility on dark backgrounds
 */

type Props = {
  focused: boolean;
  radiusOverride?: number;
  darkBackground?: boolean;
};

export default function FocusOverlay({
  focused,
  radiusOverride,
  darkBackground = false,
}: Props) {
  if (!focused) return null;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.overlay,
        { borderRadius: radiusOverride ?? radius.md },
        darkBackground && styles.darkOverlay,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: focus.ringWidth,
    borderColor: colors.focusRing,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  darkOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
});
