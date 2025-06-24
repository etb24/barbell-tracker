// src/types/index.ts

export interface SavedVideo {
  id: string;
  title: string;
  date: string;
  localUri: string;
}

export type Screen = "main" | "library";