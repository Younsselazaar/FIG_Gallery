import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import BaseText from "../components/BaseText";
import FocusOverlay from "../components/FocusOverlay";

import { KeyCodes, isNumericKey, numericValueFromKey } from "../keypad/keyCodes";
import { useKeypad } from "../keypad/KeypadContext";

import { getPin, setPin, verifyPin } from "../security/pinStore";

import { colors } from "../theme/colors";
import { spacing, radius, focus } from "../theme/tokens";
import { moderateScale } from "../theme/responsive";

/**
 * PinScreen.tsx
 * -------------
 * PIN entry / setup screen for Locked Folder.
 *
 * Modes:
 * - "enter": verify existing PIN
 * - "set": create a new PIN
 *
 * Design rules:
 * - Numeric keypad only
 * - No text input fields
 * - No gestures
 * - Single-line text
 * - 3.5" FIG phone safe
 */

type RouteParams = {
  mode: "enter" | "set";
};

const PIN_LENGTH = 4;

export default function PinScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { mode } = route.params as RouteParams;

  const { registerHandler, unregisterHandler } = useKeypad();

  const [entered, setEntered] = useState<number[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const handler = (keyCode: number) => {
      if (isNumericKey(keyCode)) {
        const value = numericValueFromKey(keyCode);
        if (value === null) return true;

        if (entered.length < PIN_LENGTH) {
          setEntered((prev) => [...prev, value]);
        }
        return true;
      }

      if (keyCode === KeyCodes.BACK) {
        if (entered.length > 0) {
          setEntered((prev) => prev.slice(0, -1));
          return true;
        }
        navigation.goBack();
        return true;
      }

      return false;
    };

    registerHandler(handler);
    return () => unregisterHandler(handler);
  }, [entered, navigation, registerHandler, unregisterHandler]);

  useEffect(() => {
    if (entered.length === PIN_LENGTH) {
      handleSubmit();
    }
  }, [entered]);

  const handleSubmit = async () => {
    const pin = entered.join("");

    if (mode === "set") {
      await setPin(pin);
      navigation.replace("LockedFolder");
      return;
    }

    const valid = await verifyPin(pin);
    if (valid) {
      navigation.replace("LockedFolder");
    } else {
      setError(true);
      setEntered([]);
      setTimeout(() => setError(false), 800);
    }
  };

  return (
    <View style={styles.container}>
      <BaseText variant="title">
        {mode === "set" ? "Set PIN" : "Enter PIN"}
      </BaseText>

      <View style={styles.dotsRow}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => {
          const filled = i < entered.length;
          return (
            <View key={i} style={styles.dotWrap}>
              <View
                style={[
                  styles.dot,
                  filled && styles.dotFilled,
                  error && styles.dotError,
                ]}
              />
              <FocusOverlay focused={i === entered.length} />
            </View>
          );
        })}
      </View>

      <BaseText
        variant="body"
        color={error ? colors.error : colors.textSecondary}
      >
        {error ? "Incorrect PIN" : "Use keypad to enter PIN"}
      </BaseText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  dotsRow: {
    flexDirection: "row",
    marginVertical: spacing.lg,
  },
  dotWrap: {
    marginHorizontal: spacing.sm,
  },
  dot: {
    width: moderateScale(14, 0.4),
    height: moderateScale(14, 0.4),
    borderRadius: radius.full,
    borderWidth: focus.ringWidth,
    borderColor: colors.border,
  },
  dotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotError: {
    borderColor: colors.error,
  },
});
