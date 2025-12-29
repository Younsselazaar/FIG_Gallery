import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import PhotoGrid, { PhotoItem } from "../components/PhotoGrid";
import BottomSheet from "../components/BottomSheet";
import BaseText from "../components/BaseText";

import {
  getTrashedPhotos,
  trashPhoto,
  deletePhotoPermanently,
} from "../db/photoRepository";

import { useGridFocus } from "../keypad/useGridFocus";

import { colors } from "../theme/colors";
import { spacing, heights } from "../theme/tokens";

/**
 * TrashScreen.tsx
 * ----------------
 * Trash / Recently Deleted screen.
 *
 * Base44 parity:
 * - Same grid layout as Home
 * - Actions via bottom sheet
 * - No gestures
 *
 * FIG rules:
 * - Offline-only
 * - Keypad + touch
 * - 3.5" screen safe
 */

export default function TrashScreen() {
  const navigation = useNavigation<any>();

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [menuPhotoId, setMenuPhotoId] = useState<string | null>(null);

  useEffect(() => {
    loadTrashedPhotos();
  }, []);

  const loadTrashedPhotos = async () => {
    const list = await getTrashedPhotos();
    setPhotos(
      list.map((p) => ({
        id: p.id,
        uri: p.uri,
      }))
    );
  };

  const openViewer = (index: number) => {
    const photo = photos[index];
    if (!photo) return;
    navigation.navigate("Viewer", { photoId: photo.id });
  };

  const handleRestore = async () => {
    if (!menuPhotoId) return;
    await trashPhoto(menuPhotoId, false);
    setMenuPhotoId(null);
    loadTrashedPhotos();
  };

  const handleDeleteForever = async () => {
    if (!menuPhotoId) return;
    await deletePhotoPermanently(menuPhotoId);
    setMenuPhotoId(null);
    loadTrashedPhotos();
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
        <BaseText variant="title">Trash</BaseText>
      </View>

      <PhotoGrid
        photos={photos}
        columns="medium"
        focusedId={photos[focusedIndex]?.id}
        onPress={(photoId) =>
          navigation.navigate("Viewer", { photoId })
        }
      />

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
            key: "restore",
            label: "Restore",
            onPress: handleRestore,
          },
          {
            key: "delete",
            label: "Delete Permanently",
            destructive: true,
            onPress: handleDeleteForever,
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
    height: heights.header,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
