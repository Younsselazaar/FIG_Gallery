/**
 * typography.ts
 * -------------
 * Typography system for FIG Gallery.
 * Font sizes scale proportionally to screen width.
 */

import { fontScale } from "./responsive";

/**
 * Font families
 */
export const fontFamily = {
  regular: "System",
  medium: "System",
  bold: "System",
} as const;

/**
 * Font sizes (responsive)
 */
export const fontSize = {
  xs: fontScale(11),
  sm: fontScale(13),
  md: fontScale(15),
  lg: fontScale(17),
  xl: fontScale(20),
  xxl: fontScale(24),
  title: fontScale(28),
} as const;

/**
 * Line heights (responsive)
 */
export const lineHeight = {
  xs: fontScale(15),
  sm: fontScale(18),
  md: fontScale(21),
  lg: fontScale(24),
  xl: fontScale(28),
  xxl: fontScale(32),
  title: fontScale(36),
} as const;

/**
 * Font weights
 */
export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

/**
 * Text variants
 */
export const textVariants = {
  title: {
    fontSize: fontSize.title,
    lineHeight: lineHeight.title,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontWeight: fontWeight.medium,
  },
  body: {
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: fontWeight.regular,
  },
  label: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: fontWeight.medium,
  },
  caption: {
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: fontWeight.regular,
  },
} as const;

export const textStyles = textVariants;
