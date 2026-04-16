// javascript
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import InputField from "../components/InputField";
import API from "../services/api";
import { setSession } from "../services/authSession";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      Alert.alert("Missing Details", "Please enter your name, email, and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/signup", {
        name: normalizedName,
        email: normalizedEmail,
        password,
      });

      const token = res.data.token;

      await setSession({
        token,
        user: res.data.user,
      });
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert("Signup Failed", err.response?.data?.message || "Unable to create your account.");
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
                <Ionicons name="person-add" size={36} color="#fff" />
              </LinearGradient>
            </View>
          </View>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and start managing your finances smartly</Text>
          </View>

          {/* FORM CARD */}
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <InputField
                icon="person-outline"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

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
                placeholder="Minimum 6 characters"
                secure
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.termsContainer}>
              <Ionicons name="shield-checkmark" size={16} color="#64748b" />
              <Text style={styles.termsText}>
                By signing up, you agree to our Terms & Privacy Policy
              </Text>
            </View>

            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={signup}
              disabled={loading}
            >
              <LinearGradient
                colors={["#8b5cf6", "#7c3aed"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, loading && styles.buttonDisabled]}
              >
                <Text style={styles.buttonText}>{loading ? "Creating..." : "Create Account"}</Text>
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

          {/* SOCIAL SIGNUP */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={22} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={22} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.footerLink}>Sign In</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
  },

  decorativeCircle1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(139, 92, 246, 0.08)",
    top: -80,
    right: -80,
  },

  decorativeCircle2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(139, 92, 246, 0.05)",
    bottom: 120,
    left: -40,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },

  logoWrapper: {
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },

  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    marginBottom: 32,
    alignItems: "center",
  },

  title: {
    color: "#f1f5f9",
    fontSize: 34,
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
    paddingHorizontal: 20,
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

  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    gap: 10,
  },

  termsText: {
    flex: 1,
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
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
