import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path, Circle } from "react-native-svg";

import Header from "../components/Header";
import SideDrawer from "../components/SideDrawer";
import { light, brand } from "../theme/colors";
import { spacing, radius } from "../theme/tokens";
import { scale, fontScale } from "../theme/responsive";

/**
 * TagsScreen.tsx
 * --------------
 * Manage tags for photos.
 */

function TagIcon({ size = 24, color = light.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="7" cy="7" r="1.5" fill={color} />
    </Svg>
  );
}

function SearchIcon({ size = 20, color = light.textTertiary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
      <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function PlusIcon({ size = 18, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function CloseIcon({ size = 20, color = light.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function TrashIcon({ size = 20, color = "#EF4444" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

type Tag = {
  id: string;
  name: string;
  count: number;
};

// Sample tags data
const sampleTags: Tag[] = [
  { id: "1", name: "nature", count: 6 },
  { id: "2", name: "forest", count: 3 },
  { id: "3", name: "mountains", count: 2 },
  { id: "4", name: "landscape", count: 2 },
  { id: "5", name: "trees", count: 2 },
  { id: "6", name: "sky", count: 1 },
  { id: "7", name: "stars", count: 1 },
  { id: "8", name: "night", count: 1 },
  { id: "9", name: "city", count: 1 },
  { id: "10", name: "urban", count: 1 },
  { id: "11", name: "skyline", count: 1 },
  { id: "12", name: "autumn", count: 1 },
  { id: "13", name: "fall", count: 1 },
  { id: "14", name: "desert", count: 1 },
  { id: "15", name: "sand", count: 1 },
  { id: "16", name: "fog", count: 1 },
  { id: "17", name: "waterfall", count: 1 },
  { id: "18", name: "water", count: 1 },
  { id: "19", name: "lake", count: 1 },
  { id: "20", name: "reflection", count: 1 },
  { id: "21", name: "tropical", count: 1 },
  { id: "22", name: "beach", count: 1 },
  { id: "23", name: "palm", count: 1 },
];

export default function TagsScreen() {
  const navigation = useNavigation<any>();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tags, setTags] = useState<Tag[]>(sampleTags);
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTagPress = (tag: Tag) => {
    setSelectedTag(tag);
  };

  const handleNewTag = () => {
    setNewTagName("");
    setShowNewTagInput(true);
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTag: Tag = {
        id: String(Date.now()),
        name: newTagName.trim().toLowerCase(),
        count: 0,
      };
      setTags([...tags, newTag]);
      setShowNewTagInput(false);
      setNewTagName("");
      setSelectedTag(newTag);
    }
  };

  const handleCancelNewTag = () => {
    setShowNewTagInput(false);
    setNewTagName("");
  };

  const handleBackFromTag = () => {
    setSelectedTag(null);
  };

  const handleDeleteTag = () => {
    if (selectedTag) {
      setTags(tags.filter((t) => t.id !== selectedTag.id));
      setSelectedTag(null);
    }
  };

  return (
    <View style={styles.container}>
      <Header onMenuPress={() => setDrawerVisible(true)} />

      {/* Title Bar */}
      <View style={styles.titleBar}>
        <View style={styles.titleLeft}>
          <TagIcon size={scale(24)} color={light.textPrimary} />
          <View style={styles.titleTextContainer}>
            <Text style={styles.title}>Manage Tags</Text>
            <Text style={styles.subtitle}>{tags.length} tags</Text>
          </View>
        </View>
        <Pressable style={styles.newTagButton} onPress={handleNewTag}>
          <PlusIcon size={scale(16)} color="#FFFFFF" />
          <Text style={styles.newTagButtonText}>New Tag</Text>
        </Pressable>
      </View>

      {/* New Tag Input Row */}
      {showNewTagInput && (
        <View style={styles.newTagInputRow}>
          <TextInput
            style={styles.newTagInput}
            placeholder="Enter tag name..."
            placeholderTextColor={light.textTertiary}
            value={newTagName}
            onChangeText={setNewTagName}
            autoFocus
          />
          <Pressable style={styles.addButton} onPress={handleAddTag}>
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
          <Pressable onPress={handleCancelNewTag}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon size={scale(18)} color={light.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tags..."
            placeholderTextColor={light.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Selected Tag Detail View */}
      {selectedTag && (
        <View style={styles.tagDetailRow}>
          <Pressable style={styles.backButton} onPress={handleBackFromTag}>
            <CloseIcon size={scale(18)} color={light.textPrimary} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.selectedTagChip}>
            <Text style={styles.selectedTagName}>{selectedTag.name}</Text>
          </View>
          <Text style={styles.photoCount}>{selectedTag.count} photos</Text>
          <Pressable style={styles.deleteTagButton} onPress={handleDeleteTag}>
            <TrashIcon size={scale(16)} color="#EF4444" />
            <Text style={styles.deleteTagText}>Delete Tag</Text>
          </Pressable>
        </View>
      )}

      {/* Tags List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.tagsContainer}>
        <View style={styles.tagsWrap}>
          {filteredTags.map((tag) => (
            <Pressable
              key={tag.id}
              style={styles.tagChip}
              onPress={() => handleTagPress(tag)}
            >
              <Text style={styles.tagName}>{tag.name}</Text>
              <Text style={styles.tagCount}>{tag.count}</Text>
            </Pressable>
          ))}
        </View>

        {filteredTags.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tags found</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        currentScreen="Tags"
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  titleTextContainer: {
    marginLeft: scale(4),
  },
  title: {
    fontSize: fontScale(22),
    fontWeight: "700",
    color: light.textPrimary,
  },
  subtitle: {
    fontSize: fontScale(13),
    color: light.textSecondary,
    marginTop: scale(2),
  },
  newTagButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: brand.teal,
    paddingVertical: scale(10),
    paddingHorizontal: scale(14),
    borderRadius: scale(8),
    gap: scale(6),
  },
  newTagButtonText: {
    fontSize: fontScale(14),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: light.surface,
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: light.border,
    paddingHorizontal: scale(14),
    paddingVertical: scale(10),
    gap: scale(10),
  },
  searchInput: {
    flex: 1,
    fontSize: fontScale(15),
    color: light.textPrimary,
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  tagsContainer: {
    paddingHorizontal: spacing.lg,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(10),
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: light.surface,
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: light.border,
    paddingVertical: scale(8),
    paddingHorizontal: scale(14),
    gap: scale(8),
  },
  tagName: {
    fontSize: fontScale(14),
    color: light.textPrimary,
  },
  tagCount: {
    fontSize: fontScale(13),
    color: light.textTertiary,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: scale(40),
  },
  emptyText: {
    fontSize: fontScale(16),
    color: light.textSecondary,
  },
  bottomPadding: {
    height: scale(80),
  },
  newTagInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: scale(10),
  },
  newTagInput: {
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
  addButton: {
    paddingVertical: scale(10),
    paddingHorizontal: scale(18),
    borderRadius: scale(8),
    backgroundColor: "#1F2937",
  },
  addButtonText: {
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
  tagDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: scale(10),
    flexWrap: "wrap",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  backText: {
    fontSize: fontScale(14),
    fontWeight: "500",
    color: light.textPrimary,
  },
  selectedTagChip: {
    backgroundColor: brand.teal,
    borderRadius: scale(20),
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
  },
  selectedTagName: {
    fontSize: fontScale(14),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  photoCount: {
    fontSize: fontScale(14),
    color: light.textSecondary,
  },
  deleteTagButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: scale(8),
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
  },
  deleteTagText: {
    fontSize: fontScale(13),
    fontWeight: "500",
    color: "#EF4444",
  },
});
