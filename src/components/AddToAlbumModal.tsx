import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";

import { getAllAlbums, createAlbum } from "../db/albumRepository";
import { requestMediaPermission } from "../services/mediaScanner";
import { scale, fontScale } from "../theme/responsive";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type Album = {
  id: string;
  name: string;
  count: number;
  isDevice?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectAlbum: (albumId: string, albumName: string) => void;
  photoId?: string;
};

// Icons
function FolderIcon({ size = 32, color = "rgba(255,255,255,0.6)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
    </Svg>
  );
}

function CreateAlbumIcon({ size = 24, color = "rgba(255,255,255,0.6)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M20 6h-8l-2-2H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z"
        fill={color}
      />
    </Svg>
  );
}

function AlbumRow({
  album,
  selected,
  onPress,
}: {
  album: Album;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.albumRow} onPress={onPress}>
      <View style={styles.albumIconContainer}>
        <FolderIcon size={scale(28)} color="rgba(255,255,255,0.7)" />
      </View>
      <View style={styles.albumInfo}>
        <Text style={styles.albumName}>{album.name}</Text>
        <Text style={styles.albumCount}>{album.count} photos</Text>
      </View>
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && (
          <Svg width={scale(16)} height={scale(16)} viewBox="0 0 24 24">
            <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#FFFFFF" />
          </Svg>
        )}
      </View>
    </Pressable>
  );
}

export default function AddToAlbumModal({ visible, onClose, onSelectAlbum, photoId }: Props) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadAlbums();
      setSelectedAlbumId(null);
    }
  }, [visible]);

  const loadAlbums = async () => {
    try {
      const allAlbums: Album[] = [];

      // Request permission first
      const hasPermission = await requestMediaPermission();

      if (hasPermission) {
        // Get device albums from CameraRoll
        try {
          const deviceAlbums = await CameraRoll.getAlbums({ assetType: "Photos" });

          for (const deviceAlbum of deviceAlbums) {
            allAlbums.push({
              id: `device_${deviceAlbum.title}`,
              name: deviceAlbum.title,
              count: deviceAlbum.count || 0,
              isDevice: true,
            });
          }
        } catch (err) {
          console.log("Error loading device albums:", err);
        }
      }

      // Add Favorites
      allAlbums.push({
        id: "favorites",
        name: "Favorites",
        count: 0,
        isDevice: false,
      });

      // Get custom albums from database
      const dbAlbums = await getAllAlbums();
      for (const dbAlbum of dbAlbums) {
        allAlbums.push({
          id: dbAlbum.id,
          name: dbAlbum.name,
          count: (dbAlbum as any).photoCount || 0,
          isDevice: false,
        });
      }

      setAlbums(allAlbums);
    } catch (error) {
      console.error("Error loading albums:", error);
    }
  };

  const handleCreateNewAlbum = async () => {
    const newAlbum = await createAlbum("New Album");
    loadAlbums();
  };

  const handleSelectAlbum = (album: Album) => {
    setSelectedAlbumId(album.id);
    onSelectAlbum(album.id, album.name);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalContainer}>
          {/* Drag handle */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add to album</Text>
            <Pressable onPress={handleCreateNewAlbum} style={styles.createButton}>
              <CreateAlbumIcon size={scale(24)} color="rgba(255,255,255,0.7)" />
            </Pressable>
          </View>

          {/* Album list */}
          <ScrollView style={styles.albumList} showsVerticalScrollIndicator={false}>
            {albums.map((album) => (
              <AlbumRow
                key={album.id}
                album={album}
                selected={selectedAlbumId === album.id}
                onPress={() => handleSelectAlbum(album)}
              />
            ))}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    maxHeight: SCREEN_HEIGHT * 0.7,
    paddingBottom: scale(20),
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingVertical: scale(12),
  },
  dragHandle: {
    width: scale(36),
    height: scale(4),
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: scale(2),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingBottom: scale(16),
  },
  title: {
    fontSize: fontScale(22),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  createButton: {
    padding: scale(8),
  },
  albumList: {
    paddingHorizontal: scale(16),
  },
  albumRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: scale(12),
    padding: scale(12),
    marginBottom: scale(10),
  },
  albumIconContainer: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(10),
    backgroundColor: "#3A3A3C",
    alignItems: "center",
    justifyContent: "center",
  },
  albumInfo: {
    flex: 1,
    marginLeft: scale(14),
  },
  albumName: {
    fontSize: fontScale(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  albumCount: {
    fontSize: fontScale(13),
    color: "rgba(255,255,255,0.5)",
    marginTop: scale(2),
  },
  checkbox: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#34C759",
    borderColor: "#34C759",
  },
  bottomPadding: {
    height: scale(40),
  },
});
