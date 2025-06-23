// src/types/index.ts

export interface SavedVideo {
  id: string;
  title: string;
  date: string;
  localUri: string;
  cloudSynced?: boolean; // We'll add this for cloud backup later
}

export type Screen = "main" | "library";