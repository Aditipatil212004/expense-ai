import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import API from "../services/api";

const categories = ["Food", "Travel", "Shopping", "Bills", "Entertainment"];
const methods = ["UPI", "Credit Card", "Debit Card", "Cash", "Net Banking"];

export default function AddExpenseScreen({ navigation }) {
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("Food");
  const [method, setMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);

  const addExpense = async () => {
    if (!amount || isNaN(amount)) {
      return Alert.alert("Invalid Amount", "Enter valid amount");
    }

    if (!merchant.trim()) {
      return Alert.alert("Missing Merchant", "Enter merchant name");
    }

    try {
      setLoading(true);

      await API.post("/expenses", {
        amount: Number(amount),
        merchant,
        category,
        method,
        type: "debit", // 🔥 IMPORTANT (fix for insights)
        date: new Date(),
      });

      setAmount("");
      setMerchant("");
      setCategory("Food");
      setMethod("UPI");

      navigation.navigate("Dashboard");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Add Transaction</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* AMOUNT */}
        <Text style={styles.label}>Amount (₹)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        {/* MERCHANT */}
        <Text style={styles.label}>Merchant</Text>
        <TextInput
          style={styles.input}
          placeholder="Merchant name"
          placeholderTextColor="#666"
          value={merchant}
          onChangeText={setMerchant}
        />

        {/* CATEGORY */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.rowWrap}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.chip,
                category === item && styles.activeChip,
              ]}
              onPress={() => setCategory(item)}
            >
              <Text
                style={
                  category === item ? styles.activeText : styles.chipText
                }
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* METHOD */}
        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.rowWrap}>
          {methods.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.chip,
                method === item && styles.activeChip,
              ]}
              onPress={() => setMethod(item)}
            >
              <Text
                style={method === item ? styles.activeText : styles.chipText}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BUTTON */}
        <TouchableOpacity onPress={addExpense} disabled={loading}>
          <LinearGradient
            colors={["#8b5cf6", "#6366f1"]}
            style={[styles.button, loading && { opacity: 0.6 }]}
          >
            <Text style={styles.buttonText}>
              {loading ? "Adding..." : "Add Transaction"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

/* ✅ THIS WAS MISSING */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05060A",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  label: {
    color: "#aaa",
    marginTop: 15,
    marginBottom: 5,
  },

  input: {
    backgroundColor: "#121826",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
  },

  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },

  chip: {
    backgroundColor: "#121826",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },

  activeChip: {
    backgroundColor: "#8b5cf6",
  },

  chipText: {
    color: "#aaa",
  },

  activeText: {
    color: "#fff",
  },

  button: {
    marginTop: 30,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});