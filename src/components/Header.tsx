import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { brand, light, ui } from "../theme/colors";
import { scale, fontScale } from "../theme/responsive";

type Props = {
  onMenuPress?: () => void;
  showMenu?: boolean;
};

function FigLogo({ size = 40 }: { size?: number }) {
  // Camera aperture logo matching screenshot design
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {/* Outer circle */}
      <Circle cx="24" cy="24" r="22" fill={brand.teal} />
      {/* Inner circle (hole) */}
      <Circle cx="24" cy="24" r="6" fill="white" />
      {/* Aperture blades - 8 dots around the center */}
      <Circle cx="24" cy="12" r="3" fill="white" />
      <Circle cx="32.5" cy="15.5" r="3" fill="white" />
      <Circle cx="36" cy="24" r="3" fill="white" />
      <Circle cx="32.5" cy="32.5" r="3" fill="white" />
      <Circle cx="24" cy="36" r="3" fill="white" />
      <Circle cx="15.5" cy="32.5" r="3" fill="white" />
      <Circle cx="12" cy="24" r="3" fill="white" />
      <Circle cx="15.5" cy="15.5" r="3" fill="white" />
    </Svg>
  );
}

function MenuIcon({ size = 24, color = light.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 6h18M3 12h18M3 18h18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function Header({ onMenuPress, showMenu = true }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <FigLogo size={scale(40)} />
        <Text style={styles.title}>FIG Gallery</Text>
      </View>

      {showMenu && (
        <Pressable
          onPress={onMenuPress}
          style={({ pressed }) => [
            styles.menuButton,
            pressed && styles.menuButtonPressed,
          ]}
          hitSlop={12}
        >
          <MenuIcon size={scale(24)} color={light.textPrimary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: light.background,
    borderBottomWidth: 0.5,
    borderBottomColor: ui.headerBorder,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  title: {
    fontSize: fontScale(22),
    fontWeight: "600",
    color: brand.teal,
  },
  menuButton: {
    padding: scale(8),
    borderRadius: scale(6),
  },
  menuButtonPressed: {
    backgroundColor: light.surfaceSecondary,
  },
});
