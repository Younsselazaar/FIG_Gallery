import React from "react";
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
} from "react-native";

import BaseText from "./BaseText";
import { colors } from "../theme/colors";
import { spacing, radius, bottomSheet } from "../theme/tokens";

/**
 * BottomSheet.tsx
 * ----------------
 * Base44-style bottom sheet for FIG Gallery.
 *
 * Rules:
 * - Full-width sheet
 * - Single-line actions only
 * - No dialogs
 * - Thumb + keypad friendly
 * - 3.5" FIG phone safe
 */

export type BottomSheetAction = {
  key: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  actions: BottomSheetAction[];
};

export default function BottomSheet({
  visible,
  onClose,
  actions,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.container}>
        {actions.map(action => (
          <Pressable
            key={action.key}
            onPress={() => {
              onClose();
              action.onPress();
            }}
            style={({ pressed }) => [
              styles.row,
              pressed && styles.pressed,
            ]}
          >
            <BaseText
              variant="label"
              color={action.destructive ? colors.error : colors.textPrimary}
            >
              {action.label}
            </BaseText>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayDark,
  },
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: `${bottomSheet.maxHeightRatio * 100}%`,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: spacing.lg,
  },
  row: {
    height: bottomSheet.handleHeight + 20,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: colors.overlayLight,
  },
});
