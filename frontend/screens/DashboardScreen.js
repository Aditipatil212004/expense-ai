// javascript
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import { NativeEventEmitter } from "react-native";
import API from "../services/api";

const getCategoryIcon = (category) => {
  const iconMap = {
    Food: "restaurant",
    Travel: "airplane",
    Shopping: "cart",
    Bills: "receipt",
    Entertainment: "game-controller",
  };
  return iconMap[category] || "wallet";
};

const getCategoryColor = (category) => {
  const colorMap = {
    Food: "#f97316",
    Travel: "#06b6d4",
    Shopping: "#a855f7",
    Bills: "#ef4444",
    Entertainment: "#ec4899",
  };
  return colorMap[category] || "#6366f1";
};

export default function DashboardScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [liveNotification, setLiveNotification] = useState("");
  const [user, setUser] = useState(null);

  const latestExpenseIdRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem("user");
      if (data) setUser(JSON.parse(data));
    };
    loadUser();
  }, []);

  const getExpenses = useCallback(async () => {
    try {
      const res = await API.get("/expenses");
      setExpenses(res.data || []);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      getExpenses();
    }, [getExpenses])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const total = expenses.reduce((sum, e) => {
    return e.type === "credit" ? sum + e.amount : sum - e.amount;
  }, 0);

  const totalIncome = expenses.filter(e => e.type === "credit").reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === "debit").reduce((sum, e) => sum + e.amount, 0);

  const categoryMap = {};
  expenses
    .filter((e) => e.type === "debit")
    .forEach((e) => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });

  const chartData = Object.keys(categoryMap).length > 0 ? [
    { name: "Food", amount: categoryMap["Food"] || 0, color: "#f97316", legendFontColor: "#94a3b8", legendFontSize: 11 },
    { name: "Shopping", amount: categoryMap["Shopping"] || 0, color: "#a855f7", legendFontColor: "#94a3b8", legendFontSize: 11 },
    { name: "Travel", amount: categoryMap["Travel"] || 0, color: "#06b6d4", legendFontColor: "#94a3b8", legendFontSize: 11 },
    { name: "Entertainment", amount: categoryMap["Entertainment"] || 0, color: "#ec4899", legendFontColor: "#94a3b8", legendFontSize: 11 },
    { name: "Bills", amount: categoryMap["Bills"] || 0, color: "#ef4444", legendFontColor: "#94a3b8", legendFontSize: 11 },
  ] : [];

  const renderTransaction = ({ item }) => {
    const categoryColor = getCategoryColor(item.category);
    const categoryIcon = getCategoryIcon(item.category);
    
    return (
      <TouchableOpacity style={styles.transactionCard} activeOpacity={0.7}>
        <View style={styles.transactionContent}>
          <View style={[styles.transactionIcon, { backgroundColor: `${categoryColor}15` }]}>
            <Ionicons name={categoryIcon} size={24} color={categoryColor} />
          </View>
          
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionCategory}>{item.category}</Text>
            <View style={styles.transactionMeta}>
              <Ionicons name="storefront-outline" size={12} color="#64748b" />
              <Text style={styles.transactionMerchant}>{item.merchant || "Unknown"}</Text>
              <View style={styles.metaDot} />
              <Text style={styles.transactionMethod}>{item.method}</Text>
            </View>
          </View>

          <View style={styles.transactionAmountContainer}>
            <Text style={[styles.transactionAmount, item.type === "credit" && styles.creditAmount]}>
              {item.type === "credit" ? "+" : "-"}₹{item.amount.toLocaleString()}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrapper}>
        <LinearGradient
          colors={["#1e293b", "#0f172a"]}
          style={styles.emptyIconGradient}
        >
          <Ionicons name="wallet-outline" size={56} color="#475569" />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>No Transactions Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start tracking your finances by adding your first transaction
      </Text>
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => navigation.navigate("AddExpense")}
      >
        <LinearGradient
          colors={["#8b5cf6", "#7c3aed"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.emptyButton}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.emptyButtonText}>Add Transaction</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome Back 👋</Text>
            <Text style={styles.username}>{user?.name || "User"}</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="search-outline" size={20} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <View style={styles.notificationDot} />
              <Ionicons name="notifications-outline" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* BALANCE CARD */}
        <View style={styles.balanceWrapper}>
          <LinearGradient
            colors={["#8b5cf6", "#7c3aed", "#6d28d9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.balanceOverlay} />
            
            <View style={styles.balanceTop}>
              <View>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceAmount}>₹{total.toLocaleString()}</Text>
                <Text style={styles.balanceSubtext}>
                  {expenses.length} transaction{expenses.length !== 1 ? 's' : ''} this month
                </Text>
              </View>
              
              <View style={styles.balanceIconContainer}>
                <Ionicons name="wallet" size={32} color="rgba(255,255,255,0.9)" />
              </View>
            </View>

            <View style={styles.balanceStats}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="arrow-down-circle" size={18} color="#fca5a5" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Expense</Text>
                  <Text style={styles.statValue}>₹{totalExpense.toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="arrow-up-circle" size={18} color="#86efac" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Income</Text>
                  <Text style={styles.statValue}>₹{totalIncome.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate("AddExpense")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#8b5cf615" }]}>
              <Ionicons name="add" size={22} color="#8b5cf6" />
            </View>
            <Text style={styles.actionText}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate("Budget")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#06b6d415" }]}>
              <Ionicons name="pie-chart" size={22} color="#06b6d4" />
            </View>
            <Text style={styles.actionText}>Budget</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate("Insights")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#f9731615" }]}>
              <Ionicons name="stats-chart" size={22} color="#f97316" />
            </View>
            <Text style={styles.actionText}>Insights</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#ec489915" }]}>
              <Ionicons name="person" size={22} color="#ec4899" />
            </View>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* SPENDING CHART */}
        {chartData.length > 0 && (
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.sectionTitle}>Spending Overview</Text>
                <Text style={styles.sectionSubtitle}>Category breakdown</Text>
              </View>
              <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={() => navigation.navigate("Insights")}
              >
                <Text style={styles.viewDetailsText}>Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#8b5cf6" />
              </TouchableOpacity>
            </View>

            <View style={styles.chartContainer}>
              <PieChart
                data={chartData}
                width={Dimensions.get("window").width - 80}
                height={220}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                chartConfig={{ color: () => "#fff" }}
                hasLegend={true}
              />
            </View>
          </View>
        )}

        {/* RECENT TRANSACTIONS */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Text style={styles.sectionSubtitle}>
                {expenses.length > 0 ? `Last ${Math.min(expenses.length, 8)} transactions` : "No transactions"}
              </Text>
            </View>
            {expenses.length > 8 && (
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {expenses.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.transactionsList}>
              {expenses.slice(0, 8).map((item, index) => (
                <View key={item?._id || index}>
                  {renderTransaction({ item })}
                </View>
              ))}
            </View>
          )}
        </View>
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
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },

  greeting: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },

  username: {
    color: "#f1f5f9",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  headerActions: {
    flexDirection: "row",
    gap: 12,
  },

  headerButton: {
    backgroundColor: "#1e293b",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 2,
    borderColor: "#1e293b",
    zIndex: 1,
  },

  balanceWrapper: {
    paddingHorizontal: 20,
    marginBottom: 24,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 15,
  },

  balanceCard: {
    borderRadius: 24,
    padding: 24,
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

  balanceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },

  balanceLabel: {
    color: "#e9d5ff",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  balanceAmount: {
    color: "#fff",
    fontSize: 44,
    fontWeight: "700",
    letterSpacing: -1.5,
    marginBottom: 6,
  },

  balanceSubtext: {
    color: "#ddd6fe",
    fontSize: 13,
    fontWeight: "500",
  },

  balanceIconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  balanceStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
    backdropFilter: "blur(10px)",
  },

  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  statIconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  statContent: {
    flex: 1,
  },

  statLabel: {
    color: "#e9d5ff",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },

  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 16,
  },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 28,
    gap: 12,
  },

  actionButton: {
    flex: 1,
    backgroundColor: "#1e293b",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 10,
  },

  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  actionText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "700",
  },

  chartSection: {
    backgroundColor: "#1e293b",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  sectionTitle: {
    color: "#f1f5f9",
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 4,
  },

  sectionSubtitle: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
  },

  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 4,
  },

  viewDetailsText: {
    color: "#8b5cf6",
    fontSize: 13,
    fontWeight: "700",
  },

  chartContainer: {
    alignItems: "center",
    marginTop: 8,
  },

  transactionsSection: {
    paddingHorizontal: 20,
  },

  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  viewAllText: {
    color: "#8b5cf6",
    fontSize: 14,
    fontWeight: "700",
  },

  transactionsList: {
    gap: 12,
  },

  transactionCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  transactionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },

  transactionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },

  transactionDetails: {
    flex: 1,
    gap: 6,
  },

  transactionCategory: {
    color: "#f1f5f9",
    fontSize: 16,
    fontWeight: "700",
  },

  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  transactionMerchant: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#475569",
  },

  transactionMethod: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },

  transactionAmountContainer: {
    alignItems: "flex-end",
    gap: 4,
  },

  transactionAmount: {
    color: "#ef4444",
    fontSize: 18,
    fontWeight: "700",
  },

  creditAmount: {
    color: "#22c55e",
  },

  transactionDate: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },

  emptyIconWrapper: {
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },

  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: "#f1f5f9",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },

  emptySubtitle: {
    color: "#64748b",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },

  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    gap: 10,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
