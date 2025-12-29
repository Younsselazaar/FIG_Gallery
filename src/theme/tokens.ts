/**
 * tokens.ts
 * ----------
 * Layout + spacing tokens for FIG Gallery.
 * All values scale proportionally to screen width.
 */

import { scale, wp } from "./responsive";

/**
 * Spacing scale
 */
export const spacing = {
  xxs: scale(2),
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
} as const;

/**
 * Border radius
 */
export const radius = {
  xs: scale(4),
  sm: scale(6),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  full: 999,
} as const;

/**
 * Standard heights
 */
export const heights = {
  header: scale(48),
  tabBar: scale(60),
  row: scale(44),
  button: scale(44),
  searchInput: scale(44),
} as const;

/**
 * Icon sizes
 */
export const icon = {
  xs: scale(16),
  sm: scale(20),
  md: scale(24),
  lg: scale(28),
  xl: scale(32),
} as const;

/**
 * Grid configuration
 */
export const grid = {
  gap: scale(4),
  padding: wp(4), // 4% of screen width
  columns: 4,
} as const;

/**
 * Bottom sheet tokens
 */
export const bottomSheet = {
  maxHeightRatio: 0.6,
  handleHeight: scale(20),
  rowHeight: scale(48),
} as const;

/**
 * Editor tokens
 */
export const editor = {
  tabBarHeight: scale(48),
  sliderHeight: scale(40),
  sliderButtonSize: scale(28),
} as const;

/**
 * Focus ring tokens
 */
export const focus = {
  ringWidth: scale(2),
  ringColor: "#2196F3",
  ringOffset: scale(2),
} as const;
