import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Screen } from "../types";
import { colors } from "../styles";

interface TabBarProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  libraryCount: number;
}

export const TabBar: React.FC<TabBarProps> = ({
  currentScreen,
  onScreenChange,
  libraryCount,
}) => {
  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, currentScreen === "main" && styles.activeTab]}
        onPress={() => onScreenChange("main")}
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
        onPress={() => onScreenChange("library")}
      >
        <Text
          style={[
            styles.tabText,
            currentScreen === "library" && styles.activeTabText,
          ]}
        >
          LIBRARY ({libraryCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  activeTab: {
    backgroundColor: colors.border,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  activeTabText: {
    color: colors.text,
  },
});
