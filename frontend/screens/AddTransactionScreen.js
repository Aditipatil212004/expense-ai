// javascript
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
import { createTransaction } from "../services/api";

const categories = ["Food", "Travel", "Shopping", "Bills", "Entertainment"];
const incomeCategories = ["Salary", "Freelance", "Business", "Investment", "Other Income"];
const methods = ["UPI", "Card", "Cash", "Bank Transfer"];

export default function AddTransactionScreen({ navigation }) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [merchant, setMerchant] = useState("");
  const [method, setMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);

  const availableCategories = type === "income" ? incomeCategories : categories;

  const addTransaction = async () => {
    if (!amount || isNaN(amount)) {
      return Alert.alert("Invalid Amount", "Enter valid amount");
    }

    if (!description.trim()) {
      return Alert.alert("Missing Description", "Enter transaction description");
    }

    try {
      setLoading(true);

      await createTransaction({
        amount: Number(amount),
        type,
        category,
        description,
        sourceText: method,
        merchant: merchant || (type === "income" ? "Income Source" : "Manual Entry"),
      });

      setAmount("");
      setDescription("");
      setMerchant("");
      setMethod("UPI");
      setCategory(type === "income" ? "Salary" : "Food");
      setType("expense");

      navigation.navigate("Dashboard");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.subtitle}>New Transaction</Text>
            <Text style={styles.title}>Add {type === "income" ? "Income" : "Expense"}</Text>
          </View>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={22} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* TYPE SELECTION */}
        <View style={styles.card}>
          <Text style={styles.label}>Transaction Type</Text>
          <View style={styles.typeGrid}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === "expense" && styles.activeType,
              ]}
              onPress={() => {
                setType("expense");
                setCategory("Food");
                setMethod("UPI");
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="remove-circle" size={24} color={type === "expense" ? "#fff" : "#ef4444"} />
              <Text style={type === "expense" ? styles.activeTypeText : styles.typeText}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === "income" && styles.activeType,
              ]}
              onPress={() => {
                setType("income");
                setCategory("Salary");
                setMethod("Bank Transfer");
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={24} color={type === "income" ? "#fff" : "#22c55e"} />
              <Text style={type === "income" ? styles.activeTypeText : styles.typeText}>Income</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AMOUNT CARD */}
        <View style={styles.card}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="#334155"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        {/* DESCRIPTION CARD */}
        <View style={styles.card}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter transaction description"
            placeholderTextColor="#475569"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* MERCHANT CARD */}
        <View style={styles.card}>
          <Text style={styles.label}>{type === "income" ? "Source" : "Merchant"} (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter ${type === "income" ? "income source" : "merchant or store name"}`}
            placeholderTextColor="#475569"
            value={merchant}
            onChangeText={setMerchant}
          />
        </View>

        {/* CATEGORY CARD */}
        <View style={styles.card}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipGrid}>
            {availableCategories.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.chip,
                  category === item && styles.activeChip,
                ]}
                onPress={() => setCategory(item)}
                activeOpacity={0.7}
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
        </View>

        {/* PAYMENT METHOD CARD */}
        <View style={styles.card}>
          <Text style={styles.label}>Payment Method</Text>
          <View style={styles.chipGrid}>
            {methods.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.chip,
                  method === item && styles.activeChip,
                ]}
                onPress={() => setMethod(item)}
                activeOpacity={0.7}
              >
                <Text
                  style={method === item ? styles.activeText : styles.chipText}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity 
          onPress={addTransaction} 
          disabled={loading}
          activeOpacity={0.9}
          style={styles.buttonWrapper}
        >
          <LinearGradient
            colors={["#8b5cf6", "#7c3aed"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, loading && { opacity: 0.6 }]}
          >
            <Text style={styles.buttonText}>
              {loading ? "Processing..." : "Add Transaction"}
            </Text>
            {!loading && <Ionicons name="arrow-forward" size={20} color="#fff" />}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 60,
    marginBottom: 32,
  },

  subtitle: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  title: {
    color: "#f1f5f9",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  closeButton: {
    backgroundColor: "#1e293b",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  label: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  currencySymbol: {
    color: "#8b5cf6",
    fontSize: 32,
    fontWeight: "700",
    marginRight: 8,
  },

  amountInput: {
    flex: 1,
    color: "#f1f5f9",
    fontSize: 36,
    fontWeight: "700",
    padding: 12,
  },

  input: {
    backgroundColor: "#0f172a",
    color: "#f1f5f9",
    padding: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: "500",
  },

  typeGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  typeButton: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#334155",
  },

  activeType: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },

  typeText: {
    color: "#cbd5e1",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },

  activeTypeText: {
    color: "#fff",
    fontWeight: "700",
  },

  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    gap: 8,
  },

  chip: {
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "#334155",
  },

  activeChip: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },

  chipText: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "600",
  },

  activeText: {
    color: "#fff",
    fontWeight: "700",
  },

  buttonWrapper: {
    marginTop: 24,
  },

  button: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    gap: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
