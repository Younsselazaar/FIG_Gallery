import React, { useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Video, { OnLoadData, OnProgressData } from "react-native-video";
import Svg, { Path, Rect } from "react-native-svg";
import Slider from "@react-native-community/slider";

import { dark, brand } from "../theme/colors";
import { scale, fontScale } from "../theme/responsive";

/**
 * VideoPlayer.tsx
 * ---------------
 * In-app video player with controls for FIG Gallery.
 * Features: play/pause, seek, fullscreen, progress bar.
 */

type Props = {
  uri: string;
  onClose?: () => void;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

// Icons
function PlayIcon({ size = 48, color = "white" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8 5V19L19 12L8 5Z" fill={color} />
    </Svg>
  );
}

function PauseIcon({ size = 48, color = "white" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="6" y="4" width="4" height="16" rx="1" fill={color} />
      <Rect x="14" y="4" width="4" height="16" rx="1" fill={color} />
    </Svg>
  );
}

function ReplayIcon({ size = 24, color = "white" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 5V1L7 6L12 11V7C15.31 7 18 9.69 18 13C18 16.31 15.31 19 12 19C8.69 19 6 16.31 6 13H4C4 17.42 7.58 21 12 21C16.42 21 20 17.42 20 13C20 8.58 16.42 5 12 5Z"
        fill={color}
      />
    </Svg>
  );
}

function Forward10Icon({ size = 24, color = "white" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M18 13C18 16.31 15.31 19 12 19C8.69 19 6 16.31 6 13C6 9.69 8.69 7 12 7V11L17 6L12 1V5C7.58 5 4 8.58 4 13C4 17.42 7.58 21 12 21C16.42 21 20 17.42 20 13H18Z"
        fill={color}
      />
      <Path d="M10.8 16H9.8V11.5L8.5 12V11.1L10.7 10.2H10.8V16Z" fill={color} />
      <Path
        d="M14.3 16.1C13.7 16.1 13.2 15.9 12.9 15.4C12.5 15 12.4 14.4 12.4 13.6V12.6C12.4 11.8 12.6 11.2 12.9 10.8C13.2 10.3 13.7 10.1 14.3 10.1C14.9 10.1 15.4 10.3 15.7 10.8C16 11.2 16.2 11.8 16.2 12.6V13.6C16.2 14.4 16 15 15.7 15.4C15.4 15.9 14.9 16.1 14.3 16.1ZM14.3 15.2C14.5 15.2 14.7 15.1 14.8 14.9C14.9 14.7 15 14.4 15 14V12.3C15 11.9 14.9 11.6 14.8 11.4C14.7 11.2 14.5 11.1 14.3 11.1C14.1 11.1 13.9 11.2 13.8 11.4C13.7 11.6 13.6 11.9 13.6 12.3V14C13.6 14.4 13.7 14.7 13.8 14.9C13.9 15.1 14.1 15.2 14.3 15.2Z"
        fill={color}
      />
    </Svg>
  );
}

function Back10Icon({ size = 24, color = "white" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 5V1L7 6L12 11V7C15.31 7 18 9.69 18 13C18 16.31 15.31 19 12 19C8.69 19 6 16.31 6 13H4C4 17.42 7.58 21 12 21C16.42 21 20 17.42 20 13C20 8.58 16.42 5 12 5Z"
        fill={color}
      />
      <Path d="M9.8 16H8.8V11.5L7.5 12V11.1L9.7 10.2H9.8V16Z" fill={color} />
      <Path
        d="M13.3 16.1C12.7 16.1 12.2 15.9 11.9 15.4C11.5 15 11.4 14.4 11.4 13.6V12.6C11.4 11.8 11.6 11.2 11.9 10.8C12.2 10.3 12.7 10.1 13.3 10.1C13.9 10.1 14.4 10.3 14.7 10.8C15 11.2 15.2 11.8 15.2 12.6V13.6C15.2 14.4 15 15 14.7 15.4C14.4 15.9 13.9 16.1 13.3 16.1ZM13.3 15.2C13.5 15.2 13.7 15.1 13.8 14.9C13.9 14.7 14 14.4 14 14V12.3C14 11.9 13.9 11.6 13.8 11.4C13.7 11.2 13.5 11.1 13.3 11.1C13.1 11.1 12.9 11.2 12.8 11.4C12.7 11.6 12.6 11.9 12.6 12.3V14C12.6 14.4 12.7 14.7 12.8 14.9C12.9 15.1 13.1 15.2 13.3 15.2Z"
        fill={color}
      />
    </Svg>
  );
}

function MuteIcon({ size = 24, color = "white" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M16.5 12C16.5 10.23 15.48 8.71 14 7.97V10.18L16.45 12.63C16.48 12.43 16.5 12.22 16.5 12ZM19 12C19 12.94 18.8 13.82 18.46 14.64L19.97 16.15C20.63 14.91 21 13.5 21 12C21 7.72 18.01 4.14 14 3.23V5.29C16.89 6.15 19 8.83 19 12ZM4.27 3L3 4.27L7.73 9H3V15H7L12 20V13.27L16.25 17.52C15.58 18.04 14.83 18.45 14 18.7V20.76C15.38 20.45 16.63 19.81 17.69 18.95L19.73 21L21 19.73L12 10.73L4.27 3ZM12 4L9.91 6.09L12 8.18V4Z"
        fill={color}
      />
    </Svg>
  );
}

function VolumeIcon({ size = 24, color = "white" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.48 8.71 14 7.97V16.02C15.48 15.29 16.5 13.77 16.5 12ZM14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.85 14 18.71V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z"
        fill={color}
      />
    </Svg>
  );
}

function CloseIcon({ size = 24, color = "white" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
        fill={color}
      />
    </Svg>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({ uri, onClose }: Props) {
  const videoRef = useRef<Video>(null);

  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [ended, setEnded] = useState(false);

  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  const startHideTimer = useCallback(() => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    hideControlsTimer.current = setTimeout(() => {
      if (!paused) {
        setShowControls(false);
      }
    }, 3000);
  }, [paused]);

  const handleTap = () => {
    setShowControls(true);
    startHideTimer();
  };

  const handleLoad = (data: OnLoadData) => {
    setDuration(data.duration);
    setLoading(false);
    startHideTimer();
  };

  const handleProgress = (data: OnProgressData) => {
    setCurrentTime(data.currentTime);
  };

  const handleEnd = () => {
    setEnded(true);
    setPaused(true);
    setShowControls(true);
  };

  const handlePlayPause = () => {
    if (ended) {
      // Restart video
      videoRef.current?.seek(0);
      setEnded(false);
      setPaused(false);
    } else {
      setPaused(!paused);
    }
    startHideTimer();
  };

  const handleSeek = (value: number) => {
    videoRef.current?.seek(value);
    setCurrentTime(value);
    if (ended) {
      setEnded(false);
      setPaused(false);
    }
  };

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    videoRef.current?.seek(newTime);
    setCurrentTime(newTime);
    startHideTimer();
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <View style={styles.container}>
      <Pressable style={styles.videoWrapper} onPress={handleTap}>
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          resizeMode="contain"
          paused={paused}
          muted={muted}
          onLoad={handleLoad}
          onProgress={handleProgress}
          onEnd={handleEnd}
          repeat={false}
        />

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={brand.teal} />
          </View>
        )}

        {/* Controls overlay */}
        {showControls && !loading && (
          <View style={styles.controlsOverlay}>
            {/* Close button */}
            <Pressable style={styles.closeButton} onPress={onClose}>
              <CloseIcon size={scale(28)} />
            </Pressable>

            {/* Center controls */}
            <View style={styles.centerControls}>
              <Pressable style={styles.skipButton} onPress={() => handleSkip(-10)}>
                <Back10Icon size={scale(32)} />
              </Pressable>

              <Pressable style={styles.playPauseButton} onPress={handlePlayPause}>
                {ended ? (
                  <ReplayIcon size={scale(48)} />
                ) : paused ? (
                  <PlayIcon size={scale(48)} />
                ) : (
                  <PauseIcon size={scale(48)} />
                )}
              </Pressable>

              <Pressable style={styles.skipButton} onPress={() => handleSkip(10)}>
                <Forward10Icon size={scale(32)} />
              </Pressable>
            </View>

            {/* Bottom controls */}
            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={duration}
                  value={currentTime}
                  onSlidingComplete={handleSeek}
                  minimumTrackTintColor={brand.teal}
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor={brand.teal}
                />
              </View>

              <Text style={styles.timeText}>{formatTime(duration)}</Text>

              <Pressable style={styles.muteButton} onPress={() => setMuted(!muted)}>
                {muted ? (
                  <MuteIcon size={scale(24)} />
                ) : (
                  <VolumeIcon size={scale(24)} />
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* Large play button when paused and controls hidden */}
        {paused && !showControls && !loading && (
          <Pressable style={styles.largePauseOverlay} onPress={handleTap}>
            <View style={styles.largePlayButton}>
              <PlayIcon size={scale(64)} />
            </View>
          </Pressable>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 1000,
  },
  videoWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  closeButton: {
    position: "absolute",
    top: scale(40),
    left: scale(16),
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  centerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(40),
  },
  playPauseButton: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  skipButton: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomControls: {
    position: "absolute",
    bottom: scale(20),
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    gap: scale(8),
  },
  timeText: {
    color: "white",
    fontSize: fontScale(12),
    fontWeight: "500",
    minWidth: scale(40),
  },
  sliderContainer: {
    flex: 1,
    height: scale(40),
    justifyContent: "center",
  },
  slider: {
    width: "100%",
    height: scale(40),
  },
  muteButton: {
    padding: scale(8),
  },
  largePauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  largePlayButton: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});
