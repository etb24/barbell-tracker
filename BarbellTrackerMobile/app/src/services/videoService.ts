import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Alert } from "react-native";
import { API_URL, ALBUM_NAME } from "../constants";

export const videoService = {
  //test API connection (testing purposes)
  testConnection: async (): Promise<void> => {
    try {
      console.log("Testing connection to:", API_URL);
      const response = await fetch(`${API_URL}/`);
      const data = await response.json();
      Alert.alert("Success!", `Connected: ${data.message}`);
    } catch (error) {
      console.error("Connection test failed:", error);
      Alert.alert("Connection Failed", `Cannot reach ${API_URL}`);
    }
  },

  //upload video from library
  uploadVideo: async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant photo library access to upload videos"
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  },

  //process video through API
  processVideo: async (videoUri: string): Promise<string> => {
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

    //get the raw response text
    const responseText = await response.text();

    //try to parse JSON
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

      //convert blob to base64 and save locally
      return new Promise((resolve, reject) => {
        const fileReaderInstance = new FileReader();
        
        fileReaderInstance.onload = async () => {
          try {
            const base64data = fileReaderInstance.result
              ?.toString()
              .split(",")[1];
            if (base64data) {
              const fileUri =
                FileSystem.documentDirectory + `processed_${Date.now()}.mp4`;

              await FileSystem.writeAsStringAsync(fileUri, base64data, {
                encoding: FileSystem.EncodingType.Base64,
              });

              resolve(fileUri);
            } else {
              reject(new Error("Failed to convert video to base64"));
            }
          } catch (error) {
            reject(error);
          }
        };

        fileReaderInstance.onerror = (error) => {
          console.error("FileReader error:", error);
          reject(new Error("FileReader failed"));
        };

        fileReaderInstance.readAsDataURL(blob);
      });
    } else {
      console.error("Invalid response structure:");
      console.error("success:", result.success);
      console.error("download_url:", result.download_url);
      throw new Error("Invalid response: missing success or download_url");
    }
  },

  //save video to device photo library
  saveVideoToGallery: async (videoUri: string): Promise<void> => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant media library access to save videos"
      );
      return;
    }

    try {
      const asset = await MediaLibrary.createAssetAsync(videoUri);

      const album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);

      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
      } else {
        await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset, false);
      }

      Alert.alert(
        "Saved!",
        `Video saved to your photo library in "${ALBUM_NAME}" album`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save video");
      console.error(error);
      throw error;
    }
  },
};