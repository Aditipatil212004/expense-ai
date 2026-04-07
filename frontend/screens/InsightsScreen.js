// javascript
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import API from "../services/api";

export default function InsightsScreen() {
  const [expenses, setExpenses] = useState([]);

  const fetchData = async () => {
    try {
      const res = await API.get("/expenses");
      setExpenses(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const spentList = expenses.filter((e) => e.type === "debit");
  const receivedList = expenses.filter((e) => e.type === "credit");

  const totalSpent = spentList.reduce((sum, e) => sum + e.amount, 0);
  const totalReceived = receivedList.reduce((sum, e) => sum + e.amount, 0);

  const netBalance = totalReceived - totalSpent;

  const hasData = expenses.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.subtitle}>Financial Overview</Text>
            <Text style={styles.title}>Insights</Text>
          </View>
          <View style={styles.headerIconContainer}>
            <Ionicons name="analytics" size={28} color="#8b5cf6" />
          </View>
        </View>

        {hasData ? (
          <>
            {/* STATS CARDS */}
            <View style={styles.cardsRow}>
              
              {/* SPENT CARD */}
              <View style={styles.cardWrapper}>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconCircleRed}>
                      <Ionicons name="trending-down" size={20} color="#fff" />
                    </View>
                    <Text style={styles.cardLabel}>Spent</Text>
                  </View>
                  
                  <Text style={styles.cardAmount}>₹{totalSpent.toLocaleString()}</Text>
                  
                  <View style={styles.cardFooter}>
                    <View style={styles.transactionBadge}>
                      <Ionicons name="receipt-outline" size={12} color="#64748b" />
                      <Text style={styles.transactionText}>
                        {spentList.length} transaction{spentList.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* RECEIVED CARD */}
              <View style={styles.cardWrapper}>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconCircleGreen}>
                      <Ionicons name="trending-up" size={20} color="#fff" />
                    </View>
                    <Text style={styles.cardLabel}>Received</Text>
                  </View>
                  
                  <Text style={styles.cardAmount}>₹{totalReceived.toLocaleString()}</Text>
                  
                  <View style={styles.cardFooter}>
                    <View style={styles.transactionBadge}>
                      <Ionicons name="receipt-outline" size={12} color="#64748b" />
                      <Text style={styles.transactionText}>
                        {receivedList.length} transaction{receivedList.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

            </View>

            {/* NET BALANCE CARD */}
            <View style={styles.balanceCardWrapper}>
              <LinearGradient
                colors={netBalance >= 0 ? ["#8b5cf6", "#7c3aed", "#6d28d9"] : ["#ef4444", "#dc2626", "#b91c1c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.balanceCard}
              >
                <View style={styles.balanceOverlay} />
                
                <View style={styles.balanceHeader}>
                  <View style={styles.balanceIconContainer}>
                    <Ionicons 
                      name={netBalance >= 0 ? "trending-up" : "trending-down"} 
                      size={24} 
                      color="#fff" 
                    />
                  </View>
                  <Text style={styles.balanceLabel}>Net Balance</Text>
                </View>

                <Text style={styles.balanceAmount}>₹{netBalance.toLocaleString()}</Text>

                <View style={styles.balanceFooter}>
                  <View style={styles.balanceStatusBadge}>
                    <Ionicons 
                      name={netBalance >= 0 ? "checkmark-circle" : "alert-circle"} 
                      size={16} 
                      color="#fff" 
                    />
                    <Text style={styles.balanceStatusText}>
                      {netBalance >= 0
                        ? `You saved ₹${netBalance.toLocaleString()} this period`
                        : `Overspent by ₹${Math.abs(netBalance).toLocaleString()}`}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* BREAKDOWN SECTION */}
            <View style={styles.breakdownSection}>
              <Text style={styles.breakdownTitle}>Financial Summary</Text>
              
              <View style={styles.breakdownCard}>
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownItem}>
                    <View style={styles.breakdownIconContainer}>
                      <Ionicons name="swap-horizontal" size={16} color="#8b5cf6" />
                    </View>
                    <Text style={styles.breakdownLabel}>Total Transactions</Text>
                  </View>
                  <Text style={styles.breakdownValue}>{expenses.length}</Text>
                </View>

                <View style={styles.breakdownDivider} />

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownItem}>
                    <View style={styles.breakdownIconContainer}>
                      <Ionicons name="calculator" size={16} color="#8b5cf6" />
                    </View>
                    <Text style={styles.breakdownLabel}>Average Expense</Text>
                  </View>
                  <Text style={styles.breakdownValue}>
                    ₹{spentList.length > 0 ? Math.round(totalSpent / spentList.length).toLocaleString() : 0}
                  </Text>
                </View>

                <View style={styles.breakdownDivider} />

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownItem}>
                    <View style={styles.breakdownIconContainer}>
                      <Ionicons name="pie-chart" size={16} color="#8b5cf6" />
                    </View>
                    <Text style={styles.breakdownLabel}>Savings Rate</Text>
                  </View>
                  <Text style={[
                    styles.breakdownValue,
                    { color: netBalance >= 0 ? "#22c55e" : "#ef4444" }
                  ]}>
                    {totalReceived > 0 ? Math.round((netBalance / totalReceived) * 100) : 0}%
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <LinearGradient
                colors={["#1e293b", "#0f172a"]}
                style={styles.emptyIconGradient}
              >
                <Ionicons name="analytics-outline" size={64} color="#475569" />
              </LinearGradient>
            </View>
            
            <Text style={styles.emptyTitle}>No Insights Available</Text>
            <Text style={styles.emptySubtitle}>
              Start adding transactions to see your financial insights and spending patterns
            </Text>

            <View style={styles.emptyStatsContainer}>
              <View style={styles.emptyStatItem}>
                <Ionicons name="wallet-outline" size={24} color="#475569" />
                <Text style={styles.emptyStatText}>Track Expenses</Text>
              </View>
              <View style={styles.emptyStatItem}>
                <Ionicons name="trending-up-outline" size={24} color="#475569" />
                <Text style={styles.emptyStatText}>Monitor Income</Text>
              </View>
              <View style={styles.emptyStatItem}>
                <Ionicons name="pie-chart-outline" size={24} color="#475569" />
                <Text style={styles.emptyStatText}>View Analytics</Text>
              </View>
            </View>
          </View>
        )}

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
    paddingTop: 60,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },

  subtitle: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  title: {
    color: "#f1f5f9",
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  headerIconContainer: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  cardsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },

  cardWrapper: {
    flex: 1,
  },

  card: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  cardHeader: {
    marginBottom: 16,
  },

  iconCircleRed: {
    backgroundColor: "#ef4444",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  iconCircleGreen: {
    backgroundColor: "#22c55e",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  cardLabel: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  cardAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f1f5f9",
    marginBottom: 12,
    letterSpacing: -0.5,
  },

  cardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },

  transactionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  transactionText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },

  balanceCardWrapper: {
    marginBottom: 28,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 15,
  },

  balanceCard: {
    borderRadius: 24,
    padding: 28,
    overflow: "hidden",
  },

  balanceOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.1)",
  },

  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },

  balanceIconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  balanceLabel: {
    color: "#e9d5ff",
    fontSize: 15,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  balanceAmount: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -1.5,
  },

  balanceFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },

  balanceStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
  },

  balanceStatusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  breakdownSection: {
    marginBottom: 20,
  },

  breakdownTitle: {
    color: "#f1f5f9",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },

  breakdownCard: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },

  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  breakdownIconContainer: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  breakdownLabel: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "600",
  },

  breakdownValue: {
    color: "#f1f5f9",
    fontSize: 18,
    fontWeight: "700",
  },

  breakdownDivider: {
    height: 1,
    backgroundColor: "#334155",
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },

  emptyIconWrapper: {
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },

  emptyIconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: "#f1f5f9",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },

  emptySubtitle: {
    color: "#64748b",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },

  emptyStatsContainer: {
    flexDirection: "row",
    gap: 24,
  },

  emptyStatItem: {
    alignItems: "center",
    gap: 12,
  },

  emptyStatText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
