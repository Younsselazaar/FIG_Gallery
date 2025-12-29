/**
 * responsive.ts
 * --------------
 * Responsive scaling for FIG Gallery
 *
 * Same proportional design on all screen sizes
 * UI scales to fit the screen properly
 */

import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Base design reference (iPhone 375px width)
const BASE_WIDTH = 375;

// Scale proportionally to screen width
// Phone (393dp): 1.05x | Emulator (320dp): 0.85x
const SCALE = SCREEN_WIDTH / BASE_WIDTH;

/**
 * Width percentage of screen
 */
export function wp(percent: number): number {
  return (percent / 100) * SCREEN_WIDTH;
}

/**
 * Height percentage of screen
 */
export function hp(percent: number): number {
  return (percent / 100) * SCREEN_HEIGHT;
}

/**
 * Scale size proportionally to screen width
 */
export function scale(size: number): number {
  return Math.round(size * SCALE);
}

/**
 * Scale font size
 */
export function fontScale(size: number): number {
  const scaled = size * SCALE;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
}

/**
 * Moderate scale - less aggressive
 */
export function moderateScale(size: number, factor: number = 0.5): number {
  return Math.round(size + (scale(size) - size) * factor);
}

/**
 * Calculate photo grid item size
 */
export function gridItemSize(columns: number, gap: number = 4, padding: number = 8): number {
  const totalGap = gap * (columns - 1);
  const totalPadding = padding * 2;
  return Math.floor((SCREEN_WIDTH - totalGap - totalPadding) / columns);
}

/**
 * Screen info
 */
export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  scale: SCALE,
};

// Aliases
export const s = scale;
export const fs = fontScale;
export const ms = moderateScale;
export const verticalScale = scale;
export const lineHeightScale = fontScale;
export const rw = scale;
export const rf = fontScale;
