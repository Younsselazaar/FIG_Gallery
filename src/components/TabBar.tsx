import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { brand, light, ui } from "../theme/colors";
import { spacing, heights } from "../theme/tokens";
import { scale, fontScale } from "../theme/responsive";

/**
 * TabBar.tsx
 * ----------
 * Bottom navigation tab bar matching design specs.
 * Tabs: Home, Albums, Favorites, Search, Cloud
 */

type TabName = "home" | "albums" | "favorites" | "search" | "cloud";

type Props = {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
};

type IconProps = {
  size: number;
  color: string;
  filled?: boolean;
};

// Home icon
function HomeIcon({ size, color, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {filled ? (
        <Path
          d="M3 9.5L12 3L21 9.5V20C21 20.5 20.5 21 20 21H4C3.5 21 3 20.5 3 20V9.5Z"
          fill={color}
        />
      ) : (
        <Path
          d="M3 9.5L12 3L21 9.5V20C21 20.5 20.5 21 20 21H4C3.5 21 3 20.5 3 20V9.5Z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}

// Albums/Grid icon
function AlbumsIcon({ size, color, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" fill={filled ? color : "none"} />
      <Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" fill={filled ? color : "none"} />
      <Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" fill={filled ? color : "none"} />
      <Rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" fill={filled ? color : "none"} />
    </Svg>
  );
}

// Favorites/Heart icon
function FavoritesIcon({ size, color, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth="2"
      />
    </Svg>
  );
}

// Search icon
function SearchIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
      <Path d="M16 16L21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// Cloud icon
function CloudIcon({ size, color, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 10H17.74C17.36 7.68 15.36 6 13 6C11.28 6 9.77 6.89 9 8.22C6.79 8.57 5 10.56 5 13C5 15.76 7.24 18 10 18H18C20.21 18 22 16.21 22 14C22 11.79 20.21 10 18 10Z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const tabs: { key: TabName; label: string; Icon: React.FC<IconProps> }[] = [
  { key: "home", label: "Home", Icon: HomeIcon },
  { key: "albums", label: "Albums", Icon: AlbumsIcon },
  { key: "favorites", label: "Favorites", Icon: FavoritesIcon },
  { key: "search", label: "Search", Icon: SearchIcon },
  { key: "cloud", label: "Cloud", Icon: CloudIcon },
];

export default function TabBar({ activeTab, onTabPress }: Props) {
  return (
    <View style={styles.container}>
      {tabs.map(({ key, label, Icon }) => {
        const isActive = activeTab === key;
        const color = isActive ? ui.tabActive : ui.tabInactive;

        return (
          <Pressable
            key={key}
            onPress={() => onTabPress(key)}
            style={styles.tab}
          >
            <Icon size={scale(26)} color={color} filled={isActive} />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: light.background,
    borderTopWidth: 1,
    borderTopColor: light.border,
    paddingBottom: scale(8),
    paddingTop: scale(10),
    minHeight: scale(60),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: scale(4),
  },
  label: {
    fontSize: fontScale(12),
    color: ui.tabInactive,
    marginTop: scale(4),
  },
  labelActive: {
    color: ui.tabActive,
    fontWeight: "500",
  },
});
