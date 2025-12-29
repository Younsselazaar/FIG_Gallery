import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import Header from "../components/Header";
import { PhotoGridSection, PhotoItem, PhotoSection } from "../components/PhotoGrid";

import { getFavoritePhotos } from "../db/photoRepository";
import { light, brand } from "../theme/colors";
import { spacing, radius } from "../theme/tokens";
import { scale, fontScale, verticalScale } from "../theme/responsive";

/**
 * FavoritesScreen.tsx
 * -------------------
 * Displays user's favorite photos.
 */

function formatDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function groupPhotosByDate(photos: PhotoItem[]): PhotoSection[] {
  const groups: { [key: string]: PhotoItem[] } = {};

  photos.forEach((photo) => {
    const date = photo.date
      ? new Date(photo.date).toDateString()
      : new Date().toDateString();

    if (!groups[date]) groups[date] = [];
    groups[date].push(photo);
  });

  const sortedDates = Object.keys(groups).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return sortedDates.map((date) => ({
    title: formatDateGroup(date),
    data: groups[date],
  }));
}

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const list = await getFavoritePhotos();
      setPhotos(
        list.map((p: any) => ({
          id: p.id,
          uri: p.uri,
          favorite: true,
          date: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
        }))
      );
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  }, []);

  const sections = useMemo(() => groupPhotosByDate(photos), [photos]);

  const handlePhotoPress = (photoId: string) => {
    navigation.navigate("Viewer", { photoId });
  };

  return (
    <View style={styles.container}>
      <Header onMenuPress={() => {}} />

      <View style={styles.titleBar}>
        <View>
          <Text style={styles.title}>Favorites</Text>
          <Text style={styles.subtitle}>{photos.length} photos</Text>
        </View>
        <Pressable style={styles.selectButton}>
          <Text style={styles.selectButtonText}>Select</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {photos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the heart icon on any photo to add it to favorites
            </Text>
          </View>
        ) : (
          sections.map((section) => (
            <View key={section.title}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <PhotoGridSection
                photos={section.data}
                columns={4}
                onPress={handlePhotoPress}
                showFavorites={true}
              />
            </View>
          ))
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
  selectButton: {
    paddingVertical: scale(10),
    paddingHorizontal: scale(16),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: light.border,
  },
  selectButtonText: {
    fontSize: fontScale(15),
    color: light.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
    paddingBottom: scale(8),
  },
  sectionTitle: {
    fontSize: fontScale(16),
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
    paddingTop: scale(100),
    paddingHorizontal: scale(24),
  },
  emptyText: {
    fontSize: fontScale(18),
    fontWeight: "600",
    color: light.textPrimary,
    marginBottom: scale(8),
  },
  emptySubtext: {
    fontSize: fontScale(14),
    color: light.textSecondary,
    textAlign: "center",
  },
});
