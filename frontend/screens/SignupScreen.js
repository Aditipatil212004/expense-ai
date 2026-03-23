import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import InputField from "../components/InputField";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signup = async () => {
  try {
    console.log("Signup clicked");

    const res = await API.post("/auth/signup", {
      email,
      password,
    });

    console.log(res.data);

    const token = res.data.token;

    await AsyncStorage.setItem("token", token);

    navigation.replace("Login"); // safer for now
  } catch (err) {
    console.log(err.response?.data || err.message);
    alert("Signup failed");
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Start tracking your expenses</Text>

      <InputField
        icon="person-outline"
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <InputField
        icon="mail-outline"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <InputField
        icon="lock-closed-outline"
        placeholder="Password (min 6 characters)"
        secure
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={signup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Already have an account?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
          Login
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