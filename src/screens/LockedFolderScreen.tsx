import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import PhotoGrid, { PhotoItem } from "../components/PhotoGrid";
import BottomSheet from "../components/BottomSheet";
import BaseText from "../components/BaseText";

import {
  getAllPhotos,
  hidePhoto,
} from "../db/photoRepository";

import { useGridFocus } from "../keypad/useGridFocus";

import { colors } from "../theme/colors";
import { spacing, heights } from "../theme/tokens";

/**
 * LockedFolderScreen.tsx
 * ----------------------
 * Secure container for hidden photos.
 *
 * Base44 parity:
 * - Same grid as Home
 * - No special visual treatment
 *
 * FIG rules:
 * - Access gated by PIN (handled upstream)
 * - Offline-only
 * - No gestures
 * - 3.5" screen safe
 */

export default function LockedFolderScreen() {
  const navigation = useNavigation<any>();

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [menuPhotoId, setMenuPhotoId] = useState<string | null>(null);

  useEffect(() => {
    loadHiddenPhotos();
  }, []);

  const loadHiddenPhotos = async () => {
    const list = await getAllPhotos();
    const hidden = list.filter((p) => p.hidden);

    setPhotos(
      hidden.map((p) => ({
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

  const handleUnhide = async () => {
    if (!menuPhotoId) return;
    await hidePhoto(menuPhotoId, false);
    setMenuPhotoId(null);
    loadHiddenPhotos();
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
        <BaseText variant="title">Locked Folder</BaseText>
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
            key: "unhide",
            label: "Remove from Locked Folder",
            onPress: handleUnhide,
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
