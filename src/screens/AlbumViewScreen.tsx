import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, RefreshControl } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";

import PhotoGrid, { PhotoItem } from "../components/PhotoGrid";
import BottomSheet from "../components/BottomSheet";
import BaseText from "../components/BaseText";

import {
  getAlbumById,
  getPhotosForAlbum,
  removePhotoFromAlbum,
} from "../db/albumRepository";
import { getPhotoById } from "../db/photoRepository";

import { useGridFocus } from "../keypad/useGridFocus";

import { colors } from "../theme/colors";
import { spacing, heights } from "../theme/tokens";
import { scale } from "../theme/responsive";

/**
 * AlbumViewScreen.tsx
 * -------------------
 * Displays photos inside a single album.
 * Supports both custom albums (from DB) and device albums (from CameraRoll).
 *
 * Base44 parity:
 * - Same grid behavior as Home
 * - No inline headers
 * - Context actions via bottom sheet
 *
 * FIG adaptations:
 * - 3.5" screen safe
 * - Keypad navigation
 * - No gestures required
 */

type RouteParams = {
  albumId: string;
  albumName?: string;
  isDevice?: boolean;
  groupName?: string;
};

export default function AlbumViewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { albumId, albumName, isDevice, groupName } = route.params as RouteParams;

  const [title, setTitle] = useState(albumName || "");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [menuPhotoId, setMenuPhotoId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlbum();
  }, []);

  const loadAlbum = async () => {
    setLoading(true);

    if (isDevice && groupName) {
      // Load photos from device album using CameraRoll
      await loadDeviceAlbumPhotos(groupName);
    } else {
      // Load photos from custom album (database)
      await loadCustomAlbumPhotos();
    }

    setLoading(false);
  };

  const loadDeviceAlbumPhotos = async (albumGroupName: string) => {
    try {
      setTitle(albumGroupName);

      let allPhotos: PhotoItem[] = [];
      let hasMore = true;
      let endCursor: string | undefined;

      while (hasMore) {
        const result = await CameraRoll.getPhotos({
          first: 100,
          after: endCursor,
          groupName: albumGroupName,
          assetType: "Photos",
          include: ["filename", "fileSize", "imageSize"],
        });

        for (const edge of result.edges) {
          const node = edge.node;
          allPhotos.push({
            id: node.image.uri,
            uri: node.image.uri,
          });
        }

        hasMore = result.page_info.has_next_page;
        endCursor = result.page_info.end_cursor;
      }

      setPhotos(allPhotos);
      setFocusedIndex(0);
    } catch (err) {
      console.error("Error loading device album photos:", err);
      setPhotos([]);
    }
  };

  const loadCustomAlbumPhotos = async () => {
    try {
      const album = await getAlbumById(albumId);
      if (album) setTitle(album.name);

      const photoIds = await getPhotosForAlbum(albumId);
      const items: PhotoItem[] = [];

      for (const id of photoIds) {
        const photo = await getPhotoById(id);
        if (photo) {
          items.push({
            id: photo.id,
            uri: photo.uri,
          });
        }
      }

      setPhotos(items);
      setFocusedIndex(0);
    } catch (err) {
      console.error("Error loading custom album photos:", err);
      setPhotos([]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAlbum();
    setRefreshing(false);
  }, [isDevice, groupName, albumId]);

  const openViewer = (index: number) => {
    const photo = photos[index];
    if (!photo) return;
    navigation.navigate("Viewer", { photoId: photo.id, photoUri: photo.uri });
  };

  const handleRemove = async () => {
    if (!menuPhotoId) return;
    if (!isDevice) {
      await removePhotoFromAlbum(albumId, menuPhotoId);
    }
    setMenuPhotoId(null);
    loadAlbum();
  };

  const { focusedIndex: gridFocus } = useGridFocus({
    itemCount: photos.length,
    columns: 3,
    initialIndex: focusedIndex,
    onSelect: openViewer,
  });

  return (
    <View style={styles.container}>
      {/* Title (single-line, non-scrollable) */}
      <View style={styles.header}>
        <BaseText variant="title">{title}</BaseText>
        <BaseText variant="caption" style={styles.subtitle}>
          {photos.length} photos
        </BaseText>
      </View>

      <PhotoGrid
        photos={photos}
        columns="medium"
        focusedId={photos[gridFocus]?.id}
        onPress={(photoId) =>
          navigation.navigate("Viewer", { photoId, photoUri: photoId })
        }
        onLongPress={(photoId) => setMenuPhotoId(photoId)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <BottomSheet
        visible={!!menuPhotoId}
        onClose={() => setMenuPhotoId(null)}
        actions={[
          {
            key: "open",
            label: "Open Photo",
            onPress: () => {
              const index = photos.findIndex(
                (p) => p.id === menuPhotoId
              );
              if (index >= 0) openViewer(index);
            },
          },
          ...(!isDevice
            ? [
                {
                  key: "remove",
                  label: "Remove from Album",
                  destructive: true,
                  onPress: handleRemove,
                },
              ]
            : []),
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
    minHeight: heights.header,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: scale(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  subtitle: {
    marginTop: scale(2),
    opacity: 0.6,
  },
});
