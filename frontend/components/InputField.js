import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InputField({ icon, placeholder, secure, value, onChangeText }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={20} color="#8b5cf6" style={styles.icon} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        secureTextEntry={secure}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e2f",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    height: 50,
  },
});