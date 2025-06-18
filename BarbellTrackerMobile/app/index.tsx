import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Video, ResizeMode } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { StatusBar } from "expo-status-bar";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function App() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // UPDATE THIS WITH YOUR COMPUTER'S IP ADDRESS!
  const API_URL = "http://YOUR.IP.ADDRESS:8000"; // e.g., 'http://192.168.1.5:8000'

  /* Test API connection function for development
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
  };*/

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
      mediaTypes: "videos",
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
      console.log("Starting upload to:", `${API_URL}/process`);
      console.log("Video URI:", videoUri);

      // Create form data
      const formData = new FormData();
      formData.append("file", {
        uri: videoUri,
        type: "video/mp4",
        name: "video.mp4",
      } as any);

      // Upload and process
      const response = await fetch(`${API_URL}/process`, {
        method: "POST",
        body: formData,
        // Remove the Content-Type header - let fetch set it automatically
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      // Save processed video
      const blob = await response.blob();
      const fileReaderInstance = new FileReader();

      fileReaderInstance.onload = async () => {
        const base64data = fileReaderInstance.result?.toString().split(",")[1];
        if (base64data) {
          const fileUri =
            FileSystem.documentDirectory + `processed_${Date.now()}.mp4`;
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          setProcessedVideo(fileUri);
          setSelectedVideo(null);
        }
      };

      fileReaderInstance.readAsDataURL(blob);
    } catch (error) {
      Alert.alert("Error", "Failed to process video. Please try again.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveVideo = async () => {
    if (!processedVideo) return;

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant media library access to save videos"
      );
      return;
    }

    try {
      const asset = await MediaLibrary.createAssetAsync(processedVideo);

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
  };

  // Initial screen - Upload button
  if (!selectedVideo && !processedVideo && !isProcessing) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <TouchableOpacity style={styles.uploadButton} onPress={uploadVideo}>
          <Text style={styles.uploadButtonText}>UPLOAD</Text>
        </TouchableOpacity>

        {/* Test button for API development and connection
        <TouchableOpacity style={styles.testButton} onPress={testConnection}>
          <Text style={styles.testButtonText}>Test Connection</Text>
        </TouchableOpacity> */}
      </View>
    );
  }

  // Processing screen
  if (isProcessing) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.processingText}>Processing your video...</Text>
      </View>
    );
  }

  // Video playback screen
  if (processedVideo) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: processedVideo }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={true}
            isLooping={true}
          />
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.saveButton} onPress={saveVideo}>
            <Text style={styles.buttonText}>SAVE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.discardButton} onPress={discardVideo}>
            <Text style={styles.buttonText}>DISCARD</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
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
    flexDirection: "row",
    position: "absolute",
    bottom: 50,
    gap: 20,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 50,
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
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  testButton: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "#666",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 14,
  },
});
