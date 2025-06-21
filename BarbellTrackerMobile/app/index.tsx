import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Video, ResizeMode } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Video metadata interface
interface SavedVideo {
  id: string;
  title: string;
  date: string;
  localUri: string;
}

type Screen = "main" | "library";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("main");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [isFromLibrary, setIsFromLibrary] = useState(false);

  // UPDATE THIS WITH YOUR COMPUTER'S IP ADDRESS!
  const API_URL = "http://YOUR.IP.ADDRESS:8000"; // e.g., 'http://192.168.1.5:8000'

  // Load saved videos when app starts
  useEffect(() => {
    loadSavedVideos();
  }, []);

  // Load videos from AsyncStorage
  const loadSavedVideos = async () => {
    try {
      const stored = await AsyncStorage.getItem("savedVideos");
      if (stored) {
        setSavedVideos(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load saved videos:", error);
    }
  };

  // Play video
  const playVideo = (uri: string, fromLibrary = false) => {
    setCurrentVideo(uri);
    setIsFromLibrary(fromLibrary);
  };

  // Save video to library
  const saveVideoToLibrary = async () => {
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

      const updatedVideos = [newVideo, ...savedVideos];
      setSavedVideos(updatedVideos);

      // Save to AsyncStorage
      await AsyncStorage.setItem("savedVideos", JSON.stringify(updatedVideos));

      Alert.alert("Saved!", "Video saved to your library", [
        { text: "OK", onPress: discardVideo },
      ]);
    } catch (error) {
      console.error("Failed to save video:", error);
      Alert.alert("Error", "Failed to save video to library");
    }
  };

  // Delete video from library
  const deleteVideoFromLibrary = async (videoId: string) => {
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
              const updatedVideos = savedVideos.filter((v) => v.id !== videoId);
              setSavedVideos(updatedVideos);
              await AsyncStorage.setItem(
                "savedVideos",
                JSON.stringify(updatedVideos)
              );
            } catch (error) {
              console.error("Failed to delete video:", error);
            }
          },
        },
      ]
    );
  };

  // Test API connection function for development
  const testConnection = async () => {
    try {
      console.log("Testing connection to:", API_URL);
      const response = await fetch(`${API_URL}/`);
      const data = await response.json();
      Alert.alert("Success!", `Connected: ${data.message}`);
    } catch (error) {
      console.error("Connection test failed:", error);
      Alert.alert("Connection Failed", `Cannot reach ${API_URL}`);
    }
  };

  const uploadVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant photo library access to upload videos"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedVideo(result.assets[0].uri);
      processVideo(result.assets[0].uri);
    }
  };

  const processVideo = async (videoUri: string) => {
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: videoUri,
        type: "video/mp4",
        name: "video.mp4",
      } as any);

      const response = await fetch(`${API_URL}/process`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      // Get the raw response text
      const responseText = await response.text();

      // Try to parse JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Response was:", responseText);
        throw new Error("Invalid JSON response from server");
      }

      if (result.success && result.download_url) {
        const videoResponse = await fetch(result.download_url);

        if (!videoResponse.ok) {
          throw new Error(`S3 download failed: ${videoResponse.status}`);
        }
        const blob = await videoResponse.blob();

        const fileReaderInstance = new FileReader();
        fileReaderInstance.onload = async () => {
          const base64data = fileReaderInstance.result
            ?.toString()
            .split(",")[1];
          if (base64data) {
            const fileUri =
              FileSystem.documentDirectory + `processed_${Date.now()}.mp4`;

            await FileSystem.writeAsStringAsync(fileUri, base64data, {
              encoding: FileSystem.EncodingType.Base64,
            });

            playVideo(fileUri, false);
            setProcessedVideo(fileUri); //come back to this
            setSelectedVideo(null);
          } else {
            throw new Error("Failed to convert video to base64");
          }
        };

        fileReaderInstance.onerror = (error) => {
          console.error("FileReader error:", error);
          throw new Error("FileReader failed");
        };

        fileReaderInstance.readAsDataURL(blob);
      } else {
        console.error("Invalid response structure:");
        console.error("success:", result.success);
        console.error("download_url:", result.download_url);
        throw new Error("Invalid response: missing success or download_url");
      }
    } catch (error) {
      console.error("=== PROCESSING ERROR ===");
      console.error("Error type:", typeof error);

      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        Alert.alert("Error", `Failed to process video: ${error.message}`);
      } else {
        console.error("Unknown error:", error);
        Alert.alert("Error", "Failed to process video: Unknown error");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const saveVideo = async () => {
    if (!currentVideo) return;

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant media library access to save videos"
      );
      return;
    }

    try {
      const asset = await MediaLibrary.createAssetAsync(currentVideo);

      const albumName = "Barbell Tracker";
      const album = await MediaLibrary.getAlbumAsync(albumName);

      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
      } else {
        await MediaLibrary.createAlbumAsync(albumName, asset, false);
      }

      Alert.alert(
        "Saved!",
        'Video saved to your photo library in "Barbell Tracker" album',
        [{ text: "OK", onPress: discardVideo }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save video");
      console.error(error);
    }
  };

  const discardVideo = () => {
    setProcessedVideo(null);
    setSelectedVideo(null);
    setCurrentVideo(null);
    setIsFromLibrary(false);
  };

  // Render main screen content
  const renderMainScreen = () => {
    // Initial screen - Upload button
    if (!selectedVideo && !processedVideo && !isProcessing) {
      return (
        <View style={styles.container}>
          <TouchableOpacity style={styles.uploadButton} onPress={uploadVideo}>
            <Text style={styles.uploadButtonText}>UPLOAD</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={testConnection}>
            <Text style={styles.testButtonText}>Test Connection</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Processing screen
    if (isProcessing) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>Processing your video...</Text>
        </View>
      );
    }

    // Video playback screen
    if (currentVideo) {
      return (
        <View style={styles.container}>
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: currentVideo }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping
            />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={saveVideo}>
              <Text style={styles.buttonText}>SAVE TO GALLERY</Text>
            </TouchableOpacity>

            {!isFromLibrary && (
              <TouchableOpacity
                style={styles.libraryButton}
                onPress={saveVideoToLibrary}
              >
                <Text style={styles.buttonText}>SAVE TO LIBRARY</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.discardButton}
              onPress={() => {
                discardVideo();
              }}
            >
              <Text style={styles.buttonText}>EXIT</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  // Render library screen
  const renderLibraryScreen = () => {
    if (currentVideo && isFromLibrary) {
      return (
        <View style={styles.container}>
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: currentVideo }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping
            />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={saveVideo}>
              <Text style={styles.buttonText}>SAVE TO GALLERY</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.discardButton}
              onPress={() => {
                discardVideo();
              }}
            >
              <Text style={styles.buttonText}>EXIT</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <Text style={styles.libraryTitle}>
          Video Library ({savedVideos.length})
        </Text>

        {savedVideos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No videos saved yet</Text>
            <Text style={styles.emptySubtext}>
              Process and save videos to build your library!
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.libraryList}
            showsVerticalScrollIndicator={false}
          >
            {savedVideos.map((video) => (
              <View key={video.id} style={styles.libraryItem}>
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
                </View>

                <View style={styles.videoActions}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => {
                      // Set the library video as processed video to view on library screen
                      playVideo(video.localUri, true);
                    }}
                  >
                    <Text style={styles.playButtonText}>PLAY</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteVideoFromLibrary(video.id)}
                  >
                    <Text style={styles.deleteButtonText}>DELETE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Screen Content */}
      {currentScreen === "main" ? renderMainScreen() : renderLibraryScreen()}

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, currentScreen === "main" && styles.activeTab]}
          onPress={() => setCurrentScreen("main")}
        >
          <Text
            style={[
              styles.tabText,
              currentScreen === "main" && styles.activeTabText,
            ]}
          >
            MAIN
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === "library" && styles.activeTab]}
          onPress={() => setCurrentScreen("library")}
        >
          <Text
            style={[
              styles.tabText,
              currentScreen === "library" && styles.activeTabText,
            ]}
          >
            LIBRARY ({savedVideos.length})
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButton: {
    width: 275,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  uploadButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: 2,
  },
  processingText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 20,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: "column",
    position: "absolute",
    bottom: 25,
    gap: 15,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  libraryButton: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  discardButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  testButton: {
    position: "absolute",
    bottom: 100,
    backgroundColor: "#666",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 14,
  },

  // Tab Bar Styles
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  activeTab: {
    backgroundColor: "#333",
  },
  tabText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  activeTabText: {
    color: "#fff",
  },

  // Library Styles
  libraryTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 20,
    letterSpacing: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  libraryList: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  libraryItem: {
    backgroundColor: "#1e1e1e",
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
    color: "#fff",
    marginBottom: 5,
  },
  videoDate: {
    fontSize: 12,
    color: "#888",
  },
  videoActions: {
    flexDirection: "column",
    gap: 8,
  },
  playButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    textAlign: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
