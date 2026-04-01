import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  // 🔁 LOAD USER
  useEffect(() => {
    const getUser = async () => {
      const data = await AsyncStorage.getItem("user");
      if (data) {
        setUser(JSON.parse(data));
      }
    };

    getUser();
  }, []);

  // 🚪 LOGOUT FUNCTION
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
      {/* Profile Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150" }}
          style={styles.avatar}
        />

        <Text style={styles.name}>
          {user?.name || "User"}
        </Text>

        <Text style={styles.email}>
          {user?.email || "No email"}
        </Text>
      </View>

      {/* Options */}
      <View style={styles.card}>
        <ProfileItem icon="person-outline" text="Edit Profile" />
        <ProfileItem icon="lock-closed-outline" text="Change Password" />
        <ProfileItem icon="notifications-outline" text="Notifications" />
      </View>

      {/* 🔥 LOGOUT BUTTON */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

// 🔹 Reusable item
const ProfileItem = ({ icon, text }) => (
  <TouchableOpacity style={styles.item}>
    <Ionicons name={icon} size={22} color="#8b5cf6" />
    <Text style={styles.itemText}>{text}</Text>
  </TouchableOpacity>
);

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a12",
    padding: 20,
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },

  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  email: {
    color: "#aaa",
  },

  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 15,
    padding: 15,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },

  itemText: {
    color: "#fff",
    marginLeft: 15,
    fontSize: 16,
  },

  logoutBtn: {
    marginTop: 30,
    backgroundColor: "#ef4444",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
});