import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

/**
 * pinStore.ts
 * -----------
 * Secure PIN storage for FIG Gallery Locked Folder.
 *
 * Rules:
 * - PIN is NEVER stored in plaintext
 * - Uses SHA-256 hash
 * - Offline-only
 * - No biometric / OS dependency
 * - Android 11–13 safe
 *
 * This is intentionally simple and deterministic.
 */

const PIN_KEY = "@fig_gallery_pin_hash";

/**
 * Hash a PIN using SHA-256
 */
async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin
  );
}

/**
 * Check if a PIN already exists
 */
export async function hasPin(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(PIN_KEY);
  return !!stored;
}

/**
 * Store a new PIN (hashed)
 */
export async function setPin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  await AsyncStorage.setItem(PIN_KEY, hash);
}

/**
 * Verify entered PIN against stored hash
 */
export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await AsyncStorage.getItem(PIN_KEY);
  if (!stored) return false;

  const hash = await hashPin(pin);
  return stored === hash;
}

/**
 * Get raw hash (internal use only)
 * DO NOT expose to UI
 */
export async function getPin(): Promise<string | null> {
  return AsyncStorage.getItem(PIN_KEY);
}

/**
 * Remove PIN completely
 * (used for reset / dev tools only)
 */
export async function clearPin(): Promise<void> {
  await AsyncStorage.removeItem(PIN_KEY);
}
