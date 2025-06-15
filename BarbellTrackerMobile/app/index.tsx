import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";

export default function App() {
  const [isConnected, setIsConnected] = useState(false);

  // IMPORTANT: Update this with your computer's IP address!
  // Windows: Run 'ipconfig' in cmd
  // Mac/Linux: Run 'ifconfig' in terminal
  const API_URL = "http://YOUR.IP.ADDRESS:8000"; // e.g., 'http://192.168.1.5:8000'

  const testConnection = async () => {
    try {
      console.log("Testing connection to:", API_URL);
      const response = await fetch(`${API_URL}/`);
      const data = await response.json();

      setIsConnected(true);
      Alert.alert(
        "✅ Success!",
        `Connected to: ${data.message}\n\nYou're ready to build the app!`
      );
    } catch (error) {
      console.error("Connection error:", error);
      Alert.alert(
        "Connection Failed",
        `Could not connect to ${API_URL}\n\n` +
          "Make sure:\n" +
          "1. Your Python API is running (python run_api.py)\n" +
          "2. You updated API_URL with your computer's IP\n" +
          "3. Both devices are on the same Wi-Fi network\n" +
          "4. Your firewall allows port 8000"
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>Barbell Path Tracker</Text>
        <Text style={styles.subtitle}>Mobile App</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 Development Setup</Text>
          <Text style={styles.cardText}>
            Platform: {Platform.OS === "ios" ? "iOS" : "Android"}
            {"\n"}
            Expo SDK: 49.0{"\n"}
            API URL: {API_URL}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isConnected && styles.successButton]}
          onPress={testConnection}
        >
          <Text style={styles.buttonText}>
            {isConnected ? "✅ API Connected" : "🔌 Test API Connection"}
          </Text>
        </TouchableOpacity>

        <View style={styles.nextSteps}>
          <Text style={styles.nextStepsTitle}>Next Steps:</Text>
          <Text style={styles.nextStepsText}>
            1. Get API connection working{"\n"}
            2. Add video selection{"\n"}
            3. Process videos{"\n"}
            4. Display results
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    backgroundColor: "#1a73e8",
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: "#ccc",
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#1a73e8",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#1a73e8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  successButton: {
    backgroundColor: "#0f9d58",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  nextSteps: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  nextStepsText: {
    fontSize: 16,
    color: "#ccc",
    lineHeight: 28,
  },
});
