import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";

import Header from "../components/Header";
import SideDrawer from "../components/SideDrawer";
import { light, brand } from "../theme/colors";
import { spacing } from "../theme/tokens";
import { scale, fontScale } from "../theme/responsive";

import {
  getTrashedPhotos,
  trashPhoto,
  deletePhotoPermanently,
} from "../db/photoRepository";

/**
 * TrashScreen.tsx
 * ----------------
 * Trash / Recently Deleted screen with restore and delete options.
 */

function TrashIcon({ size = 24, color = light.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function RestoreIcon({ size = 20, color = brand.teal }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3 3v5h5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function DeleteIcon({ size = 20, color = "#EF4444" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

type TrashedPhoto = {
  id: string;
  uri: string;
  trashedAt?: string;
};

export default function TrashScreen() {
  const navigation = useNavigation<any>();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [photos, setPhotos] = useState<TrashedPhoto[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<TrashedPhoto | null>(null);

  const loadTrashedPhotos = useCallback(async () => {
    try {
      const list = await getTrashedPhotos();
      setPhotos(
        list.map((p: any) => ({
          id: p.id,
          uri: p.uri,
          trashedAt: p.modifiedAt,
        }))
      );
    } catch (error) {
      console.error("Error loading trashed photos:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTrashedPhotos();
    }, [loadTrashedPhotos])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrashedPhotos();
    setRefreshing(false);
  }, [loadTrashedPhotos]);

  const handlePhotoPress = (photo: TrashedPhoto) => {
    setSelectedPhoto(photo);
  };

  const handleRestore = async () => {
    if (!selectedPhoto) return;

    try {
      await trashPhoto(selectedPhoto.id, false);
      setSelectedPhoto(null);
      loadTrashedPhotos();
    } catch (error) {
      console.error("Error restoring photo:", error);
      Alert.alert("Error", "Failed to restore photo");
    }
  };

  const handleDeletePermanently = async () => {
    if (!selectedPhoto) return;

    Alert.alert(
      "Delete Permanently",
      "This photo will be permanently deleted from your device. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePhotoPermanently(selectedPhoto.id);
              setSelectedPhoto(null);
              loadTrashedPhotos();
            } catch (error) {
              console.error("Error deleting photo:", error);
              Alert.alert("Error", "Failed to delete photo");
            }
          },
        },
      ]
    );
  };

  const handleRestoreAll = async () => {
    if (photos.length === 0) return;

    Alert.alert(
      "Restore All",
      `Restore all ${photos.length} photos from trash?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore All",
          onPress: async () => {
            try {
              for (const photo of photos) {
                await trashPhoto(photo.id, false);
              }
              loadTrashedPhotos();
            } catch (error) {
              console.error("Error restoring all photos:", error);
            }
          },
        },
      ]
    );
  };

  const handleEmptyTrash = async () => {
    if (photos.length === 0) return;

    Alert.alert(
      "Empty Trash",
      `Permanently delete all ${photos.length} photos? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              for (const photo of photos) {
                await deletePhotoPermanently(photo.id);
              }
              loadTrashedPhotos();
            } catch (error) {
              console.error("Error emptying trash:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header onMenuPress={() => setDrawerVisible(true)} />

      {/* Title Bar */}
      <View style={styles.titleBar}>
        <View style={styles.titleLeft}>
          <TrashIcon size={scale(24)} color={light.textPrimary} />
          <View style={styles.titleTextContainer}>
            <Text style={styles.title}>Trash</Text>
            <Text style={styles.subtitle}>{photos.length} items</Text>
          </View>
        </View>
        {photos.length > 0 && (
          <View style={styles.headerActions}>
            <Pressable style={styles.headerButton} onPress={handleRestoreAll}>
              <Text style={styles.restoreAllText}>Restore All</Text>
            </Pressable>
            <Pressable style={styles.emptyTrashButton} onPress={handleEmptyTrash}>
              <Text style={styles.emptyTrashText}>Empty</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Selected Photo Actions */}
      {selectedPhoto && (
        <View style={styles.selectedPhotoBar}>
          <Pressable style={styles.closeSelection} onPress={() => setSelectedPhoto(null)}>
            <Text style={styles.closeSelectionText}>× Close</Text>
          </Pressable>
          <Image source={{ uri: selectedPhoto.uri }} style={styles.selectedThumb} />
          <Pressable style={styles.restoreButton} onPress={handleRestore}>
            <RestoreIcon size={scale(18)} color={brand.teal} />
            <Text style={styles.restoreText}>Restore</Text>
          </Pressable>
          <Pressable style={styles.deleteButton} onPress={handleDeletePermanently}>
            <DeleteIcon size={scale(18)} color="#EF4444" />
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      )}

      {/* Photos Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.gridContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {photos.length === 0 ? (
          <View style={styles.emptyState}>
            <TrashIcon size={scale(64)} color={light.textTertiary} />
            <Text style={styles.emptyText}>Trash is empty</Text>
            <Text style={styles.emptySubtext}>
              Deleted photos will appear here for 30 days before being permanently removed
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {photos.map((photo) => (
              <Pressable
                key={photo.id}
                style={[
                  styles.photoItem,
                  selectedPhoto?.id === photo.id && styles.photoItemSelected,
                ]}
                onPress={() => handlePhotoPress(photo)}
              >
                <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                {selectedPhoto?.id === photo.id && (
                  <View style={styles.selectedOverlay}>
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        currentScreen="Trash"
        navigation={navigation}
      />
    </View>
  );
}

const PHOTO_SIZE = scale(105);
const PHOTO_GAP = scale(4);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: light.background,
  },
  titleBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  titleTextContainer: {
    marginLeft: scale(4),
  },
  title: {
    fontSize: fontScale(22),
    fontWeight: "700",
    color: light.textPrimary,
  },
  subtitle: {
    fontSize: fontScale(13),
    color: light.textSecondary,
    marginTop: scale(2),
  },
  headerActions: {
    flexDirection: "row",
    gap: scale(10),
  },
  headerButton: {
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
  },
  restoreAllText: {
    fontSize: fontScale(14),
    fontWeight: "500",
    color: brand.teal,
  },
  emptyTrashButton: {
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
  },
  emptyTrashText: {
    fontSize: fontScale(14),
    fontWeight: "500",
    color: "#EF4444",
  },
  selectedPhotoBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: light.surface,
    borderBottomWidth: 1,
    borderBottomColor: light.border,
    gap: scale(12),
  },
  closeSelection: {
    paddingRight: scale(8),
  },
  closeSelectionText: {
    fontSize: fontScale(14),
    color: light.textSecondary,
  },
  selectedThumb: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(6),
  },
  restoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: brand.teal,
  },
  restoreText: {
    fontSize: fontScale(13),
    fontWeight: "500",
    color: brand.teal,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  deleteText: {
    fontSize: fontScale(13),
    fontWeight: "500",
    color: "#EF4444",
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    paddingHorizontal: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: PHOTO_GAP,
  },
  photoItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: scale(4),
    overflow: "hidden",
  },
  photoItemSelected: {
    borderWidth: 3,
    borderColor: brand.teal,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 175, 185, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: brand.teal,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "#FFFFFF",
    fontSize: fontScale(16),
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: scale(80),
    paddingHorizontal: scale(40),
  },
  emptyText: {
    fontSize: fontScale(18),
    fontWeight: "600",
    color: light.textPrimary,
    marginTop: spacing.lg,
    marginBottom: scale(8),
  },
  emptySubtext: {
    fontSize: fontScale(14),
    color: light.textSecondary,
    textAlign: "center",
    lineHeight: fontScale(20),
  },
  bottomPadding: {
    height: scale(80),
  },
});
