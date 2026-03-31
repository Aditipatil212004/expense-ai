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
import API from "../services/api";

export default function DashboardScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [liveNotification, setLiveNotification] = useState("");
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [user, setUser] = useState(null); // ✅ FIX

  const latestExpenseIdRef = useRef(null);

  // 🔁 LOAD USER (FIX)
  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem("user");
      if (data) {
        setUser(JSON.parse(data));
      }
    };
    loadUser();
  }, []);

  // 🔁 FETCH EXPENSES
  const getExpenses = useCallback(async (notify = false) => {
    try {
      const res = await API.get("/expenses");
      const data = Array.isArray(res.data) ? res.data : [];

      if (data.length > 0) {
        const latest = data[0];

        if (
          notify &&
          latestExpenseIdRef.current &&
          latest._id !== latestExpenseIdRef.current
        ) {
          setLiveNotification(
            `New ${latest.category} transaction ₹${latest.amount}`
          );
          setTimeout(() => setLiveNotification(""), 3000);
        }

        latestExpenseIdRef.current = latest._id;
      }

      setExpenses(data);
    } catch (err) {
      console.log(err);
    }
  }, []);

  // 🔁 REFRESH ON SCREEN FOCUS
  useFocusEffect(
    useCallback(() => {
      getExpenses(false);
    }, [getExpenses])
  );

  // 🔁 DRAWER BUTTON
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // 🔁 LIVE SYNC
  useEffect(() => {
    if (!syncEnabled) return;

    const interval = setInterval(() => {
      getExpenses(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [syncEnabled, getExpenses]);

  // 💰 TOTAL
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  // 📊 CATEGORY MAP
  const categoryMap = {};
  expenses.forEach((e) => {
    categoryMap[e.category] =
      (categoryMap[e.category] || 0) + e.amount;
  });

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.username}>
            {user?.name || "User"} {/* ✅ FIX */}
          </Text>
        </View>
        <Ionicons name="notifications-outline" size={24} color="#00ffcc" />
      </View>

      {/* TOTAL CARD */}
      <LinearGradient
        colors={["#0f3d2e", "#06281f"]}
        style={styles.totalCard}
      >
        <Text style={styles.totalTitle}>Mar Total Spend</Text>
        <Text style={styles.totalAmount}>₹{total}</Text>
        <Text style={styles.totalSub}>
          {Object.keys(categoryMap).length} categories
        </Text>
      </LinearGradient>

      {/* LIVE NOTIFICATION */}
      {liveNotification ? (
        <View style={styles.notificationBanner}>
          <Text style={styles.notificationText}>
            {liveNotification}
          </Text>
        </View>
      ) : null}

      {/* CATEGORY BREAKDOWN */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Category Breakdown</Text>

        <PieChart
          data={[
            {
              name: "Shopping",
              amount: categoryMap["Shopping"] || 0,
              color: "#8b5cf6",
              legendFontColor: "#fff",
              legendFontSize: 12,
            },
            {
              name: "Food",
              amount: categoryMap["Food"] || 0,
              color: "#fb923c",
              legendFontColor: "#fff",
              legendFontSize: 12,
            },
            {
              name: "Entertainment",
              amount: categoryMap["Entertainment"] || 0,
              color: "#f43f5e",
              legendFontColor: "#fff",
              legendFontSize: 12,
            },
            {
              name: "Travel",
              amount: categoryMap["Travel"] || 0,
              color: "#60a5fa",
              legendFontColor: "#fff",
              legendFontSize: 12,
            },
          ]}
          width={Dimensions.get("window").width - 60}
          height={180}
          chartConfig={{ color: () => "#fff" }}
          accessor="amount"
          backgroundColor="transparent"
        />
      </View>

      {/* MONTHLY TREND */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Trend</Text>
        <View style={styles.trendBox}>
          <View style={styles.trendBar} />
          <Text style={styles.monthText}>Mar</Text>
        </View>
      </View>

      {/* RECENT TRANSACTIONS */}
      <FlatList
        data={expenses.slice(0, 5)}
        keyExtractor={(item, index) =>
          item?._id || index.toString()
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>
              {item.category}
            </Text>
            <Text style={styles.amountText}>
              ₹{item.amount}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

// 🎨 STYLES
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
    fontSize: 14,
  },

  username: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },

  totalCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  totalTitle: {
    color: "#ccc",
  },

  totalAmount: {
    color: "#00ffcc",
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 10,
  },

  totalSub: {
    color: "#aaa",
  },

  card: {
    backgroundColor: "#0f111a",
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },

  trendBox: {
    alignItems: "center",
    marginTop: 20,
  },

  trendBar: {
    height: 120,
    width: 120,
    backgroundColor: "#00c896",
    borderRadius: 10,
  },

  monthText: {
    color: "#aaa",
    marginTop: 10,
  },

  notificationBanner: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#1f2937",
    borderRadius: 10,
  },

  notificationText: {
    color: "#fff",
  },

  item: {
    backgroundColor: "#121420",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  itemTitle: {
    color: "#fff",
  },

  amountText: {
    color: "#f87171",
  },
});