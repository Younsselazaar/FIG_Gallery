import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";

import PhotoGrid, { PhotoItem } from "../components/PhotoGrid";
import BottomSheet from "../components/BottomSheet";
import BaseText from "../components/BaseText";

import {
  getArchivedPhotos,
  archivePhoto,
} from "../db/photoRepository";

import { useGridFocus } from "../keypad/useGridFocus";

import { colors, dark } from "../theme/colors";
import { spacing, heights } from "../theme/tokens";
import { scale, fontScale, verticalScale } from "../theme/responsive";

/**
 * ArchivedScreen.tsx
 * ------------------
 * Container for archived photos.
 *
 * FIG rules:
 * - Offline-only
 * - No gestures
 * - 3.5" screen safe
 */

export default function ArchivedScreen() {
  const navigation = useNavigation<any>();

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [menuPhotoId, setMenuPhotoId] = useState<string | null>(null);

  const loadArchivedPhotos = useCallback(async () => {
    try {
      const archived = await getArchivedPhotos();
      setPhotos(
        archived.map((p) => ({
          id: p.id,
          uri: p.uri,
        }))
      );
    } catch (error) {
      console.error("Error loading archived photos:", error);
    }
  }, []);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadArchivedPhotos();
    }, [loadArchivedPhotos])
  );

  const openViewer = (index: number) => {
    const photo = photos[index];
    if (!photo) return;
    navigation.navigate("Viewer", { photoId: photo.id });
  };

  const handleUnarchive = async () => {
    if (!menuPhotoId) return;
    await archivePhoto(menuPhotoId, false);
    setMenuPhotoId(null);
    loadArchivedPhotos();
  };

  const { focusedIndex } = useGridFocus({
    itemCount: photos.length,
    columns: 3,
    onSelect: openViewer,
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width={scale(24)} height={scale(24)} viewBox="0 0 24 24">
            <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#1F2937" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>Archived Pictures</Text>
        <View style={styles.headerRight}>
          <Text style={styles.photoCount}>{photos.length} items</Text>
        </View>
      </View>

      {photos.length === 0 ? (
        <View style={styles.emptyState}>
          <Svg width={scale(64)} height={scale(64)} viewBox="0 0 24 24">
            <Path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z" fill="#9CA3AF" />
          </Svg>
          <Text style={styles.emptyText}>No archived pictures</Text>
          <Text style={styles.emptySubtext}>Photos you archive will appear here</Text>
        </View>
      ) : (
        <PhotoGrid
          photos={photos}
          columns={3}
          onPress={(photoId) =>
            navigation.navigate("Viewer", { photoId })
          }
          onLongPress={(photoId) => setMenuPhotoId(photoId)}
        />
      )}

      <BottomSheet
        visible={!!menuPhotoId}
        onClose={() => setMenuPhotoId(null)}
        actions={[
          {
            key: "open",
            label: "Open",
            onPress: () => {
              const index = photos.findIndex(
                (p) => p.id === menuPhotoId
              );
              if (index >= 0) openViewer(index);
            },
          },
          {
            key: "unarchive",
            label: "Remove from Archived Pictures",
            onPress: handleUnarchive,
          },
        ]}
      />
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: fontScale(18),
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontScale(14),
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
});
