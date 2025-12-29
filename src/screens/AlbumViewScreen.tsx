import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import Svg, { Path, Rect, Circle } from "react-native-svg";

import { PhotoGridSection, PhotoItem } from "../components/PhotoGrid";

import {
  getAlbumById,
  getPhotosForAlbum,
  removePhotoFromAlbum,
} from "../db/albumRepository";
import { getPhotoById } from "../db/photoRepository";

import { light, brand } from "../theme/colors";
import { scale, fontScale } from "../theme/responsive";

/**
 * AlbumViewScreen.tsx
 * -------------------
 * Displays photos inside a single album with same UI as HomeScreen.
 */

// Icons
function GridIcon({ size = 24, color = light.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3" y="3" width="8" height="8" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="13" y="3" width="8" height="8" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="3" y="13" width="8" height="8" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="13" y="13" width="8" height="8" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

function CompactGridIcon({ size = 24, color = light.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="2" y="2" width="5.5" height="5.5" rx="0.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="9.25" y="2" width="5.5" height="5.5" rx="0.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="16.5" y="2" width="5.5" height="5.5" rx="0.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="2" y="9.25" width="5.5" height="5.5" rx="0.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="9.25" y="9.25" width="5.5" height="5.5" rx="0.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="16.5" y="9.25" width="5.5" height="5.5" rx="0.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="2" y="16.5" width="5.5" height="5.5" rx="0.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="9.25" y="16.5" width="5.5" height="5.5" rx="0.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="16.5" y="16.5" width="5.5" height="5.5" rx="0.5" stroke={color} strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

function MoreIcon({ size = 24, color = light.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="5" r="2" fill={color} />
      <Circle cx="12" cy="12" r="2" fill={color} />
      <Circle cx="12" cy="19" r="2" fill={color} />
    </Svg>
  );
}

function BackIcon({ size = 24, color = light.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function SelectIcon({ size = 20, color = light.textSecondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
      <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ShareIcon({ size = 20, color = light.textSecondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2" />
      <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth="2" />
      <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth="2" />
      <Path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

function HeartIcon({ size = 20, color = light.textSecondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    </Svg>
  );
}

function TrashIcon({ size = 20, color = "#E53935" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6H5H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke={color} strokeWidth="2" />
      <Path d="M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

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
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [gridColumns, setGridColumns] = useState(4);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const toggleGridView = () => setGridColumns((prev) => (prev === 4 ? 5 : 4));

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

  const handlePhotoPress = (photoId: string) => {
    if (selectionMode) {
      setSelectedPhotos((prev) =>
        prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
      );
    } else {
      navigation.navigate("Viewer", { photoId, photoUri: photoId });
    }
  };

  const enterSelectionMode = () => {
    setSelectionMode(true);
    setSelectedPhotos([]);
    setMenuVisible(false);
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedPhotos([]);
  };

  const selectAllPhotos = () => {
    setSelectionMode(true);
    setSelectedPhotos(photos.map((p) => p.id));
    setMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Title bar like HomeScreen */}
      <View style={styles.titleBar}>
        <View style={styles.titleLeft}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <BackIcon size={scale(24)} color={light.textPrimary} />
          </Pressable>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{photos.length} photos</Text>
          </View>
        </View>
        <View style={styles.titleActions}>
          {selectionMode ? (
            <>
              <Pressable style={styles.cancelButton} onPress={exitSelectionMode}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Text style={styles.selectedText}>{selectedPhotos.length} selected</Text>
              <Pressable style={styles.moreButtonTeal} onPress={() => setMenuVisible(!menuVisible)}>
                <MoreIcon size={scale(18)} color="white" />
              </Pressable>
            </>
          ) : (
            <>
              <Pressable style={styles.iconButton} onPress={toggleGridView}>
                {gridColumns === 4 ? (
                  <GridIcon size={scale(22)} color={light.textSecondary} />
                ) : (
                  <CompactGridIcon size={scale(22)} color={brand.teal} />
                )}
              </Pressable>
              <Pressable style={styles.iconButton} onPress={() => setMenuVisible(!menuVisible)}>
                <MoreIcon size={scale(18)} color={light.textPrimary} />
              </Pressable>
            </>
          )}
        </View>
      </View>

      {/* Dropdown Menu */}
      {menuVisible && (
        <>
          <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)} />
          <View style={styles.menuOverlay}>
            <View style={styles.menuDropdown}>
              {selectionMode ? (
                <>
                  <Pressable style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                    <ShareIcon size={scale(20)} />
                    <Text style={styles.menuItemText}>Share</Text>
                  </Pressable>
                  <Pressable style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                    <HeartIcon size={scale(20)} />
                    <Text style={styles.menuItemText}>Add to Favorites</Text>
                  </Pressable>
                  <Pressable style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                    <TrashIcon size={scale(20)} />
                    <Text style={[styles.menuItemText, styles.menuItemTextDelete]}>Delete</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable style={styles.menuItem} onPress={enterSelectionMode}>
                    <SelectIcon size={scale(20)} />
                    <Text style={styles.menuItemText}>Select</Text>
                  </Pressable>
                  <Pressable style={styles.menuItem} onPress={selectAllPhotos}>
                    <SelectIcon size={scale(20)} />
                    <Text style={styles.menuItemText}>Select All</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </>
      )}

      {/* Photo Grid */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <PhotoGridSection
          photos={photos}
          columns={gridColumns}
          onPress={handlePhotoPress}
          showFavorites={true}
          selectionMode={selectionMode}
          selectedIds={new Set(selectedPhotos)}
        />
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: light.background,
  },
  titleBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(8),
    paddingVertical: scale(12),
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: scale(8),
    marginRight: scale(4),
  },
  title: {
    fontSize: fontScale(24),
    fontWeight: "700",
    color: light.textPrimary,
  },
  subtitle: {
    fontSize: fontScale(14),
    color: light.textSecondary,
    marginTop: scale(2),
  },
  titleActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  iconButton: {
    padding: scale(8),
    borderRadius: scale(6),
    borderWidth: 1,
    borderColor: light.border,
  },
  cancelButton: {
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
    borderRadius: scale(20),
    backgroundColor: light.surfaceSecondary,
  },
  cancelButtonText: {
    fontSize: fontScale(14),
    fontWeight: "500",
    color: light.textPrimary,
  },
  selectedText: {
    fontSize: fontScale(14),
    color: light.textSecondary,
    marginHorizontal: scale(8),
  },
  moreButtonTeal: {
    backgroundColor: brand.teal,
    padding: scale(8),
    borderRadius: scale(8),
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  bottomPadding: {
    height: scale(80),
  },
  menuBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  menuOverlay: {
    position: "absolute",
    top: scale(70),
    right: scale(16),
    zIndex: 100,
  },
  menuDropdown: {
    backgroundColor: light.background,
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: scale(160),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    gap: scale(12),
  },
  menuItemText: {
    fontSize: fontScale(15),
    color: light.textPrimary,
  },
  menuItemTextDelete: {
    color: "#E53935",
  },
});
