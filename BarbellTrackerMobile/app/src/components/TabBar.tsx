import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "../types";
import { colors } from "../styles";

interface TabBarProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

const { width: screenWidth } = Dimensions.get("window");
const tabWidth = screenWidth / 2;

export const TabBar: React.FC<TabBarProps> = ({
  currentScreen,
  onScreenChange,
}) => {
  const slideAnim = useRef(
    new Animated.Value(currentScreen === "main" ? 0 : tabWidth)
  ).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: currentScreen === "main" ? 0 : tabWidth,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [currentScreen, slideAnim]);

  const tabs = [
    {
      key: "main" as Screen,
      label: "Main",
      icon: "home-outline" as keyof typeof Ionicons.glyphMap,
      activeIcon: "home" as keyof typeof Ionicons.glyphMap,
    },
    {
      key: "library" as Screen,
      label: "Library",
      icon: "library-outline" as keyof typeof Ionicons.glyphMap,
      activeIcon: "library" as keyof typeof Ionicons.glyphMap,
    },
  ];

  return (
    <View style={styles.container}>
      {/* background */}
      <LinearGradient
        colors={["rgba(26, 26, 26, 0.95)", "rgba(26, 26, 26, 0.98)"]}
        style={styles.backdrop}
      />

      {/* sliding indicator */}
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            transform: [{ translateX: slideAnim }],
            width: tabWidth,
          },
        ]}
      >
        <LinearGradient
          colors={["#3b82f6", "#8b5cf6", "#06b6d4"]}
          style={styles.indicatorGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* tab buttons */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={currentScreen === tab.key}
            onPress={() => onScreenChange(tab.key)}
          />
        ))}
      </View>
    </View>
  );
};

interface TabButtonProps {
  tab: {
    key: Screen;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
    badge?: number;
  };
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ tab, isActive, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1.1 : 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: isActive ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive, scaleAnim, opacityAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.05 : 0.95,
      useNativeDriver: true,
      tension: 200,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.1 : 1,
      useNativeDriver: true,
      tension: 200,
    }).start();
  };

  return (
    <TouchableOpacity
      style={styles.tab}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.tabContent,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={isActive ? tab.activeIcon : tab.icon}
            size={24}
            color={isActive ? colors.text : colors.textSecondary}
          />
          {tab.badge !== undefined && tab.badge > 0 && (
            <View style={styles.badge}>
              <LinearGradient
                colors={["#ef4444", "#dc2626"]}
                style={styles.badgeGradient}
              >
                <Text style={styles.badgeText}>
                  {tab.badge > 99 ? "99+" : tab.badge}
                </Text>
              </LinearGradient>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.tabLabel,
            {
              color: isActive ? colors.text : colors.textSecondary,
              fontWeight: isActive ? "600" : "500",
            },
          ]}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 8,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  activeIndicator: {
    position: "absolute",
    top: 0,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  indicatorGradient: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    paddingTop: 16,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    position: "relative",
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -12,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background,
    overflow: "hidden",
  },
  badgeGradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
  },
});
