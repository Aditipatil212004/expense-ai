import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";

export default function InsightsScreen({ route }) {
  const { expenses } = route.params;

  const map = {};
  expenses.forEach((e) => {
    map[e.category] = (map[e.category] || 0) + e.amount;
  });

  const chartData = Object.keys(map).map((key) => ({
    name: key,
    amount: map[key],
    color:
      "#" +
      Math.floor(Math.random() * 16777215).toString(16),
    legendFontColor: "#fff",
    legendFontSize: 12,
  }));

  const getInsights = () => {
    if (!expenses.length) return "No data yet";

    const top = Object.keys(map).reduce((a, b) =>
      map[a] > map[b] ? a : b
    );

    return `You spend most on ${top} 💸`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insights</Text>

      <PieChart
        data={chartData}
        width={Dimensions.get("window").width - 20}
        height={220}
        chartConfig={{ color: () => "#fff" }}
        accessor="amount"
        backgroundColor="transparent"
      />

      <Text style={styles.insight}>{getInsights()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a12",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    marginBottom: 20,
  },
  insight: {
    color: "#f59e0b",
    marginTop: 20,
    fontSize: 16,
  },
});