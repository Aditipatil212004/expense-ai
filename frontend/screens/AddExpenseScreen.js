import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
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

  const addExpense = async () => {
    try {
      await API.post("/expenses", {
        amount: Number(amount),
        category,
        merchant,
        method,
      });

      navigation.goBack();
    } catch (err) {
      console.log(err);
      alert("Failed to add transaction");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
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
                style={[
                  styles.chipText,
                  category === item && styles.activeText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PAYMENT METHOD */}
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
                style={[
                  styles.chipText,
                  method === item && styles.activeText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BUTTON */}
        <TouchableOpacity onPress={addExpense}>
          <LinearGradient
            colors={["#8b5cf6", "#6366f1"]}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Add Transaction</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a12",
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
    fontSize: 20,
    fontWeight: "bold",
  },

  label: {
    color: "#ccc",
    marginBottom: 8,
    marginTop: 15,
  },

  input: {
    backgroundColor: "#111827",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
  },

  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  chip: {
    backgroundColor: "#111827",
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
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 30,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});