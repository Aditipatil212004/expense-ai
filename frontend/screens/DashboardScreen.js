import React, { useEffect, useState } from "react";
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

export default function DashboardScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);

  // ✅ FETCH EXPENSES
  const getExpenses = async () => {
    try {
      const res = await API.get("/expenses");
      setExpenses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      setExpenses([]);
    }
  };

 useEffect(() => {
  const unsubscribe = navigation.addListener("focus", () => {
    getExpenses(); // reload when coming back
  });

  return unsubscribe;
}, [navigation]);

  // ✅ SAFE TOTAL
  const total = Array.isArray(expenses)
    ? expenses.reduce((sum, item) => sum + item.amount, 0)
    : 0;

  // ✅ CATEGORY MAP
  const categoryMap = {};
  expenses.forEach((e) => {
    categoryMap[e.category] =
      (categoryMap[e.category] || 0) + e.amount;
  });

  // ✅ CHART DATA
  const chartData = Object.keys(categoryMap).map((key) => ({
    name: key,
    amount: categoryMap[key],
    color:
      "#" +
      Math.floor(Math.random() * 16777215).toString(16),
    legendFontColor: "#fff",
    legendFontSize: 12,
  }));

  // 🤖 AI INSIGHTS
  const getInsights = () => {
    if (!expenses.length) return "No data yet";

    const topCategory = Object.keys(categoryMap).reduce((a, b) =>
      categoryMap[a] > categoryMap[b] ? a : b
    );

    return `You are spending most on ${topCategory} 💸`;
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Hello,</Text>
          <Text style={styles.name}>Aditi</Text>
        </View>

        <Ionicons name="log-out-outline" size={24} color="red" />
      </View>

      {/* CARD */}
      <LinearGradient
        colors={["#8b5cf6", "#6366f1"]}
        style={styles.card}
      >
        <Text style={styles.cardTitle}>This Month's Spending</Text>
        <Text style={styles.amount}>₹{total}</Text>
        <Text style={styles.transactions}>
          {expenses.length} transactions
        </Text>
      </LinearGradient>

      {/* ACTION BUTTONS */}
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
  onPress={() =>
    navigation.navigate("Insights", { expenses })
  }
/>
      </View>

      {/* 📊 PIE CHART */}
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

     

      {/* TRANSACTIONS */}
      <View style={styles.row}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Text style={styles.seeAll}>See All</Text>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.itemTitle}>{item.category}</Text>
              <Text style={styles.itemDate}>Today</Text>
            </View>

            <Text style={styles.amountText}>₹{item.amount}</Text>
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
    fontWeight: "bold",
  },

  itemDate: {
    color: "#aaa",
  },

  amountText: {
    color: "#f87171",
    fontWeight: "bold",
  },
});