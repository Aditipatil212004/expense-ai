import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InsightsScreen() {
  return (
    <View style={styles.container}>
      
      {/* Header */}
      <Text style={styles.title}>Insights</Text>
      <Text style={styles.subtitle}>Your financial overview</Text>

      {/* Cards Row */}
      <View style={styles.row}>
        
        {/* Spent Card */}
        <View style={[styles.card, styles.spentCard]}>
          <View style={styles.iconCircleRed}>
            <Ionicons name="arrow-up" size={16} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Spent</Text>
          <Text style={styles.amount}>₹0</Text>
          <Text style={styles.transactions}>0 transactions</Text>
        </View>

        {/* Received Card */}
        <View style={[styles.card, styles.receivedCard]}>
          <View style={styles.iconCircleGreen}>
            <Ionicons name="arrow-down" size={16} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Received</Text>
          <Text style={styles.amount}>₹0</Text>
          <Text style={styles.transactions}>0 transactions</Text>
        </View>

      </View>

      {/* Net Balance */}
      <View style={styles.balanceCard}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="trending-up" size={18} color="#fff" />
          <Text style={styles.balanceTitle}> Net Balance</Text>
        </View>

        <Text style={styles.balanceAmount}>+₹0</Text>
        <Text style={styles.balanceSub}>
          You saved ₹0 this month! 🎉
        </Text>
      </View>

      {/* Empty State */}
      <View style={styles.emptyContainer}>
        <Ionicons name="analytics-outline" size={40} color="#888" />
        <Text style={styles.emptyTitle}>No insights yet</Text>
        <Text style={styles.emptySub}>
          Add transactions to see your spending analysis
        </Text>
      </View>

    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b0f",
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
    padding: 15,
  },

  spentCard: {
    backgroundColor: "#f2d6d6",
  },

  receivedCard: {
    backgroundColor: "#cfe8d9",
  },

  iconCircleRed: {
    backgroundColor: "#e74c3c",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  iconCircleGreen: {
    backgroundColor: "#27ae60",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 14,
    color: "#333",
  },

  amount: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },

  transactions: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },

  balanceCard: {
    backgroundColor: "#18a873",
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
    color: "#e0f7ee",
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