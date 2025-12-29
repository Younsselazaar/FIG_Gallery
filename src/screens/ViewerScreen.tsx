import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  Pressable,
  StatusBar,
  Share,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Svg, { Path, Circle } from "react-native-svg";

import {
  getPhotoById,
  getAllPhotos,
  markFavorite,
  trashPhoto,
} from "../db/photoRepository";

import { dark, brand, ui, semantic } from "../theme/colors";
import { spacing, radius } from "../theme/tokens";
import { scale, fontScale, verticalScale } from "../theme/responsive";

/**
 * ViewerScreen.tsx
 * ----------------
 * Fullscreen photo viewer matching FIG Gallery design.
 * Dark theme with header, navigation arrows, and action bar.
 */

type RouteParams = {
  photoId: string;
};

// Icons
function BackIcon({ size = 24, color = "white" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={color} />
    </Svg>
  );
}

function HeartIcon({ size = 24, color = "white", filled = false }: { size?: number; color?: string; filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth="2"
      />
    </Svg>
  );
}

function MoreIcon({ size = 24, color = "white" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="6" r="2" fill={color} />
      <Circle cx="12" cy="12" r="2" fill={color} />
      <Circle cx="12" cy="18" r="2" fill={color} />
    </Svg>
  );
}

function ChevronIcon({ size = 24, color = "white", direction = "left" }: { size?: number; color?: string; direction?: "left" | "right" }) {
  const d = direction === "left" ? "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" : "M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={d} fill={color} />
    </Svg>
  );
}

function ShareIcon({ size = 24, color = "white" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" fill={color} />
    </Svg>
  );
}

function EditIcon({ size = 24, color = "white" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill={color} />
    </Svg>
  );
}

function AddIcon({ size = 24, color = "white" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill={color} />
    </Svg>
  );
}

function DeleteIcon({ size = 24, color = "white" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill={color} />
    </Svg>
  );
}

function formatDate(dateStr: string | number): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ViewerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { photoId } = route.params as RouteParams;

  const [photo, setPhoto] = useState<any>(null);
  const [allPhotos, setAllPhotos] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [photoId]);

  const loadData = async () => {
    const currentPhoto = await getPhotoById(photoId);
    if (!currentPhoto) {
      navigation.goBack();
      return;
    }
    setPhoto(currentPhoto);

    const photos = await getAllPhotos();
    setAllPhotos(photos);
    const index = photos.findIndex((p: any) => p.id === photoId);
    setCurrentIndex(index >= 0 ? index : 0);
  };

  const toggleFavorite = async () => {
    if (!photo) return;
    const newFavorite = !photo.favorite;
    await markFavorite(photo.id, newFavorite);
    setPhoto({ ...photo, favorite: newFavorite ? 1 : 0 });
  };

  const handleDelete = async () => {
    if (!photo) return;
    await trashPhoto(photo.id, true);
    navigation.goBack();
  };

  const handleShare = async () => {
    if (!photo) return;
    try {
      await Share.share({ url: photo.uri });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevPhoto = allPhotos[currentIndex - 1];
      setPhoto(prevPhoto);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < allPhotos.length - 1) {
      const nextPhoto = allPhotos[currentIndex + 1];
      setPhoto(nextPhoto);
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!photo) return null;

  const isFavorite = photo.favorite === 1;
  const isEdited = photo.edited === 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={dark.background} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <BackIcon size={scale(24)} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerDate}>
            {formatDate(photo.createdAt || Date.now())}
          </Text>
          <Text style={styles.headerCount}>
            {currentIndex + 1} of {allPhotos.length}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable onPress={toggleFavorite} style={styles.headerButton}>
            <HeartIcon size={scale(24)} filled={isFavorite} color={isFavorite ? semantic.favorite : "white"} />
          </Pressable>
          <Pressable onPress={() => setMenuOpen(true)} style={styles.headerButton}>
            <MoreIcon size={scale(24)} />
          </Pressable>
        </View>
      </View>

      {/* Edited badge */}
      {isEdited && (
        <View style={styles.badgeContainer}>
          <View style={styles.editedBadge}>
            <Svg width={scale(14)} height={scale(14)} viewBox="0 0 24 24">
              <Path d="M12 2L4.5 20.3l.7.7L12 18l6.8 3 .7-.7z" fill="white" />
            </Svg>
            <Text style={styles.editedText}>Edited</Text>
          </View>
        </View>
      )}

      {/* Image with navigation */}
      <View style={styles.imageContainer}>
        {currentIndex > 0 && (
          <Pressable style={[styles.navButton, styles.navLeft]} onPress={goToPrevious}>
            <ChevronIcon size={scale(32)} direction="left" />
          </Pressable>
        )}

        <Image
          source={{ uri: photo.uri }}
          style={styles.image}
          resizeMode="contain"
        />

        {currentIndex < allPhotos.length - 1 && (
          <Pressable style={[styles.navButton, styles.navRight]} onPress={goToNext}>
            <ChevronIcon size={scale(32)} direction="right" />
          </Pressable>
        )}
      </View>

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.actionButton} onPress={handleShare}>
          <ShareIcon size={scale(22)} />
          <Text style={styles.actionText}>Share</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => navigation.navigate("Editor", { photoId: photo.id })}
        >
          <EditIcon size={scale(22)} />
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <AddIcon size={scale(22)} />
          <Text style={styles.actionText}>Add to</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={handleDelete}>
          <DeleteIcon size={scale(22)} />
          <Text style={styles.actionText}>Delete</Text>
        </Pressable>
      </View>

      {/* More menu overlay */}
      {menuOpen && (
        <>
          <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)} />
          <View style={styles.menu}>
            <Pressable style={styles.menuItem} onPress={handleShare}>
              <ShareIcon size={scale(20)} color={dark.textPrimary} />
              <Text style={styles.menuItemText}>Share</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => { setMenuOpen(false); navigation.navigate("Editor", { photoId: photo.id }); }}>
              <EditIcon size={scale(20)} color={dark.textPrimary} />
              <Text style={styles.menuItemText}>Edit</Text>
            </Pressable>
            <Pressable style={styles.menuItem}>
              <AddIcon size={scale(20)} color={dark.textPrimary} />
              <Text style={styles.menuItemText}>Add to album</Text>
            </Pressable>
            <Pressable style={styles.menuItem}>
              <Svg width={scale(20)} height={scale(20)} viewBox="0 0 24 24">
                <Path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zM6 10h2v2H6v-2zm0 4h8v2H6v-2zm10 0h2v2h-2v-2zm-6-4h8v2h-8v-2z" fill={dark.textPrimary} />
              </Svg>
              <Text style={styles.menuItemText}>Details</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => { setMenuOpen(false); handleDelete(); }}>
              <DeleteIcon size={scale(20)} color={semantic.error} />
              <Text style={[styles.menuItemText, { color: semantic.error }]}>Delete</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dark.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingTop: verticalScale(40),
  },
  headerButton: {
    padding: spacing.sm,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerDate: {
    fontSize: fontScale(16),
    fontWeight: "600",
    color: dark.textPrimary,
  },
  headerCount: {
    fontSize: fontScale(13),
    color: dark.textSecondary,
    marginTop: scale(2),
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeContainer: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  editedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ui.badgeEdited,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  editedText: {
    fontSize: fontScale(13),
    color: ui.badgeEditedText,
    fontWeight: "500",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    marginTop: -scale(24),
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  navLeft: {
    left: spacing.md,
  },
  navRight: {
    right: spacing.md,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingBottom: verticalScale(30),
    backgroundColor: dark.backgroundSecondary,
  },
  actionButton: {
    alignItems: "center",
    gap: spacing.xs,
  },
  actionText: {
    fontSize: fontScale(12),
    color: dark.textPrimary,
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 100,
  },
  menu: {
    position: "absolute",
    top: verticalScale(80),
    right: spacing.lg,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 101,
    minWidth: scale(180),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  menuItemText: {
    fontSize: fontScale(15),
    color: "#1A1A1A",
  },
});
