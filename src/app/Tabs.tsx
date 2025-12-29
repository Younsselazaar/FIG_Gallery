import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";

import HomeScreen from "../screens/HomeScreen";
import AlbumsScreen from "../screens/AlbumsScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import SearchScreen from "../screens/SearchScreen";
import CloudScreen from "../screens/CloudScreen";

import { light, brand, ui } from "../theme/colors";
import { scale, fontScale } from "../theme/responsive";

const Tab = createBottomTabNavigator();

// Fixed tab bar height - minimum 60dp for usability on all screens
const TAB_BAR_HEIGHT = Math.max(60, scale(56));

function HomeIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3L21 9.5V20C21 20.5 20.5 21 20 21H4C3.5 21 3 20.5 3 20V9.5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color === ui.tabActive ? color : "none"}
      />
    </Svg>
  );
}

function AlbumsIcon({ color, size }: { color: string; size: number }) {
  const filled = color === ui.tabActive;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" fill={filled ? color : "none"} />
      <Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" fill={filled ? color : "none"} />
      <Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" fill={filled ? color : "none"} />
      <Rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" fill={filled ? color : "none"} />
    </Svg>
  );
}

function FavoritesIcon({ color, size }: { color: string; size: number }) {
  const filled = color === ui.tabActive;
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

function SearchIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
      <Path d="M16 16L21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function CloudIcon({ color, size }: { color: string; size: number }) {
  const filled = color === ui.tabActive;
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

// Minimum icon size of 22dp for visibility on small screens
const iconSize = Math.max(22, scale(24));

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: light.background,
          borderTopColor: light.border,
          borderTopWidth: 1,
          height: TAB_BAR_HEIGHT,
          paddingTop: scale(6),
          paddingBottom: scale(6),
        },
        tabBarLabelStyle: {
          fontSize: Math.max(10, fontScale(11)),
          marginTop: 2,
        },
        tabBarActiveTintColor: ui.tabActive,
        tabBarInactiveTintColor: ui.tabInactive,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => <HomeIcon color={color} size={iconSize} />,
        }}
      />

      <Tab.Screen
        name="AlbumsTab"
        component={AlbumsScreen}
        options={{
          tabBarLabel: "Albums",
          tabBarIcon: ({ color }) => <AlbumsIcon color={color} size={iconSize} />,
        }}
      />

      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesScreen}
        options={{
          tabBarLabel: "Favorites",
          tabBarIcon: ({ color }) => <FavoritesIcon color={color} size={iconSize} />,
        }}
      />

      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          tabBarLabel: "Search",
          tabBarIcon: ({ color }) => <SearchIcon color={color} size={iconSize} />,
        }}
      />

      <Tab.Screen
        name="CloudTab"
        component={CloudScreen}
        options={{
          tabBarLabel: "Cloud",
          tabBarIcon: ({ color }) => <CloudIcon color={color} size={iconSize} />,
        }}
      />
    </Tab.Navigator>
  );
}
