import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import API from "../services/api";

export default function DashboardScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);

  const getExpenses = async () => {
  try {
    const res = await API.get("/expenses");
    setExpenses(res.data);
  } catch (err) {
    console.log(err);
  }
};


  useEffect(() => {
    getExpenses();
  }, []);

  return (
    <View>
      <Button title="Add Expense" onPress={() => navigation.navigate("AddExpense")} />

      {expenses.map((item, index) => (
        <Text key={index}>
          {item.category} - ₹{item.amount}
        </Text>
      ))}
    </View>
  );
}