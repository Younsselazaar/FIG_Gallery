import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";

import Header from "../components/Header";
import { light, brand } from "../theme/colors";
import { spacing, radius } from "../theme/tokens";
import { scale, fontScale, verticalScale } from "../theme/responsive";

/**
 * CloudScreen.tsx
 * ---------------
 * Cloud backup and sync screen.
 */

function CloudIcon({ size = 64, color = light.textTertiary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 10H17.74C17.36 7.68 15.36 6 13 6C11.28 6 9.77 6.89 9 8.22C6.79 8.57 5 10.56 5 13C5 15.76 7.24 18 10 18H18C20.21 18 22 16.21 22 14C22 11.79 20.21 10 18 10Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export default function CloudScreen() {
  return (
    <View style={styles.container}>
      <Header onMenuPress={() => {}} />

      <View style={styles.titleBar}>
        <Text style={styles.title}>Cloud</Text>
        <Text style={styles.subtitle}>Backup & Sync</Text>
      </View>

      <View style={styles.content}>
        <CloudIcon size={scale(80)} color={light.textTertiary} />

        <Text style={styles.heading}>Cloud Backup</Text>
        <Text style={styles.description}>
          Back up your photos to the cloud to keep them safe and access them from any device.
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Svg width={scale(24)} height={scale(24)} viewBox="0 0 24 24">
              <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill={brand.teal} />
            </Svg>
            <Text style={styles.featureText}>Automatic backup</Text>
          </View>
          <View style={styles.feature}>
            <Svg width={scale(24)} height={scale(24)} viewBox="0 0 24 24">
              <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill={brand.teal} />
            </Svg>
            <Text style={styles.featureText}>Access anywhere</Text>
          </View>
          <View style={styles.feature}>
            <Svg width={scale(24)} height={scale(24)} viewBox="0 0 24 24">
              <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill={brand.teal} />
            </Svg>
            <Text style={styles.featureText}>Secure encryption</Text>
          </View>
        </View>

        <Pressable style={styles.setupButton}>
          <Text style={styles.setupButtonText}>Set Up Cloud Backup</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: light.background,
  },
  titleBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: fontScale(24),
    fontWeight: "700",
    color: light.textPrimary,
  },
  subtitle: {
    fontSize: fontScale(13),
    color: light.textSecondary,
    marginTop: scale(2),
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: verticalScale(40),
  },
  heading: {
    fontSize: fontScale(20),
    fontWeight: "600",
    color: light.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontScale(14),
    color: light.textSecondary,
    textAlign: "center",
    lineHeight: fontScale(20),
    marginBottom: spacing.xl,
  },
  features: {
    alignSelf: "stretch",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  featureText: {
    fontSize: fontScale(15),
    color: light.textPrimary,
  },
  setupButton: {
    backgroundColor: brand.teal,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  setupButtonText: {
    fontSize: fontScale(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
