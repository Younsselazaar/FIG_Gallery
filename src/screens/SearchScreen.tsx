import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path, Circle, Rect } from "react-native-svg";

import { PhotoGridSection, PhotoItem, PhotoSection } from "../components/PhotoGrid";
import Header from "../components/Header";
import SideDrawer from "../components/SideDrawer";

import { searchPhotos, getAllPhotos } from "../db/photoRepository";
import { getAllAlbums } from "../db/albumRepository";
import { requestMediaPermission } from "../services/mediaScanner";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { light, brand } from "../theme/colors";
import { scale, fontScale } from "../theme/responsive";

type Album = {
  id: string;
  name: string;
  photoCount: number;
  coverUri?: string;
};

type FilterType = "all" | "photos" | "videos";

function SearchIcon({ size = 20, color = light.textSecondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
      <Path d="M16 16L21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function PhotoIcon({ size = 16, color = light.textSecondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
      <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
      <Path d="M21 15L16 10L5 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function VideoIcon({ size = 16, color = light.textSecondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="15" height="16" rx="2" stroke={color} strokeWidth="2" />
      <Path d="M17 8L22 5V19L17 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function FilterIcon({ size = 16, color = light.textSecondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6H20M4 12H20M4 18H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="8" cy="6" r="2" fill={color} />
      <Circle cx="16" cy="12" r="2" fill={color} />
      <Circle cx="10" cy="18" r="2" fill={color} />
    </Svg>
  );
}

function CloseIcon({ size = 20, color = light.textSecondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function AlbumCardIcon({ size = 24, color = brand.teal }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
      <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
      <Path d="M21 15L16 10L5 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HeartCardIcon({ size = 24, color = "#E91E63" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
        fill={color}
      />
    </Svg>
  );
}

function FolderCardIcon({ size = 24, color = "#FF9800" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
        fill={color}
      />
    </Svg>
  );
}

function formatDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function groupPhotosByDate(photos: PhotoItem[]): PhotoSection[] {
  const groups: { [key: string]: PhotoItem[] } = {};
  photos.forEach((photo) => {
    const date = photo.date ? new Date(photo.date).toDateString() : new Date().toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(photo);
  });
  const sortedDates = Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  return sortedDates.map((date) => ({ title: formatDateGroup(date), data: groups[date] }));
}

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [results, setResults] = useState<PhotoItem[]>([]);
  const [allPhotos, setAllPhotos] = useState<PhotoItem[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    loadAllPhotos();
  }, []);

  const isVideoFile = (uri: string, mimeType?: string): boolean => {
    // Check mime type first if available
    if (mimeType && mimeType.startsWith('video/')) {
      return true;
    }
    // Check file extension
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.3gp', '.m4v'];
    const lowerUri = uri.toLowerCase();
    return videoExtensions.some(ext => lowerUri.includes(ext));
  };

  const loadAllPhotos = async () => {
    try {
      // Load directly from CameraRoll for accurate video detection
      const hasPermission = await requestMediaPermission();
      if (!hasPermission) {
        console.log("No permission to load photos");
        return;
      }

      const result = await CameraRoll.getPhotos({
        first: 500,
        assetType: "All",
        groupTypes: "All",
        include: ["filename", "playableDuration"],
      });

      const mediaItems = result.edges.map((edge) => {
        const photoUri = edge.node.image.uri;
        const fileName = edge.node.image.filename || "";
        const nodeType = edge.node.type || "";
        const playableDuration = edge.node.image.playableDuration;

        // Determine if it's a video
        const isVideo = nodeType.startsWith("video") ||
                       (playableDuration && playableDuration > 0) ||
                       isVideoFile(photoUri) ||
                       isVideoFile(fileName);

        return {
          id: photoUri,
          uri: photoUri,
          favorite: false,
          date: edge.node.timestamp
            ? new Date(edge.node.timestamp * 1000).toISOString()
            : undefined,
          mediaType: isVideo ? "video" : "photo",
        };
      });

      setAllPhotos(mediaItems);
    } catch (error) {
      console.error("Error loading photos:", error);
    }
  };

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.length > 0) {
      setHasSearched(true);
      try {
        const searchLower = text.toLowerCase();
        const matchingAlbums: Album[] = [];
        let allMatchingPhotos: PhotoItem[] = [];

        // Search directly from allPhotos (which has correct mediaType)
        const matchingFromAll = allPhotos.filter(p => {
          const uri = p.uri.toLowerCase();
          return uri.includes(searchLower);
        });
        allMatchingPhotos = [...matchingFromAll];

        // Check if "Favorites" matches
        if ("favorites".includes(searchLower)) {
          matchingAlbums.push({ id: "favorites", name: "Favorites", photoCount: 0 });
        }

        // Add custom albums from database that match
        const dbAlbums = await getAllAlbums();
        dbAlbums.forEach((a: any) => {
          const albumNameLower = (a.name || "").toLowerCase();
          if (albumNameLower.includes(searchLower)) {
            matchingAlbums.push({
              id: a.id,
              name: a.name,
              photoCount: a.photoCount || 0,
              coverUri: a.coverUri,
            });
          }
        });

        // Search device albums
        try {
          const hasPermission = await requestMediaPermission();
          if (hasPermission) {
            const deviceAlbums = await CameraRoll.getAlbums({ assetType: "All" });

            for (const deviceAlbum of deviceAlbums) {
              const albumTitleLower = (deviceAlbum.title || "").toLowerCase();
              if (albumTitleLower.includes(searchLower)) {
                matchingAlbums.push({
                  id: `device_${deviceAlbum.title}`,
                  name: deviceAlbum.title,
                  photoCount: deviceAlbum.count || 0,
                });

                // Get photos from this album
                try {
                  const albumPhotos = await CameraRoll.getPhotos({
                    first: 50,
                    assetType: "All",
                    groupName: deviceAlbum.title,
                    groupTypes: "Album",
                  });

                  albumPhotos.edges.forEach((edge) => {
                    const photoId = edge.node.image.uri;
                    if (!allMatchingPhotos.find((p) => p.uri === photoId)) {
                      allMatchingPhotos.push({
                        id: photoId,
                        uri: photoId,
                        favorite: false,
                        date: edge.node.timestamp
                          ? new Date(edge.node.timestamp * 1000).toISOString()
                          : undefined,
                        mediaType: isVideoFile(photoId) ? "video" : "photo",
                      });
                    }
                  });
                } catch (photoErr) {
                  console.log("Error getting album photos:", photoErr);
                }
              }
            }

            // Always search all device photos/videos by filename
            try {
              const allDevicePhotos = await CameraRoll.getPhotos({
                first: 200,
                assetType: "All",
                groupTypes: "All",
                include: ["filename", "playableDuration"],
              });

              allDevicePhotos.edges.forEach((edge) => {
                const photoUri = edge.node.image.uri;
                const fileName = edge.node.image.filename || "";
                const nodeType = edge.node.type || "";
                const playableDuration = edge.node.image.playableDuration;

                // Determine if it's a video: check type, playableDuration, or filename
                const isVideo = nodeType.startsWith("video") ||
                               (playableDuration && playableDuration > 0) ||
                               isVideoFile(photoUri) ||
                               isVideoFile(fileName);

                // Check if filename or URI contains search term
                if (
                  photoUri.toLowerCase().includes(searchLower) ||
                  fileName.toLowerCase().includes(searchLower)
                ) {
                  // Only add if not already in results
                  if (!allMatchingPhotos.find((p) => p.uri === photoUri)) {
                    allMatchingPhotos.push({
                      id: photoUri,
                      uri: photoUri,
                      favorite: false,
                      date: edge.node.timestamp
                        ? new Date(edge.node.timestamp * 1000).toISOString()
                        : undefined,
                      mediaType: isVideo ? "video" : "photo",
                    });
                  }
                }
              });
            } catch (err) {
              console.log("Error searching all photos:", err);
            }
          }
        } catch (err) {
          console.log("Error loading device albums:", err);
        }

        setResults(allMatchingPhotos);
        setFilteredAlbums(matchingAlbums);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
        setFilteredAlbums([]);
      }
    } else {
      setResults([]);
      setFilteredAlbums([]);
      setHasSearched(false);
    }
  }, [allPhotos]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setFilteredAlbums([]);
    setHasSearched(false);
  };

  // Apply filter to photos
  const applyFilter = (photos: PhotoItem[]): PhotoItem[] => {
    if (filter === "all") return photos;
    if (filter === "photos") return photos.filter(p => p.mediaType !== "video");
    if (filter === "videos") return photos.filter(p => p.mediaType === "video");
    return photos;
  };

  const photosToShow = applyFilter(hasSearched ? results : allPhotos);
  const sections = groupPhotosByDate(photosToShow);

  const handlePhotoPress = (photoId: string) => {
    const photo = photosToShow.find((p) => p.id === photoId);
    navigation.navigate("Viewer", { photoId, mediaType: photo?.mediaType });
  };

  return (
    <View style={styles.container}>
      <Header onMenuPress={() => setDrawerVisible(true)} />

      {/* Search input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <SearchIcon size={scale(20)} color={light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search photos, albums, tags..."
            placeholderTextColor={light.textTertiary}
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={clearSearch} style={styles.clearButton}>
              <CloseIcon size={scale(18)} color={light.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter chips row */}
      <View style={styles.filterChipsRow}>
        <Pressable
          style={[styles.filterChip, filter === "all" && styles.filterChipActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterChipText, filter === "all" && styles.filterChipTextActive]}>
            All
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterChip, filter === "photos" && styles.filterChipActive]}
          onPress={() => setFilter("photos")}
        >
          <PhotoIcon size={scale(14)} color={filter === "photos" ? "#FFFFFF" : light.textSecondary} />
          <Text style={[styles.filterChipText, filter === "photos" && styles.filterChipTextActive]}>
            Photos
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterChip, filter === "videos" && styles.filterChipActive]}
          onPress={() => setFilter("videos")}
        >
          <VideoIcon size={scale(14)} color={filter === "videos" ? "#FFFFFF" : light.textSecondary} />
          <Text style={[styles.filterChipText, filter === "videos" && styles.filterChipTextActive]}>
            Videos
          </Text>
        </Pressable>
      </View>

      {/* Advanced Filters row */}
      <View style={styles.advancedRow}>
        <Pressable style={styles.advancedButton}>
          <FilterIcon size={scale(16)} color={light.textSecondary} />
          <Text style={styles.advancedButtonText}>Advanced Filters</Text>
          <Svg width={scale(14)} height={scale(14)} viewBox="0 0 24 24">
            <Path d="M7 10l5 5 5-5z" fill={light.textSecondary} />
          </Svg>
        </Pressable>
      </View>

      {/* Results */}
      <ScrollView style={styles.scrollView}>
        {hasSearched ? (
          <>
            {/* Albums section */}
            {filteredAlbums.length > 0 && (
              <>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Albums</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.albumsScrollView}
                  contentContainerStyle={styles.albumsScrollContent}
                >
                  {filteredAlbums.map((album) => (
                    <Pressable
                      key={album.id}
                      style={styles.albumCard}
                      onPress={() => {
                        if (album.id === "favorites") {
                          navigation.navigate("Favorites");
                        } else if (album.id.startsWith("device_")) {
                          const albumName = album.id.replace("device_", "");
                          navigation.navigate("DeviceAlbum", { albumName });
                        } else {
                          navigation.navigate("AlbumDetail", { albumId: album.id, albumName: album.name });
                        }
                      }}
                    >
                      <View style={[
                        styles.albumCardIcon,
                        album.id === "favorites" && styles.albumCardIconFavorites,
                        album.id.startsWith("device_") && styles.albumCardIconDevice
                      ]}>
                        {album.id === "favorites" ? (
                          <HeartCardIcon size={scale(26)} color="#E91E63" />
                        ) : album.id.startsWith("device_") ? (
                          <FolderCardIcon size={scale(26)} color="#FF9800" />
                        ) : (
                          <AlbumCardIcon size={scale(28)} color={brand.teal} />
                        )}
                      </View>
                      <View style={styles.albumCardInfo}>
                        <Text style={styles.albumCardName} numberOfLines={1}>
                          {album.name}
                        </Text>
                        <Text style={styles.albumCardCount}>
                          {album.photoCount} photos
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Results count */}
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>
                {photosToShow.length} {filter === "videos" ? "videos" : filter === "photos" ? "photos" : "results"}
              </Text>
            </View>

            {/* Photos grouped by date */}
            {sections.length > 0 ? (
              sections.map((section) => (
                <View key={section.title}>
                  <View style={styles.dateHeader}>
                    <Text style={styles.dateHeaderText}>{section.title}</Text>
                  </View>
                  <PhotoGridSection
                    photos={section.data}
                    columns={3}
                    onPress={handlePhotoPress}
                    showFavorites={true}
                  />
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {filter === "videos" ? "No videos found" : filter === "photos" ? "No photos found" : "No results found"}
                </Text>
                <Text style={styles.emptySubtext}>Try different keywords or filters</Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* All Photos/Videos title */}
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>
                {filter === "videos" ? "All Videos" : filter === "photos" ? "All Photos" : "All Media"}
              </Text>
            </View>

            {sections.length > 0 ? (
              sections.map((section) => (
                <View key={section.title}>
                  <View style={styles.dateHeader}>
                    <Text style={styles.dateHeaderText}>{section.title}</Text>
                  </View>
                  <PhotoGridSection
                    photos={section.data}
                    columns={3}
                    onPress={handlePhotoPress}
                    showFavorites={true}
                  />
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <SearchIcon size={scale(48)} color={light.textTertiary} />
                <Text style={styles.emptyText}>
                  {filter === "videos" ? "No videos yet" : filter === "photos" ? "No photos yet" : "No media yet"}
                </Text>
                <Text style={styles.emptySubtext}>
                  {filter === "videos" ? "Your videos will appear here" : filter === "photos" ? "Your photos will appear here" : "Your media will appear here"}
                </Text>
              </View>
            )}
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        currentScreen="Search"
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
  searchContainer: {
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
    paddingBottom: scale(12),
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: light.background,
    borderRadius: scale(24),
    borderWidth: 2,
    borderColor: brand.teal,
    paddingHorizontal: scale(16),
    gap: scale(10),
  },
  searchInput: {
    flex: 1,
    fontSize: fontScale(16),
    color: light.textPrimary,
    paddingVertical: scale(12),
  },
  clearButton: {
    padding: scale(4),
  },
  filterChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingBottom: scale(10),
    gap: scale(8),
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: light.border,
    backgroundColor: light.background,
    gap: scale(6),
  },
  filterChipActive: {
    backgroundColor: brand.teal,
    borderColor: brand.teal,
  },
  filterChipText: {
    fontSize: fontScale(14),
    color: light.textSecondary,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  advancedRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingBottom: scale(12),
  },
  advancedButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(10),
    paddingHorizontal: scale(14),
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: light.border,
    gap: scale(8),
  },
  advancedButtonText: {
    fontSize: fontScale(14),
    color: light.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitleContainer: {
    paddingHorizontal: scale(16),
    paddingTop: scale(8),
    paddingBottom: scale(12),
  },
  sectionTitle: {
    fontSize: fontScale(22),
    fontWeight: "700",
    color: light.textPrimary,
  },
  dateHeader: {
    paddingHorizontal: scale(16),
    paddingTop: scale(8),
    paddingBottom: scale(8),
  },
  dateHeaderText: {
    fontSize: fontScale(15),
    fontWeight: "600",
    color: light.textPrimary,
  },
  bottomPadding: {
    height: scale(80),
  },
  emptyState: {
    flex: 1,
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
    marginTop: scale(8),
  },
  emptySubtext: {
    fontSize: fontScale(14),
    color: light.textSecondary,
    textAlign: "center",
  },
  albumsScrollView: {
    marginBottom: scale(16),
  },
  albumsScrollContent: {
    paddingHorizontal: scale(16),
    gap: scale(12),
  },
  albumCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: light.background,
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: light.border,
    paddingVertical: scale(12),
    paddingHorizontal: scale(14),
    minWidth: scale(160),
    gap: scale(12),
  },
  albumCardIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(10),
    backgroundColor: "rgba(0, 175, 185, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  albumCardIconFavorites: {
    backgroundColor: "rgba(233, 30, 99, 0.1)",
  },
  albumCardIconDevice: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
  },
  albumCardInfo: {
    flex: 1,
  },
  albumCardName: {
    fontSize: fontScale(15),
    fontWeight: "600",
    color: light.textPrimary,
  },
  albumCardCount: {
    fontSize: fontScale(13),
    color: light.textSecondary,
    marginTop: scale(2),
  },
});
