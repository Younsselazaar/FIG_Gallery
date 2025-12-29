import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  PanResponder,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Svg, { Path, Circle } from "react-native-svg";
import {
  Brightness,
  Contrast,
  Saturate,
} from "react-native-color-matrix-image-filters";

import { getPhotoById } from "../db/photoRepository";
import { addEdit } from "../db/editRepository";

import { light, brand } from "../theme/colors";
import { scale, fontScale, verticalScale } from "../theme/responsive";

const SCREEN_WIDTH = Dimensions.get("window").width;

type RouteParams = {
  photoId: string;
};

type TabKey = "adjust" | "filter" | "tools" | "draw";

// Icons
function BackIcon({ size = 24, color = "#1A1A1A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={color} />
    </Svg>
  );
}

function UndoIcon({ size = 24, color = "#1A1A1A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" fill={color} />
    </Svg>
  );
}

function HistoryIcon({ size = 24, color = "#1A1A1A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" fill={color} />
    </Svg>
  );
}

function CopyIcon({ size = 24, color = "#1A1A1A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill={color} />
    </Svg>
  );
}

function SaveIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" fill={color} />
    </Svg>
  );
}

function MagicWandIcon({ size = 24, color = "#1A1A1A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29c-.39-.39-1.02-.39-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05c.39-.39.39-1.02 0-1.41l-2.33-2.35zm-1.03 5.49l-2.12-2.12 2.44-2.44 2.12 2.12-2.44 2.44z" fill={color} />
    </Svg>
  );
}

function EyeIcon({ size = 24, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill={color} />
    </Svg>
  );
}

// Slider icons
function ExposureIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 17H9v-2h6v2zm0-4H9v-2h6v2zm0-4H9V7h6v2zM3 21h18v-2H3v2zM3 3v2h18V3H3z" fill="#F59E0B" />
    </Svg>
  );
}

function BrightnessIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" fill="#F59E0B" />
    </Svg>
  );
}

function ContrastIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z" fill="#3B82F6" />
    </Svg>
  );
}

function HighlightsIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 2v11h3v9l7-12h-4l4-8z" fill="#F59E0B" />
    </Svg>
  );
}

function ShadowsIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" fill="#1A1A1A" />
    </Svg>
  );
}

function SaturationIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z" fill="#10B981" />
    </Svg>
  );
}

function TemperatureIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-8c0-.55.45-1 1-1s1 .45 1 1h-1v1h1v2h-1v1h1v2h-2V5z" fill="#1A1A1A" />
    </Svg>
  );
}

function SharpnessIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="3" stroke="#8B5CF6" strokeWidth="2" fill="none" />
      <Path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#8B5CF6" strokeWidth="2" />
    </Svg>
  );
}

// Custom center-based slider component
function CenterSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  const SLIDER_WIDTH = SCREEN_WIDTH - scale(100);
  const THUMB_SIZE = scale(22);
  const TRACK_HEIGHT = scale(4);

  const normalizedValue = (value + 100) / 200;
  const thumbPosition = normalizedValue * SLIDER_WIDTH;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const newValue = Math.round((x / SLIDER_WIDTH) * 200 - 100);
        onChange(Math.max(-100, Math.min(100, newValue)));
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const newValue = Math.round((x / SLIDER_WIDTH) * 200 - 100);
        onChange(Math.max(-100, Math.min(100, newValue)));
      },
    })
  ).current;

  const centerPosition = SLIDER_WIDTH / 2;

  return (
    <View style={[styles.sliderContainer, { width: SLIDER_WIDTH }]} {...panResponder.panHandlers}>
      <View style={[styles.sliderTrack, { backgroundColor: "#E5E7EB", height: TRACK_HEIGHT }]} />
      <View
        style={[
          styles.sliderTrackFilled,
          {
            left: 0,
            width: Math.min(thumbPosition, centerPosition),
            backgroundColor: "#1A1A1A",
            height: TRACK_HEIGHT,
          },
        ]}
      />
      <View
        style={[
          styles.sliderThumb,
          {
            left: thumbPosition - THUMB_SIZE / 2,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
          },
        ]}
      />
    </View>
  );
}

function AdjustSlider({
  icon,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderIcon}>{icon}</View>
      <CenterSlider value={value} onChange={onChange} />
      <Text style={styles.sliderValue}>{Math.round(value)}</Text>
    </View>
  );
}

export default function EditorScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { photoId } = route.params as RouteParams;

  const [photo, setPhoto] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("adjust");
  const [showOriginal, setShowOriginal] = useState(false);

  // Adjustments (range -100 to 100, default 0)
  const [exposure, setExposure] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [highlights, setHighlights] = useState(0);
  const [shadows, setShadows] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [sharpness, setSharpness] = useState(0);

  useEffect(() => {
    loadPhoto();
  }, []);

  const loadPhoto = async () => {
    const loadedPhoto = await getPhotoById(photoId);
    if (!loadedPhoto) {
      navigation.goBack();
      return;
    }
    setPhoto(loadedPhoto);
  };

  const handleSave = async () => {
    await addEdit({
      id: `${Date.now()}`,
      photoId,
      type: "adjust",
      payload: JSON.stringify({
        exposure, brightness, contrast, highlights, shadows, saturation, temperature, sharpness,
      }),
      createdAt: Date.now(),
    });
    navigation.goBack();
  };

  const handleUndo = () => {
    setExposure(0);
    setBrightness(0);
    setContrast(0);
    setHighlights(0);
    setShadows(0);
    setSaturation(0);
    setTemperature(0);
    setSharpness(0);
  };

  // Convert slider values to filter amounts
  // Brightness: -100 to 100 -> 0 to 2 (1 = normal)
  const brightnessAmount = 1 + brightness / 100;
  // Contrast: -100 to 100 -> 0 to 2 (1 = normal)
  const contrastAmount = 1 + contrast / 100;
  // Saturation: -100 to 100 -> 0 to 2 (1 = normal)
  const saturationAmount = 1 + saturation / 100;

  const renderAdjustPanel = () => (
    <ScrollView style={styles.adjustPanel} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>LIGHT</Text>
      <AdjustSlider icon={<ExposureIcon size={scale(18)} />} value={exposure} onChange={setExposure} />
      <AdjustSlider icon={<BrightnessIcon size={scale(18)} />} value={brightness} onChange={setBrightness} />
      <AdjustSlider icon={<ContrastIcon size={scale(18)} />} value={contrast} onChange={setContrast} />
      <AdjustSlider icon={<HighlightsIcon size={scale(18)} />} value={highlights} onChange={setHighlights} />
      <AdjustSlider icon={<ShadowsIcon size={scale(18)} />} value={shadows} onChange={setShadows} />

      <Text style={styles.sectionTitle}>COLOR</Text>
      <AdjustSlider icon={<SaturationIcon size={scale(18)} />} value={saturation} onChange={setSaturation} />
      <AdjustSlider icon={<TemperatureIcon size={scale(18)} />} value={temperature} onChange={setTemperature} />

      <Text style={styles.sectionTitle}>DETAIL</Text>
      <AdjustSlider icon={<SharpnessIcon size={scale(18)} />} value={sharpness} onChange={setSharpness} />

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  if (!photo) return null;

  // Render image with filters applied
  const renderFilteredImage = () => {
    const imageSource = { uri: photo.uri };
    const imageStyle = styles.image;

    // Apply filters in sequence - wrap Image as children
    return (
      <Brightness amount={brightnessAmount}>
        <Contrast amount={contrastAmount}>
          <Saturate amount={saturationAmount}>
            <Image source={imageSource} style={imageStyle} resizeMode="cover" />
          </Saturate>
        </Contrast>
      </Brightness>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={light.background} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <BackIcon size={scale(24)} color="#1A1A1A" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Pressable onPress={handleUndo} style={styles.headerButton}>
            <UndoIcon size={scale(22)} color="#6B7280" />
          </Pressable>
          <Pressable style={styles.headerButton}>
            <HistoryIcon size={scale(22)} color="#6B7280" />
          </Pressable>
          <Pressable style={styles.headerButton}>
            <CopyIcon size={scale(22)} color="#6B7280" />
          </Pressable>
        </View>

        <Pressable onPress={handleSave} style={styles.saveButton}>
          <SaveIcon size={scale(16)} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      {/* Image Preview with filters */}
      <View style={styles.imageContainer}>
        {showOriginal ? (
          <Image source={{ uri: photo.uri }} style={styles.image} resizeMode="cover" />
        ) : (
          renderFilteredImage()
        )}
        <Pressable
          style={styles.eyeButton}
          onPressIn={() => setShowOriginal(true)}
          onPressOut={() => setShowOriginal(false)}
        >
          <EyeIcon size={scale(20)} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <Pressable style={styles.tabButton}>
          <MagicWandIcon size={scale(20)} color="#6B7280" />
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeTab === "adjust" && styles.tabButtonActive]}
          onPress={() => setActiveTab("adjust")}
        >
          <Text style={[styles.tabText, activeTab === "adjust" && styles.tabTextActive]}>Adjust</Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeTab === "filter" && styles.tabButtonActive]}
          onPress={() => setActiveTab("filter")}
        >
          <Text style={[styles.tabText, activeTab === "filter" && styles.tabTextActive]}>Filter</Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeTab === "tools" && styles.tabButtonActive]}
          onPress={() => setActiveTab("tools")}
        >
          <Text style={[styles.tabText, activeTab === "tools" && styles.tabTextActive]}>Tools</Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeTab === "draw" && styles.tabButtonActive]}
          onPress={() => setActiveTab("draw")}
        >
          <Text style={[styles.tabText, activeTab === "draw" && styles.tabTextActive]}>Draw</Text>
        </Pressable>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {activeTab === "adjust" && renderAdjustPanel()}
        {activeTab === "filter" && (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>Filters coming soon</Text>
          </View>
        )}
        {activeTab === "tools" && (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>Tools coming soon</Text>
          </View>
        )}
        {activeTab === "draw" && (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>Draw coming soon</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(8),
    paddingVertical: scale(8),
    paddingTop: verticalScale(40),
  },
  headerButton: {
    padding: scale(8),
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: brand.teal,
    paddingVertical: scale(8),
    paddingHorizontal: scale(14),
    borderRadius: scale(6),
    gap: scale(6),
  },
  saveButtonText: {
    fontSize: fontScale(14),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  imageContainer: {
    marginHorizontal: scale(12),
    marginVertical: scale(8),
    borderRadius: scale(12),
    overflow: "hidden",
    backgroundColor: "#000",
    aspectRatio: 4 / 3,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  eyeButton: {
    position: "absolute",
    bottom: scale(10),
    right: scale(10),
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabButton: {
    paddingVertical: scale(6),
    paddingHorizontal: scale(10),
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#1A1A1A",
  },
  tabText: {
    fontSize: fontScale(14),
    fontWeight: "500",
    color: "#9CA3AF",
  },
  tabTextActive: {
    color: "#1A1A1A",
    fontWeight: "600",
  },
  controlsContainer: {
    flex: 1,
  },
  adjustPanel: {
    flex: 1,
    paddingHorizontal: scale(16),
  },
  sectionTitle: {
    fontSize: fontScale(11),
    fontWeight: "600",
    color: "#6B7280",
    marginTop: scale(16),
    marginBottom: scale(12),
    letterSpacing: 0.5,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(12),
    height: scale(32),
  },
  sliderIcon: {
    width: scale(28),
    alignItems: "center",
  },
  sliderContainer: {
    height: scale(32),
    justifyContent: "center",
    position: "relative",
  },
  sliderTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    borderRadius: scale(2),
  },
  sliderTrackFilled: {
    position: "absolute",
    borderRadius: scale(2),
  },
  sliderThumb: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  sliderValue: {
    width: scale(32),
    fontSize: fontScale(13),
    color: "#9CA3AF",
    textAlign: "right",
  },
  bottomPadding: {
    height: scale(100),
  },
  comingSoon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  comingSoonText: {
    fontSize: fontScale(16),
    color: "#9CA3AF",
  },
});
