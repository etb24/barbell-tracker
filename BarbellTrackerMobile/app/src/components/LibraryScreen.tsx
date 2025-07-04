import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { VideoPlayer } from "./VideoPlayer";
import { SavedVideo } from "../types";
import { sharedStyles, colors } from "../styles";

interface LibraryScreenProps {
  savedVideos: SavedVideo[];
  currentVideo: string | null;
  isFromLibrary: boolean;
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
  //video playback screen
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

  //main library screen
  return (
    <View style={sharedStyles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.libraryTitle}>Video Library</Text>
          <Text style={styles.videoCount}>
            {savedVideos.length} videos saved
          </Text>
        </View>
        <View style={styles.badge}>
          <LinearGradient
            colors={["#3b82f6", "#8b5cf6"]}
            style={styles.badgeGradient}
          >
            <Text style={styles.badgeText}>{savedVideos.length}</Text>
          </LinearGradient>
        </View>
      </View>

      {/* content */}
      {savedVideos.length === 0 ? (
        <EmptyLibraryState />
      ) : (
        <ScrollView
          style={styles.libraryList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {savedVideos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              index={index}
              onPlay={() => onPlayVideo(video.localUri, true)}
              onDelete={() => onDeleteVideo(video.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const EmptyLibraryState = () => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconContainer}>
      <Ionicons name="library-outline" size={64} color={colors.textMuted} />
    </View>
    <Text style={styles.emptyTitle}>No videos yet</Text>
    <Text style={styles.emptySubtitle}>
      Upload and process videos to build your library
    </Text>
  </View>
);

interface VideoCardProps {
  video: SavedVideo;
  index: number;
  onPlay: () => void;
  onDelete: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  index,
  onPlay,
  onDelete,
}) => {
  const handleDelete = () => {
    Alert.alert(
      "Delete Video",
      `Are you sure you want to remove "${video.title}" from your library?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={[styles.videoCard, { marginTop: index === 0 ? 0 : 16 }]}>
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
        style={styles.cardGradient}
      >
        {/* thumbnail */}
        <View style={styles.thumbnailSection}>
          <View style={styles.thumbnailContainer}>
            <Video
              source={{ uri: video.localUri }}
              style={styles.thumbnail}
              shouldPlay={false}
              isLooping={false}
              resizeMode={ResizeMode.COVER}
            />
            <TouchableOpacity style={styles.playOverlay} onPress={onPlay}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={24} color={colors.text} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* thumbnail content */}
        <View style={styles.contentSection}>
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle}>{video.title}</Text>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.videoDate}>
                {formatDate(video.date)} • {formatTime(video.date)}
              </Text>
            </View>
          </View>

          {/* action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.playActionButton}
              onPress={onPlay}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="play" size={16} color={colors.text} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <View style={styles.deleteButtonBg}>
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={colors.danger}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  libraryTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  videoCount: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  badge: {
    borderRadius: 16,
    overflow: "hidden",
    marginLeft: 16,
    marginTop: 4,
  },
  badgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  libraryList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  videoCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardGradient: {
    backgroundColor: colors.surface,
  },
  thumbnailSection: {
    padding: 16,
  },
  thumbnailContainer: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 30,
    padding: 15,
  },
  contentSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  videoInfo: {
    flex: 1,
    marginRight: 12,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 6,
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  videoDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  playActionButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  actionButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    borderRadius: 12,
  },
  deleteButtonBg: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: 12,
  },
});
