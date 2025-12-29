import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import BaseText from "../components/BaseText";
import FocusOverlay from "../components/FocusOverlay";
import { colors } from "../theme/colors";
import { spacing, radius, editor } from "../theme/tokens";

/**
 * FilterStrip.tsx
 * ----------------
 * Horizontal filter selector used in Editor.
 *
 * Rules:
 * - Single-row horizontal strip
 * - Text-only previews (no thumbnails)
 * - Keypad + touch friendly
 * - Base44 visual parity
 * - 3.5" FIG phone safe
 */

export type FilterItem = {
  key: string;
  label: string;
};

type Props = {
  filters: FilterItem[];
  activeKey: string;
  focusedKey?: string | null;
  onSelect: (key: string) => void;
};

export default function FilterStrip({
  filters,
  activeKey,
  focusedKey,
  onSelect,
}: Props) {
  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={filters}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isActive = item.key === activeKey;
          const isFocused = item.key === focusedKey;

          return (
            <Pressable
              onPress={() => onSelect(item.key)}
              style={[
                styles.item,
                isActive && styles.active,
              ]}
            >
              <BaseText
                variant="label"
                color={isActive ? colors.primary : colors.textSecondary}
              >
                {item.label}
              </BaseText>

              <FocusOverlay
                focused={isFocused}
                radiusOverride={radius.sm}
              />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: editor.filterStripHeight,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  list: {
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  item: {
    height: editor.filterItemHeight,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  active: {
    backgroundColor: colors.surfaceActive,
  },
});
