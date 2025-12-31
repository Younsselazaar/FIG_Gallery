import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Tabs from "./Tabs";

import HomeScreen from "../screens/HomeScreen";
import ViewerScreen from "../screens/ViewerScreen";
import EditorScreen from "../screens/EditorScreen";
import AlbumsScreen from "../screens/AlbumsScreen";
import AlbumViewScreen from "../screens/AlbumViewScreen";
import TrashScreen from "../screens/TrashScreen";
import TagsScreen from "../screens/TagsScreen";
import LockedFolderScreen from "../screens/LockedFolderScreen";
import PinScreen from "../screens/PinScreen";

/**
 * AppNavigator.tsx
 * ----------------
 * Central navigation definition for FIG Gallery.
 *
 * Design rules:
 * - Matches Base44 screen flow
 * - Optimized for 3.5" FIG phones
 * - No gestures that assume large screens
 * - Stack + Tabs only
 */

export type RootStackParamList = {
  Tabs: undefined;
  Home: undefined;
  Viewer: { photoId: string };
  Editor: { photoId: string };
  Albums: undefined;
  AlbumView: { albumId: string };
  Trash: undefined;
  Tags: undefined;
  LockedFolder: undefined;
  Pin: { mode: "enter" | "set" };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      {/* Bottom tabs (Home / Albums / etc.) */}
      <Stack.Screen name="Tabs" component={Tabs} />

      {/* Standalone screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Viewer" component={ViewerScreen} />
      <Stack.Screen name="Editor" component={EditorScreen} />

      <Stack.Screen name="Albums" component={AlbumsScreen} />
      <Stack.Screen name="AlbumView" component={AlbumViewScreen} />

      <Stack.Screen name="Trash" component={TrashScreen} />
      <Stack.Screen name="Tags" component={TagsScreen} />
      <Stack.Screen name="LockedFolder" component={LockedFolderScreen} />
      <Stack.Screen name="Pin" component={PinScreen} />
    </Stack.Navigator>
  );
}
