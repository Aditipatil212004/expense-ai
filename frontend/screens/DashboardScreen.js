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
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import { NativeEventEmitter } from "react-native";
import API from "../services/api";

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

  const categoryMap = {};
  expenses
    .filter((e) => e.type === "debit")
    .forEach((e) => {
      categoryMap[e.category] =
        (categoryMap[e.category] || 0) + e.amount;
    });

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome 👋</Text>
          <Text style={styles.username}>{user?.name || "User"}</Text>
        </View>

        <View style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color="#fff" />
        </View>
      </View>

      {/* BALANCE */}
      <LinearGradient
        colors={["#8b5cf6", "#6366f1"]}
        style={styles.balanceCard}
      >
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>₹{total}</Text>
        <Text style={styles.balanceSub}>
          {expenses.length} transactions
        </Text>
      </LinearGradient>

      {/* CHART */}
      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Spending</Text>

        <PieChart
          data={[
            { name: "Food", amount: categoryMap["Food"] || 0, color: "#f97316", legendFontColor: "#fff", legendFontSize: 12 },
            { name: "Shopping", amount: categoryMap["Shopping"] || 0, color: "#8b5cf6", legendFontColor: "#fff", legendFontSize: 12 },
            { name: "Travel", amount: categoryMap["Travel"] || 0, color: "#3b82f6", legendFontColor: "#fff", legendFontSize: 12 },
            { name: "Entertainment", amount: categoryMap["Entertainment"] || 0, color: "#ec4899", legendFontColor: "#fff", legendFontSize: 12 },
          ]}
          width={Dimensions.get("window").width - 60}
          height={180}
          accessor="amount"
          backgroundColor="transparent"
          chartConfig={{ color: () => "#fff" }}
        />
      </View>

      {/* TRANSACTIONS */}
      <FlatList
        data={expenses.slice(0, 5)}
        keyExtractor={(item, i) => item?._id || i.toString()}
        renderItem={({ item }) => (
          <View style={styles.transaction}>
            <Text style={styles.txTitle}>{item.category}</Text>
            <Text style={styles.txAmount}>₹{item.amount}</Text>
          </View>
        )}
      />
    </View>
  );
}

/* ✅ THIS WAS MISSING OR WRONG IN YOUR CODE */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05060A",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    marginBottom: 20,
  },

  greeting: {
    color: "#aaa",
  },

  username: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  iconBtn: {
    backgroundColor: "#121826",
    padding: 10,
    borderRadius: 50,
  },

  balanceCard: {
    padding: 22,
    borderRadius: 22,
    marginBottom: 20,
  },

  balanceLabel: {
    color: "#ddd",
  },

  balanceAmount: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    marginVertical: 10,
  },

  balanceSub: {
    color: "#eee",
  },

  chartCard: {
    backgroundColor: "#0f111a",
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

  transaction: {
    backgroundColor: "#121420",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  txTitle: {
    color: "#fff",
  },

  txAmount: {
    color: "#ef4444",
    fontWeight: "bold",
  },
});