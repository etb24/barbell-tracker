// src/styles/index.ts

import { StyleSheet } from "react-native";

export const colors = {
  background: "#121212",
  surface: "#1e1e1e",
  primary: "#fff",
  success: "#4CAF50",
  warning: "#FF9500", 
  danger: "#f44336",
  text: "#fff",
  textSecondary: "#888",
  textMuted: "#666",
  border: "#333",
} as const;

export const sharedStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: "center",
  },
  caption: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});