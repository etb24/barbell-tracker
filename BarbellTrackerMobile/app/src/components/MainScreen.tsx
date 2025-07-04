import React, { useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { VideoPlayer } from "./VideoPlayer";
import { ProcessingScreen } from "./ProcessingScreen";
import { sharedStyles, colors } from "../styles";

interface MainScreenProps {
  selectedVideo: string | null;
  processedVideo: string | null;
  isProcessing: boolean;
  currentVideo: string | null;
  isFromLibrary: boolean;
  onUploadVideo: () => void;
  onTestConnection: () => void;
  onSaveToGallery: () => void;
  onSaveToLibrary: () => void;
  onDiscardVideo: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  selectedVideo,
  processedVideo,
  isProcessing,
  currentVideo,
  isFromLibrary,
  onUploadVideo,
  onTestConnection,
  onSaveToGallery,
  onSaveToLibrary,
  onDiscardVideo,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  //pulse animation for upload button
  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  //processing screen
  if (isProcessing) {
    return <ProcessingScreen />;
  }

  //video playback screen
  if (currentVideo) {
    return (
      <VideoPlayer
        videoUri={currentVideo}
        onSaveToGallery={onSaveToGallery}
        onSaveToLibrary={onSaveToLibrary}
        onExit={onDiscardVideo}
        isFromLibrary={isFromLibrary}
      />
    );
  }

  //main upload screen
  return (
    <View style={sharedStyles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>Barbell Tracker</Text>
        <Text style={styles.subtitle}>Analyze your lifting form</Text>
      </View>

      <View style={styles.uploadSection}>
        <Animated.View
          style={[
            styles.uploadButtonContainer,
            {
              transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={onUploadVideo}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          >
            <LinearGradient
              colors={["#3b82f6", "#8b5cf6", "#06b6d4"]}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={48}
                  color={colors.text}
                />
              </View>
              <Text style={styles.uploadButtonText}>UPLOAD VIDEO</Text>
              <Text style={styles.uploadSubtext}>Tap to select video</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* test connection button for testing purposes
      <View style={styles.footer}>
        <TouchableOpacity style={styles.testButton} onPress={onTestConnection}>
          <Text style={styles.testButtonText}>Test Connection</Text>
        </TouchableOpacity>
      </View>*/}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 60,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  uploadSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButtonContainer: {
    marginBottom: 40,
  },
  uploadButton: {
    width: 280,
    height: 280,
    borderRadius: 140,
    elevation: 20,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    borderRadius: 140,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 30,
    padding: 16,
    marginBottom: 16,
  },
  uploadButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    letterSpacing: 2,
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 0.5,
  },
  footer: {
    marginBottom: 40,
  },
  testButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.border,
  },
  testButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
});
