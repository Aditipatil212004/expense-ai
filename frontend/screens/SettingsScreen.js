import { View, Text, StyleSheet, Switch } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <SettingItem
          icon="moon-outline"
          text="Dark Mode"
          value={darkMode}
          onValueChange={setDarkMode}
        />

        <SettingItem
          icon="notifications-outline"
          text="Notifications"
          value={notifications}
          onValueChange={setNotifications}
        />
      </View>
    </View>
  );
}

const SettingItem = ({ icon, text, value, onValueChange }) => (
  <View style={styles.item}>
    <View style={styles.left}>
      <Ionicons name={icon} size={22} color="#8b5cf6" />
      <Text style={styles.text}>{text}</Text>
    </View>
    <Switch value={value} onValueChange={onValueChange} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a12",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 15,
    padding: 15,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    marginLeft: 15,
    fontSize: 16,
  },
});