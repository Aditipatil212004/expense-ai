// javascript
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const data = await AsyncStorage.getItem("user");
      if (data) {
        setUser(JSON.parse(data));
      }
    };

    getUser();
  }, []);

  const logout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel" },
        {
          text: "Logout",
          onPress: async () => {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");

            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* PROFILE HEADER CARD */}
        <View style={styles.headerCard}>
          <LinearGradient
            colors={["#8b5cf6", "#7c3aed", "#6d28d9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.decorativePattern}>
              <View style={styles.patternCircle1} />
              <View style={styles.patternCircle2} />
            </View>

            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: "https://i.pravatar.cc/150" }}
                  style={styles.avatar}
                />
                <View style={styles.avatarBadge}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              </View>
            </View>

            <Text style={styles.name}>{user?.name || "User"}</Text>
            <Text style={styles.email}>{user?.email || "No email"}</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>24</Text>
                <Text style={styles.statLabel}>Transactions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statLabel}>Budgets</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ACCOUNT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <View style={styles.optionsCard}>
            <ProfileItem 
              icon="person-outline" 
              text="Edit Profile" 
              subtitle="Update your personal information"
            />
            <ProfileItem 
              icon="lock-closed-outline" 
              text="Change Password" 
              subtitle="Update your security credentials"
            />
            <ProfileItem 
              icon="shield-checkmark-outline" 
              text="Privacy & Security" 
              subtitle="Manage your privacy settings"
              hideDivider
            />
          </View>
        </View>

        {/* PREFERENCES SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.optionsCard}>
            <ProfileItem 
              icon="notifications-outline" 
              text="Notifications" 
              subtitle="Manage notification settings"
            />
            <ProfileItem 
              icon="moon-outline" 
              text="Dark Mode" 
              subtitle="Switch app appearance"
            />
            <ProfileItem 
              icon="language-outline" 
              text="Language" 
              subtitle="Change app language"
              hideDivider
            />
          </View>
        </View>

        {/* SUPPORT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <View style={styles.optionsCard}>
            <ProfileItem 
              icon="help-circle-outline" 
              text="Help & Support" 
              subtitle="Get help with the app"
            />
            <ProfileItem 
              icon="information-circle-outline" 
              text="About" 
              subtitle="App version and info"
              hideDivider
            />
          </View>
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.9}
        >
          <View style={styles.logoutContent}>
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
            <Ionicons name="chevron-forward" size={20} color="#ef4444" />
          </View>
        </TouchableOpacity>

        <Text style={styles.appVersion}>Version 1.0.0</Text>

      </ScrollView>
    </View>
  );
}

const ProfileItem = ({ icon, text, subtitle, hideDivider }) => (
  <TouchableOpacity style={styles.item} activeOpacity={0.7}>
    <View style={styles.itemIconContainer}>
      <Ionicons name={icon} size={22} color="#8b5cf6" />
    </View>
    
    <View style={styles.itemContent}>
      <Text style={styles.itemText}>{text}</Text>
      {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
    </View>
    
    <Ionicons name="chevron-forward" size={20} color="#475569" />
    
    {!hideDivider && <View style={styles.itemDivider} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  scrollContent: {
    paddingBottom: 40,
  },

  headerCard: {
    marginBottom: 28,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 15,
  },

  headerGradient: {
    paddingTop: 80,
    paddingBottom: 32,
    paddingHorizontal: 24,
    overflow: "hidden",
    position: "relative",
  },

  decorativePattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  patternCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    top: -50,
    right: -50,
  },

  patternCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    bottom: -30,
    left: -30,
  },

  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatarWrapper: {
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  avatarBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#22c55e",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#8b5cf6",
  },

  name: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: -0.5,
  },

  email: {
    color: "#e9d5ff",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 24,
  },

  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },

  statLabel: {
    color: "#e9d5ff",
    fontSize: 12,
    fontWeight: "600",
  },

  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 16,
  },

  section: {
    paddingHorizontal: 20,
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

  optionsCard: {
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
    alignItems: "center",
    padding: 18,
    position: "relative",
  },

  itemIconContainer: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginBottom: 2,
  },

  itemSubtitle: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
  },

  itemDivider: {
    position: "absolute",
    bottom: 0,
    left: 76,
    right: 18,
    height: 1,
    backgroundColor: "#334155",
  },

  logoutButton: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: "#1e293b",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(239, 68, 68, 0.3)",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },

  logoutIconContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  logoutText: {
    flex: 1,
    color: "#ef4444",
    fontSize: 17,
    fontWeight: "700",
  },

  appVersion: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
});
