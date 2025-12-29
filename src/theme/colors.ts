/**
 * colors.ts
 * ----------
 * FIG Gallery color system matching design specs.
 */

/**
 * Brand colors
 */
export const brand = {
  teal: "#1A9B8C",
  tealLight: "#2AB5A5",
  tealDark: "#158578",
  blue: "#4A90D9",
  blueLight: "#5BA3EC",
  navy: "#111b43",
} as const;

/**
 * Light theme colors
 */
export const light = {
  background: "#FFFFFF",
  backgroundSecondary: "#F8F9FA",
  surface: "#FFFFFF",
  surfaceSecondary: "#F0F2F4",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  divider: "#E5E7EB",
} as const;

/**
 * Dark theme colors
 */
export const dark = {
  background: "#121212",
  backgroundSecondary: "#1E1E1E",
  surface: "#2D2D2D",
  surfaceSecondary: "#3D3D3D",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0A0",
  textTertiary: "#6B6B6B",
  border: "#3D3D3D",
  borderLight: "#2D2D2D",
  divider: "#3D3D3D",
} as const;

/**
 * Semantic colors
 */
export const semantic = {
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  favorite: "#EF4444",
} as const;

/**
 * Core UI colors for compatibility
 */
export const colors = {
  // Backgrounds
  background: light.background,
  surface: light.surface,
  surfaceAlt: light.backgroundSecondary,
  surfaceActive: "#e8f5f2",

  // Text
  textPrimary: light.textPrimary,
  textSecondary: light.textSecondary,
  textMuted: light.textTertiary,

  // Icons
  iconPrimary: light.textPrimary,
  iconSecondary: light.textSecondary,

  // Borders & dividers
  border: light.border,
  divider: light.divider,

  // Actions
  primary: brand.teal,
  accent: brand.blue,
  info: brand.blue,

  // Status
  success: semantic.success,
  error: semantic.error,
  warning: semantic.warning,

  // Overlays
  overlayDark: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(255, 255, 255, 0.1)",

  // Focus
  focusRing: brand.teal,

  // Special
  black: "#000000",
  white: "#ffffff",
  transparent: "transparent",
} as const;

/**
 * UI component specific colors
 */
export const ui = {
  // Tab bar
  tabActive: brand.teal,
  tabInactive: "#9CA3AF",

  // Header
  headerBackground: light.background,
  headerBorder: light.border,

  // Buttons
  buttonPrimary: brand.teal,
  buttonSecondary: "#E5E7EB",
  buttonDanger: semantic.error,

  // Selection
  selectionCircle: "rgba(255, 255, 255, 0.9)",
  selectionCircleActive: brand.teal,
  selectionBorder: "rgba(0, 0, 0, 0.2)",

  // Editor (dark theme)
  editorBackground: dark.background,
  editorSurface: dark.surface,
  editorHeader: "#3D5A80",
  sliderTrack: "#1A1A1A",
  sliderTrackLight: "#E5E7EB",
  sliderThumb: "#FFFFFF",

  // Badges
  badgeEdited: brand.blue,
  badgeEditedText: "#FFFFFF",

  // Photo viewer (dark)
  viewerBackground: dark.background,
  viewerSurface: dark.surface,
  viewerText: dark.textPrimary,
  viewerTextSecondary: dark.textSecondary,

  // Bottom sheet (dark)
  sheetBackground: dark.surface,
  sheetHandle: "#6B6B6B",
  sheetItem: dark.surfaceSecondary,
  sheetItemText: dark.textPrimary,

  // Photo grid
  photoPlaceholder: "#F0F0F0",
  favoriteIcon: semantic.favorite,
} as const;

/**
 * Gradients
 */
export const gradients = {
  teal: [brand.teal, brand.tealLight],
  blue: [brand.blue, brand.blueLight],
} as const;

export default colors;
