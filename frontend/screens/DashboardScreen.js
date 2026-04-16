// javascript
import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  DeviceEventEmitter,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import { getTransactions } from "../services/api";
import { openNotificationListenerSettings } from "../services/notificationListener"; 

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
  const [user, setUser] = useState(null);
  const [notificationAccessGranted, setNotificationAccessGranted] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem("user");
      if (data) setUser(JSON.parse(data));
    };
    loadUser();
  }, []);

  useEffect(() => {
    const checkNotificationAccess = async () => {
      if (Platform.OS === "android") {
        const { isNotificationServiceEnabled } = await import("../services/notificationListener");
        const enabled = await isNotificationServiceEnabled();
        setNotificationAccessGranted(enabled);
      }
    };
    checkNotificationAccess();
  }, []);

  const getExpenses = useCallback(async () => {
    try {
      console.log("📥 Fetching transactions from API...");
      const res = await getTransactions();
      console.log("✅ Transactions fetched:", res.data?.length || 0, "items");
      setExpenses(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching transactions:");
      console.error("   Message:", err.message);
      console.error("   Status:", err.response?.status);
      console.error("   Data:", err.response?.data);
      console.error("   Full Error:", JSON.stringify(err, null, 2));
    }
  }, []);

  useEffect(() => {
    console.log("📻 Dashboard: Setting up SMS event listener...");
    
    const handleSmsExpenseAdded = async () => {
      console.log("🔔 Dashboard: SMS event received! Starting refresh...");
      
      // Add delay to ensure backend has saved
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        console.log("📡 Refreshing dashboard transactions after auto-ingest...");
        await getExpenses();
      } catch (err) {
        console.error("❌ Failed to fetch expenses:", err.message);
      }
    };

    const subscription = DeviceEventEmitter.addListener("expenseAddedFromSms", handleSmsExpenseAdded);

    return () => {
      subscription.remove();
    };
  }, [getExpenses]);

  useFocusEffect(
    useCallback(() => {
      getExpenses();
    }, [getExpenses])
  );

  const total = expenses.reduce((sum, e) => {
    return e.type === "income" ? sum + e.amount : sum - e.amount;
  }, 0);

  const totalIncome = expenses.filter(e => e.type === "income").reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === "expense").reduce((sum, e) => sum + e.amount, 0);

  const categoryMap = {};
  expenses
    .filter((e) => e.type === "expense")
    .forEach((e) => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });

  const chartData = Object.keys(categoryMap).length > 0 ? [
    { name: "Food", amount: categoryMap["Food"] || 0, color: "#f97316", legendFontColor: "#cbd5e1", legendFontSize: 10 },
    { name: "Shopping", amount: categoryMap["Shopping"] || 0, color: "#a855f7", legendFontColor: "#cbd5e1", legendFontSize: 10 },
    { name: "Travel", amount: categoryMap["Travel"] || 0, color: "#06b6d4", legendFontColor: "#cbd5e1", legendFontSize: 10 },
    { name: "Entertainment", amount: categoryMap["Entertainment"] || 0, color: "#ec4899", legendFontColor: "#cbd5e1", legendFontSize: 10 },
    { name: "Bills", amount: categoryMap["Bills"] || 0, color: "#ef4444", legendFontColor: "#cbd5e1", legendFontSize: 10 },
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
              <Text style={styles.transactionType}>{item.type === "income" ? "Income" : "Expense"}</Text>
            </View>
          </View>

          <View style={styles.transactionAmountContainer}>
            <Text style={[styles.transactionAmount, item.type === "income" && styles.incomeAmount]}>
              {item.type === "income" ? "+" : "-"}₹{item.amount.toLocaleString()}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(item.createdAt || item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
        onPress={() => navigation.navigate("AddTransaction")}
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
      <SafeAreaView style={styles.safeArea}>
        {/* CUSTOM HEADER */}
        <View style={styles.customHeader}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={26} color="#f1f5f9" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.greeting}>Welcome Back 👋</Text>
            <Text style={styles.username}>{user?.name || "User"}</Text>
          </View>

          <TouchableOpacity 
            style={styles.notificationButton}
            activeOpacity={0.7}
          >
            <View style={styles.notificationDot} />
            <Ionicons name="notifications-outline" size={24} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* BALANCE CARD */}
        <View style={styles.balanceWrapper}>
          <LinearGradient
            colors={["#8b5cf6", "#7c3aed", "#6d28d9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.balanceOverlay}></View>
            
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
            onPress={() => navigation.navigate("AddTransaction")}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#8b5cf615" }]}>
              <Ionicons name="add" size={22} color="#8b5cf6" />
            </View>
            <Text style={styles.actionText}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate("Budget")}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#06b6d415" }]}>
              <Ionicons name="pie-chart" size={22} color="#06b6d4" />
            </View>
            <Text style={styles.actionText}>Budget</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate("Insights")}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#f9731615" }]}>
              <Ionicons name="stats-chart" size={22} color="#f97316" />
            </View>
            <Text style={styles.actionText}>Insights</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate("Profile")}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#ec489915" }]}>
              <Ionicons name="person" size={22} color="#ec4899" />
            </View>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>

          {!notificationAccessGranted && Platform.OS === "android" && (
            <TouchableOpacity 
              style={styles.notificationAccessButton}
              onPress={async () => {
                await openNotificationListenerSettings();
                // Re-check after returning from settings
                setTimeout(async () => {
                  const { isNotificationServiceEnabled } = await import("../services/notificationListener");
                  const enabled = await isNotificationServiceEnabled();
                  setNotificationAccessGranted(enabled);
                }, 1000);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#8b5cf615" }]}>
                <Ionicons name="notifications-outline" size={22} color="#8b5cf6" />
              </View>
              <Text style={styles.actionText}>Enable{'\n'}Notifications</Text>
            </TouchableOpacity>
          )}
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
                activeOpacity={0.7}
              >
                <Text style={styles.viewDetailsText}>Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#8b5cf6" />
              </TouchableOpacity>
            </View>

            <View style={styles.chartContainer}>
              <PieChart
                data={chartData}
                width={Dimensions.get("window").width - 80}
                height={200}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="10"
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
              <TouchableOpacity activeOpacity={0.7}>
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

  safeArea: {
    backgroundColor: "#0f172a",
  },

  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#0f172a",
  },

  menuButton: {
    backgroundColor: "#1e293b",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
  },

  greeting: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },

  username: {
    color: "#f1f5f9",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  notificationAccessButton: {
  backgroundColor: "#8b5cf6",
  padding: 15,
  borderRadius: 10,
  marginVertical: 10,
  flexDirection: "row",
  alignItems: "center",
},
notificationAccessText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
  marginLeft: 10,
  flex: 1,
},
notificationAccessSubtext: {
  color: "#e0e7ff",
  fontSize: 12,
  marginTop: 2,
  flex: 1,
},


  notificationButton: {
    backgroundColor: "#1e293b",
    width: 48,
    height: 48,
    borderRadius: 24,
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

  scrollContent: {
    paddingBottom: 40,
  },

  balanceWrapper: {
    paddingHorizontal: 20,
    marginTop: 16,
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
  },

  statIconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
  },

  actionButton: {
    flex: 1,
    backgroundColor: "#1e293b",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 6,
  },

  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
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
  },

  viewDetailsText: {
    color: "#8b5cf6",
    fontSize: 13,
    fontWeight: "700",
    marginRight: 4,
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
    marginTop: 0,
  },

  transactionCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
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
  },

  transactionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  transactionDetails: {
    flex: 1,
  },

  transactionCategory: {
    color: "#f1f5f9",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },

  transactionMerchant: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#475569",
    marginHorizontal: 6,
  },

  transactionType: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },

  transactionAmountContainer: {
    alignItems: "flex-end",
  },

  transactionAmount: {
    color: "#ef4444",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },

  incomeAmount: {
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
    marginLeft: 10,
  },
});
