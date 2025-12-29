import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";

import Header from "../components/Header";
import { getAllAlbums, createAlbum, deleteAlbum } from "../db/albumRepository";
import { Album } from "../types/album";
import { requestMediaPermission } from "../services/mediaScanner";

import { light, brand, ui, semantic } from "../theme/colors";
import { spacing, radius } from "../theme/tokens";
import { scale, fontScale, wp, screen } from "../theme/responsive";

/**
 * AlbumsScreen.tsx
 * ----------------
 * Album grid screen matching FIG Gallery design.
 * Shows device albums (Camera, Screenshots) and custom albums.
 * Responsive layout using percentage-based sizing.
 */

// Responsive grid configuration
const NUM_COLUMNS = 3;
const GRID_PADDING_PERCENT = 4; // 4% padding on sides
const CARD_GAP_PERCENT = 2; // 2% gap between cards

// Calculate card dimensions based on screen width
const gridPadding = wp(GRID_PADDING_PERCENT);
const cardGap = wp(CARD_GAP_PERCENT);
const CARD_WIDTH = (screen.width - (gridPadding * 2) - (cardGap * (NUM_COLUMNS - 1))) / NUM_COLUMNS;
const CARD_HEIGHT = CARD_WIDTH; // Square cards

// Album types for different icons
type AlbumType = "camera" | "screenshots" | "favorites" | "hidden" | "folder";

interface DisplayAlbum {
  id: string;
  name: string;
  type: AlbumType;
  count: number;
  coverUri?: string;
  isDevice?: boolean;
}

// Icons for album cards
function CameraIcon({ size = 48, color = "rgba(255,255,255,0.4)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
        fill={color}
      />
      <Path
        d="M12 17c1.65 0 3-1.35 3-3h-6c0 1.65 1.35 3 3 3z"
        fill={color}
      />
    </Svg>
  );
}

function ScreenshotIcon({ size = 48, color = "rgba(255,255,255,0.4)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
        fill={color}
      />
    </Svg>
  );
}

function HeartIcon({ size = 48, color = "rgba(255,255,255,0.4)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={color}
      />
    </Svg>
  );
}

function LockIcon({ size = 48, color = "rgba(255,255,255,0.4)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="5" y="11" width="14" height="9" rx="2" fill={color} />
      <Path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    </Svg>
  );
}

function FolderIcon({ size = 48, color = "rgba(255,255,255,0.4)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
        fill={color}
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

function LockBadge({ size = 16 }: { size?: number }) {
  return (
    <View style={styles.lockBadge}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect x="5" y="11" width="14" height="9" rx="2" fill="rgba(0,0,0,0.6)" />
        <Path
          d="M8 11V8a4 4 0 0 1 8 0v3"
          stroke="rgba(0,0,0,0.6)"
          strokeWidth="2"
          fill="none"
        />
      </Svg>
    </View>
  );
}

// Get icon component based on album type
function getAlbumIcon(type: AlbumType, size: number = scale(48)) {
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
    case "folder":
    default:
      return <FolderIcon size={size} color={color} />;
  }
}

// Determine album type from name
function getAlbumType(name: string, isSystem?: boolean): AlbumType {
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

// Album Card Component
function AlbumCard({
  album,
  onPress,
}: {
  album: DisplayAlbum;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Gradient background */}
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#C8CDD3" stopOpacity="1" />
            <Stop offset="1" stopColor="#5A6169" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#cardGrad)" rx={scale(12)} />
      </Svg>

      {/* Cover image if available */}
      {album.coverUri && (
        <Image
          source={{ uri: album.coverUri }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      )}

      {/* Icon */}
      <View style={styles.iconContainer}>
        {getAlbumIcon(album.type, scale(44))}
      </View>

      {/* Lock badge for hidden albums */}
      {album.type === "hidden" && <LockBadge size={scale(14)} />}

      {/* Album info at bottom */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>
          {album.name}
        </Text>
        <Text style={styles.cardCount}>{album.count}</Text>
      </View>
    </Pressable>
  );
}

export default function AlbumsScreen() {
  const navigation = useNavigation<any>();

  const [albums, setAlbums] = useState<DisplayAlbum[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectMode, setSelectMode] = useState(false);

  useEffect(() => {
    loadAllAlbums();
  }, []);

  const loadAllAlbums = async () => {
    try {
      const displayAlbums: DisplayAlbum[] = [];

      // Request permission first
      const hasPermission = await requestMediaPermission();

      if (hasPermission) {
        // Get device albums from CameraRoll
        try {
          const deviceAlbums = await CameraRoll.getAlbums({
            assetType: "Photos",
          });

          for (const deviceAlbum of deviceAlbums) {
            const type = getAlbumType(deviceAlbum.title);

            // Get cover image for this album
            let coverUri: string | undefined;
            try {
              const photos = await CameraRoll.getPhotos({
                first: 1,
                groupName: deviceAlbum.title,
                assetType: "Photos",
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
      }

      // Add system albums (Favorites, Hidden)
      displayAlbums.push({
        id: "favorites",
        name: "Favorites",
        type: "favorites",
        count: 0, // TODO: Get actual count from DB
        isDevice: false,
      });

      displayAlbums.push({
        id: "hidden",
        name: "Hidden",
        type: "hidden",
        count: 0, // TODO: Get actual count from DB
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

      // Sort: Camera first, then Screenshots, then Favorites, then Hidden, then others alphabetically
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
    } catch (error) {
      console.error("Error loading albums:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllAlbums();
    setRefreshing(false);
  }, []);

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

  const handleCreateAlbum = async () => {
    const newAlbum = await createAlbum("New Album");
    loadAllAlbums();
  };

  const renderItem = ({ item, index }: { item: DisplayAlbum; index: number }) => (
    <View style={[
      styles.cardWrapper,
      index % NUM_COLUMNS === 0 && { marginLeft: 0 },
      index % NUM_COLUMNS === NUM_COLUMNS - 1 && { marginRight: 0 },
    ]}>
      <AlbumCard
        album={item}
        onPress={() => handleOpenAlbum(item)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header onMenuPress={() => {}} />

      {/* Title bar */}
      <View style={styles.titleBar}>
        <View>
          <Text style={styles.title}>Albums</Text>
          <Text style={styles.subtitle}>{albums.length} albums</Text>
        </View>
        <View style={styles.titleButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.selectButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setSelectMode(!selectMode)}
          >
            <Text style={styles.selectButtonText}>Select</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.newButton,
              pressed && styles.newButtonPressed,
            ]}
            onPress={handleCreateAlbum}
          >
            <AddIcon size={scale(18)} color="#FFFFFF" />
            <Text style={styles.newButtonText}>New</Text>
          </Pressable>
        </View>
      </View>

      {/* Album grid */}
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FolderIcon size={scale(64)} color={light.textTertiary} />
            <Text style={styles.emptyText}>No albums yet</Text>
            <Text style={styles.emptySubtext}>
              Create an album to organize your photos
            </Text>
          </View>
        }
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
  newButtonPressed: {
    backgroundColor: brand.tealDark,
  },
  newButtonText: {
    fontSize: fontScale(14),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonPressed: {
    backgroundColor: light.surfaceSecondary,
  },
  grid: {
    paddingHorizontal: gridPadding,
    paddingBottom: scale(100),
  },
  row: {
    justifyContent: "flex-start",
    marginBottom: cardGap,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginHorizontal: cardGap / 2,
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
    backgroundColor: "rgba(255,255,255,0.8)",
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: scale(80),
    paddingHorizontal: scale(24),
    gap: scale(12),
  },
  emptyText: {
    fontSize: fontScale(18),
    fontWeight: "600",
    color: light.textPrimary,
  },
  emptySubtext: {
    fontSize: fontScale(14),
    color: light.textSecondary,
    textAlign: "center",
  },
});
