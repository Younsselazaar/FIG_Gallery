import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./app/AppNavigator";
import { KeypadProvider } from "./keypad/KeypadContext";
import { initDatabase } from "./db/database";
import { scanDevicePhotos } from "./services/mediaScanner";
import { brand } from "./theme/colors";

/**
 * App.tsx
 * -------
 * Root React component for FIG Gallery
 */

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize database first
        setStatus("Setting up database...");
        await initDatabase();

        // Then scan device photos
        setStatus("Scanning photos...");
        const count = await scanDevicePhotos();
        setStatus(`Found ${count} photos`);

        // Small delay to show count
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsReady(true);
      } catch (error) {
        console.error("Init error:", error);
        setStatus("Error loading app");
        // Still proceed even with errors
        setIsReady(true);
      }
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={brand.teal} />
        <Text style={styles.loadingText}>{status}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <KeypadProvider>
        <NavigationContainer theme={DarkTheme}>
          <AppNavigator />
        </NavigationContainer>
      </KeypadProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    gap: 16,
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 12,
  },
});
