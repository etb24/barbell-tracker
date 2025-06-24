import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { sharedStyles, colors } from "../styles";

interface VideoPlayerProps {
  videoUri: string;
  onSaveToGallery: () => void;
  onSaveToLibrary?: () => void;
  onExit: () => void;
  isFromLibrary?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUri,
  onSaveToGallery,
  onSaveToLibrary,
  onExit,
  isFromLibrary = false,
}) => {
  return (
    <View style={sharedStyles.container}>
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: videoUri }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          isLooping
        />
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.saveButton} onPress={onSaveToGallery}>
          <Text style={sharedStyles.buttonText}>SAVE TO GALLERY</Text>
        </TouchableOpacity>

        {!isFromLibrary && onSaveToLibrary && (
          <TouchableOpacity
            style={styles.libraryButton}
            onPress={onSaveToLibrary}
          >
            <Text style={sharedStyles.buttonText}>SAVE TO LIBRARY</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.discardButton} onPress={onExit}>
          <Text style={sharedStyles.buttonText}>EXIT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  actionButtons: {
    flexDirection: "column",
    position: "absolute",
    bottom: 25,
    gap: 15,
    alignItems: "center",
  },
  saveButton: {
    ...sharedStyles.button,
    backgroundColor: colors.success,
  },
  libraryButton: {
    ...sharedStyles.button,
    backgroundColor: colors.warning,
  },
  discardButton: {
    ...sharedStyles.button,
    backgroundColor: colors.danger,
    paddingHorizontal: 40,
  },
});
