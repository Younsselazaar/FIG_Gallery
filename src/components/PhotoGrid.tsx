import React, { useCallback } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
  Text,
  SectionList,
  Dimensions,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

import { spacing, radius } from "../theme/tokens";
import { light, ui, semantic } from "../theme/colors";
import { scale, fontScale, screen } from "../theme/responsive";

/**
 * PhotoGrid.tsx
 * -------------
 * Photo grid matching FIG Gallery design.
 * - Responsive grid that adapts to screen size
 * - Uses percentage-based calculations
 */

export type PhotoItem = {
  id: string;
  uri: string;
  favorite?: boolean;
  date?: string;
};

export type PhotoSection = {
  title: string;
  data: PhotoItem[];
};

type Props = {
  photos: PhotoItem[];
  sections?: PhotoSection[];
  columns?: number;
  onPress: (photoId: string) => void;
  onLongPress?: (photoId: string) => void;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  showFavorites?: boolean;
};

// Grid configuration - smaller gaps for compact mode
const GRID_GAP = 2;
const GRID_PADDING = 4;

// Heart icon for favorites
function HeartIcon({ size = 18, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
        fill={filled ? semantic.favorite : "none"}
        stroke={semantic.favorite}
        strokeWidth="2"
      />
    </Svg>
  );
}

// Selection circle - matches FIG Gallery design
function SelectionCircle({ selected, compact = false }: { selected: boolean; compact?: boolean }) {
  const size = compact ? scale(18) : scale(22);
  const checkSize = compact ? scale(10) : scale(12);

  return (
    <View style={[
      styles.selectionCircle,
      { width: size, height: size, borderRadius: size / 2 },
      selected && styles.selectionCircleSelected
    ]}>
      {selected && (
        <Svg width={checkSize} height={checkSize} viewBox="0 0 24 24">
          <Path
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
            fill="white"
          />
        </Svg>
      )}
    </View>
  );
}

// Single photo item
function PhotoGridItem({
  item,
  onPress,
  onLongPress,
  selectionMode,
  selected,
  showFavorite,
  itemSize,
  compact = false,
}: {
  item: PhotoItem;
  onPress: () => void;
  onLongPress?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
  showFavorite?: boolean;
  itemSize: number;
  compact?: boolean;
}) {
  // Icon sizes for favorites and selection
  const iconSize = compact ? scale(16) : scale(18);
  const iconPadding = compact ? scale(3) : scale(4);
  const iconOffset = compact ? scale(6) : scale(8);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.item,
        { width: itemSize, height: itemSize },
        pressed && styles.pressed,
      ]}
    >
      <Image
        source={{ uri: item.uri }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Favorite heart icon */}
      {showFavorite && item.favorite && (
        <View style={[
          styles.favoriteIcon,
          { bottom: iconOffset, right: iconOffset, padding: iconPadding }
        ]}>
          <HeartIcon size={iconSize} filled />
        </View>
      )}

      {/* Selection circle - top right corner */}
      {selectionMode && (
        <View style={[styles.selectionOverlay, { top: 1, right: 1 }]}>
          <SelectionCircle selected={selected || false} compact={compact} />
        </View>
      )}
    </Pressable>
  );
}

// Section header for date grouping
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

// Calculate grid item size based on columns
function calculateItemSize(columns: number): number {
  // Account for margins on each item (2 on each side = 4 total per item)
  const itemMargin = 2;
  const totalMargins = itemMargin * 2 * columns;
  const totalPadding = GRID_PADDING * 2;
  const availableWidth = screen.width - totalMargins - totalPadding;
  return Math.floor(availableWidth / columns);
}

export default function PhotoGrid({
  photos,
  sections,
  columns = 4,
  onPress,
  onLongPress,
  selectionMode = false,
  selectedIds = new Set(),
  showFavorites = true,
}: Props) {
  const itemSize = calculateItemSize(columns);

  const renderItem = useCallback(
    ({ item }: { item: PhotoItem }) => (
      <PhotoGridItem
        item={item}
        onPress={() => onPress(item.id)}
        onLongPress={onLongPress ? () => onLongPress(item.id) : undefined}
        selectionMode={selectionMode}
        selected={selectedIds.has(item.id)}
        showFavorite={showFavorites}
        itemSize={itemSize}
      />
    ),
    [onPress, onLongPress, selectionMode, selectedIds, showFavorites, itemSize]
  );

  // Use SectionList if sections are provided
  if (sections && sections.length > 0) {
    return (
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <SectionHeader title={section.title} />
        )}
        contentContainerStyle={styles.container}
        stickySectionHeadersEnabled={false}
        // Render items in a row
        renderSectionFooter={() => <View style={{ height: scale(8) }} />}
      />
    );
  }

  // Use FlatList for flat photo list
  return (
    <FlatList
      data={photos}
      numColumns={columns}
      key={columns}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      initialNumToRender={24}
      windowSize={9}
      removeClippedSubviews
      contentContainerStyle={styles.container}
    />
  );
}

// Grid view for sections (renders photos in rows)
export function PhotoGridSection({
  photos,
  columns = 4,
  onPress,
  onLongPress,
  selectionMode = false,
  selectedIds = new Set(),
  showFavorites = true,
}: Omit<Props, "sections">) {
  const itemSize = calculateItemSize(columns);
  const isCompact = columns > 4;

  // Group photos into rows
  const rows: PhotoItem[][] = [];
  for (let i = 0; i < photos.length; i += columns) {
    rows.push(photos.slice(i, i + columns));
  }

  return (
    <View style={styles.gridSection}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item) => (
            <PhotoGridItem
              key={item.id}
              item={item}
              onPress={() => onPress(item.id)}
              onLongPress={onLongPress ? () => onLongPress(item.id) : undefined}
              selectionMode={selectionMode}
              selected={selectedIds.has(item.id)}
              showFavorite={showFavorites}
              itemSize={itemSize}
              compact={isCompact}
            />
          ))}
          {/* Fill empty spaces in last row */}
          {row.length < columns &&
            Array(columns - row.length)
              .fill(null)
              .map((_, i) => (
                <View
                  key={`empty-${i}`}
                  style={{ width: itemSize, height: itemSize, margin: 2 }}
                />
              ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: scale(24),
  },
  item: {
    margin: 2,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: ui.photoPlaceholder,
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  favoriteIcon: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: scale(10),
  },
  selectionOverlay: {
    position: "absolute",
  },
  selectionCircle: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderWidth: 1.5,
    borderColor: "rgba(150, 160, 180, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  selectionCircleSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  sectionHeader: {
    paddingHorizontal: scale(8),
    paddingTop: scale(12),
    paddingBottom: scale(6),
    backgroundColor: light.background,
  },
  sectionTitle: {
    fontSize: fontScale(16),
    fontWeight: "600",
    color: light.textPrimary,
  },
  gridSection: {
    paddingHorizontal: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
});
