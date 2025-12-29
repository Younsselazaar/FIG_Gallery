import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Svg, { Path, Rect, Circle } from "react-native-svg";

import Header from "../components/Header";
import { PhotoGridSection, PhotoItem, PhotoSection } from "../components/PhotoGrid";
import JumpToDateModal from "../components/JumpToDateModal";

import { getAllPhotos } from "../db/photoRepository";
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

  const toggleGridView = () => setGridColumns((prev) => (prev === 4 ? 5 : 4));

  const loadPhotos = useCallback(async () => {
    try {
      const list = await getAllPhotos();
      setPhotos(list.map((p: any) => ({
        id: p.id, uri: p.uri, favorite: p.favorite === 1,
        date: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
      })));
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
  const sections = useMemo(() => groupPhotosByDate(photos), [photos]);

  const handlePhotoPress = (photoId: string) => {
    if (selectionMode) {
      setSelectedPhotos((prev) =>
        prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
      );
    } else {
      navigation.navigate("Viewer", { photoId });
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
      <Header onMenuPress={() => {}} />
      <View style={styles.titleBar}>
        <View>
          <Text style={styles.title}>Photos</Text>
          <Text style={styles.subtitle}>{photos.length} photos</Text>
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

      {menuVisible && (
        <>
          <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)} />
          <View style={styles.menuOverlay}>
            <View style={styles.menuDropdown}>
            {selectionMode ? (
              <>
                <Pressable style={styles.menuItem} onPress={() => { setMenuVisible(false); }}>
                  <ShareIcon size={scale(20)} />
                  <Text style={styles.menuItemText}>Share</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={() => { setMenuVisible(false); }}>
                  <AddAlbumIcon size={scale(20)} />
                  <Text style={styles.menuItemText}>Add to Album</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={() => { setMenuVisible(false); }}>
                  <HeartIcon size={scale(20)} />
                  <Text style={styles.menuItemText}>Add to Favorites</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={() => { setMenuVisible(false); }}>
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
        {sections.map((section) => (
          <View key={section.title}>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{section.title}</Text></View>
            <PhotoGridSection photos={section.data} columns={gridColumns} onPress={handlePhotoPress} showFavorites={true} selectionMode={selectionMode} selectedIds={new Set(selectedPhotos)} />
          </View>
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Jump to Date Modal */}
      <JumpToDateModal
        visible={jumpToDateVisible}
        onClose={() => setJumpToDateVisible(false)}
        onSelectDate={(date) => {
          console.log("Selected date:", date);
          // TODO: Scroll to the selected date section
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: light.background },
  titleBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: scale(16), paddingVertical: scale(12) },
  title: { fontSize: fontScale(28), fontWeight: "700", color: light.textPrimary },
  subtitle: { fontSize: fontScale(14), color: light.textSecondary, marginTop: scale(2) },
  titleActions: { flexDirection: "row", alignItems: "center", gap: scale(8) },
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
});
