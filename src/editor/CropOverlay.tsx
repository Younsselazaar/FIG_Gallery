import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing, radius, focus } from "../theme/tokens";

/**
 * CropOverlay.tsx
 * ----------------
 * Visual crop frame overlay used in Editor.
 *
 * IMPORTANT:
 * - This is a VISUAL overlay only
 * - No gesture math here
 * - No image processing here
 *
 * Matches Base44 look but adapted for:
 * - 3.5" FIG phones
 * - Keypad + touch
 * - Clear, high-contrast guides
 */

type Props = {
  visible: boolean;
};

export default function CropOverlay({ visible }: Props) {
  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.container}>
      {/* Crop frame */}
      <View style={styles.frame} />

      {/* Rule-of-thirds grid */}
      <View style={styles.grid}>
        <View style={styles.hLine} />
        <View style={styles.hLine} />
        <View style={styles.vLine} />
        <View style={styles.vLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },

  frame: {
    width: "90%",
    height: "90%",
    borderWidth: focus.ringWidth,
    borderColor: colors.focusRing,
    borderRadius: radius.sm,
  },

  grid: {
    position: "absolute",
    width: "90%",
    height: "90%",
  },

  hLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.overlayLight,
    opacity: 0.6,
  },

  vLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.overlayLight,
    opacity: 0.6,
  },
});

/**
 * Position grid lines manually (avoids layout math at runtime)
 */
styles.hLine.top = "33%";
styles.hLine.bottom = "66%";

styles.vLine.left = "33%";
styles.vLine.right = "66%";
