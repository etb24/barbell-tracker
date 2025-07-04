// app/src/styles/index.ts
import { StyleSheet } from "react-native";

export const colors = {
  //base colors
  background: "#0a0a0a",
  surface: "#1a1a1a",
  surfaceElevated: "#2a2a2a",
  
  //text colors
  text: "#ffffff",
  textSecondary: "#a1a1aa",
  textMuted: "#71717a",
  
  //brand colors
  primary: "#ffffff",
  
  //status colors
  success: "#10b981",
  warning: "#f59e0b", 
  danger: "#ef4444",
  
  //border and dividers
  border: "#27272a",
  
  //gradient definitions for enhanced UI
  gradient: {
    primary: ["#3b82f6", "#8b5cf6", "#06b6d4"],
    success: ["#10b981", "#059669"],
    warning: ["#f59e0b", "#d97706"],
    danger: ["#ef4444", "#dc2626"],
    surface: ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"],
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
} as const;

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

export const sharedStyles = StyleSheet.create({
  //layout
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
    paddingHorizontal: spacing.xl,
  },
  
  //buttons
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonSuccess: {
    backgroundColor: colors.success,
  },
  buttonWarning: {
    backgroundColor: colors.warning,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  
  //button Text
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.5,
    color: colors.text,
  },
  buttonTextPrimary: {
    color: colors.background,
  },
  buttonTextSecondary: {
    color: colors.text,
  },
  buttonTextLight: {
    color: colors.text,
  },
  
  //typography
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textAlign: "center",
  },
  heading: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  body: {
    fontSize: typography.sizes.base,
    color: colors.text,
    lineHeight: 24,
  },
  caption: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  
  //cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardElevated: {
    backgroundColor: colors.surfaceElevated,
    ...shadows.md,
  },
  
  //layout helpers
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  column: {
    flexDirection: "column",
  },
  
  //spacing utilities
  mt: {
    marginTop: spacing.md,
  },
  mb: {
    marginBottom: spacing.md,
  },
  ml: {
    marginLeft: spacing.md,
  },
  mr: {
    marginRight: spacing.md,
  },
  mx: {
    marginHorizontal: spacing.md,
  },
  my: {
    marginVertical: spacing.md,
  },
  pt: {
    paddingTop: spacing.md,
  },
  pb: {
    paddingBottom: spacing.md,
  },
  pl: {
    paddingLeft: spacing.md,
  },
  pr: {
    paddingRight: spacing.md,
  },
  px: {
    paddingHorizontal: spacing.md,
  },
  py: {
    paddingVertical: spacing.md,
  },
  
  // Input styles
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  
  //status styles
  statusSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  statusWarning: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  statusDanger: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  
  //animation helpers
  fadeIn: {
    opacity: 1,
  },
  fadeOut: {
    opacity: 0,
  },
  scaleUp: {
    transform: [{ scale: 1.05 }],
  },
  scaleDown: {
    transform: [{ scale: 0.95 }],
  },
});