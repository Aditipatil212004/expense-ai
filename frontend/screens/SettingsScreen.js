// javascript
import { View, Text, StyleSheet, Switch, ScrollView } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.subtitle}>Preferences</Text>
            <Text style={styles.title}>Settings</Text>
          </View>
          <View style={styles.headerIconContainer}>
            <Ionicons name="settings" size={24} color="#8b5cf6" />
          </View>
        </View>

        {/* APPEARANCE SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.card}>
            <SettingItem
              icon="moon"
              text="Dark Mode"
              subtitle="Switch between light and dark theme"
              value={darkMode}
              onValueChange={setDarkMode}
            />
          </View>
        </View>

        {/* NOTIFICATIONS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.card}>
            <SettingItem
              icon="notifications"
              text="Push Notifications"
              subtitle="Get alerts for transactions and updates"
              value={notifications}
              onValueChange={setNotifications}
              hideDivider
            />
          </View>
        </View>

        {/* SECURITY SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <View style={styles.card}>
            <SettingItem
              icon="finger-print"
              text="Biometric Login"
              subtitle="Use fingerprint or face ID"
              value={biometric}
              onValueChange={setBiometric}
            />
            <SettingItem
              icon="cloud-upload"
              text="Auto Backup"
              subtitle="Automatically backup your data"
              value={autoBackup}
              onValueChange={setAutoBackup}
              hideDivider
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const SettingItem = ({ icon, text, subtitle, value, onValueChange, hideDivider }) => (
  <View style={styles.item}>
    <View style={styles.itemLeft}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color="#8b5cf6" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemText}>{text}</Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    
    <Switch 
      value={value} 
      onValueChange={onValueChange}
      trackColor={{ false: "#334155", true: "#8b5cf6" }}
      thumbColor={value ? "#fff" : "#cbd5e1"}
      ios_backgroundColor="#334155"
    />
    
    {!hideDivider && <View style={styles.itemDivider} />}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },

  subtitle: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  title: {
    color: "#f1f5f9",
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  headerIconContainer: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    position: "relative",
  },

  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },

  iconContainer: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  itemContent: {
    flex: 1,
  },

  itemText: {
    color: "#f1f5f9",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  itemSubtitle: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },

  itemDivider: {
    position: "absolute",
    bottom: 0,
    left: 80,
    right: 18,
    height: 1,
    backgroundColor: "#334155",
  },
});
