/**
 * keyCodes.ts
 * -----------
 * Hardware keycode mapping for FIG phones.
 *
 * Supports:
 * - Android 11–13
 * - DPAD navigation
 * - Numeric keypad
 * - FIG Menu / Back / Call keys
 *
 * IMPORTANT:
 * - Do NOT use magic numbers elsewhere
 * - All keypad logic must reference this file
 */

export const KeyCodes = {
  // Directional pad
  DPAD_UP: 19,
  DPAD_DOWN: 20,
  DPAD_LEFT: 21,
  DPAD_RIGHT: 22,
  DPAD_CENTER: 23,

  // Soft / system
  BACK: 4,
  MENU: 82,

  // Call / end (FIG specific but safe)
  CALL: 5,
  ENDCALL: 6,

  // Numeric keypad
  NUM_0: 7,
  NUM_1: 8,
  NUM_2: 9,
  NUM_3: 10,
  NUM_4: 11,
  NUM_5: 12,
  NUM_6: 13,
  NUM_7: 14,
  NUM_8: 15,
  NUM_9: 16,

  // Star / pound
  STAR: 17,
  POUND: 18,
} as const;

export type KeyCode = typeof KeyCodes[keyof typeof KeyCodes];

/**
 * Helpers
 * -------
 * Use these instead of raw comparisons.
 */

export function isNumericKey(code: number): boolean {
  return code >= KeyCodes.NUM_0 && code <= KeyCodes.NUM_9;
}

export function numericValueFromKey(code: number): number | null {
  if (!isNumericKey(code)) return null;
  return code - KeyCodes.NUM_0;
}

export function isDpadKey(code: number): boolean {
  return (
    code === KeyCodes.DPAD_UP ||
    code === KeyCodes.DPAD_DOWN ||
    code === KeyCodes.DPAD_LEFT ||
    code === KeyCodes.DPAD_RIGHT ||
    code === KeyCodes.DPAD_CENTER
  );
}
