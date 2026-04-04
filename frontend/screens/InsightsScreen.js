import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import API from "../services/api";

export default function InsightsScreen() {
  const [expenses, setExpenses] = useState([]);

  // 🔄 FETCH DATA
  const fetchData = async () => {
    try {
      const res = await API.get("/expenses");
      setExpenses(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔁 AUTO REFRESH
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // 📊 CALCULATIONS
  const spentList = expenses.filter((e) => e.type === "debit");
  const receivedList = expenses.filter((e) => e.type === "credit");

  const totalSpent = spentList.reduce((sum, e) => sum + e.amount, 0);
  const totalReceived = receivedList.reduce((sum, e) => sum + e.amount, 0);

  const netBalance = totalReceived - totalSpent;

  const hasData = expenses.length > 0;

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <Text style={styles.title}>Insights</Text>
      <Text style={styles.subtitle}>Your financial overview</Text>

      {/* CARDS */}
      <View style={styles.row}>
        
        {/* SPENT */}
        <View style={[styles.card, styles.cardDark]}>
          <View style={styles.iconCircleRed}>
            <Ionicons name="arrow-up" size={16} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Spent</Text>
          <Text style={styles.amount}>₹{totalSpent}</Text>
          <Text style={styles.transactions}>
            {spentList.length} transactions
          </Text>
        </View>

        {/* RECEIVED */}
        <View style={[styles.card, styles.cardDark]}>
          <View style={styles.iconCircleGreen}>
            <Ionicons name="arrow-down" size={16} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Received</Text>
          <Text style={styles.amount}>₹{totalReceived}</Text>
          <Text style={styles.transactions}>
            {receivedList.length} transactions
          </Text>
        </View>

      </View>

      {/* NET BALANCE */}
      <View style={styles.balanceCard}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="trending-up" size={18} color="#fff" />
          <Text style={styles.balanceTitle}> Net Balance</Text>
        </View>

        <Text style={styles.balanceAmount}>₹{netBalance}</Text>

        <Text style={styles.balanceSub}>
          {netBalance >= 0
            ? `You saved ₹${netBalance} 🎉`
            : `Overspent ₹${Math.abs(netBalance)} ⚠`}
        </Text>
      </View>

      {/* EMPTY STATE */}
      {!hasData && (
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={40} color="#888" />
          <Text style={styles.emptyTitle}>No insights yet</Text>
          <Text style={styles.emptySub}>
            Add transactions to unlock insights 🚀
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05060A",
    padding: 20,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
  },

  subtitle: {
    color: "#aaa",
    marginTop: 5,
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    borderRadius: 20,
    padding: 18,
  },

  cardDark: {
    backgroundColor: "#121826",
  },

  iconCircleRed: {
    backgroundColor: "#ef4444",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  iconCircleGreen: {
    backgroundColor: "#22c55e",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 14,
    color: "#aaa",
  },

  amount: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
    color: "#fff",
  },

  transactions: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },

  balanceCard: {
    backgroundColor: "#8b5cf6",
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
  },

  balanceTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  balanceAmount: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 10,
  },

  balanceSub: {
    color: "#eee",
    marginTop: 5,
  },

  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
  },

  emptyTitle: {
    color: "#ccc",
    fontSize: 16,
    marginTop: 10,
  },

  emptySub: {
    color: "#777",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 30,
  },
});