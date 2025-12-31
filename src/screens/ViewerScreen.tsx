import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  Pressable,
  StatusBar,
  Share,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import Svg, { Path, Circle } from "react-native-svg";
import RNFS from "react-native-fs";

import {
  getPhotoById,
  getAllPhotos,
  markFavorite,
  trashPhoto,
} from "../db/photoRepository";
import { addPhotoToAlbum } from "../db/albumRepository";
import { trackPhotoView } from "../services/viewTracking";
import AddToAlbumModal from "../components/AddToAlbumModal";

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
  mediaType?: "photo" | "video";
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

function PlayIcon({ size = 48, color = "white" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.5)" />
      <Path d="M9.5 7.5V16.5L16.5 12L9.5 7.5Z" fill={color} />
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

// Helper to detect if URI is a video
function isVideoUri(uri: string): boolean {
  const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v", ".3gp"];
  const lowerUri = uri.toLowerCase();
  return videoExtensions.some((ext) => lowerUri.includes(ext)) || lowerUri.includes("video");
}

export default function ViewerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { photoId, mediaType: routeMediaType } = route.params as RouteParams;

  const [photo, setPhoto] = useState<any>(null);
  const [allPhotos, setAllPhotos] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [addToMenuOpen, setAddToMenuOpen] = useState(false);
  const [addToAlbumVisible, setAddToAlbumVisible] = useState(false);
  const [mediaTypeMap, setMediaTypeMap] = useState<Map<string, "photo" | "video">>(new Map());

  useEffect(() => {
    loadData();
    loadMediaTypes();
  }, [photoId]);

  const loadData = async () => {
    const currentPhoto = await getPhotoById(photoId);
    if (!currentPhoto) {
      navigation.goBack();
      return;
    }
    setPhoto(currentPhoto);

    // Track this photo view for Recently Viewed and Most Viewed
    await trackPhotoView(photoId);

    const photos = await getAllPhotos();
    setAllPhotos(photos);
    const index = photos.findIndex((p: any) => p.id === photoId);
    setCurrentIndex(index >= 0 ? index : 0);
  };

  // Load media types from CameraRoll to properly detect videos
  const loadMediaTypes = async () => {
    try {
      const result = await CameraRoll.getPhotos({
        first: 5000,
        assetType: "All",
        groupTypes: "All",
      });

      const typeMap = new Map<string, "photo" | "video">();
      result.edges.forEach((edge) => {
        const uri = edge.node.image.uri;
        const isVideo = edge.node.type?.includes("video") || false;
        typeMap.set(uri, isVideo ? "video" : "photo");
      });
      setMediaTypeMap(typeMap);
    } catch (error) {
      console.log("Error loading media types:", error);
    }
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

  const goToPrevious = async () => {
    if (currentIndex > 0) {
      const prevPhoto = allPhotos[currentIndex - 1];
      setPhoto(prevPhoto);
      setCurrentIndex(currentIndex - 1);
      // Track view for the new photo
      await trackPhotoView(prevPhoto.id);
    }
  };

  const goToNext = async () => {
    if (currentIndex < allPhotos.length - 1) {
      const nextPhoto = allPhotos[currentIndex + 1];
      setPhoto(nextPhoto);
      setCurrentIndex(currentIndex + 1);
      // Track view for the new photo
      await trackPhotoView(nextPhoto.id);
    }
  };

  // Open video with share menu to select video player
  const playVideo = async () => {
    Alert.alert(
      "Play Video",
      "Choose how to play this video:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open with...",
          onPress: async () => {
            try {
              await Share.share({
                url: photo.uri,
                title: "Play Video",
              });
            } catch (error) {
              console.log("Error sharing video:", error);
            }
          },
        },
      ]
    );
  };

  if (!photo) return null;

  const isFavorite = photo.favorite === 1;
  const isEdited = photo.edited === 1;

  // Check video status from multiple sources
  const isVideo =
    routeMediaType === "video" ||
    mediaTypeMap.get(photo.uri) === "video" ||
    isVideoUri(photo.uri);

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

      {/* Image/Video with navigation */}
      <View style={styles.imageContainer}>
        {currentIndex > 0 && (
          <Pressable style={[styles.navButton, styles.navLeft]} onPress={goToPrevious}>
            <ChevronIcon size={scale(32)} direction="left" />
          </Pressable>
        )}

        {isVideo ? (
          <Pressable style={styles.videoContainer} onPress={playVideo}>
            <Image
              source={{ uri: photo.uri }}
              style={styles.image}
              resizeMode="contain"
            />
            {/* Play button overlay */}
            <View style={styles.playOverlay}>
              <View style={styles.playButton}>
                <PlayIcon size={scale(56)} />
              </View>
              <Text style={styles.tapToPlayText}>Tap to play video</Text>
            </View>
          </Pressable>
        ) : (
          <Image
            source={{ uri: photo.uri }}
            style={styles.image}
            resizeMode="contain"
          />
        )}

        {currentIndex < allPhotos.length - 1 && (
          <Pressable style={[styles.navButton, styles.navRight]} onPress={goToNext}>
            <ChevronIcon size={scale(32)} direction="right" />
          </Pressable>
        )}
      </View>

      {/* Add to popup menu */}
      {addToMenuOpen && (
        <>
          <Pressable style={styles.addToMenuOverlay} onPress={() => setAddToMenuOpen(false)} />
          <View style={styles.addToMenu}>
            {/* Album */}
            <Pressable
              style={styles.addToMenuItem}
              onPress={() => {
                setAddToMenuOpen(false);
                setAddToAlbumVisible(true);
              }}
            >
              <Svg width={scale(22)} height={scale(22)} viewBox="0 0 24 24">
                <Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-8-2h2v-4h4v-2h-4V7h-2v4H7v2h4v4z" fill="#1A1A1A" />
              </Svg>
              <Text style={styles.addToMenuText}>Album</Text>
            </Pressable>
            {/* Archive */}
            <Pressable
              style={styles.addToMenuItem}
              onPress={() => {
                setAddToMenuOpen(false);
                Alert.alert("Archive", "Photo archived");
              }}
            >
              <Svg width={scale(22)} height={scale(22)} viewBox="0 0 24 24">
                <Path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z" fill="#1A1A1A" />
              </Svg>
              <Text style={styles.addToMenuText}>Archive</Text>
            </Pressable>
            {/* Locked folder */}
            <Pressable
              style={styles.addToMenuItem}
              onPress={() => {
                setAddToMenuOpen(false);
                Alert.alert("Locked folder", "Photo moved to locked folder");
              }}
            >
              <Svg width={scale(22)} height={scale(22)} viewBox="0 0 24 24">
                <Path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="#1A1A1A" />
              </Svg>
              <Text style={styles.addToMenuText}>Locked folder</Text>
            </Pressable>
          </View>
        </>
      )}

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

        <Pressable style={styles.actionButton} onPress={() => setAddToMenuOpen(true)}>
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
            {/* Share */}
            <Pressable style={styles.menuItem} onPress={() => { setMenuOpen(false); handleShare(); }}>
              <ShareIcon size={scale(20)} color="#1A1A1A" />
              <Text style={styles.menuItemText}>Share</Text>
            </Pressable>
            {/* Edit */}
            <Pressable style={styles.menuItem} onPress={() => { setMenuOpen(false); navigation.navigate("Editor", { photoId: photo.id }); }}>
              <EditIcon size={scale(20)} color="#1A1A1A" />
              <Text style={styles.menuItemText}>Edit</Text>
            </Pressable>
            {/* Add to album */}
            <Pressable style={styles.menuItem} onPress={() => { setMenuOpen(false); setAddToAlbumVisible(true); }}>
              <Svg width={scale(20)} height={scale(20)} viewBox="0 0 24 24">
                <Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-8-2h2v-4h4v-2h-4V7h-2v4H7v2h4v4z" fill="#1A1A1A" />
              </Svg>
              <Text style={styles.menuItemText}>Add to album</Text>
            </Pressable>
            {/* Archive */}
            <Pressable style={styles.menuItem}>
              <Svg width={scale(20)} height={scale(20)} viewBox="0 0 24 24">
                <Path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z" fill="#1A1A1A" />
              </Svg>
              <Text style={styles.menuItemText}>Archive</Text>
            </Pressable>
            {/* Locked folder */}
            <Pressable style={styles.menuItem}>
              <Svg width={scale(20)} height={scale(20)} viewBox="0 0 24 24">
                <Path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="#1A1A1A" />
              </Svg>
              <Text style={styles.menuItemText}>Locked folder</Text>
            </Pressable>
            {/* Revert to original */}
            <Pressable style={styles.menuItem}>
              <Svg width={scale(20)} height={scale(20)} viewBox="0 0 24 24">
                <Path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" fill="#1A1A1A" />
              </Svg>
              <Text style={styles.menuItemText}>Revert to original</Text>
            </Pressable>
            {/* Details */}
            <Pressable style={styles.menuItem}>
              <Svg width={scale(20)} height={scale(20)} viewBox="0 0 24 24">
                <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#1A1A1A" />
              </Svg>
              <Text style={styles.menuItemText}>Details</Text>
            </Pressable>
            {/* Show EXIF */}
            <Pressable style={styles.menuItem}>
              <Svg width={scale(20)} height={scale(20)} viewBox="0 0 24 24">
                <Path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z" fill="#1A1A1A" />
              </Svg>
              <Text style={styles.menuItemText}>Show EXIF</Text>
            </Pressable>
            {/* Manage Tags */}
            <Pressable style={styles.menuItem}>
              <Svg width={scale(20)} height={scale(20)} viewBox="0 0 24 24">
                <Path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" fill="#1A1A1A" />
              </Svg>
              <Text style={styles.menuItemText}>Manage Tags</Text>
            </Pressable>
            {/* Delete */}
            <Pressable style={styles.menuItem} onPress={() => { setMenuOpen(false); handleDelete(); }}>
              <DeleteIcon size={scale(20)} color="#E53935" />
              <Text style={[styles.menuItemText, { color: "#E53935" }]}>Delete</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* Add to Album Modal */}
      <AddToAlbumModal
        visible={addToAlbumVisible}
        onClose={() => setAddToAlbumVisible(false)}
        onSelectAlbum={async (albumId, albumName) => {
          if (!photo) return;

          try {
            if (albumId === "favorites") {
              // Handle Favorites specially - mark as favorite
              await markFavorite(photo.id, true);
              setPhoto({ ...photo, favorite: 1 });
              Alert.alert("Added", `Photo added to Favorites`);
            } else if (albumId.startsWith("device_")) {
              // Copy photo to device album using RNFS
              const deviceAlbumName = albumId.replace("device_", "");

              try {
                // Create a temp file path
                const timestamp = Date.now();
                const tempPath = `${RNFS.CachesDirectoryPath}/temp_photo_${timestamp}.jpg`;

                // Read the content:// URI and copy to temp file
                const base64Data = await RNFS.readFile(photo.uri, "base64");
                await RNFS.writeFile(tempPath, base64Data, "base64");

                // Save from temp file to the device album
                await CameraRoll.save(`file://${tempPath}`, {
                  type: "photo",
                  album: deviceAlbumName,
                });

                // Clean up temp file
                await RNFS.unlink(tempPath);

                Alert.alert("Added", `Photo copied to ${deviceAlbumName}`);
              } catch (saveError: any) {
                console.error("Error copying to device album:", saveError);
                Alert.alert(
                  "Error",
                  `Could not copy photo to ${deviceAlbumName}. ${saveError?.message || ""}`
                );
              }
            } else {
              // Add to custom album (database)
              await addPhotoToAlbum(albumId, photo.id);
              Alert.alert("Added", `Photo added to ${albumName}`);
            }
            console.log(`Added photo to album: ${albumName}`);
          } catch (error) {
            console.error("Error adding photo to album:", error);
            Alert.alert("Error", "Failed to add photo to album. Please try again.");
          }
        }}
        photoId={photo?.id}
      />
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
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 100,
  },
  menu: {
    position: "absolute",
    top: verticalScale(50),
    right: scale(12),
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 101,
    minWidth: scale(200),
    paddingVertical: scale(8),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    gap: scale(14),
  },
  menuItemText: {
    fontSize: fontScale(15),
    fontWeight: "500",
    color: "#1A1A1A",
  },
  addToMenuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    zIndex: 50,
  },
  addToMenu: {
    position: "absolute",
    bottom: verticalScale(90),
    left: "50%",
    marginLeft: -scale(80),
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 51,
    minWidth: scale(160),
    paddingVertical: scale(8),
  },
  addToMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(14),
    paddingHorizontal: scale(18),
    gap: scale(14),
  },
  addToMenuText: {
    fontSize: fontScale(16),
    fontWeight: "500",
    color: "#1A1A1A",
  },
  videoContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  tapToPlayText: {
    color: "white",
    fontSize: fontScale(14),
    fontWeight: "500",
    marginTop: scale(12),
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
