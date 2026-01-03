import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Dimensions,
  PanResponder,
  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Svg, { Path, Circle, Rect, Line, G } from "react-native-svg";
import {
  Brightness,
  Contrast,
  Saturate,
  ColorMatrix,
} from "react-native-color-matrix-image-filters";
import { captureRef } from "react-native-view-shot";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";

import { getPhotoById, insertPhoto } from "../db/photoRepository";
import { addEdit } from "../db/editRepository";
import { scale, fontScale, verticalScale } from "../theme/responsive";
import { useKeypad } from "../keypad/KeypadContext";
import { KeyCodes } from "../keypad/keyCodes";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const isSmallScreen = SCREEN_HEIGHT < 700;

type RouteParams = {
  photoId: string;
};

type TabKey = "adjust" | "filter" | "tools" | "draw";
type FocusArea = "none" | "header" | "tabs" | "categories" | "filters";
type FocusElement = "none" | "back" | "undo" | "reset" | "copy" | "save" | "tab_adjust" | "tab_filter" | "tab_tools" | "tab_draw";

// ============ ICONS ============

function BackIcon({ size = 24, color = "#1F2937" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={color} />
    </Svg>
  );
}

function UndoIcon({ size = 24, color = "#6B7280" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" fill={color} />
    </Svg>
  );
}

function HistoryIcon({ size = 24, color = "#6B7280" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" fill={color} />
    </Svg>
  );
}

function CopyIcon({ size = 24, color = "#6B7280" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill={color} />
    </Svg>
  );
}

function SaveIcon({ size = 18, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" fill={color} />
    </Svg>
  );
}

function MagicWandIcon({ size = 22, color = "#6B7280" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29c-.39-.39-1.02-.39-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05c.39-.39.39-1.02 0-1.41l-2.33-2.35zm-1.03 5.49l-2.12-2.12 2.44-2.44 2.12 2.12-2.44 2.44z" fill={color} />
    </Svg>
  );
}

function EyeIcon({ size = 22, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill={color} />
    </Svg>
  );
}

// Slider Icons - matching the design exactly
function ExposureIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="4" fill="#F97316" />
      <Line x1="12" y1="2" x2="12" y2="6" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
      <Line x1="12" y1="18" x2="12" y2="22" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
      <Line x1="2" y1="12" x2="6" y2="12" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
      <Line x1="18" y1="12" x2="22" y2="12" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function BrightnessIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="4" fill="#FBBF24" />
      <Line x1="12" y1="2" x2="12" y2="5" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
      <Line x1="12" y1="19" x2="12" y2="22" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
      <Line x1="2" y1="12" x2="5" y2="12" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
      <Line x1="19" y1="12" x2="22" y2="12" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
      <Line x1="4.93" y1="4.93" x2="7.05" y2="7.05" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
      <Line x1="16.95" y1="16.95" x2="19.07" y2="19.07" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
      <Line x1="4.93" y1="19.07" x2="7.05" y2="16.95" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
      <Line x1="16.95" y1="7.05" x2="19.07" y2="4.93" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function ContrastIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="9" fill="none" stroke="#3B82F6" strokeWidth="2" />
      <Path d="M12 3v18c4.97 0 9-4.03 9-9s-4.03-9-9-9z" fill="#3B82F6" />
    </Svg>
  );
}

function HighlightsIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 2v11h3v9l7-12h-4l4-8z" fill="#FBBF24" />
    </Svg>
  );
}

function ShadowsIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7v14z" fill="#374151" />
    </Svg>
  );
}

function SaturationIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" fill="#14B8A6" />
    </Svg>
  );
}

function TemperatureIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-8c0-.55.45-1 1-1s1 .45 1 1v8h-2V5z" fill="#1F2937" />
    </Svg>
  );
}

function SharpnessIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="2" fill="#8B5CF6" />
      <Circle cx="12" cy="12" r="5" fill="none" stroke="#8B5CF6" strokeWidth="1.5" />
      <Circle cx="12" cy="12" r="9" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="3 3" />
    </Svg>
  );
}

function RotateIcon({ size = 22, color = "#1F2937" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z" fill={color} />
    </Svg>
  );
}

function ResetIcon({ size = 22, color = "#1F2937" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" fill={color} />
    </Svg>
  );
}

function PenIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill={color} />
    </Svg>
  );
}

function HighlightIcon({ size = 20, color = "#1F2937" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 14l3 3v5h6v-5l3-3V9H6v5zm5-12h2v3h-2V2zM3.5 5.875L4.914 4.46l2.12 2.122L5.622 7.997 3.5 5.875zm13.46.71l2.123-2.12 1.414 1.414L18.375 8 16.96 6.586z" fill={color} />
    </Svg>
  );
}

// ============ CUSTOM THICK SLIDER ============

interface ThickSliderProps {
  icon: React.ReactNode;
  value: number;
  onChange: (val: number) => void;
  onStart?: () => void;
}

function ThickSlider({ icon, value, onChange, onStart }: ThickSliderProps) {
  const sliderWidth = SCREEN_WIDTH - scale(isSmallScreen ? 80 : 100); // Account for icon and value
  const thumbSize = isSmallScreen ? scale(14) : scale(18);
  const trackHeight = isSmallScreen ? scale(4) : scale(5);
  const containerHeight = isSmallScreen ? verticalScale(24) : verticalScale(28);

  // Convert value (-100 to 100) to position (0 to sliderWidth)
  const valueToPosition = (val: number) => ((val + 100) / 200) * sliderWidth;
  const positionToValue = (pos: number) => Math.round((pos / sliderWidth) * 200 - 100);

  const thumbPosition = valueToPosition(value);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      if (onStart) onStart(); // Save history BEFORE change
      const touchX = evt.nativeEvent.locationX;
      const newValue = positionToValue(Math.max(0, Math.min(sliderWidth, touchX)));
      onChange(newValue);
    },
    onPanResponderMove: (evt) => {
      const touchX = evt.nativeEvent.locationX;
      const newValue = positionToValue(Math.max(0, Math.min(sliderWidth, touchX)));
      onChange(newValue);
    },
  }), [sliderWidth, onChange, onStart]);

  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderIcon}>{icon}</View>
      <View style={styles.sliderTrackContainer} {...panResponder.panHandlers}>
        {/* Background track (gray) */}
        <View style={[styles.sliderTrack, { backgroundColor: '#E5E7EB', height: trackHeight }]} />
        {/* Filled track (dark) */}
        <View
          style={[
            styles.sliderTrackFilled,
            {
              backgroundColor: '#1F2937',
              height: trackHeight,
              width: thumbPosition,
            }
          ]}
        />
        {/* Thumb */}
        <View
          style={[
            styles.sliderThumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              left: thumbPosition - thumbSize / 2,
              top: (containerHeight - thumbSize) / 2,
            }
          ]}
        />
      </View>
      <Text style={styles.sliderValue}>{value}</Text>
    </View>
  );
}

// ============ MAIN COMPONENT ============

export default function EditorScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { photoId } = route.params as RouteParams;

  const imageContainerRef = useRef<View>(null);
  const [photo, setPhoto] = useState<any>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("adjust");
  const [showOriginal, setShowOriginal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState("Basic");
  const [selectedFilter, setSelectedFilter] = useState("Original");

  // Tools state
  const [rotation, setRotation] = useState(0);

  // Draw state
  const [drawTool, setDrawTool] = useState<"pen" | "highlight">("pen");
  const [drawColor, setDrawColor] = useState("#FF0000");
  const [paths, setPaths] = useState<Array<{ path: string; color: string; strokeWidth: number; opacity: number }>>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [isDrawing, setIsDrawing] = useState(false);

  // D-pad focus state
  const [focusedElement, setFocusedElement] = useState<FocusElement>("none");
  const [focusArea, setFocusArea] = useState<FocusArea>("none");
  const [focusedCategoryIndex, setFocusedCategoryIndex] = useState(0);
  const [focusedFilterIndex, setFocusedFilterIndex] = useState(0);
  const { registerHandler, unregisterHandler } = useKeypad();
  const lastKeyTime = useRef(0);

  // Adjustments (range -100 to 100, default 0)
  const [exposure, setExposure] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [highlights, setHighlights] = useState(0);
  const [shadows, setShadows] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [sharpness, setSharpness] = useState(0);

  // Undo history
  type EditorState = {
    exposure: number;
    brightness: number;
    contrast: number;
    highlights: number;
    shadows: number;
    saturation: number;
    temperature: number;
    sharpness: number;
    selectedFilter: string;
    rotation: number;
    paths: Array<{ path: string; color: string; strokeWidth: number; opacity: number }>;
  };
  const [undoHistory, setUndoHistory] = useState<EditorState[]>([]);
  const lastSavedState = useRef<EditorState | null>(null);

  // Save current state to history (called when user finishes an edit action)
  const saveToHistory = useCallback(() => {
    const currentState: EditorState = {
      exposure, brightness, contrast, highlights, shadows,
      saturation, temperature, sharpness, selectedFilter, rotation, paths
    };

    // Only save if state actually changed
    if (lastSavedState.current &&
        JSON.stringify(currentState) === JSON.stringify(lastSavedState.current)) {
      return;
    }

    setUndoHistory(prev => [...prev, currentState]);
    lastSavedState.current = currentState;
  }, [exposure, brightness, contrast, highlights, shadows, saturation, temperature, sharpness, selectedFilter, rotation, paths]);

  // Undo last action
  const handleUndo = useCallback(() => {
    if (undoHistory.length === 0) return;

    const prevState = undoHistory[undoHistory.length - 1];
    setUndoHistory(prev => prev.slice(0, -1));

    // Restore previous state
    setExposure(prevState.exposure);
    setBrightness(prevState.brightness);
    setContrast(prevState.contrast);
    setHighlights(prevState.highlights);
    setShadows(prevState.shadows);
    setSaturation(prevState.saturation);
    setTemperature(prevState.temperature);
    setSharpness(prevState.sharpness);
    setSelectedFilter(prevState.selectedFilter);
    setRotation(prevState.rotation);
    setPaths(prevState.paths);

    lastSavedState.current = prevState;
  }, [undoHistory]);

  // D-pad navigation handler
  const tabOrder: FocusElement[] = ["tab_adjust", "tab_filter", "tab_tools", "tab_draw"];
  const filterCategories = ["Basic", "Vintage", "Mood", "Color", "Portrait", "Art"];
  const filters: Record<string, string[]> = {
    Basic: ["Original", "Vivid", "B&W", "Warm", "Cool"],
    Vintage: ["Sepia", "Retro", "Film", "Fade", "Grain"],
    Mood: ["Drama", "Noir", "Cinematic", "Muted", "Pop"],
    Color: ["Teal", "Orange", "Pink", "Blue", "Green"],
    Portrait: ["Soft", "Glow", "Sharp", "Smooth", "Natural"],
    Art: ["Sketch", "Paint", "Poster", "Comic", "Neon"],
  };
  const filtersPerRow = isSmallScreen ? 5 : 4;

  const handleKeyDown = useCallback((keyCode: number): boolean => {
    // Debounce: ignore events within 100ms
    const now = Date.now();
    if (now - lastKeyTime.current < 100) {
      return true;
    }
    lastKeyTime.current = now;

    // Start focus on first D-pad press
    if (focusArea === "none") {
      if (keyCode === KeyCodes.DPAD_LEFT || keyCode === KeyCodes.DPAD_RIGHT ||
          keyCode === KeyCodes.DPAD_UP || keyCode === KeyCodes.DPAD_DOWN ||
          keyCode === KeyCodes.DPAD_CENTER || keyCode === KeyCodes.ENTER) {
        setFocusArea("tabs");
        setFocusedElement(`tab_${activeTab}` as FocusElement);
        return true;
      }
    }

    // Handle navigation based on focus area
    if (focusArea === "tabs") {
      switch (keyCode) {
        case KeyCodes.DPAD_LEFT:
          if (focusedElement === "save") {
            setFocusedElement("back");
          } else if (focusedElement.startsWith("tab_")) {
            const currentIdx = tabOrder.indexOf(focusedElement);
            if (currentIdx > 0) {
              setFocusedElement(tabOrder[currentIdx - 1]);
            }
          }
          return true;

        case KeyCodes.DPAD_RIGHT:
          if (focusedElement === "back") {
            setFocusedElement("save");
          } else if (focusedElement.startsWith("tab_")) {
            const currentIdx = tabOrder.indexOf(focusedElement);
            if (currentIdx < tabOrder.length - 1) {
              setFocusedElement(tabOrder[currentIdx + 1]);
            }
          }
          return true;

        case KeyCodes.DPAD_UP:
          if (focusedElement.startsWith("tab_")) {
            setFocusArea("header");
            setFocusedElement("back");
          }
          return true;

        case KeyCodes.DPAD_DOWN:
          if (focusedElement === "back" || focusedElement === "save") {
            setFocusedElement(`tab_${activeTab}` as FocusElement);
          } else if (focusedElement.startsWith("tab_") && activeTab === "filter") {
            // Move to categories when on filter tab
            setFocusArea("categories");
            setFocusedCategoryIndex(filterCategories.indexOf(selectedCategory));
          }
          return true;

        case KeyCodes.DPAD_CENTER:
        case KeyCodes.ENTER:
        case KeyCodes.NUMPAD_ENTER:
          if (focusedElement === "back") {
            navigation.goBack();
          } else if (focusedElement === "save") {
            handleSave();
          } else if (focusedElement === "tab_adjust") {
            setActiveTab("adjust");
          } else if (focusedElement === "tab_filter") {
            setActiveTab("filter");
          } else if (focusedElement === "tab_tools") {
            setActiveTab("tools");
          } else if (focusedElement === "tab_draw") {
            setActiveTab("draw");
          }
          return true;
      }
    } else if (focusArea === "header") {
      const headerOrder: FocusElement[] = ["back", "undo", "reset", "copy", "save"];
      const currentHeaderIdx = headerOrder.indexOf(focusedElement);

      switch (keyCode) {
        case KeyCodes.DPAD_LEFT:
          if (currentHeaderIdx > 0) {
            setFocusedElement(headerOrder[currentHeaderIdx - 1]);
          }
          return true;

        case KeyCodes.DPAD_RIGHT:
          if (currentHeaderIdx < headerOrder.length - 1) {
            setFocusedElement(headerOrder[currentHeaderIdx + 1]);
          }
          return true;

        case KeyCodes.DPAD_DOWN:
          setFocusArea("tabs");
          setFocusedElement(`tab_${activeTab}` as FocusElement);
          return true;

        case KeyCodes.DPAD_CENTER:
        case KeyCodes.ENTER:
        case KeyCodes.NUMPAD_ENTER:
          if (focusedElement === "back") {
            navigation.goBack();
          } else if (focusedElement === "undo") {
            handleUndo();
          } else if (focusedElement === "reset") {
            handleReset();
          } else if (focusedElement === "save") {
            handleSave();
          }
          return true;
      }
    } else if (focusArea === "categories") {
      const categoryCount = filterCategories.length;
      switch (keyCode) {
        case KeyCodes.DPAD_LEFT:
          if (focusedCategoryIndex > 0) {
            setFocusedCategoryIndex(focusedCategoryIndex - 1);
          }
          return true;

        case KeyCodes.DPAD_RIGHT:
          if (focusedCategoryIndex < categoryCount - 1) {
            setFocusedCategoryIndex(focusedCategoryIndex + 1);
          }
          return true;

        case KeyCodes.DPAD_UP:
          setFocusArea("tabs");
          setFocusedElement("tab_filter");
          return true;

        case KeyCodes.DPAD_DOWN:
          setFocusArea("filters");
          setFocusedFilterIndex(0);
          return true;

        case KeyCodes.DPAD_CENTER:
        case KeyCodes.ENTER:
        case KeyCodes.NUMPAD_ENTER:
          // Select the focused category
          setSelectedCategory(filterCategories[focusedCategoryIndex]);
          setFocusedFilterIndex(0);
          return true;
      }
    } else if (focusArea === "filters") {
      const currentFilters = filters[selectedCategory] || [];
      const filterCount = currentFilters.length;
      const currentRow = Math.floor(focusedFilterIndex / filtersPerRow);
      const currentCol = focusedFilterIndex % filtersPerRow;
      const totalRows = Math.ceil(filterCount / filtersPerRow);

      switch (keyCode) {
        case KeyCodes.DPAD_LEFT:
          if (currentCol > 0) {
            setFocusedFilterIndex(focusedFilterIndex - 1);
          }
          return true;

        case KeyCodes.DPAD_RIGHT:
          if (focusedFilterIndex < filterCount - 1 && currentCol < filtersPerRow - 1) {
            setFocusedFilterIndex(focusedFilterIndex + 1);
          }
          return true;

        case KeyCodes.DPAD_UP:
          if (currentRow > 0) {
            const newIndex = (currentRow - 1) * filtersPerRow + currentCol;
            setFocusedFilterIndex(Math.min(newIndex, filterCount - 1));
          } else {
            // Move back to categories
            setFocusArea("categories");
          }
          return true;

        case KeyCodes.DPAD_DOWN:
          if (currentRow < totalRows - 1) {
            const newIndex = (currentRow + 1) * filtersPerRow + currentCol;
            setFocusedFilterIndex(Math.min(newIndex, filterCount - 1));
          }
          return true;

        case KeyCodes.DPAD_CENTER:
        case KeyCodes.ENTER:
        case KeyCodes.NUMPAD_ENTER:
          // Select the focused filter
          saveToHistory();
          setSelectedFilter(currentFilters[focusedFilterIndex]);
          return true;
      }
    }

    // Handle BACK key globally
    if (keyCode === KeyCodes.BACK) {
      if (focusArea === "filters") {
        setFocusArea("categories");
      } else if (focusArea === "categories") {
        setFocusArea("tabs");
        setFocusedElement("tab_filter");
      } else {
        navigation.goBack();
      }
      return true;
    }

    return false;
  }, [focusArea, focusedElement, focusedCategoryIndex, focusedFilterIndex, activeTab, selectedCategory, navigation, saveToHistory]);

  // Register keypad handler with delay to prevent lingering events from previous screen
  useEffect(() => {
    const timer = setTimeout(() => {
      registerHandler(handleKeyDown);
    }, 200);
    return () => {
      clearTimeout(timer);
      unregisterHandler(handleKeyDown);
    };
  }, [handleKeyDown, registerHandler, unregisterHandler]);

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

    // Get original image dimensions
    Image.getSize(
      loadedPhoto.uri,
      (width, height) => {
        setImageSize({ width, height });
      },
      (error) => {
        console.error("Error getting image size:", error);
        // Fallback to 4:3 aspect ratio
        setImageSize({ width: 4, height: 3 });
      }
    );
  };

  const requestSavePermission = async (): Promise<boolean> => {
    if (Platform.OS !== "android") return true;

    const androidVersion = Platform.Version;

    // Android 13+ (API 33+) uses different permissions
    if (androidVersion >= 33) {
      const permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
      const hasPermission = await PermissionsAndroid.check(permission);
      if (hasPermission) return true;

      const status = await PermissionsAndroid.request(permission, {
        title: "Photo Access Required",
        message: "FIG Gallery needs access to save edited photos to your gallery.",
        buttonPositive: "Allow",
        buttonNegative: "Deny",
      });
      return status === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      // Android 12 and below
      const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
      const hasPermission = await PermissionsAndroid.check(permission);
      if (hasPermission) return true;

      const status = await PermissionsAndroid.request(permission, {
        title: "Storage Permission Required",
        message: "FIG Gallery needs storage access to save edited photos.",
        buttonPositive: "Allow",
        buttonNegative: "Deny",
      });
      return status === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      // Make sure we're showing the filtered image, not original
      setShowOriginal(false);

      // Request permission first
      const hasPermission = await requestSavePermission();
      if (!hasPermission) {
        Alert.alert("Permission Denied", "Cannot save image without storage permission.");
        setIsSaving(false);
        return;
      }

      // Small delay to ensure filters are rendered before capture
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the edited image
      if (imageContainerRef.current) {
        const uri = await captureRef(imageContainerRef, {
          format: "jpg",
          quality: 1,
          result: "tmpfile",
        });

        // Save to gallery as a copy
        const savedAsset = await CameraRoll.save(uri, { type: "photo" });

        // Add the new photo to the app's database so it shows immediately
        try {
          const newPhotoId = `edited_${Date.now()}`;
          await insertPhoto({
            id: newPhotoId,
            uri: savedAsset,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            favorite: false,
            hidden: false,
            trashed: false,
          });

          // Save edit record
          await addEdit({
            id: `${Date.now()}`,
            photoId: newPhotoId,
            type: "adjust",
            payload: JSON.stringify({
              exposure, brightness, contrast, highlights, shadows, saturation, temperature, sharpness,
              filter: selectedFilter,
              rotation,
            }),
            createdAt: Date.now(),
          });
        } catch (e) {
          // Ignore database errors - image is still saved to gallery
        }

        setIsSaving(false);
        Alert.alert("Saved", "Image saved to your gallery", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error("Error saving image:", error);
      setIsSaving(false);
      Alert.alert("Error", "Failed to save image. Please try again.");
    }
  };

  const handleReset = () => {
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
  const exposureAmount = useMemo(() => 1 + (exposure / 100) * 0.5, [exposure]);
  const brightnessAmount = useMemo(() => 1 + brightness / 100, [brightness]);
  const contrastAmount = useMemo(() => 1 + contrast / 100, [contrast]);
  const highlightsAmount = useMemo(() => 1 + (highlights / 100) * 0.3, [highlights]);
  const shadowsAmount = useMemo(() => 1 + (shadows / 100) * 0.2, [shadows]);
  const saturationAmount = useMemo(() => 1 + saturation / 100, [saturation]);
  const temperatureAmount = useMemo(() => temperature / 100, [temperature]);

  // Temperature color matrix
  const temperatureMatrix = useMemo(() => {
    const t = temperatureAmount;
    return [
      1 + t * 0.3, 0, 0, 0, 0,
      0, 1 + t * 0.1, 0, 0, 0,
      0, 0, 1 - t * 0.3, 0, 0,
      0, 0, 0, 1, 0,
    ] as const;
  }, [temperatureAmount]);

  // Get filter matrix based on selected filter
  const getFilterMatrix = useCallback((filterName: string): readonly number[] => {
    switch (filterName) {
      case "Vivid":
        return [1.2, 0, 0, 0, 0, 0, 1.2, 0, 0, 0, 0, 0, 1.2, 0, 0, 0, 0, 0, 1, 0];
      case "B&W":
        return [0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0, 0, 0, 1, 0];
      case "Warm":
        return [1.2, 0, 0, 0, 0, 0, 1.1, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 1, 0];
      case "Cool":
        return [0.9, 0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 0, 1.2, 0, 0, 0, 0, 0, 1, 0];
      case "Sepia":
        return [0.393, 0.769, 0.189, 0, 0, 0.349, 0.686, 0.168, 0, 0, 0.272, 0.534, 0.131, 0, 0, 0, 0, 0, 1, 0];
      case "Retro":
        return [1.1, 0.1, 0.1, 0, 0, 0.1, 1.0, 0.1, 0, 0, 0.1, 0.1, 0.9, 0, 0, 0, 0, 0, 1, 0];
      case "Film":
        return [1.1, 0, 0, 0, 0.05, 0, 1.05, 0, 0, 0.02, 0, 0, 1.0, 0, 0.05, 0, 0, 0, 1, 0];
      case "Fade":
        return [1, 0, 0, 0, 0.1, 0, 1, 0, 0, 0.1, 0, 0, 1, 0, 0.1, 0, 0, 0, 1, 0];
      case "Grain":
        return [1.05, 0, 0, 0, 0, 0, 1.05, 0, 0, 0, 0, 0, 1.05, 0, 0, 0, 0, 0, 1, 0];
      case "Drama":
        return [1.3, 0, 0, 0, -0.1, 0, 1.3, 0, 0, -0.1, 0, 0, 1.3, 0, -0.1, 0, 0, 0, 1, 0];
      case "Noir":
        return [0.4, 0.4, 0.4, 0, -0.1, 0.3, 0.3, 0.3, 0, -0.1, 0.2, 0.2, 0.2, 0, -0.1, 0, 0, 0, 1, 0];
      case "Cinematic":
        return [1.1, 0, 0.1, 0, 0, 0, 1.0, 0.1, 0, 0, 0, 0.1, 1.1, 0, 0, 0, 0, 0, 1, 0];
      case "Muted":
        return [0.9, 0.1, 0.1, 0, 0.05, 0.1, 0.9, 0.1, 0, 0.05, 0.1, 0.1, 0.9, 0, 0.05, 0, 0, 0, 1, 0];
      case "Pop":
        return [1.4, 0, 0, 0, 0, 0, 1.4, 0, 0, 0, 0, 0, 1.4, 0, 0, 0, 0, 0, 1, 0];
      case "Teal":
        return [0.8, 0, 0, 0, 0, 0, 1.1, 0.1, 0, 0, 0, 0.1, 1.2, 0, 0, 0, 0, 0, 1, 0];
      case "Orange":
        return [1.3, 0.1, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 0, 0.8, 0, 0, 0, 0, 0, 1, 0];
      case "Pink":
        return [1.2, 0.1, 0.1, 0, 0, 0, 0.9, 0.1, 0, 0, 0.1, 0.1, 1.1, 0, 0, 0, 0, 0, 1, 0];
      case "Blue":
        return [0.8, 0, 0.1, 0, 0, 0, 0.9, 0.2, 0, 0, 0.1, 0.1, 1.3, 0, 0, 0, 0, 0, 1, 0];
      case "Green":
        return [0.9, 0.1, 0, 0, 0, 0.1, 1.2, 0.1, 0, 0, 0, 0.1, 0.9, 0, 0, 0, 0, 0, 1, 0];
      case "Soft":
        return [1.0, 0.05, 0.05, 0, 0.05, 0.05, 1.0, 0.05, 0, 0.05, 0.05, 0.05, 1.0, 0, 0.05, 0, 0, 0, 1, 0];
      case "Glow":
        return [1.1, 0.1, 0.1, 0, 0.1, 0.1, 1.1, 0.1, 0, 0.1, 0.1, 0.1, 1.1, 0, 0.1, 0, 0, 0, 1, 0];
      case "Sharp":
        return [1.2, -0.1, -0.1, 0, 0, -0.1, 1.2, -0.1, 0, 0, -0.1, -0.1, 1.2, 0, 0, 0, 0, 0, 1, 0];
      case "Smooth":
        return [1.0, 0.05, 0.05, 0, 0.02, 0.05, 1.0, 0.05, 0, 0.02, 0.05, 0.05, 1.0, 0, 0.02, 0, 0, 0, 1, 0];
      case "Natural":
        return [1.05, 0, 0, 0, 0, 0, 1.05, 0, 0, 0, 0, 0, 1.05, 0, 0, 0, 0, 0, 1, 0];
      case "Sketch":
        return [0.5, 0.5, 0.5, 0, -0.2, 0.5, 0.5, 0.5, 0, -0.2, 0.5, 0.5, 0.5, 0, -0.2, 0, 0, 0, 1, 0];
      case "Paint":
        return [1.3, 0.2, 0, 0, 0, 0.2, 1.3, 0.2, 0, 0, 0, 0.2, 1.3, 0, 0, 0, 0, 0, 1, 0];
      case "Poster":
        return [1.5, 0, 0, 0, -0.2, 0, 1.5, 0, 0, -0.2, 0, 0, 1.5, 0, -0.2, 0, 0, 0, 1, 0];
      case "Comic":
        return [1.4, 0, 0, 0, 0, 0, 1.4, 0, 0, 0, 0, 0, 1.4, 0, 0, 0, 0, 0, 1, 0];
      case "Neon":
        return [1.5, 0, 0.5, 0, 0, 0.5, 1.5, 0, 0, 0, 0, 0.5, 1.5, 0, 0, 0, 0, 0, 1, 0];
      default: // Original
        return [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
    }
  }, []);

  const currentFilterMatrix = useMemo(() => getFilterMatrix(selectedFilter), [selectedFilter, getFilterMatrix]);

  // Memoized filtered image
  const filteredImage = useMemo(() => {
    if (!photo) return null;
    const combinedBrightness = exposureAmount * brightnessAmount * highlightsAmount;
    const combinedContrast = contrastAmount * shadowsAmount;

    return (
      <ColorMatrix matrix={currentFilterMatrix}>
        <ColorMatrix matrix={temperatureMatrix}>
          <Brightness amount={combinedBrightness}>
            <Contrast amount={combinedContrast}>
              <Saturate amount={saturationAmount}>
                <Image source={{ uri: photo.uri }} style={styles.image} resizeMode="contain" />
              </Saturate>
            </Contrast>
          </Brightness>
        </ColorMatrix>
      </ColorMatrix>
    );
  }, [photo, exposureAmount, brightnessAmount, highlightsAmount, contrastAmount, shadowsAmount, saturationAmount, temperatureMatrix, currentFilterMatrix]);

  const iconSize = isSmallScreen ? 16 : 20;

  const renderAdjustPanel = () => (
    <ScrollView style={styles.adjustPanel} showsVerticalScrollIndicator={false} focusable={false} accessible={false}>
      <Text style={styles.sectionTitle}>LIGHT</Text>
      <ThickSlider icon={<ExposureIcon size={iconSize} />} value={exposure} onChange={setExposure} onStart={saveToHistory} />
      <ThickSlider icon={<BrightnessIcon size={iconSize} />} value={brightness} onChange={setBrightness} onStart={saveToHistory} />
      <ThickSlider icon={<ContrastIcon size={iconSize} />} value={contrast} onChange={setContrast} onStart={saveToHistory} />
      <ThickSlider icon={<HighlightsIcon size={iconSize} />} value={highlights} onChange={setHighlights} onStart={saveToHistory} />
      <ThickSlider icon={<ShadowsIcon size={iconSize} />} value={shadows} onChange={setShadows} onStart={saveToHistory} />

      <Text style={styles.sectionTitle}>COLOR</Text>
      <ThickSlider icon={<SaturationIcon size={iconSize} />} value={saturation} onChange={setSaturation} onStart={saveToHistory} />
      <ThickSlider icon={<TemperatureIcon size={iconSize} />} value={temperature} onChange={setTemperature} onStart={saveToHistory} />

      <Text style={styles.sectionTitle}>DETAIL</Text>
      <ThickSlider icon={<SharpnessIcon size={iconSize} />} value={sharpness} onChange={setSharpness} onStart={saveToHistory} />

      <View style={{ height: isSmallScreen ? verticalScale(40) : verticalScale(80) }} />
    </ScrollView>
  );

  const renderFilterPanel = () => (
    <View style={styles.filterPanel}>
      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
        focusable={false}
        accessible={false}
      >
        {filterCategories.map((category, index) => (
          <Pressable
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
              focusArea === "categories" && focusedCategoryIndex === index && styles.categoryChipFocused
            ]}
            onPress={() => setSelectedCategory(category)}
            focusable={false}
            accessible={false}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category && styles.categoryChipTextActive,
              focusArea === "categories" && focusedCategoryIndex === index && styles.categoryChipTextFocused
            ]}>
              {category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Filter grid */}
      <ScrollView style={styles.filterGrid} showsVerticalScrollIndicator={false} focusable={false} accessible={false}>
        <View style={styles.filterGridContent}>
          {filters[selectedCategory]?.map((filterName, index) => (
            <Pressable
              key={filterName}
              style={styles.filterItem}
              onPress={() => { saveToHistory(); setSelectedFilter(filterName); }}
              focusable={false}
              accessible={false}
            >
              <View style={[
                styles.filterThumbnail,
                selectedFilter === filterName && styles.filterThumbnailActive,
                focusArea === "filters" && focusedFilterIndex === index && styles.filterThumbnailFocused
              ]}>
                {photo && (
                  <ColorMatrix matrix={getFilterMatrix(filterName)}>
                    <Image
                      source={{ uri: photo.uri }}
                      style={styles.filterThumbnailImage}
                      resizeMode="cover"
                    />
                  </ColorMatrix>
                )}
                {selectedFilter === filterName && (
                  <View style={styles.filterCheckmark}>
                    <Svg width={16} height={16} viewBox="0 0 24 24">
                      <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#FFFFFF" />
                    </Svg>
                  </View>
                )}
              </View>
              <Text style={[
                styles.filterName,
                selectedFilter === filterName && styles.filterNameActive,
                focusArea === "filters" && focusedFilterIndex === index && styles.filterNameFocused
              ]}>
                {filterName}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );

  const handleRotate = () => {
    saveToHistory();
    setRotation((prev) => (prev + 90) % 360);
  };

  // Check if rotation is 90 or 270 degrees (where width/height swap)
  const isRotated90or270 = rotation === 90 || rotation === 270;

  // Swap container aspect ratio when rotated 90/270
  const containerAspectRatio = useMemo(() => {
    if (!imageSize) return undefined;
    const originalRatio = imageSize.width / imageSize.height;
    return isRotated90or270 ? (1 / originalRatio) : originalRatio;
  }, [imageSize, isRotated90or270]);

  // Calculate rotation style with proper scaling for 90/270 degree rotations
  const getRotatedImageStyle = useMemo(() => {
    if (!imageSize) {
      return {
        width: '100%',
        height: '100%',
        transform: [{ rotate: `${rotation}deg` }]
      };
    }

    // For 90 or 270 degree rotation, we need to scale the image to fill the container
    if (isRotated90or270) {
      const aspectRatio = imageSize.width / imageSize.height;
      // Scale factor to make the rotated image fill the container
      const scale = aspectRatio > 1 ? aspectRatio : 1 / aspectRatio;
      return {
        width: '100%',
        height: '100%',
        transform: [
          { rotate: `${rotation}deg` },
          { scale: scale }
        ]
      };
    }

    return {
      width: '100%',
      height: '100%',
      transform: [{ rotate: `${rotation}deg` }]
    };
  }, [rotation, imageSize, isRotated90or270]);

  const handleToolsReset = () => {
    saveToHistory();
    setRotation(0);
  };

  // Drawing pan responder
  const drawPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => activeTab === "draw",
    onMoveShouldSetPanResponder: () => activeTab === "draw",
    onPanResponderGrant: (evt) => {
      saveToHistory(); // Save before starting new stroke
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath(`M${locationX},${locationY}`);
      setIsDrawing(true);
    },
    onPanResponderMove: (evt) => {
      if (!isDrawing) return;
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath((prev) => `${prev} L${locationX},${locationY}`);
    },
    onPanResponderRelease: () => {
      if (currentPath) {
        const strokeWidth = drawTool === "pen" ? 4 : 20;
        const opacity = drawTool === "pen" ? 1 : 0.4;
        setPaths((prev) => [...prev, { path: currentPath, color: drawColor, strokeWidth, opacity }]);
      }
      setCurrentPath("");
      setIsDrawing(false);
    },
  }), [activeTab, isDrawing, currentPath, drawTool, drawColor, saveToHistory]);

  const handleClearDrawing = () => {
    saveToHistory();
    setPaths([]);
    setCurrentPath("");
  };

  const renderToolsPanel = () => (
    <View style={styles.toolsPanel}>
      <View style={styles.toolsButtonsContainer}>
        <Pressable style={styles.toolButton} onPress={handleRotate} focusable={false}>
          <RotateIcon size={22} color="#1F2937" />
          <Text style={styles.toolButtonText}>90°</Text>
        </Pressable>
        <Pressable style={styles.toolButton} onPress={handleToolsReset} focusable={false}>
          <ResetIcon size={22} color="#1F2937" />
          <Text style={styles.toolButtonText}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );

  // Draw colors
  const drawColors = [
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#000000", // Black
    "#FFFFFF", // White
  ];

  const renderDrawPanel = () => (
    <View style={styles.drawPanel}>
      {/* Tool buttons */}
      <View style={styles.drawToolsContainer}>
        <Pressable
          style={[
            styles.drawToolButton,
            drawTool === "pen" && styles.drawToolButtonActive
          ]}
          onPress={() => setDrawTool("pen")}
          focusable={false}
        >
          <PenIcon size={20} color={drawTool === "pen" ? "#FFFFFF" : "#1F2937"} />
          <Text style={[
            styles.drawToolText,
            drawTool === "pen" && styles.drawToolTextActive
          ]}>Pen</Text>
        </Pressable>
        <Pressable
          style={[
            styles.drawToolButton,
            drawTool === "highlight" && styles.drawToolButtonActive
          ]}
          onPress={() => setDrawTool("highlight")}
          focusable={false}
        >
          <HighlightIcon size={20} color={drawTool === "highlight" ? "#FFFFFF" : "#1F2937"} />
          <Text style={[
            styles.drawToolText,
            drawTool === "highlight" && styles.drawToolTextActive
          ]}>Highlight</Text>
        </Pressable>
      </View>

      {/* Color palette */}
      <View style={styles.colorPalette}>
        {drawColors.map((color) => (
          <Pressable
            key={color}
            style={[
              styles.colorSwatch,
              { backgroundColor: color },
              color === "#FFFFFF" && styles.colorSwatchWhite,
              drawColor === color && styles.colorSwatchActive
            ]}
            onPress={() => setDrawColor(color)}
            focusable={false}
          />
        ))}
      </View>

      {/* Clear button */}
      {paths.length > 0 && (
        <Pressable style={styles.clearButton} onPress={handleClearDrawing} focusable={false}>
          <Text style={styles.clearButtonText}>Clear Drawing</Text>
        </Pressable>
      )}
    </View>
  );

  if (!photo) return null;

  // Check if we're in fullscreen edit mode (tools or draw)
  const isFullscreenMode = activeTab === "tools" || activeTab === "draw";

  // Fullscreen mode for Tools and Draw
  if (isFullscreenMode) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

        {/* Fullscreen Image */}
        <View
          ref={imageContainerRef}
          style={styles.fullscreenImageContainer}
          {...(activeTab === "draw" ? drawPanResponder.panHandlers : {})}
          collapsable={false}
        >
          <View style={[styles.fullscreenImageWrapper, getRotatedImageStyle]}>
            {showOriginal ? (
              <Image source={{ uri: photo.uri }} style={styles.image} resizeMode="contain" />
            ) : (
              filteredImage
            )}
          </View>
          {/* Drawing Layer */}
          {(paths.length > 0 || currentPath) && (
            <Svg style={styles.drawingLayer}>
              {paths.map((p, index) => (
                <Path
                  key={index}
                  d={p.path}
                  stroke={p.color}
                  strokeWidth={p.strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={p.opacity}
                />
              ))}
              {currentPath && (
                <Path
                  d={currentPath}
                  stroke={drawColor}
                  strokeWidth={drawTool === "pen" ? 4 : 20}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={drawTool === "pen" ? 1 : 0.4}
                />
              )}
            </Svg>
          )}
        </View>

        {/* Floating Header */}
        <View style={styles.floatingHeader}>
          <Pressable
            onPress={() => setActiveTab("adjust")}
            style={styles.floatingBackButton}
            focusable={false}
          >
            <BackIcon size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.floatingTitle}>
            {activeTab === "tools" ? "Tools" : "Draw"}
          </Text>
          <Pressable
            onPress={handleSave}
            style={[styles.floatingSaveButton, isSaving && styles.saveButtonDisabled]}
            disabled={isSaving}
            focusable={false}
          >
            <SaveIcon size={16} color="#FFFFFF" />
            <Text style={styles.floatingSaveText}>{isSaving ? "..." : "Save"}</Text>
          </Pressable>
        </View>

        {/* Floating Controls */}
        <View style={styles.floatingControls}>
          {activeTab === "tools" && (
            <View style={styles.floatingToolsRow}>
              <Pressable style={styles.floatingToolButton} onPress={handleRotate} focusable={false}>
                <RotateIcon size={22} color="#FFFFFF" />
                <Text style={styles.floatingToolText}>90°</Text>
              </Pressable>
              <Pressable style={styles.floatingToolButton} onPress={handleToolsReset} focusable={false}>
                <ResetIcon size={22} color="#FFFFFF" />
                <Text style={styles.floatingToolText}>Reset</Text>
              </Pressable>
            </View>
          )}
          {activeTab === "draw" && (
            <View style={styles.floatingDrawControls}>
              {/* Tool buttons */}
              <View style={styles.floatingDrawToolsRow}>
                <Pressable
                  style={[
                    styles.floatingDrawToolButton,
                    drawTool === "pen" && styles.floatingDrawToolButtonActive
                  ]}
                  onPress={() => setDrawTool("pen")}
                  focusable={false}
                >
                  <PenIcon size={18} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  style={[
                    styles.floatingDrawToolButton,
                    drawTool === "highlight" && styles.floatingDrawToolButtonActive
                  ]}
                  onPress={() => setDrawTool("highlight")}
                  focusable={false}
                >
                  <HighlightIcon size={18} color="#FFFFFF" />
                </Pressable>
                {paths.length > 0 && (
                  <Pressable style={styles.floatingClearButton} onPress={handleClearDrawing} focusable={false}>
                    <Text style={styles.floatingClearText}>Clear</Text>
                  </Pressable>
                )}
              </View>
              {/* Color palette */}
              <View style={styles.floatingColorPalette}>
                {drawColors.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.floatingColorSwatch,
                      { backgroundColor: color },
                      color === "#FFFFFF" && styles.colorSwatchWhite,
                      drawColor === color && styles.floatingColorSwatchActive
                    ]}
                    onPress={() => setDrawColor(color)}
                    focusable={false}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.headerButton, focusArea === "header" && focusedElement === "back" && styles.buttonFocused]}
          focusable={false}
          accessible={false}
        >
          <BackIcon size={24} color={focusArea === "header" && focusedElement === "back" ? "#000" : "#1F2937"} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Pressable
            onPress={handleUndo}
            style={[
              styles.headerButton,
              undoHistory.length === 0 && styles.headerButtonDisabled,
              focusArea === "header" && focusedElement === "undo" && styles.buttonFocused
            ]}
            focusable={false}
            accessible={false}
          >
            <UndoIcon size={22} color={focusArea === "header" && focusedElement === "undo" ? "#000" : (undoHistory.length > 0 ? "#1F2937" : "#D1D5DB")} />
          </Pressable>
          <Pressable
            onPress={handleReset}
            style={[
              styles.headerButton,
              focusArea === "header" && focusedElement === "reset" && styles.buttonFocused
            ]}
            focusable={false}
            accessible={false}
          >
            <HistoryIcon size={22} color={focusArea === "header" && focusedElement === "reset" ? "#000" : "#6B7280"} />
          </Pressable>
          <Pressable
            style={[
              styles.headerButton,
              focusArea === "header" && focusedElement === "copy" && styles.buttonFocused
            ]}
            focusable={false}
            accessible={false}
          >
            <CopyIcon size={22} color={focusArea === "header" && focusedElement === "copy" ? "#000" : "#6B7280"} />
          </Pressable>
        </View>

        <Pressable
          onPress={handleSave}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled, focusArea === "header" && focusedElement === "save" && styles.saveButtonFocused]}
          disabled={isSaving}
          focusable={false}
          accessible={false}
        >
          <SaveIcon size={16} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>{isSaving ? "Saving..." : "Save"}</Text>
        </Pressable>
      </View>

      {/* Image Preview */}
      <View
        ref={imageContainerRef}
        style={[
          styles.imageContainer,
          containerAspectRatio && { aspectRatio: containerAspectRatio }
        ]}
        collapsable={false}
      >
        <View style={[styles.imageWrapper, getRotatedImageStyle]}>
          {showOriginal ? (
            <Image source={{ uri: photo.uri }} style={styles.image} resizeMode="contain" />
          ) : (
            filteredImage
          )}
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <Pressable style={styles.tabButton} focusable={false} accessible={false}>
          <MagicWandIcon size={22} color="#6B7280" />
        </Pressable>
        <Pressable
          style={[
            styles.tabButton,
            focusArea === "tabs" && focusedElement === "tab_adjust" && styles.tabButtonFocused
          ]}
          onPress={() => setActiveTab("adjust")}
          focusable={false}
          accessible={false}
        >
          <Text style={[
            styles.tabText,
            activeTab === "adjust" && styles.tabTextActive,
            focusArea === "tabs" && focusedElement === "tab_adjust" && styles.tabTextFocused
          ]}>Adjust</Text>
        </Pressable>
        <Pressable
          style={[
            styles.tabButton,
            focusArea === "tabs" && focusedElement === "tab_filter" && styles.tabButtonFocused
          ]}
          onPress={() => setActiveTab("filter")}
          focusable={false}
          accessible={false}
        >
          <Text style={[
            styles.tabText,
            activeTab === "filter" && styles.tabTextActive,
            focusArea === "tabs" && focusedElement === "tab_filter" && styles.tabTextFocused
          ]}>Filter</Text>
        </Pressable>
        <Pressable
          style={[
            styles.tabButton,
            focusArea === "tabs" && focusedElement === "tab_tools" && styles.tabButtonFocused
          ]}
          onPress={() => setActiveTab("tools")}
          focusable={false}
          accessible={false}
        >
          <Text style={[
            styles.tabText,
            activeTab === "tools" && styles.tabTextActive,
            focusArea === "tabs" && focusedElement === "tab_tools" && styles.tabTextFocused
          ]}>Tools</Text>
        </Pressable>
        <Pressable
          style={[
            styles.tabButton,
            focusArea === "tabs" && focusedElement === "tab_draw" && styles.tabButtonFocused
          ]}
          onPress={() => setActiveTab("draw")}
          focusable={false}
          accessible={false}
        >
          <Text style={[
            styles.tabText,
            activeTab === "draw" && styles.tabTextActive,
            focusArea === "tabs" && focusedElement === "tab_draw" && styles.tabTextFocused
          ]}>Draw</Text>
        </Pressable>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {activeTab === "adjust" && renderAdjustPanel()}
        {activeTab === "filter" && renderFilterPanel()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  // Fullscreen mode styles
  fullscreenImageContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullscreenImageWrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(12),
    paddingTop: verticalScale(35),
    paddingBottom: scale(10),
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  floatingBackButton: {
    padding: scale(8),
  },
  floatingTitle: {
    fontSize: fontScale(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  floatingSaveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: scale(6),
    paddingHorizontal: scale(10),
    borderRadius: scale(6),
    gap: scale(4),
  },
  floatingSaveText: {
    fontSize: fontScale(12),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  floatingControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(12),
    paddingBottom: verticalScale(20),
    paddingTop: scale(10),
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  floatingToolsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(16),
  },
  floatingToolButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: scale(10),
    paddingHorizontal: scale(20),
    borderRadius: scale(8),
    gap: scale(8),
  },
  floatingToolText: {
    fontSize: fontScale(14),
    fontWeight: "500",
    color: "#FFFFFF",
  },
  floatingDrawControls: {
    gap: scale(12),
  },
  floatingDrawToolsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(12),
  },
  floatingDrawToolButton: {
    padding: scale(10),
    borderRadius: scale(8),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  floatingDrawToolButtonActive: {
    backgroundColor: "#3B82F6",
  },
  floatingClearButton: {
    paddingVertical: scale(10),
    paddingHorizontal: scale(16),
    borderRadius: scale(8),
    backgroundColor: "rgba(220, 38, 38, 0.8)",
  },
  floatingClearText: {
    fontSize: fontScale(12),
    fontWeight: "500",
    color: "#FFFFFF",
  },
  floatingColorPalette: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(8),
  },
  floatingColorSwatch: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(4),
  },
  floatingColorSwatchActive: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    paddingTop: verticalScale(30),
    backgroundColor: "#FFFFFF",
  },
  headerButton: {
    padding: scale(6),
    borderRadius: scale(8),
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  buttonFocused: {
    backgroundColor: "#FFD700",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
    borderRadius: scale(6),
    gap: scale(6),
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveButtonFocused: {
    backgroundColor: "#FFD700",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  saveButtonText: {
    fontSize: fontScale(13),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  imageContainer: {
    marginHorizontal: scale(12),
    marginVertical: scale(4),
    borderRadius: scale(10),
    overflow: "hidden",
    backgroundColor: "#000",
    maxHeight: isSmallScreen ? verticalScale(180) : verticalScale(300),
    alignSelf: "center",
    width: "100%",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  drawingLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  eyeButton: {
    position: "absolute",
    bottom: scale(10),
    right: scale(10),
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: isSmallScreen ? verticalScale(6) : verticalScale(10),
    paddingHorizontal: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tabButton: {
    paddingVertical: isSmallScreen ? verticalScale(4) : verticalScale(6),
    paddingHorizontal: isSmallScreen ? scale(8) : scale(12),
    borderRadius: scale(8),
  },
  tabButtonFocused: {
    backgroundColor: "#FFD700",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  tabText: {
    fontSize: isSmallScreen ? fontScale(12) : fontScale(14),
    fontWeight: "400",
    color: "#9CA3AF",
  },
  tabTextActive: {
    color: "#1F2937",
    fontWeight: "600",
  },
  tabTextFocused: {
    color: "#000000",
    fontWeight: "700",
  },
  controlsContainer: {
    flex: 1,
  },
  adjustPanel: {
    flex: 1,
    paddingHorizontal: scale(16),
  },
  sectionTitle: {
    fontSize: isSmallScreen ? fontScale(10) : fontScale(12),
    fontWeight: "600",
    color: "#6B7280",
    marginTop: isSmallScreen ? verticalScale(10) : verticalScale(16),
    marginBottom: isSmallScreen ? verticalScale(8) : verticalScale(12),
    letterSpacing: 1,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: isSmallScreen ? verticalScale(8) : verticalScale(14),
    height: isSmallScreen ? verticalScale(24) : verticalScale(28),
  },
  sliderIcon: {
    width: scale(30),
    alignItems: "center",
    justifyContent: "center",
  },
  sliderTrackContainer: {
    flex: 1,
    height: isSmallScreen ? verticalScale(24) : verticalScale(28),
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
    left: 0,
    borderRadius: scale(2),
  },
  sliderThumb: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderValue: {
    width: scale(30),
    fontSize: isSmallScreen ? fontScale(11) : fontScale(13),
    color: "#3B82F6",
    textAlign: "right",
    fontWeight: "500",
  },
  placeholderPanel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: fontScale(14),
    color: "#9CA3AF",
  },
  // Filter panel styles
  filterPanel: {
    flex: 1,
  },
  categoryScroll: {
    flexGrow: 0,
    paddingVertical: isSmallScreen ? verticalScale(8) : verticalScale(12),
  },
  categoryContainer: {
    paddingHorizontal: scale(12),
    gap: scale(8),
  },
  categoryChip: {
    paddingHorizontal: isSmallScreen ? scale(12) : scale(16),
    paddingVertical: isSmallScreen ? verticalScale(6) : verticalScale(8),
    borderRadius: scale(16),
    backgroundColor: "#F3F4F6",
  },
  categoryChipActive: {
    backgroundColor: "#3B82F6",
  },
  categoryChipFocused: {
    backgroundColor: "#FFD700",
    borderWidth: 2,
    borderColor: "#000",
  },
  categoryChipText: {
    fontSize: isSmallScreen ? fontScale(11) : fontScale(13),
    fontWeight: "500",
    color: "#6B7280",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  categoryChipTextFocused: {
    color: "#000000",
    fontWeight: "700",
  },
  filterGrid: {
    flex: 1,
    paddingHorizontal: scale(12),
  },
  filterGridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: isSmallScreen ? scale(8) : scale(10),
  },
  filterItem: {
    width: isSmallScreen ? (SCREEN_WIDTH - scale(24) - scale(32)) / 5 : (SCREEN_WIDTH - scale(24) - scale(30)) / 4,
    alignItems: "center",
  },
  filterThumbnail: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: scale(8),
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    borderWidth: 2,
    borderColor: "transparent",
  },
  filterThumbnailActive: {
    borderColor: "#3B82F6",
  },
  filterThumbnailFocused: {
    borderColor: "#FFD700",
    borderWidth: 3,
  },
  filterThumbnailImage: {
    width: "100%",
    height: "100%",
  },
  filterCheckmark: {
    position: "absolute",
    top: scale(4),
    left: scale(4),
    width: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  filterName: {
    fontSize: isSmallScreen ? fontScale(9) : fontScale(11),
    color: "#6B7280",
    marginTop: verticalScale(4),
    textAlign: "center",
  },
  filterNameActive: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  filterNameFocused: {
    color: "#000000",
    fontWeight: "700",
  },
  // Tools panel styles
  toolsPanel: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: isSmallScreen ? verticalScale(10) : verticalScale(16),
  },
  toolsButtonsContainer: {
    flexDirection: "row",
    paddingHorizontal: scale(16),
    gap: scale(10),
  },
  toolButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isSmallScreen ? verticalScale(10) : verticalScale(12),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    gap: scale(8),
  },
  toolButtonText: {
    fontSize: isSmallScreen ? fontScale(12) : fontScale(14),
    fontWeight: "500",
    color: "#1F2937",
  },
  // Draw panel styles
  drawPanel: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: isSmallScreen ? verticalScale(10) : verticalScale(16),
  },
  drawToolsContainer: {
    flexDirection: "row",
    paddingHorizontal: scale(16),
    gap: scale(10),
    marginBottom: isSmallScreen ? verticalScale(10) : verticalScale(14),
  },
  drawToolButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isSmallScreen ? verticalScale(10) : verticalScale(12),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    gap: scale(8),
  },
  drawToolButtonActive: {
    backgroundColor: "#1F2937",
    borderColor: "#1F2937",
  },
  drawToolText: {
    fontSize: isSmallScreen ? fontScale(12) : fontScale(14),
    fontWeight: "500",
    color: "#1F2937",
  },
  drawToolTextActive: {
    color: "#FFFFFF",
  },
  colorPalette: {
    flexDirection: "row",
    paddingHorizontal: scale(16),
    gap: scale(6),
  },
  colorSwatch: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: scale(5),
    maxWidth: isSmallScreen ? scale(32) : scale(40),
    maxHeight: isSmallScreen ? scale(32) : scale(40),
  },
  colorSwatchWhite: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  colorSwatchActive: {
    borderWidth: 3,
    borderColor: "#3B82F6",
  },
  clearButton: {
    marginTop: isSmallScreen ? verticalScale(10) : verticalScale(14),
    marginHorizontal: scale(16),
    paddingVertical: isSmallScreen ? verticalScale(8) : verticalScale(10),
    borderRadius: scale(6),
    backgroundColor: "#FEE2E2",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: isSmallScreen ? fontScale(12) : fontScale(13),
    fontWeight: "500",
    color: "#DC2626",
  },
});
