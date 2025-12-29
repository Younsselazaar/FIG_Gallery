import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import BaseText from "../components/BaseText";
import BottomSheet from "../components/BottomSheet";

import Slider from "../editor/Slider";
import FilterStrip, { FilterItem } from "../editor/FilterStrip";
import CropOverlay from "../editor/CropOverlay";

import { getPhotoById } from "../db/photoRepository";
import { addEdit } from "../db/editRepository";

import { colors } from "../theme/colors";
import { spacing, editor, heights } from "../theme/tokens";

/**
 * EditorScreen.tsx
 * ----------------
 * FIG Gallery photo editor.
 *
 * GOALS:
 * - Match Base44 editor layout + flow
 * - Offline-only
 * - Deterministic controls
 * - 3.5" FIG phone optimized
 * - Keypad + touch friendly
 *
 * IMPORTANT:
 * - This screen DOES NOT perform image processing
 * - It records edit intent only
 */

type RouteParams = {
  photoId: string;
};

type TabKey = "adjust" | "filters" | "crop";

const FILTERS: FilterItem[] = [
  { key: "none", label: "None" },
  { key: "warm", label: "Warm" },
  { key: "cool", label: "Cool" },
  { key: "bw", label: "B&W" },
];

export default function EditorScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { photoId } = route.params as RouteParams;

  const [activeTab, setActiveTab] = useState<TabKey>("adjust");
  const [menuOpen, setMenuOpen] = useState(false);

  // Adjust values (Base44-style ranges)
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);

  const [activeFilter, setActiveFilter] = useState("none");

  useEffect(() => {
    loadPhoto();
  }, []);

  const loadPhoto = async () => {
    const photo = await getPhotoById(photoId);
    if (!photo) {
      navigation.goBack();
    }
  };

  const saveEdits = async () => {
    await addEdit({
      id: `${Date.now()}`,
      photoId,
      type: activeTab,
      payload: JSON.stringify({
        brightness,
        contrast,
        saturation,
        filter: activeFilter,
      }),
      createdAt: Date.now(),
    });

    navigation.goBack();
  };

  const renderAdjust = () => (
    <>
      <Slider
        label="Brightness"
        min={-50}
        max={50}
        step={5}
        value={brightness}
        onChange={setBrightness}
      />
      <Slider
        label="Contrast"
        min={-50}
        max={50}
        step={5}
        value={contrast}
        onChange={setContrast}
      />
      <Slider
        label="Saturation"
        min={-50}
        max={50}
        step={5}
        value={saturation}
        onChange={setSaturation}
      />
    </>
  );

  const renderFilters = () => (
    <FilterStrip
      filters={FILTERS}
      activeKey={activeFilter}
      onSelect={setActiveFilter}
    />
  );

  const renderCrop = () => <CropOverlay visible />;

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <BaseText variant="title">Edit</BaseText>
      </View>

      {/* Editor canvas placeholder */}
      <View style={styles.canvas}>
        {activeTab === "crop" && renderCrop()}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {activeTab === "adjust" && renderAdjust()}
        {activeTab === "filters" && renderFilters()}
      </View>

      {/* Bottom tabs */}
      <View style={styles.tabBar}>
        <BaseText
          variant="label"
          color={activeTab === "adjust" ? colors.primary : colors.textSecondary}
          onPress={() => setActiveTab("adjust")}
        >
          Adjust
        </BaseText>

        <BaseText
          variant="label"
          color={activeTab === "filters" ? colors.primary : colors.textSecondary}
          onPress={() => setActiveTab("filters")}
        >
          Filters
        </BaseText>

        <BaseText
          variant="label"
          color={activeTab === "crop" ? colors.primary : colors.textSecondary}
          onPress={() => setActiveTab("crop")}
        >
          Crop
        </BaseText>
      </View>

      {/* Save / Cancel */}
      <BottomSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        actions={[
          {
            key: "save",
            label: "Save",
            onPress: saveEdits,
          },
          {
            key: "cancel",
            label: "Cancel",
            destructive: true,
            onPress: () => navigation.goBack(),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    height: heights.header,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  canvas: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  tabBar: {
    height: editor.tabBarHeight,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
