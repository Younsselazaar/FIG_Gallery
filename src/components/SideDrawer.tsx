import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path, Circle, Rect } from "react-native-svg";

import { brand, light } from "../theme/colors";
import { scale, fontScale } from "../theme/responsive";

const SCREEN_WIDTH = Dimensions.get("window").width;

type Props = {
  visible: boolean;
  onClose: () => void;
  currentScreen?: string;
  navigation?: any;
};

// Icons matching the screenshot style
function HomeIcon({ size = 24, color = light.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 22V12h6v10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function AlbumsIcon({ size = 24, color = light.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

function FavoritesIcon({ size = 24, color = light.textPrimary }: { size?: number; color?: string }) {
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

function SearchIcon({ size = 24, color = light.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
      <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function CloudIcon({ size = 24, color = light.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TagsIcon({ size = 24, color = light.textPrimary }: { size?: number; color?: string }) {
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

function TrashIcon({ size = 24, color = light.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path
        d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function SettingsIcon({ size = 24, color = light.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
      <Path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
        stroke={color}
        strokeWidth="2"
      />
    </Svg>
  );
}

function FigLogo({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx="24" cy="24" r="22" fill={brand.teal} />
      <Circle cx="24" cy="24" r="6" fill="white" />
      <Circle cx="24" cy="12" r="3" fill="white" />
      <Circle cx="32.5" cy="15.5" r="3" fill="white" />
      <Circle cx="36" cy="24" r="3" fill="white" />
      <Circle cx="32.5" cy="32.5" r="3" fill="white" />
      <Circle cx="24" cy="36" r="3" fill="white" />
      <Circle cx="15.5" cy="32.5" r="3" fill="white" />
      <Circle cx="12" cy="24" r="3" fill="white" />
      <Circle cx="15.5" cy="15.5" r="3" fill="white" />
    </Svg>
  );
}

function MenuIcon({ size = 24, color = light.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 6h18M3 12h18M3 18h18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

type MenuItem = {
  id: string;
  label: string;
  icon: (color: string) => React.ReactNode;
  screen?: string;
};

export default function SideDrawer({ visible, onClose, currentScreen = "Home", navigation: navProp }: Props) {
  const navHook = useNavigation<any>();
  const navigation = navProp || navHook;

  const menuItems: MenuItem[] = [
    { id: "home", label: "Home", icon: (c) => <HomeIcon size={scale(22)} color={c} />, screen: "Home" },
    { id: "albums", label: "Albums", icon: (c) => <AlbumsIcon size={scale(22)} color={c} />, screen: "Albums" },
    { id: "favorites", label: "Favorites", icon: (c) => <FavoritesIcon size={scale(22)} color={c} />, screen: "Favorites" },
    { id: "search", label: "Search", icon: (c) => <SearchIcon size={scale(22)} color={c} />, screen: "Search" },
    { id: "cloud", label: "Cloud", icon: (c) => <CloudIcon size={scale(22)} color={c} />, screen: "Cloud" },
    { id: "tags", label: "Tags", icon: (c) => <TagsIcon size={scale(22)} color={c} />, screen: "Tags" },
    { id: "trash", label: "Trash", icon: (c) => <TrashIcon size={scale(22)} color={c} />, screen: "Trash" },
    { id: "settings", label: "Settings", icon: (c) => <SettingsIcon size={scale(22)} color={c} />, screen: "Settings" },
  ];

  const handleMenuPress = (item: MenuItem) => {
    console.log("Menu pressed:", item.screen);

    // Close menu first
    onClose();

    // Navigate to the selected screen
    if (item.screen) {
      const tabScreenMap: { [key: string]: string } = {
        "Home": "HomeTab",
        "Albums": "AlbumsTab",
        "Favorites": "FavoritesTab",
        "Search": "SearchTab",
        "Cloud": "CloudTab",
      };

      const tabScreen = tabScreenMap[item.screen];
      console.log("Navigating to:", tabScreen || item.screen);

      if (tabScreen) {
        // Navigate directly to tab screen
        navigation.navigate(tabScreen);
      } else {
        // For non-tab screens like Trash, Settings
        navigation.navigate(item.screen);
      }
    }
  };

  const isActive = (item: MenuItem) => {
    return item.screen === currentScreen;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Dropdown Menu Container */}
        <View style={styles.menuContainer}>
          {/* Header */}
          <View style={styles.menuHeader}>
            <View style={styles.logoContainer}>
              <FigLogo size={scale(32)} />
              <Text style={styles.logoText}>FIG Gallery</Text>
            </View>
            <Pressable onPress={onClose} style={styles.menuButton}>
              <MenuIcon size={scale(22)} color="#374151" />
            </Pressable>
          </View>

          {/* Menu Items */}
          <View style={styles.menuList}>
            {menuItems.map((item) => {
              const active = isActive(item);
              const iconColor = active ? brand.teal : "#6B7280";
              const textColor = active ? brand.teal : "#1F2937";

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    active && styles.menuItemActive,
                  ]}
                  onPress={() => handleMenuPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemIcon}>
                    {item.icon(iconColor)}
                  </View>
                  <Text style={[styles.menuItemText, { color: textColor }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        {/* Backdrop to close menu when tapping outside */}
        <Pressable style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  backdrop: {
    flex: 1,
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: scale(16),
    borderBottomRightRadius: scale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingBottom: scale(12),
    zIndex: 10,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  logoText: {
    fontSize: fontScale(18),
    fontWeight: "600",
    color: brand.teal,
  },
  menuButton: {
    padding: scale(6),
  },
  menuList: {
    paddingTop: scale(6),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(12),
    paddingHorizontal: scale(20),
    marginHorizontal: scale(10),
    marginVertical: scale(2),
    borderRadius: scale(10),
  },
  menuItemActive: {
    backgroundColor: "rgba(0, 175, 185, 0.08)",
  },
  menuItemIcon: {
    width: scale(28),
    alignItems: "center",
  },
  menuItemText: {
    fontSize: fontScale(16),
    fontWeight: "500",
    marginLeft: scale(14),
  },
});
