import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { VideoPlayer } from "./VideoPlayer";
import { SavedVideo } from "../types";
import { sharedStyles, colors } from "../styles";

interface LibraryScreenProps {
  // State
  savedVideos: SavedVideo[];
  currentVideo: string | null;
  isFromLibrary: boolean;

  // Actions
  onPlayVideo: (uri: string, fromLibrary: boolean) => void;
  onDeleteVideo: (videoId: string) => void;
  onSaveToGallery: () => void;
  onDiscardVideo: () => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  savedVideos,
  currentVideo,
  isFromLibrary,
  onPlayVideo,
  onDeleteVideo,
  onSaveToGallery,
  onDiscardVideo,
}) => {
  // Video playback screen (when playing from library)
  if (currentVideo && isFromLibrary) {
    return (
      <VideoPlayer
        videoUri={currentVideo}
        onSaveToGallery={onSaveToGallery}
        onExit={onDiscardVideo}
        isFromLibrary={true}
      />
    );
  }

  // Main library screen
  return (
    <View style={sharedStyles.container}>
      <Text style={[sharedStyles.title, styles.libraryTitle]}>
        Video Library ({savedVideos.length})
      </Text>

      {savedVideos.length === 0 ? (
        <View style={sharedStyles.centeredContainer}>
          <Text style={[sharedStyles.subtitle, styles.emptyText]}>
            No videos saved yet
          </Text>
          <Text style={sharedStyles.caption}>
            Process and save videos to build your library!
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.libraryList}
          showsVerticalScrollIndicator={false}
        >
          {savedVideos.map((video) => (
            <VideoItem
              key={video.id}
              video={video}
              onPlay={() => onPlayVideo(video.localUri, true)}
              onDelete={() => onDeleteVideo(video.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

// Video item component
interface VideoItemProps {
  video: SavedVideo;
  onPlay: () => void;
  onDelete: () => void;
}

const VideoItem: React.FC<VideoItemProps> = ({ video, onPlay, onDelete }) => (
  <View style={styles.libraryItem}>
    <View style={styles.videoPreview}>
      <Video
        source={{ uri: video.localUri }}
        style={styles.thumbnailVideo}
        shouldPlay={false}
        isLooping={false}
        resizeMode={ResizeMode.COVER}
      />
    </View>

    <View style={styles.videoInfo}>
      <Text style={styles.videoTitle}>{video.title}</Text>
      <Text style={styles.videoDate}>
        {new Date(video.date).toLocaleDateString()} at{" "}
        {new Date(video.date).toLocaleTimeString()}
      </Text>
      {/* add cloud sync indicator here later */}
    </View>

    <View style={styles.videoActions}>
      <TouchableOpacity style={styles.playButton} onPress={onPlay}>
        <Text style={styles.actionButtonText}>PLAY</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.actionButtonText}>DELETE</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  libraryTitle: {
    marginTop: 20,
    marginBottom: 20,
  },
  emptyText: {
    marginBottom: 10,
  },
  libraryList: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  libraryItem: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  videoPreview: {
    width: 80,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 15,
  },
  thumbnailVideo: {
    width: "100%",
    height: "100%",
  },
  videoInfo: {
    flex: 1,
    marginRight: 10,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 5,
  },
  videoDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  videoActions: {
    flexDirection: "column",
    gap: 8,
  },
  playButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
