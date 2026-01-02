import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Dimensions,
  Alert,
} from "react-native";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { requestMediaPermission } from "../services/mediaScanner";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import Share from "react-native-share";
import RNFS from "react-native-fs";

import Header from "../components/Header";
import { PhotoGridSection, PhotoItem, PhotoSection } from "../components/PhotoGrid";
import JumpToDateModal from "../components/JumpToDateModal";
import SideDrawer from "../components/SideDrawer";

import { getAllPhotos, trashPhoto, cleanupStalePhotos, markFavorite } from "../db/photoRepository";
import AddToAlbumModal from "../components/AddToAlbumModal";
import { addPhotoToAlbum } from "../db/albumRepository";
import { light, brand, ui, semantic } from "../theme/colors";
import { scale, fontScale } from "../theme/responsive";

// Use actual screen width for proper sizing on all devices
const SCREEN_WIDTH = Dimensions.get("window").width;

// Grid icon - 2x2 squares (normal view)
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

// Compact grid icon - 3x3 squares (compact view)
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

function SelectIcon({ size = 20, color = light.textSecondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
      <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CalendarIcon({ size = 20, color = light.textSecondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
      <Path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
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

function AddAlbumIcon({ size = 20, color = light.textSecondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
      <Path d="M12 8V16M8 12H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
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
      <Path d="M10 11V17" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M14 11V17" stroke={color} strokeWidth="2" strokeLinecap="round" />
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

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [gridColumns, setGridColumns] = useState(4);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [jumpToDateVisible, setJumpToDateVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [addToAlbumVisible, setAddToAlbumVisible] = useState(false);

  // Date filter state
  const [dateFilterActive, setDateFilterActive] = useState(false);
  const [filteredDate, setFilteredDate] = useState<Date | null>(null);
  const [dateFilterMode, setDateFilterMode] = useState<"day" | "week">("day");
  const [dateFilteredPhotos, setDateFilteredPhotos] = useState<PhotoItem[]>([]);

  const toggleGridView = () => setGridColumns((prev) => (prev === 4 ? 5 : 4));

  const loadPhotos = useCallback(async () => {
    try {
      // First get all valid URIs from device to clean up stale database entries
      const hasPermission = await requestMediaPermission();
      const mediaTypeMap = new Map<string, { type: "photo" | "video"; duration?: number }>();

      if (hasPermission) {
        try {
          const result = await CameraRoll.getPhotos({
            first: 10000,
            assetType: "All",
            groupTypes: "All",
            include: ["playableDuration"],
          });
          const validUris = new Set(result.edges.map((edge) => edge.node.image.uri));

          // Build media type map
          result.edges.forEach((edge) => {
            const uri = edge.node.image.uri;
            const isVideo = edge.node.type?.includes("video") || uri.toLowerCase().includes("video");
            mediaTypeMap.set(uri, {
              type: isVideo ? "video" : "photo",
              duration: edge.node.image.playableDuration || undefined,
            });
          });

          // Clean up photos that no longer exist on device
          const cleaned = await cleanupStalePhotos(validUris);
          if (cleaned > 0) {
            console.log(`Cleaned up ${cleaned} stale photos from database`);
          }
        } catch (err) {
          console.log("Error getting device photos for cleanup:", err);
        }
      }

      // Now load photos from database
      const list = await getAllPhotos();
      setPhotos(list.map((p: any) => {
        const mediaInfo = mediaTypeMap.get(p.uri);
        return {
          id: p.id,
          uri: p.uri,
          favorite: p.favorite === 1,
          date: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
          mediaType: mediaInfo?.type || "photo",
          duration: mediaInfo?.duration,
        };
      }));
    } catch (error) { console.error("Error loading photos:", error); }
    finally { setLoading(false); }
  }, []);

  // Reload photos when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [loadPhotos])
  );

  const onRefresh = useCallback(async () => { setRefreshing(true); await loadPhotos(); setRefreshing(false); }, [loadPhotos]);

  // Handle Jump to Date selection
  const handleJumpToDate = async (date: Date, mode: "day" | "week") => {
    setFilteredDate(date);
    setDateFilterMode(mode);
    setDateFilterActive(true);

    try {
      const hasPermission = await requestMediaPermission();
      if (!hasPermission) {
        console.log("No permission for date filter");
        setDateFilteredPhotos([]);
        return;
      }

      let startDate: Date;
      let endDate: Date;

      if (mode === "day") {
        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
        endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
      } else {
        // Whole week (Sunday to Saturday)
        const dayOfWeek = date.getDay();
        startDate = new Date(date);
        startDate.setDate(date.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      }

      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const endTimestamp = Math.floor(endDate.getTime() / 1000);

      const result = await CameraRoll.getPhotos({
        first: 5000,
        assetType: "All",
        groupTypes: "All",
        include: ["playableDuration"],
      });

      const filtered: PhotoItem[] = [];
      for (const edge of result.edges) {
        const ts = edge.node.timestamp;
        if (ts && ts >= startTimestamp && ts <= endTimestamp) {
          const uri = edge.node.image.uri;
          const isVideo = edge.node.type?.includes("video") || uri.toLowerCase().includes("video");
          filtered.push({
            id: uri,
            uri: uri,
            favorite: false,
            date: new Date(ts * 1000).toISOString(),
            mediaType: isVideo ? "video" : "photo",
            duration: edge.node.image.playableDuration || undefined,
          });
        }
      }

      console.log(`Date filter: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}, found ${filtered.length} photos`);
      setDateFilteredPhotos(filtered);
    } catch (error) {
      console.error("Error filtering by date:", error);
      setDateFilteredPhotos([]);
    }
  };

  const clearDateFilter = () => {
    setDateFilterActive(false);
    setFilteredDate(null);
    setDateFilteredPhotos([]);
  };

  const formatDateRange = () => {
    if (!filteredDate) return "";
    if (dateFilterMode === "day") {
      return filteredDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } else {
      const dayOfWeek = filteredDate.getDay();
      const start = new Date(filteredDate);
      start.setDate(filteredDate.getDate() - dayOfWeek);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }
  };

  const displayPhotos = dateFilterActive ? dateFilteredPhotos : photos;
  const sections = useMemo(() => groupPhotosByDate(displayPhotos), [displayPhotos]);

  const handlePhotoPress = (photoId: string) => {
    if (selectionMode) {
      setSelectedPhotos((prev) =>
        prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
      );
    } else {
      // Find the photo to get its mediaType
      const photo = displayPhotos.find((p) => p.id === photoId);
      navigation.navigate("Viewer", { photoId, mediaType: photo?.mediaType });
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

  const handleDeleteSelected = () => {
    if (selectedPhotos.length === 0) return;

    Alert.alert(
      "Move to Trash",
      `Move ${selectedPhotos.length} photo${selectedPhotos.length > 1 ? "s" : ""} to trash?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Move to Trash",
          style: "destructive",
          onPress: async () => {
            try {
              for (const photoId of selectedPhotos) {
                await trashPhoto(photoId, true);
              }
              exitSelectionMode();
              loadPhotos();
            } catch (error) {
              console.error("Error deleting photos:", error);
              Alert.alert("Error", "Failed to delete photos");
            }
          },
        },
      ]
    );
    setMenuVisible(false);
  };

  const handleShareSelected = async () => {
    if (selectedPhotos.length === 0) return;
    setMenuVisible(false);

    try {
      // Get URIs of selected photos
      const selectedItems = displayPhotos.filter((p) => selectedPhotos.includes(p.id));
      const shareUrls: string[] = [];

      for (const item of selectedItems) {
        // Copy each file to temp location for sharing
        const timestamp = Date.now();
        const isVideo = item.mediaType === "video";
        const extension = isVideo ? "mp4" : "jpg";
        const tempPath = `${RNFS.CachesDirectoryPath}/share_${timestamp}_${Math.random().toString(36).substr(2, 9)}.${extension}`;

        try {
          const base64Data = await RNFS.readFile(item.uri, "base64");
          await RNFS.writeFile(tempPath, base64Data, "base64");
          shareUrls.push(`file://${tempPath}`);
        } catch (err) {
          console.log("Error copying file for share:", err);
        }
      }

      if (shareUrls.length === 0) {
        Alert.alert("Error", "Could not prepare files for sharing");
        return;
      }

      // Share multiple files
      await Share.open({
        urls: shareUrls,
        type: "image/*",
      });

      // Clean up temp files after delay
      setTimeout(() => {
        shareUrls.forEach((url) => {
          const path = url.replace("file://", "");
          RNFS.unlink(path).catch(() => {});
        });
      }, 5000);
    } catch (error: any) {
      if (error?.message?.includes("User did not share")) {
        return;
      }
      console.error("Share error:", error);
      Alert.alert("Error", "Could not share files");
    }
  };

  const handleAddToFavorites = async () => {
    if (selectedPhotos.length === 0) return;
    setMenuVisible(false);

    try {
      for (const photoId of selectedPhotos) {
        await markFavorite(photoId, true);
      }
      Alert.alert("Success", `${selectedPhotos.length} photo${selectedPhotos.length > 1 ? "s" : ""} added to favorites`);
      exitSelectionMode();
      loadPhotos();
    } catch (error) {
      console.error("Error adding to favorites:", error);
      Alert.alert("Error", "Failed to add to favorites");
    }
  };

  const handleAddToAlbum = () => {
    if (selectedPhotos.length === 0) return;
    setMenuVisible(false);
    setAddToAlbumVisible(true);
  };

  return (
    <View style={styles.container}>
      <Header onMenuPress={() => setDrawerVisible(true)} />
      <View style={styles.titleBar}>
        <View style={styles.titleTextContainer}>
          <Text style={styles.title}>{dateFilterActive ? "Filtered" : "Photos"}</Text>
          <Text style={styles.subtitle}>
            {dateFilterActive
              ? `${dateFilteredPhotos.length} photos • ${formatDateRange()}`
              : `${photos.length} photos`}
          </Text>
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
          ) : dateFilterActive ? (
            <>
              <Pressable style={styles.clearFilterButton} onPress={clearDateFilter}>
                <Text style={styles.clearFilterText}>Clear</Text>
              </Pressable>
              <Pressable style={styles.iconButton} onPress={() => setMenuVisible(!menuVisible)}>
                <MoreIcon size={scale(18)} color={light.textPrimary} />
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

      {menuVisible && (
        <>
          <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)} />
          <View style={styles.menuOverlay}>
            <View style={styles.menuDropdown}>
            {selectionMode ? (
              <>
                <Pressable style={styles.menuItem} onPress={handleShareSelected}>
                  <ShareIcon size={scale(20)} />
                  <Text style={styles.menuItemText}>Share</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={handleAddToAlbum}>
                  <AddAlbumIcon size={scale(20)} />
                  <Text style={styles.menuItemText}>Add to Album</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={handleAddToFavorites}>
                  <HeartIcon size={scale(20)} />
                  <Text style={styles.menuItemText}>Add to Favorites</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={handleDeleteSelected}>
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
                <Pressable style={styles.menuItem} onPress={() => { setMenuVisible(false); setJumpToDateVisible(true); }}>
                  <CalendarIcon size={scale(20)} />
                  <Text style={styles.menuItemText}>Jump to Date</Text>
                </Pressable>
              </>
            )}
            </View>
          </View>
        </>
      )}

      <ScrollView style={styles.scrollView} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {sections.length > 0 ? (
          sections.map((section) => (
            <View key={section.title}>
              <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{section.title}</Text></View>
              <PhotoGridSection photos={section.data} columns={gridColumns} onPress={handlePhotoPress} showFavorites={true} selectionMode={selectionMode} selectedIds={new Set(selectedPhotos)} />
            </View>
          ))
        ) : dateFilterActive ? (
          <View style={styles.emptyState}>
            <CalendarIcon size={scale(48)} color={light.textTertiary} />
            <Text style={styles.emptyTitle}>No photos found</Text>
            <Text style={styles.emptySubtitle}>No photos from {formatDateRange()}</Text>
          </View>
        ) : null}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Jump to Date Modal */}
      <JumpToDateModal
        visible={jumpToDateVisible}
        onClose={() => setJumpToDateVisible(false)}
        onSelectDate={handleJumpToDate}
      />

      {/* Side Drawer */}
      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        currentScreen="Home"
        navigation={navigation}
      />

      {/* Add to Album Modal */}
      <AddToAlbumModal
        visible={addToAlbumVisible}
        onClose={() => setAddToAlbumVisible(false)}
        onSelectAlbum={async (albumId, albumName, isDeviceAlbum, deviceAlbumName) => {
          try {
            for (const photoId of selectedPhotos) {
              if (isDeviceAlbum && deviceAlbumName) {
                // For device albums, we'd need to copy the file
                // For now just add to custom album
                await addPhotoToAlbum(albumId, photoId);
              } else {
                await addPhotoToAlbum(albumId, photoId);
              }
            }
            Alert.alert("Success", `${selectedPhotos.length} photo${selectedPhotos.length > 1 ? "s" : ""} added to ${albumName}`);
            setAddToAlbumVisible(false);
            exitSelectionMode();
          } catch (error) {
            console.error("Error adding to album:", error);
            Alert.alert("Error", "Failed to add photos to album");
          }
        }}
        photoId={selectedPhotos[0]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: light.background },
  titleBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: scale(16), paddingVertical: scale(12) },
  titleTextContainer: { flex: 1 },
  title: { fontSize: fontScale(28), fontWeight: "700", color: light.textPrimary },
  subtitle: { fontSize: fontScale(14), color: light.textSecondary, marginTop: scale(2) },
  titleActions: { flexDirection: "row", alignItems: "center", gap: scale(8) },
  clearFilterButton: { paddingVertical: scale(8), paddingHorizontal: scale(16), borderRadius: scale(20), backgroundColor: brand.teal },
  clearFilterText: { fontSize: fontScale(14), fontWeight: "600", color: "#FFFFFF" },
  iconButton: { padding: scale(8), borderRadius: scale(6), borderWidth: 1, borderColor: light.border },
  cancelButton: { paddingVertical: scale(8), paddingHorizontal: scale(16), borderRadius: scale(20), backgroundColor: light.surfaceSecondary },
  cancelButtonText: { fontSize: fontScale(14), fontWeight: "500", color: light.textPrimary },
  selectedText: { fontSize: fontScale(14), color: light.textSecondary, marginHorizontal: scale(8) },
  moreButtonTeal: { backgroundColor: brand.teal, padding: scale(8), borderRadius: scale(8), justifyContent: "center", alignItems: "center" },
  scrollView: { flex: 1 },
  sectionHeader: { paddingHorizontal: scale(16), paddingTop: scale(16), paddingBottom: scale(8) },
  sectionTitle: { fontSize: fontScale(16), fontWeight: "600", color: light.textPrimary },
  bottomPadding: { height: scale(80) },
  menuBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 },
  menuOverlay: { position: "absolute", top: scale(120), right: scale(16), zIndex: 100 },
  menuDropdown: { backgroundColor: light.background, borderRadius: scale(8), borderWidth: 1, borderColor: light.border, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5, minWidth: scale(160) },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: scale(12), paddingHorizontal: scale(16), gap: scale(12) },
  menuItemText: { fontSize: fontScale(15), color: light.textPrimary },
  menuItemTextDelete: { color: "#E53935" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: scale(100), paddingHorizontal: scale(24) },
  emptyTitle: { fontSize: fontScale(18), fontWeight: "600", color: light.textPrimary, marginTop: scale(16) },
  emptySubtitle: { fontSize: fontScale(14), color: light.textSecondary, marginTop: scale(8), textAlign: "center" },
});
