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

import { searchPhotos, getAllPhotos } from "../db/photoRepository";
import { light, brand, ui } from "../theme/colors";
import { scale, fontScale } from "../theme/responsive";

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
  const [hasSearched, setHasSearched] = useState(false);

  // Load all photos on mount
  useEffect(() => {
    loadAllPhotos();
  }, []);

  const loadAllPhotos = async () => {
    try {
      const photos = await getAllPhotos();
      setAllPhotos(
        photos.map((p: any) => ({
          id: p.id,
          uri: p.uri,
          favorite: p.favorite === 1,
          date: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
        }))
      );
    } catch (error) {
      console.error("Error loading photos:", error);
    }
  };

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.length > 0) {
      setHasSearched(true);
      try {
        const photos = await searchPhotos(text);
        setResults(
          photos.map((p: any) => ({
            id: p.id,
            uri: p.uri,
            favorite: p.favorite === 1,
            date: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
          }))
        );
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      }
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, []);

  const handlePhotoPress = (photoId: string) => {
    navigation.navigate("Viewer", { photoId });
  };

  const sections = groupPhotosByDate(hasSearched ? results : allPhotos);

  return (
    <View style={styles.container}>
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
        {/* All Photos title */}
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>All Photos</Text>
        </View>

        {sections.length > 0 ? (
          sections.map((section) => (
            <View key={section.title}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateHeaderText}>{section.title}</Text>
              </View>
              <PhotoGridSection
                photos={section.data}
                columns={4}
                onPress={handlePhotoPress}
                showFavorites={true}
              />
            </View>
          ))
        ) : hasSearched ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubtext}>
              Try different keywords or filters
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <SearchIcon size={scale(48)} color={light.textTertiary} />
            <Text style={styles.emptyText}>No photos yet</Text>
            <Text style={styles.emptySubtext}>
              Your photos will appear here
            </Text>
          </View>
        )}

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
    paddingHorizontal: scale(16),
    paddingBottom: scale(12),
  },
  advancedButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
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
});
