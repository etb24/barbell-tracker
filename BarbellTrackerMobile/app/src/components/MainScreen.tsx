import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { VideoPlayer } from "./VideoPlayer";
import { sharedStyles, colors } from "../styles";

interface MainScreenProps {
  //state
  selectedVideo: string | null;
  processedVideo: string | null;
  isProcessing: boolean;
  currentVideo: string | null;
  isFromLibrary: boolean;

  //actions
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
  //initial screen - upload button
  if (!selectedVideo && !processedVideo && !isProcessing) {
    return (
      <View style={sharedStyles.container}>
        <TouchableOpacity style={styles.uploadButton} onPress={onUploadVideo}>
          <Text style={styles.uploadButtonText}>UPLOAD</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={onTestConnection}>
          <Text style={styles.testButtonText}>Test Connection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  //processing screen
  if (isProcessing) {
    return (
      <View style={sharedStyles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.processingText}>Processing your video...</Text>
      </View>
    );
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

  return null;
};

const styles = StyleSheet.create({
  uploadButton: {
    width: 275,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  uploadButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.background,
    letterSpacing: 2,
  },
  processingText: {
    color: colors.text,
    fontSize: 18,
    marginTop: 20,
  },
  testButton: {
    position: "absolute",
    bottom: 100,
    backgroundColor: colors.textMuted,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  testButtonText: {
    color: colors.text,
    fontSize: 14,
  },
});
