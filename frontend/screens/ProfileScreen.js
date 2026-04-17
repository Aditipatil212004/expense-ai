
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
} from "react-native";
import { Animated } from "react-native";
import * as Haptics from 'expo-haptics';
import { useRef } from "react";
import { useLayoutEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator } from "react-native";

import React, { useCallback } from 'react';
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearSession } from "../services/authSession";
import { Linking } from "react-native";


export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
// const scaleAnim = useRef(new Animated.Value(1)).current; // Fixed: moved to ProfileItem local
  const badgeAnim = useRef(new Animated.Value(1)).current;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: { backgroundColor: 'transparent' },
      headerTintColor: '#ffffff',
      headerTransparent: true,
      headerTitle: '',
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 24 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    badgeAnim.addListener(({ value }) => {
      if (value === 1) {
        Animated.sequence([
          Animated.timing(badgeAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(badgeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          })
        ]).start();
      }
    });
    badgeAnim.setValue(1);
  }, []);

  useFocusEffect(
    useCallback(() => {
     const getUser = async () => {
  try {
    const data = await AsyncStorage.getItem("user");
    if (data) {
      setUser(JSON.parse(data));
    }
  } catch (error) {
    console.error('Error loading user:', error);
  } finally {
    setLoading(false); // ✅ THIS LINE FIXES IT
  }
};
      getUser();
    }, [])
  );
  const showHelp = () => {
  navigation.navigate('HelpSupport');
};

  const logout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel" },
        {
          text: "Logout",
          onPress: async () => {
            await clearSession();

            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
        },
      ]
    );
  };

  const showAbout = () => {
    Alert.alert(
      "About Expense Tracker",
      "Version 1.0.0\n\nA modern expense tracking application to manage your finances efficiently.\n\n© 2024 Expense Tracker",
      [{ text: "OK" }]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* PROFILE HEADER CARD */}
        <View style={styles.headerCard}>
          <LinearGradient
            colors={["#8b5cf6", "#7c3aed","#6d28d9","#5b21b6","#4c1d95"]}
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
                  source={{ uri: user?.avatarUrl || "https://i.pravatar.cc/150" }}
                  style={styles.avatar}
                />
                <Animated.View style={[styles.avatarBadge, { transform: [{ scale: badgeAnim }] }]}>
  <Ionicons name="checkmark" size={16} color="#fff" />
</Animated.View>
              </View>
            </View>

            <Text style={styles.name}>{user?.name || "User"}</Text>
            <Text style={styles.email}>{user?.email || "No email"}</Text>

            </LinearGradient>
        </View>

        {/* ACCOUNT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.optionsCard}>
            <ProfileItem 
              icon="person-outline" 
              text="Edit Profile" 
              subtitle="Update your personal information"
              onPress={() => navigation.navigate("EditProfile")}
              hideDivider
            />
          </View>
        </View>

        {/* SUPPORT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.optionsCard}>
            <ProfileItem 
              icon="help-circle-outline" 
              text="Help & Support" 
              subtitle="Get help with the app"
              onPress={showHelp} />
            <ProfileItem 
              icon="information-circle-outline" 
              text="About" 
              subtitle="App version and info"
              onPress={showAbout}
              hideDivider
            />
          </View>
        </View>


        {/* LOGOUT BUTTON */}
<TouchableOpacity 
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Logout of account"
        >
          <LinearGradient
            colors={["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 0.05)"]}
            style={styles.logoutGradient}
          />
          <View style={styles.logoutContent}>
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
            <Ionicons name="chevron-forward" size={22} color="#ef4444" />
          </View>
        </TouchableOpacity>

        <Text style={styles.appVersion}>Version 1.0.0</Text>

     </ScrollView>
</SafeAreaView>
  );
}

const ProfileItem = ({ icon, text, subtitle, onPress, hideDivider }) => {
  const localScaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.spring(localScaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 200,
    }).start(() => {
      Animated.spring(localScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
      }).start();
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity 
      style={[styles.item, { transform: [{ scale: localScaleAnim }] }]} 
      activeOpacity={0.85}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={text}
    >
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
};
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
    width: 120,
    height: 120,
    borderRadius: 60,
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
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: -0.8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  email: {
    color: "#e9d5ff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.2,
    opacity: 0.9,
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
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    position: "relative",
  },

  itemPress: {
  
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
    marginTop: 12,
    marginBottom: 24,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(239, 68, 68, 0.4)",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },

  logoutGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    opacity: 0.1,
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
