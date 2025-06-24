import AsyncStorage from "@react-native-async-storage/async-storage";
import { SavedVideo } from "../types";
import { STORAGE_KEYS } from "../constants";

export const storageService = {
  // Load videos from AsyncStorage
  loadSavedVideos: async (): Promise<SavedVideo[]> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_VIDEOS);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error("Failed to load saved videos:", error);
      return [];
    }
  },

  // Save videos to AsyncStorage
  saveVideosToStorage: async (videos: SavedVideo[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_VIDEOS, JSON.stringify(videos));
    } catch (error) {
      console.error("Failed to save videos:", error);
      throw error;
    }
  },

  // Add a video to storage
  addVideoToStorage: async (video: SavedVideo, existingVideos: SavedVideo[]): Promise<SavedVideo[]> => {
    const updatedVideos = [video, ...existingVideos];
    await storageService.saveVideosToStorage(updatedVideos);
    return updatedVideos;
  },

  // Remove a video from storage
  removeVideoFromStorage: async (videoId: string, existingVideos: SavedVideo[]): Promise<SavedVideo[]> => {
    const updatedVideos = existingVideos.filter((v) => v.id !== videoId);
    await storageService.saveVideosToStorage(updatedVideos);
    return updatedVideos;
  },
};