// javascript
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import InputField from "../components/InputField";
import API from "../services/api";
import { clearSession, setSession } from "../services/authSession";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      Alert.alert("Missing Details", "Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      console.log("Calling API...");
      await clearSession();

      const res = await API.post("/auth/login", {
        email: normalizedEmail,
        password,
      });

      console.log("RESPONSE:", res.data);

      const token = res.data.token;

      await setSession({
        token,
        user: res.data.user,
      });

    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data || err.message);
      Alert.alert("Login Failed", err.response?.data?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#0f172a"]}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* DECORATIVE CIRCLES */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

          {/* LOGO/ICON SECTION */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <LinearGradient
                colors={["#8b5cf6", "#7c3aed"]}
                style={styles.logoGradient}
              >
                <Ionicons name="wallet" size={40} color="#fff" />
              </LinearGradient>
            </View>
          </View>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue tracking your finances</Text>
          </View>

          {/* FORM CARD */}
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <InputField
                icon="mail-outline"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <InputField
                icon="lock-closed-outline"
                placeholder="Enter your password"
                secure
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={login}
              disabled={loading}
            >
              <LinearGradient
                colors={["#8b5cf6", "#7c3aed"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, loading && styles.buttonDisabled]}
              >
                <Text style={styles.buttonText}>{loading ? "Signing In..." : "Sign In"}</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* DIVIDER */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* SOCIAL LOGIN */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={22} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={22} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="finger-print" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  gradient: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },

  decorativeCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(139, 92, 246, 0.08)",
    top: -100,
    right: -100,
  },

  decorativeCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(139, 92, 246, 0.05)",
    bottom: 100,
    left: -50,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },

  logoWrapper: {
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },

  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    marginBottom: 40,
    alignItems: "center",
  },

  title: {
    color: "#f1f5f9",
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: "center",
  },

  subtitle: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },

  formCard: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },

  inputGroup: {
    marginBottom: 24,
  },

  inputLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
    marginTop: -12,
  },

  forgotPasswordText: {
    color: "#8b5cf6",
    fontSize: 14,
    fontWeight: "700",
  },

  button: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    gap: 8,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#334155",
  },

  dividerText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
    marginHorizontal: 16,
  },

  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 32,
  },

  socialButton: {
    backgroundColor: "#1e293b",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  footerText: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "500",
  },

  footerLink: {
    color: "#8b5cf6",
    fontSize: 15,
    fontWeight: "700",
  },
});
