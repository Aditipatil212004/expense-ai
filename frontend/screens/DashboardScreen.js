
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
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [user, setUser] = useState(null);

  const latestExpenseIdRef = useRef(null);

  // 🔁 LOAD USER
  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem("user");
      if (data) setUser(JSON.parse(data));
    };
    loadUser();
  }, []);

  // 🔥 NOTIFICATION PARSER
  const parseNotification = (text) => {
    const lower = text.toLowerCase();

    if (lower.includes("otp") || lower.includes("password")) return null;

    const match = text.match(/(₹|rs\.?|inr)\s?(\d+(,\d+)*)/i);
    const amount = match ? parseInt(match[2].replace(/,/g, "")) : 0;

    if (!amount) return null;

    let type = null;
    if (lower.includes("debited") || lower.includes("paid")) type = "debit";
    if (lower.includes("credited") || lower.includes("received")) type = "credit";

    if (!type) return null;

    let category = "Other";

    if (lower.includes("swiggy") || lower.includes("zomato"))
      category = "Food";
    else if (lower.includes("amazon") || lower.includes("flipkart"))
      category = "Shopping";
    else if (lower.includes("uber") || lower.includes("ola"))
      category = "Travel";
    else if (lower.includes("netflix") || lower.includes("spotify"))
      category = "Entertainment";
    else if (lower.includes("bill") || lower.includes("electricity"))
      category = "Bills";

    return { amount, type, category };
  };

  // 🔥 NOTIFICATION LISTENER
  useEffect(() => {
    const emitter = new NativeEventEmitter();

    const subscription = emitter.addListener(
      "NotificationReceived",
      async (text) => {
        console.log("Notification:", text);

        const parsed = parseNotification(text);
        if (!parsed) return;

        try {
          await API.post("/expenses", {
            amount: parsed.amount,
            type: parsed.type,
            category: parsed.category,
            description: text,
          });

          getExpenses(true);
        } catch (err) {
          console.log("API ERROR:", err);
        }
      }
    );

    return () => subscription.remove();
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

  // 🔁 REFRESH
  useFocusEffect(
    useCallback(() => {
      getExpenses(false);
    }, [getExpenses])
  );

  // 🔁 DRAWER
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // 💰 TOTAL
  const total = expenses.reduce((sum, e) => {
    if (e.type === "credit") return sum + e.amount;
    return sum - e.amount;
  }, 0);

  // 📊 CATEGORY MAP
  const categoryMap = {};
  expenses
    .filter((e) => e.type === "debit")
    .forEach((e) => {
      categoryMap[e.category] =
        (categoryMap[e.category] || 0) + e.amount;
    });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.username}>
            {user?.name || "User"}
          </Text>
        </View>
        <Ionicons name="notifications-outline" size={24} color="#00ffcc" />
      </View>

      <LinearGradient
        colors={["#0f3d2e", "#06281f"]}
        style={styles.totalCard}
      >
        <Text style={styles.totalTitle}>Total Balance</Text>
        <Text style={styles.totalAmount}>₹{total}</Text>
        <Text style={styles.totalSub}>
          {Object.keys(categoryMap).length} categories
        </Text>
      </LinearGradient>

      {liveNotification ? (
        <View style={styles.notificationBanner}>
          <Text style={styles.notificationText}>
            {liveNotification}
          </Text>
        </View>
      ) : null}

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