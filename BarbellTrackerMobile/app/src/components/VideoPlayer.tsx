import React, { useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { sharedStyles, colors } from "../styles";

interface VideoPlayerProps {
  videoUri: string;
  onSaveToGallery: () => void;
  onSaveToLibrary?: () => void;
  onExit: () => void;
  isFromLibrary?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUri,
  onSaveToGallery,
  onSaveToLibrary,
  onExit,
  isFromLibrary = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [playbackStatus, setPlaybackStatus] = useState<any>(null);

  const videoRef = useRef<Video>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const controlsTimeout = useRef<number | null>(null);

  //start the initial timeout when component mounts
  React.useEffect(() => {
    showControlsWithTimeout();

    //cleanup timeout on unmount
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
    resetControlsTimeout(); //reset timeout when user interacts
  };

  const handleVideoTap = () => {
    if (showControls) {
      //if controls are showing, hide them immediately
      hideControls();
    } else {
      //if controls are hidden, show them with timeout
      showControlsWithTimeout();
    }
  };

  const showControlsWithTimeout = () => {
    setShowControls(true);

    //fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    //clear existing timeout
    if (controlsTimeout.current !== null) {
      clearTimeout(controlsTimeout.current);
    }

    //hide controls after x seconds of inactivity
    controlsTimeout.current = setTimeout(() => {
      hideControls();
    }, 1250);
  };

  const hideControls = () => {
    //clear timeout
    if (controlsTimeout.current !== null) {
      clearTimeout(controlsTimeout.current);
      controlsTimeout.current = null;
    }

    //fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowControls(false);
    });
  };

  //reset the timeout when user interacts with controls
  const resetControlsTimeout = () => {
    if (showControls) {
      //clear existing timeout
      if (controlsTimeout.current !== null) {
        clearTimeout(controlsTimeout.current);
      }

      //start new timeout
      controlsTimeout.current = setTimeout(() => {
        hideControls();
      }, 1250);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setPlaybackStatus(status);
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
    }
  };

  const getProgressPercentage = () => {
    if (playbackStatus?.isLoaded && playbackStatus.durationMillis) {
      return (
        (playbackStatus.positionMillis / playbackStatus.durationMillis) * 100
      );
    }
    return 0;
  };

  const seekToPosition = async (percentage: number) => {
    if (videoRef.current && playbackStatus?.durationMillis) {
      const position = (percentage / 100) * playbackStatus.durationMillis;
      await videoRef.current.setPositionAsync(position);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* video */}
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={handleVideoTap}
        activeOpacity={1}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={isPlaying}
          isLooping
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        />
      </TouchableOpacity>

      {/*controls overlay */}
      {showControls && (
        <Animated.View style={[styles.controlsOverlay, { opacity: fadeAnim }]}>
          {/* top controls */}
          <LinearGradient
            colors={["rgba(0, 0, 0, 0.8)", "transparent"]}
            style={styles.topControls}
          >
            <TouchableOpacity style={styles.exitButton} onPress={onExit}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </LinearGradient>

          {/*center controls */}
          <View style={styles.centerControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                videoRef.current?.setPositionAsync(
                  Math.max(0, (playbackStatus?.positionMillis || 0) - 10000)
                );
                resetControlsTimeout();
              }}
            >
              <Ionicons name="play-back" size={32} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainPlayButton}
              onPress={togglePlayPause}
            >
              <LinearGradient
                colors={["#3b82f6", "#8b5cf6", "#06b6d4"]}
                style={styles.mainPlayButtonGradient}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={36}
                  color={colors.text}
                />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                videoRef.current?.setPositionAsync(
                  Math.min(
                    playbackStatus?.durationMillis || 0,
                    (playbackStatus?.positionMillis || 0) + 10000
                  )
                );
                resetControlsTimeout();
              }}
            >
              <Ionicons name="play-forward" size={32} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* bottom controls */}
          <LinearGradient
            colors={["transparent", "rgba(0, 0, 0, 0.8)"]}
            style={styles.bottomControls}
          >
            {/* progress Bar */}
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>
                {playbackStatus?.positionMillis
                  ? formatTime(playbackStatus.positionMillis)
                  : "0:00"}
              </Text>

              <TouchableOpacity
                style={styles.progressBar}
                onPress={(event) => {
                  const { locationX } = event.nativeEvent;
                  const progressBarWidth = styles.progressBar.width || 200;
                  const percentage = (locationX / progressBarWidth) * 100;
                  seekToPosition(percentage);
                  resetControlsTimeout();
                }}
              >
                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${getProgressPercentage()}%` },
                    ]}
                  >
                    <LinearGradient
                      colors={["#3b82f6", "#8b5cf6", "#06b6d4"]}
                      style={styles.progressGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                </View>
              </TouchableOpacity>

              <Text style={styles.timeText}>
                {playbackStatus?.durationMillis
                  ? formatTime(playbackStatus.durationMillis)
                  : "0:00"}
              </Text>
            </View>

            {/* action buttons */}
            <View style={styles.actionButtons}>
              <ActionButton
                icon="download-outline"
                label="Save to Gallery"
                onPress={onSaveToGallery}
                gradient={["#10b981", "#059669"]}
              />

              {!isFromLibrary && onSaveToLibrary && (
                <ActionButton
                  icon="library-outline"
                  label="Save to Library"
                  onPress={onSaveToLibrary}
                  gradient={["#f59e0b", "#d97706"]}
                />
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  gradient: [string, string, ...string[]];
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
  gradient,
}) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <LinearGradient colors={gradient} style={styles.actionButtonGradient}>
      <Ionicons name={icon} size={20} color={colors.text} />
      <Text style={styles.actionButtonText}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: screenWidth,
    height: screenHeight,
  },
  playButtonGradient: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
  controlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  exitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  centerControls: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 48,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  mainPlayButton: {
    borderRadius: 40,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  mainPlayButtonGradient: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomControls: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 32,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  timeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    minWidth: 40,
    textAlign: "center",
  },
  progressBar: {
    flex: 1,
    height: 6,
    width: 200, //added for calculation purposes
  },
  progressBackground: {
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressGradient: {
    width: "100%",
    height: "100%",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  actionButton: {
    borderRadius: 25,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: 0.5,
  },
});
