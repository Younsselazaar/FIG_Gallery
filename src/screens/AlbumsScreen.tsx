import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Svg, { Path, Rect, Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";

import Header from "../components/Header";
import SideDrawer from "../components/SideDrawer";
import { getAllAlbums, createAlbum, deleteAlbum } from "../db/albumRepository";
import { getAllPhotos, getFavoritePhotos } from "../db/photoRepository";
import { requestMediaPermission } from "../services/mediaScanner";
import { getRecentlyViewedIds, getMostViewedIds } from "../services/viewTracking";

import { light, brand } from "../theme/colors";
import { scale, fontScale, wp, screen } from "../theme/responsive";

/**
 * AlbumsScreen.tsx
 * ----------------
 * Album screen with Recently Viewed, Albums grid, and Most Viewed sections.
 */

// Grid configuration
const NUM_COLUMNS = 3;
const GRID_PADDING = scale(12);
const CARD_GAP = scale(8);
const CARD_WIDTH = (screen.width - (GRID_PADDING * 2) - (CARD_GAP * (NUM_COLUMNS - 1))) / NUM_COLUMNS;
const CARD_HEIGHT = CARD_WIDTH;

// Thumbnail size for horizontal scrolls
const THUMB_SIZE = scale(70);

// Album types for different icons
type AlbumType = "camera" | "screenshots" | "favorites" | "hidden" | "folder" | "videos";

interface DisplayAlbum {
  id: string;
  name: string;
  type: AlbumType;
  count: number;
  coverUri?: string;
  isDevice?: boolean;
}

interface PhotoThumb {
  id: string;
  uri: string;
}

// Icons
function ClockIcon({ size = 20, color = light.textSecondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <Path d="M12 7V12L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function TrendingIcon({ size = 20, color = light.textSecondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 17L9 11L13 15L21 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 7H21V11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CameraIcon({ size = 48, color = "rgba(255,255,255,0.5)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
        fill={color}
      />
    </Svg>
  );
}

function ScreenshotIcon({ size = 48, color = "rgba(255,255,255,0.5)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none" />
      <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
      <Path d="M21 15L16 10L5 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function HeartIcon({ size = 48, color = "rgba(255,255,255,0.5)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </Svg>
  );
}

function LockIcon({ size = 48, color = "rgba(255,255,255,0.5)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke={color} strokeWidth="2" />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  );
}

function VideoIcon({ size = 48, color = "rgba(255,255,255,0.5)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="2" y="4" width="15" height="16" rx="2" fill="none" stroke={color} strokeWidth="2" />
      <Path d="M17 8L22 5V19L17 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx="9.5" cy="12" r="3" fill="none" stroke={color} strokeWidth="1.5" />
      <Path d="M8.5 12L11 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function FolderIcon({ size = 48, color = "rgba(255,255,255,0.5)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </Svg>
  );
}

function AddIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill={color} />
    </Svg>
  );
}

function LockBadge({ size = 14 }: { size?: number }) {
  return (
    <View style={styles.lockBadge}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect x="5" y="11" width="14" height="10" rx="2" fill="rgba(0,0,0,0.7)" />
        <Path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="rgba(0,0,0,0.7)" strokeWidth="2" fill="none" />
      </Svg>
    </View>
  );
}

// Get icon component based on album type
function getAlbumIcon(type: AlbumType, size: number = scale(40)) {
  const color = "rgba(255,255,255,0.5)";
  switch (type) {
    case "camera":
      return <CameraIcon size={size} color={color} />;
    case "screenshots":
      return <ScreenshotIcon size={size} color={color} />;
    case "favorites":
      return <HeartIcon size={size} color={color} />;
    case "hidden":
      return <LockIcon size={size} color={color} />;
    case "videos":
      return <VideoIcon size={size} color={color} />;
    case "folder":
    default:
      return <FolderIcon size={size} color={color} />;
  }
}

// Determine album type from name
function getAlbumType(name: string): AlbumType {
  const lower = name.toLowerCase();
  if (lower.includes("camera") || lower === "dcim" || lower.includes("100andro")) {
    return "camera";
  }
  if (lower.includes("screenshot")) {
    return "screenshots";
  }
  if (lower.includes("favorite") || lower.includes("favourites")) {
    return "favorites";
  }
  if (lower.includes("hidden") || lower.includes("locked") || lower.includes("private")) {
    return "hidden";
  }
  return "folder";
}

// Photo Thumbnail component for horizontal scrolls
function PhotoThumbnail({ photo, onPress }: { photo: PhotoThumb; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.thumbnail}>
      <Image source={{ uri: photo.uri }} style={styles.thumbnailImage} />
    </Pressable>
  );
}

// Album Card Component
function AlbumCard({ album, onPress, selectionMode, isSelected }: { album: DisplayAlbum; onPress: () => void; selectionMode?: boolean; isSelected?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed, isSelected && styles.cardSelected]}>
      {/* Gradient background */}
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#D1D5DB" stopOpacity="1" />
            <Stop offset="1" stopColor="#6B7280" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#cardGrad)" rx={scale(12)} />
      </Svg>

      {/* Cover image if available */}
      {album.coverUri && (
        <Image source={{ uri: album.coverUri }} style={styles.coverImage} resizeMode="cover" />
      )}

      {/* Icon */}
      <View style={styles.iconContainer}>
        {getAlbumIcon(album.type, scale(40))}
      </View>

      {/* Lock badge for hidden albums */}
      {album.type === "hidden" && <LockBadge size={scale(14)} />}

      {/* Selection checkmark */}
      {selectionMode && isSelected && (
        <View style={styles.selectionBadge}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}

      {/* Album info at bottom */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{album.name}</Text>
        <Text style={styles.cardCount}>{album.count}</Text>
      </View>
    </Pressable>
  );
}

export default function AlbumsScreen() {
  const navigation = useNavigation<any>();

  const [albums, setAlbums] = useState<DisplayAlbum[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<PhotoThumb[]>([]);
  const [mostViewed, setMostViewed] = useState<PhotoThumb[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // New album modal
  const [showNewAlbumInput, setShowNewAlbumInput] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");

  // Selection mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    try {
      const displayAlbums: DisplayAlbum[] = [];

      // Request permission first
      const hasPermission = await requestMediaPermission();

      if (hasPermission) {
        // Get device albums from CameraRoll
        try {
          const deviceAlbums = await CameraRoll.getAlbums({ assetType: "All" });

          for (const deviceAlbum of deviceAlbums) {
            const type = getAlbumType(deviceAlbum.title);

            // Get cover image for this album
            let coverUri: string | undefined;
            try {
              const photos = await CameraRoll.getPhotos({
                first: 1,
                groupName: deviceAlbum.title,
                assetType: "All",
              });
              if (photos.edges.length > 0) {
                coverUri = photos.edges[0].node.image.uri;
              }
            } catch (e) {
              // Ignore cover fetch errors
            }

            displayAlbums.push({
              id: `device_${deviceAlbum.title}`,
              name: deviceAlbum.title,
              type,
              count: deviceAlbum.count || 0,
              coverUri,
              isDevice: true,
            });
          }
        } catch (err) {
          console.log("Error loading device albums:", err);
        }

        // Add Videos album - all videos from device
        try {
          const videosResult = await CameraRoll.getPhotos({
            first: 1000,
            assetType: "Videos",
            groupTypes: "All",
          });

          const videoCount = videosResult.edges.length;
          if (videoCount > 0) {
            const coverUri = videosResult.edges[0]?.node.image.uri;
            displayAlbums.unshift({
              id: "all_videos",
              name: "Videos",
              type: "videos",
              count: videoCount,
              coverUri,
              isDevice: true,
            });
          }
        } catch (err) {
          console.log("Error loading videos:", err);
        }
      }

      // Get favorites count
      const favorites = await getFavoritePhotos();

      // Add system albums (Favorites, Hidden)
      displayAlbums.push({
        id: "favorites",
        name: "Favorites",
        type: "favorites",
        count: favorites.length,
        isDevice: false,
      });

      displayAlbums.push({
        id: "hidden",
        name: "Hidden",
        type: "hidden",
        count: 0,
        isDevice: false,
      });

      // Get custom albums from database
      const dbAlbums = await getAllAlbums();
      for (const dbAlbum of dbAlbums) {
        displayAlbums.push({
          id: dbAlbum.id,
          name: dbAlbum.name,
          type: "folder",
          count: (dbAlbum as any).photoCount || 0,
          isDevice: false,
        });
      }

      // Sort: Camera first, then Screenshots, then Favorites, then Hidden, then others
      displayAlbums.sort((a, b) => {
        const order: Record<AlbumType, number> = {
          camera: 0,
          screenshots: 1,
          favorites: 2,
          hidden: 3,
          folder: 4,
        };
        if (order[a.type] !== order[b.type]) {
          return order[a.type] - order[b.type];
        }
        return a.name.localeCompare(b.name);
      });

      setAlbums(displayAlbums);

      // Load recently viewed and most viewed photos
      const allPhotos = await getAllPhotos();
      const photoMap = new Map(allPhotos.map((p: any) => [p.id, { id: p.id, uri: p.uri }]));

      // Recently viewed
      const recentIds = await getRecentlyViewedIds();
      const recentPhotos = recentIds
        .map((id) => photoMap.get(id))
        .filter((p): p is PhotoThumb => p !== undefined);
      setRecentlyViewed(recentPhotos);

      // Most viewed
      const mostViewedIds = await getMostViewedIds(25);
      const mostViewedPhotos = mostViewedIds
        .map((id) => photoMap.get(id))
        .filter((p): p is PhotoThumb => p !== undefined);
      setMostViewed(mostViewedPhotos);

    } catch (error) {
      console.error("Error loading albums:", error);
    }
  }, []);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleOpenAlbum = (album: DisplayAlbum) => {
    if (album.isDevice) {
      navigation.navigate("AlbumView", {
        albumId: album.id,
        albumName: album.name,
        isDevice: true,
        groupName: album.name,
      });
    } else if (album.id === "favorites") {
      navigation.navigate("Favorites");
    } else if (album.id === "hidden") {
      navigation.navigate("LockedFolder");
    } else {
      navigation.navigate("AlbumView", { albumId: album.id, albumName: album.name });
    }
  };

  const handleShowNewAlbumInput = () => {
    setNewAlbumName("");
    setShowNewAlbumInput(true);
  };

  const handleCreateAlbum = async () => {
    if (newAlbumName.trim()) {
      await createAlbum(newAlbumName.trim());
      setShowNewAlbumInput(false);
      setNewAlbumName("");
      loadData();
    }
  };

  const handleCancelNewAlbum = () => {
    setShowNewAlbumInput(false);
    setNewAlbumName("");
  };

  const handlePhotoPress = (photoId: string) => {
    navigation.navigate("Viewer", { photoId });
  };

  // Selection mode handlers
  const enterSelectionMode = () => {
    setSelectionMode(true);
    setSelectedAlbums([]);
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedAlbums([]);
  };

  const toggleAlbumSelection = (albumId: string) => {
    if (selectedAlbums.includes(albumId)) {
      setSelectedAlbums(selectedAlbums.filter((id) => id !== albumId));
    } else {
      setSelectedAlbums([...selectedAlbums, albumId]);
    }
  };

  const handleDeleteSelectedAlbums = () => {
    if (selectedAlbums.length === 0) return;

    // Filter out system albums (favorites, hidden, device albums)
    const deletableAlbums = selectedAlbums.filter((id) => {
      const album = albums.find((a) => a.id === id);
      return album && !album.isDevice && id !== "favorites" && id !== "hidden";
    });

    if (deletableAlbums.length === 0) {
      Alert.alert("Cannot Delete", "System albums and device albums cannot be deleted.");
      return;
    }

    Alert.alert(
      "Delete Albums",
      `Delete ${deletableAlbums.length} album${deletableAlbums.length > 1 ? "s" : ""}? Photos will not be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              for (const albumId of deletableAlbums) {
                await deleteAlbum(albumId);
              }
              exitSelectionMode();
              loadData();
            } catch (error) {
              console.error("Error deleting albums:", error);
              Alert.alert("Error", "Failed to delete albums");
            }
          },
        },
      ]
    );
  };

  // Split albums into rows for the grid
  const albumRows: DisplayAlbum[][] = [];
  for (let i = 0; i < albums.length; i += NUM_COLUMNS) {
    albumRows.push(albums.slice(i, i + NUM_COLUMNS));
  }

  return (
    <View style={styles.container}>
      <Header onMenuPress={() => setDrawerVisible(true)} />

      {/* Title bar */}
      <View style={styles.titleBar}>
        <View>
          <Text style={styles.title}>Albums</Text>
          <Text style={styles.subtitle}>
            {selectionMode ? `${selectedAlbums.length} selected` : `${albums.length} albums`}
          </Text>
        </View>
        <View style={styles.titleButtons}>
          {selectionMode ? (
            <>
              <Pressable style={styles.cancelButton} onPress={exitSelectionMode}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={handleDeleteSelectedAlbums}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable style={styles.selectButton} onPress={enterSelectionMode}>
                <Text style={styles.selectButtonText}>Select</Text>
              </Pressable>
              <Pressable style={styles.newButton} onPress={handleShowNewAlbumInput}>
                <AddIcon size={scale(18)} color="#FFFFFF" />
                <Text style={styles.newButtonText}>New</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      {/* New Album Input */}
      {showNewAlbumInput && (
        <View style={styles.newAlbumInputRow}>
          <TextInput
            style={styles.newAlbumInput}
            placeholder="Album name..."
            placeholderTextColor={light.textTertiary}
            value={newAlbumName}
            onChangeText={setNewAlbumName}
            autoFocus
          />
          <Pressable style={styles.addAlbumButton} onPress={handleCreateAlbum}>
            <Text style={styles.addAlbumButtonText}>Add</Text>
          </Pressable>
          <Pressable onPress={handleCancelNewAlbum}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ClockIcon size={scale(18)} color={light.textSecondary} />
              <Text style={styles.sectionTitle}>Recently Viewed</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {recentlyViewed.map((photo) => (
                <PhotoThumbnail
                  key={photo.id}
                  photo={photo}
                  onPress={() => handlePhotoPress(photo.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Albums Grid */}
        <View style={styles.albumsGrid}>
          {albumRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.albumRow}>
              {row.map((album) => (
                <View key={album.id} style={styles.cardWrapper}>
                  <AlbumCard
                    album={album}
                    onPress={() => {
                      if (selectionMode) {
                        toggleAlbumSelection(album.id);
                      } else {
                        handleOpenAlbum(album);
                      }
                    }}
                    selectionMode={selectionMode}
                    isSelected={selectedAlbums.includes(album.id)}
                  />
                </View>
              ))}
              {/* Fill empty spaces in last row */}
              {row.length < NUM_COLUMNS &&
                Array(NUM_COLUMNS - row.length)
                  .fill(null)
                  .map((_, i) => <View key={`empty-${i}`} style={styles.cardWrapper} />)}
            </View>
          ))}
        </View>

        {/* Most Viewed Section */}
        {mostViewed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingIcon size={scale(18)} color={light.textSecondary} />
              <Text style={styles.sectionTitle}>Most Viewed</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {mostViewed.map((photo) => (
                <PhotoThumbnail
                  key={photo.id}
                  photo={photo}
                  onPress={() => handlePhotoPress(photo.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        currentScreen="Albums"
        navigation={navigation}
      />
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
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
  },
  title: {
    fontSize: fontScale(28),
    fontWeight: "700",
    color: light.textPrimary,
  },
  subtitle: {
    fontSize: fontScale(14),
    color: light.textSecondary,
    marginTop: scale(2),
  },
  titleButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  selectButton: {
    paddingVertical: scale(10),
    paddingHorizontal: scale(16),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: light.border,
    backgroundColor: light.background,
  },
  selectButtonText: {
    fontSize: fontScale(14),
    fontWeight: "500",
    color: light.textPrimary,
  },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: brand.teal,
    paddingVertical: scale(10),
    paddingHorizontal: scale(14),
    borderRadius: scale(8),
    gap: scale(4),
  },
  newButtonText: {
    fontSize: fontScale(14),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: scale(16),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: GRID_PADDING,
    paddingVertical: scale(10),
    gap: scale(8),
  },
  sectionTitle: {
    fontSize: fontScale(16),
    fontWeight: "600",
    color: light.textPrimary,
  },
  horizontalScroll: {
    paddingHorizontal: GRID_PADDING,
    gap: scale(8),
  },
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: scale(10),
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  albumsGrid: {
    paddingHorizontal: GRID_PADDING,
  },
  albumRow: {
    flexDirection: "row",
    marginBottom: CARD_GAP,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
  },
  card: {
    width: "100%",
    height: CARD_HEIGHT,
    borderRadius: scale(12),
    overflow: "hidden",
    position: "relative",
  },
  cardPressed: {
    opacity: 0.8,
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  lockBadge: {
    position: "absolute",
    top: scale(8),
    right: scale(8),
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: scale(10),
    padding: scale(4),
  },
  cardInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: scale(10),
  },
  cardName: {
    fontSize: fontScale(13),
    fontWeight: "600",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardCount: {
    fontSize: fontScale(11),
    color: "rgba(255,255,255,0.8)",
    marginTop: scale(2),
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardSelected: {
    borderWidth: 3,
    borderColor: brand.teal,
  },
  selectionBadge: {
    position: "absolute",
    top: scale(8),
    left: scale(8),
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: brand.teal,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "#FFFFFF",
    fontSize: fontScale(14),
    fontWeight: "bold",
  },
  cancelButton: {
    paddingVertical: scale(10),
    paddingHorizontal: scale(16),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: light.border,
  },
  cancelButtonText: {
    fontSize: fontScale(14),
    fontWeight: "500",
    color: light.textPrimary,
  },
  deleteButton: {
    paddingVertical: scale(10),
    paddingHorizontal: scale(16),
    borderRadius: scale(8),
    backgroundColor: "#EF4444",
  },
  deleteButtonText: {
    fontSize: fontScale(14),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  newAlbumInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingBottom: scale(12),
    gap: scale(10),
  },
  newAlbumInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: light.border,
    borderRadius: scale(8),
    paddingHorizontal: scale(14),
    paddingVertical: scale(10),
    fontSize: fontScale(15),
    color: light.textPrimary,
    backgroundColor: light.surface,
  },
  addAlbumButton: {
    paddingVertical: scale(10),
    paddingHorizontal: scale(18),
    borderRadius: scale(8),
    backgroundColor: "#1F2937",
  },
  addAlbumButtonText: {
    fontSize: fontScale(14),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cancelText: {
    fontSize: fontScale(14),
    fontWeight: "500",
    color: light.textPrimary,
    paddingHorizontal: scale(8),
  },
  bottomPadding: {
    height: scale(100),
  },
});
