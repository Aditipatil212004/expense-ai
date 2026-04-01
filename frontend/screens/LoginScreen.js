import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import InputField from "../components/InputField";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 const login = async () => {
  try {
    console.log("Calling API...");

    const res = await API.post("/auth/login", {
      email,
      password,
    });

    console.log("RESPONSE:", res.data);

    const token = res.data.token;

    await AsyncStorage.setItem("token", token);
    // 🔥 ADD THIS
await AsyncStorage.setItem("user", JSON.stringify(res.data.user));


// force app reload logic

  } catch (err) {
    console.log("LOGIN ERROR:", err.response?.data || err.message);
    alert("Login failed");
  }
};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Track your expenses smartly</Text>

      <InputField
        icon="mail-outline"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <InputField
        icon="lock-closed-outline"
        placeholder="Password"
        secure
        value={password}
        onChangeText={setPassword}
      />

     <TouchableOpacity style={styles.button} onPress={login}>
  <Text style={styles.buttonText}>Login</Text>
</TouchableOpacity>

      <Text style={styles.footer}>
        Don't have an account?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("Signup")}>
          Sign Up
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a12",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    color: "#aaa",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#8b5cf6",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  footer: {
    color: "#aaa",
    marginTop: 20,
    textAlign: "center",
  },
  link: {
    color: "#8b5cf6",
    fontWeight: "bold",
  },
});