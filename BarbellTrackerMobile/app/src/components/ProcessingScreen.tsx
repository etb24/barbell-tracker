// app/src/components/ProcessingScreen.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { sharedStyles, colors } from "../styles";

interface ProcessingScreenProps {
  progress?: number;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  progress = 0,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const progressValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    //spinning animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    //scale animation
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    scaleAnimation.start();

    return () => {
      spinAnimation.stop();
      scaleAnimation.stop();
    };
  }, []);

  useEffect(() => {
    Animated.timing(progressValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={sharedStyles.container}>
      <View style={styles.processingContainer}>
        {/* animated circle */}
        <Animated.View
          style={[
            styles.circleContainer,
            { transform: [{ scale: scaleValue }] },
          ]}
        >
          <Animated.View
            style={[styles.outerCircle, { transform: [{ rotate: spin }] }]}
          >
            <LinearGradient
              colors={["#3b82f6", "#8b5cf6", "#06b6d4"]}
              style={styles.gradientCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          <View style={styles.innerCircle}>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={styles.processingTitle}>Processing Video</Text>
          <Text style={styles.processingSubtitle}>Analyzing your form...</Text>

          {/* progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressValue.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                      extrapolate: "clamp",
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={["#3b82f6", "#8b5cf6", "#06b6d4"]}
                  style={styles.progressGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
            </View>
          </View>

          {/* processing steps */}
          <View style={styles.stepsContainer}>
            <ProcessingStep
              title="Uploading video"
              completed={progress > 20}
              active={progress <= 20}
            />
            <ProcessingStep
              title="Analyzing movement"
              completed={progress > 60}
              active={progress > 20 && progress <= 60}
            />
            <ProcessingStep
              title="Generating insights"
              completed={progress > 90}
              active={progress > 60 && progress <= 90}
            />
            <ProcessingStep
              title="Finalizing results"
              completed={progress >= 100}
              active={progress > 90 && progress < 100}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

interface ProcessingStepProps {
  title: string;
  completed: boolean;
  active: boolean;
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({
  title,
  completed,
  active,
}) => (
  <View style={styles.stepRow}>
    <View
      style={[
        styles.stepIndicator,
        completed && styles.stepCompleted,
        active && styles.stepActive,
      ]}
    >
      {completed && <View style={styles.stepCheck} />}
    </View>
    <Text
      style={[
        styles.stepText,
        completed && styles.stepTextCompleted,
        active && styles.stepTextActive,
      ]}
    >
      {title}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  processingContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  circleContainer: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  outerCircle: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  gradientCircle: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
    opacity: 0.8,
  },
  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    borderWidth: 3,
    borderColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  textContainer: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 30,
  },
  progressBarContainer: {
    width: "100%",
    maxWidth: 280,
    marginBottom: 40,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressGradient: {
    width: "100%",
    height: "100%",
  },
  stepsContainer: {
    width: "100%",
    maxWidth: 280,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surface,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  stepActive: {
    backgroundColor: "#3b82f6",
  },
  stepCompleted: {
    backgroundColor: colors.success,
  },
  stepCheck: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text,
  },
  stepText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  stepTextActive: {
    color: colors.textSecondary,
    fontWeight: "500",
  },
  stepTextCompleted: {
    color: colors.text,
    fontWeight: "500",
  },
});
