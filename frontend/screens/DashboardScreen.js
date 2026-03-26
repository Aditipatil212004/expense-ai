import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import API from "../services/api";
import { PieChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const POLLING_INTERVAL_MS = 5000;

export default function DashboardScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [liveNotification, setLiveNotification] = useState("");
<<<<<<< codex/locate-real-time-transaction-notifications-6xvbir
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [notificationSummary, setNotificationSummary] = useState({
    totalCredited: 0,
    totalDebited: 0,
  });
  const latestExpenseIdRef = useRef(null);

  const getExpenses = useCallback(async (notifyOnNewTransaction = false) => {
    try {
      const res = await API.get("/expenses");
      const fetchedExpenses = Array.isArray(res.data) ? res.data : [];

      if (fetchedExpenses.length > 0) {
        const newestExpense = fetchedExpenses[0];
        const hasNewTransaction =
          latestExpenseIdRef.current && newestExpense._id !== latestExpenseIdRef.current;

        if (notifyOnNewTransaction && hasNewTransaction) {
          setLiveNotification(
            `New ${newestExpense.category} transaction: ₹${newestExpense.amount}`
          );
          setTimeout(() => setLiveNotification(""), 3000);
        }

        latestExpenseIdRef.current = newestExpense._id;
      }

      setExpenses(fetchedExpenses);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const getNotificationSummary = useCallback(async () => {
    try {
      const res = await API.get("/expenses/notifications/summary");
      setNotificationSummary({
        totalCredited: res.data?.totalCredited || 0,
        totalDebited: res.data?.totalDebited || 0,
      });
    } catch (err) {
      console.log("Summary error", err?.response?.data || err.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      getExpenses(false);
      getNotificationSummary();
    }, [getExpenses, getNotificationSummary])
  );

  useEffect(() => {
    if (!syncEnabled) {
      return;
    }

    const interval = setInterval(() => {
      getExpenses(true);
      getNotificationSummary();
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [getExpenses, getNotificationSummary, syncEnabled]);
=======
  const latestExpenseIdRef = useRef(null);

  // ✅ FETCH EXPENSES
  const getExpenses = useCallback(async (notifyOnNewTransaction = false) => {
    try {
      const res = await API.get("/expenses");
      const fetchedExpenses = Array.isArray(res.data) ? res.data : [];

      if (fetchedExpenses.length > 0) {
        const newestExpense = fetchedExpenses[0];
        const hasNewTransaction =
          latestExpenseIdRef.current && newestExpense._id !== latestExpenseIdRef.current;

        if (notifyOnNewTransaction && hasNewTransaction) {
          setLiveNotification(
            `New ${newestExpense.category} transaction: ₹${newestExpense.amount}`
          );

          setTimeout(() => {
            setLiveNotification("");
          }, 3000);
        }

        latestExpenseIdRef.current = newestExpense._id;
      }

      setExpenses(fetchedExpenses);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("Dashboard refreshed 🔄");
      getExpenses(false);
    }, [getExpenses])
  );

  // 🔔 Near real-time polling for transaction notifications
  useEffect(() => {
    const interval = setInterval(() => {
      getExpenses(true);
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [getExpenses]);
>>>>>>> main

  const total = Array.isArray(expenses)
    ? expenses.reduce((sum, item) => sum + item.amount, 0)
    : 0;

  const categoryMap = {};
<<<<<<< codex/locate-real-time-transaction-notifications-6xvbir
  expenses
    .filter((e) => e.type !== "credit")
    .forEach((e) => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });
=======
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
>>>>>>> main

  const chartData = Object.keys(categoryMap).map((key) => ({
    name: key,
    amount: categoryMap[key],
    color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    legendFontColor: "#fff",
    legendFontSize: 12,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Hello,</Text>
          <Text style={styles.name}>Aditi</Text>
        </View>

        <Ionicons name="log-out-outline" size={24} color="red" />
      </View>

<<<<<<< codex/locate-real-time-transaction-notifications-6xvbir
      <TouchableOpacity
        style={[styles.syncButton, syncEnabled && styles.syncButtonActive]}
        onPress={() => setSyncEnabled((prev) => !prev)}
      >
        <Ionicons
          name={syncEnabled ? "notifications" : "notifications-off"}
          size={16}
          color="#fff"
        />
        <Text style={styles.syncButtonText}>
          {syncEnabled ? "Notification Listener Enabled" : "Enable Notification Listener"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.syncHint}>
        Turn this on after your mobile app forwards bank/shop notification text to backend.
      </Text>

=======
>>>>>>> main
      {liveNotification ? (
        <View style={styles.notificationBanner}>
          <Text style={styles.notificationText}>{liveNotification}</Text>
        </View>
      ) : null}

<<<<<<< codex/locate-real-time-transaction-notifications-6xvbir
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Credited</Text>
          <Text style={styles.creditText}>₹{notificationSummary.totalCredited}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Debited</Text>
          <Text style={styles.debitText}>₹{notificationSummary.totalDebited}</Text>
        </View>
      </View>

=======
      {/* CARD */}
>>>>>>> main
      <LinearGradient colors={["#8b5cf6", "#6366f1"]} style={styles.card}>
        <Text style={styles.cardTitle}>This Month's Spending</Text>
        <Text style={styles.amount}>₹{total}</Text>
        <Text style={styles.transactions}>{expenses.length} transactions</Text>
      </LinearGradient>

      <View style={styles.actions}>
        <ActionButton
          icon="add"
          label="Add"
          color="#8b5cf6"
          onPress={() => navigation.navigate("AddExpense")}
        />
        <ActionButton
          icon="wallet"
          label="Budget"
          color="#10b981"
          onPress={() => navigation.navigate("Budget")}
        />
        <ActionButton
          icon="analytics"
          label="Insights"
          color="#f59e0b"
          onPress={() => navigation.navigate("Insights", { expenses })}
        />
      </View>

      {chartData.length > 0 && (
        <PieChart
          data={chartData}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            color: () => "#fff",
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      )}

<<<<<<< codex/locate-real-time-transaction-notifications-6xvbir
=======
      {/* TRANSACTIONS */}
>>>>>>> main
      <View style={styles.row}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Text style={styles.seeAll}>See All</Text>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item, index) => item?._id || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.itemTitle}>{item.category}</Text>
              <Text style={styles.itemDate}>{item.type === "credit" ? "Credited" : "Debited"}</Text>
            </View>

            <Text style={[styles.amountText, item.type === "credit" && styles.creditText]}>
              ₹{item.amount}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const ActionButton = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.actionItem} onPress={onPress}>
    <View style={[styles.iconBox, { backgroundColor: color }]}> 
      <MaterialIcons name={icon} size={24} color="#fff" />
    </View>
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a12",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  hello: {
    color: "#aaa",
  },
  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
<<<<<<< codex/locate-real-time-transaction-notifications-6xvbir
  syncButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#374151",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  syncButtonActive: {
    backgroundColor: "#2563eb",
  },
  syncButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  syncHint: {
    color: "#9ca3af",
    marginTop: 6,
    fontSize: 12,
  },
  notificationBanner: {
    marginTop: 12,
=======

  notificationBanner: {
    marginTop: 16,
>>>>>>> main
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#1f2937",
    borderColor: "#10b981",
    borderWidth: 1,
  },
<<<<<<< codex/locate-real-time-transaction-notifications-6xvbir
=======

>>>>>>> main
  notificationText: {
    color: "#d1fae5",
    fontSize: 14,
    fontWeight: "600",
  },
<<<<<<< codex/locate-real-time-transaction-notifications-6xvbir
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 12,
  },
  summaryLabel: {
    color: "#9ca3af",
    fontSize: 12,
  },
  creditText: {
    color: "#34d399",
    fontWeight: "700",
    marginTop: 4,
  },
  debitText: {
    color: "#f87171",
    fontWeight: "700",
    marginTop: 4,
  },
=======

>>>>>>> main
  card: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
  },
  cardTitle: {
    color: "#ddd",
  },
  amount: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 5,
  },
  transactions: {
    color: "#ddd",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  actionItem: {
    alignItems: "center",
  },
  iconBox: {
    padding: 15,
    borderRadius: 15,
  },
  actionText: {
    color: "#aaa",
    marginTop: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  seeAll: {
    color: "#8b5cf6",
  },
  item: {
    backgroundColor: "#1a1a2e",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemTitle: {
    color: "#fff",
    fontWeight: "600",
  },
  itemDate: {
    color: "#777",
    fontSize: 12,
    marginTop: 2,
  },
  amountText: {
    color: "#f87171",
    fontWeight: "bold",
  },
});
