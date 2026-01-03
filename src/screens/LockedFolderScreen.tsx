import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Svg, { Path, Rect } from "react-native-svg";

import {
  getHiddenPhotos,
  getArchivedPhotos,
} from "../db/photoRepository";

import { colors } from "../theme/colors";
import { spacing } from "../theme/tokens";
import { scale, fontScale, verticalScale } from "../theme/responsive";

/**
 * LockedFolderScreen.tsx
 * ----------------------
 * Hidden folder container with two sub-folders:
 * - Locked Pictures
 * - Archived Pictures
 */

export default function LockedFolderScreen() {
  const navigation = useNavigation<any>();

  const [lockedCount, setLockedCount] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);

  const loadCounts = useCallback(async () => {
    try {
      const hidden = await getHiddenPhotos();
      const archived = await getArchivedPhotos();
      setLockedCount(hidden.length);
      setArchivedCount(archived.length);
    } catch (error) {
      console.error("Error loading counts:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCounts();
    }, [loadCounts])
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width={scale(24)} height={scale(24)} viewBox="0 0 24 24">
            <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#1F2937" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>Hidden</Text>
        <View style={styles.headerRight}>
          <Text style={styles.photoCount}>{lockedCount + archivedCount} items</Text>
        </View>
      </View>

      {/* Folder List */}
      <View style={styles.folderList}>
        {/* Locked Pictures Folder */}
        <Pressable
          style={styles.folderCard}
          onPress={() => navigation.navigate("LockedPhotos")}
        >
          <View style={styles.folderIconContainer}>
            <Svg width={scale(40)} height={scale(40)} viewBox="0 0 24 24">
              <Rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="#6B7280" strokeWidth="2" />
              <Path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#6B7280" strokeWidth="2" fill="none" />
            </Svg>
          </View>
          <View style={styles.folderInfo}>
            <Text style={styles.folderName}>Locked Pictures</Text>
            <Text style={styles.folderCount}>{lockedCount} items</Text>
          </View>
          <Svg width={scale(24)} height={scale(24)} viewBox="0 0 24 24">
            <Path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" fill="#9CA3AF" />
          </Svg>
        </Pressable>

        {/* Archived Pictures Folder */}
        <Pressable
          style={styles.folderCard}
          onPress={() => navigation.navigate("Archived")}
        >
          <View style={styles.folderIconContainer}>
            <Svg width={scale(40)} height={scale(40)} viewBox="0 0 24 24">
              <Path
                d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"
                fill="none"
                stroke="#6B7280"
                strokeWidth="1.5"
              />
            </Svg>
          </View>
          <View style={styles.folderInfo}>
            <Text style={styles.folderName}>Archived Pictures</Text>
            <Text style={styles.folderCount}>{archivedCount} items</Text>
          </View>
          <Svg width={scale(24)} height={scale(24)} viewBox="0 0 24 24">
            <Path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" fill="#9CA3AF" />
          </Svg>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    paddingTop: verticalScale(40),
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontScale(18),
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  photoCount: {
    fontSize: fontScale(14),
    color: colors.textSecondary,
  },
  folderList: {
    padding: spacing.md,
  },
  folderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: scale(12),
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  folderIconContainer: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(12),
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  folderInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  folderName: {
    fontSize: fontScale(16),
    fontWeight: "600",
    color: colors.text,
  },
  folderCount: {
    fontSize: fontScale(13),
    color: colors.textSecondary,
    marginTop: scale(2),
  },
});
