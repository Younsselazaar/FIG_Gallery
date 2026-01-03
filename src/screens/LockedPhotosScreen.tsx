import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";

import PhotoGrid, { PhotoItem } from "../components/PhotoGrid";
import BottomSheet from "../components/BottomSheet";

import {
  getHiddenPhotos,
  hidePhoto,
} from "../db/photoRepository";

import { useGridFocus } from "../keypad/useGridFocus";

import { colors } from "../theme/colors";
import { spacing } from "../theme/tokens";
import { scale, fontScale, verticalScale } from "../theme/responsive";

/**
 * LockedPhotosScreen.tsx
 * ----------------------
 * Shows photos in the Locked Pictures folder.
 */

export default function LockedPhotosScreen() {
  const navigation = useNavigation<any>();

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [menuPhotoId, setMenuPhotoId] = useState<string | null>(null);

  const loadLockedPhotos = useCallback(async () => {
    try {
      const hidden = await getHiddenPhotos();
      setPhotos(
        hidden.map((p) => ({
          id: p.id,
          uri: p.uri,
        }))
      );
    } catch (error) {
      console.error("Error loading locked photos:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLockedPhotos();
    }, [loadLockedPhotos])
  );

  const openViewer = (index: number) => {
    const photo = photos[index];
    if (!photo) return;
    navigation.navigate("Viewer", { photoId: photo.id });
  };

  const handleUnlock = async () => {
    if (!menuPhotoId) return;
    await hidePhoto(menuPhotoId, false);
    setMenuPhotoId(null);
    loadLockedPhotos();
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
        <Text style={styles.headerTitle}>Locked Pictures</Text>
        <View style={styles.headerRight}>
          <Text style={styles.photoCount}>{photos.length} items</Text>
        </View>
      </View>

      {photos.length === 0 ? (
        <View style={styles.emptyState}>
          <Svg width={scale(64)} height={scale(64)} viewBox="0 0 24 24">
            <Path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="#9CA3AF" />
          </Svg>
          <Text style={styles.emptyText}>No locked pictures</Text>
          <Text style={styles.emptySubtext}>Photos you move to locked folder will appear here</Text>
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
            key: "unlock",
            label: "Remove from Locked Pictures",
            onPress: handleUnlock,
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
