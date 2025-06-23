// index.tsx

import React, { useState, useEffect } from "react";
import { SafeAreaView, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";

// Components
import { MainScreen } from "./src/components/MainScreen";
import { LibraryScreen } from "./src/components/LibraryScreen";
import { TabBar } from "./src/components/TabBar";

// Services
import { videoService } from "./src/services/videoService";
import { storageService } from "./src/services/storageService";

// Types and styles
import { SavedVideo, Screen } from "./src/types";
import { sharedStyles } from "./src/styles";

export default function App() {
  // Navigation state
  const [currentScreen, setCurrentScreen] = useState<Screen>("main");

  // Video processing state
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Video playback state
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [isFromLibrary, setIsFromLibrary] = useState(false);

  // Library state
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);

  // Load saved videos when app starts
  useEffect(() => {
    loadSavedVideos();
  }, []);

  // Load videos from storage
  const loadSavedVideos = async () => {
    const videos = await storageService.loadSavedVideos();
    setSavedVideos(videos);
  };

  // Handle video upload
  const handleUploadVideo = async () => {
    const videoUri = await videoService.uploadVideo();
    if (videoUri) {
      setSelectedVideo(videoUri);
      await handleProcessVideo(videoUri);
    }
  };

  // Handle video processing
  const handleProcessVideo = async (videoUri: string) => {
    setIsProcessing(true);

    try {
      const processedUri = await videoService.processVideo(videoUri);
      setProcessedVideo(processedUri);
      setCurrentVideo(processedUri);
      setIsFromLibrary(false);
      setSelectedVideo(null);
    } catch (error) {
      console.error("=== PROCESSING ERROR ===");

      if (error instanceof Error) {
        console.error("Error message:", error.message);
        Alert.alert("Error", `Failed to process video: ${error.message}`);
      } else {
        console.error("Unknown error:", error);
        Alert.alert("Error", "Failed to process video: Unknown error");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle saving video to device gallery
  const handleSaveToGallery = async () => {
    if (!currentVideo) return;

    try {
      await videoService.saveVideoToGallery(currentVideo);
      handleDiscardVideo();
    } catch (error) {
      // Error is handled in the service
    }
  };

  // Handle saving video to app library
  const handleSaveToLibrary = async () => {
    if (!processedVideo) {
      Alert.alert("Error", "No processed video to save");
      return;
    }

    try {
      const newVideo: SavedVideo = {
        id: Date.now().toString(),
        title: `Workout ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString(),
        localUri: processedVideo,
      };

      const updatedVideos = await storageService.addVideoToStorage(
        newVideo,
        savedVideos
      );
      setSavedVideos(updatedVideos);

      Alert.alert("Saved!", "Video saved to your library", [
        { text: "OK", onPress: handleDiscardVideo },
      ]);
    } catch (error) {
      console.error("Failed to save video:", error);
      Alert.alert("Error", "Failed to save video to library");
    }
  };

  // Handle video deletion from library
  const handleDeleteVideo = async (videoId: string) => {
    Alert.alert(
      "Delete Video",
      "Are you sure you want to remove this video from your library?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedVideos = await storageService.removeVideoFromStorage(
                videoId,
                savedVideos
              );
              setSavedVideos(updatedVideos);
            } catch (error) {
              console.error("Failed to delete video:", error);
            }
          },
        },
      ]
    );
  };

  // Handle video playback
  const handlePlayVideo = (uri: string, fromLibrary = false) => {
    setCurrentVideo(uri);
    setIsFromLibrary(fromLibrary);
  };

  // Handle discarding current video
  const handleDiscardVideo = () => {
    setProcessedVideo(null);
    setSelectedVideo(null);
    setCurrentVideo(null);
    setIsFromLibrary(false);
  };

  return (
    <SafeAreaView style={sharedStyles.safeArea}>
      <StatusBar style="light" />

      {/* Screen Content */}
      {currentScreen === "main" ? (
        <MainScreen
          selectedVideo={selectedVideo}
          processedVideo={processedVideo}
          isProcessing={isProcessing}
          currentVideo={currentVideo}
          isFromLibrary={isFromLibrary}
          onUploadVideo={handleUploadVideo}
          onTestConnection={videoService.testConnection}
          onSaveToGallery={handleSaveToGallery}
          onSaveToLibrary={handleSaveToLibrary}
          onDiscardVideo={handleDiscardVideo}
        />
      ) : (
        <LibraryScreen
          savedVideos={savedVideos}
          currentVideo={currentVideo}
          isFromLibrary={isFromLibrary}
          onPlayVideo={handlePlayVideo}
          onDeleteVideo={handleDeleteVideo}
          onSaveToGallery={handleSaveToGallery}
          onDiscardVideo={handleDiscardVideo}
        />
      )}

      {/* Bottom Tab Bar */}
      <TabBar
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        libraryCount={savedVideos.length}
      />
    </SafeAreaView>
  );
}
