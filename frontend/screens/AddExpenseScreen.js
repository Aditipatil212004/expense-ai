import React, { useState } from "react";
import { View, TextInput, Button } from "react-native";
import API from "../services/api";

export default function AddExpenseScreen({ navigation }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const addExpense = async () => {
    await API.post(
      "/expenses",
      { amount, category },
      { headers: { Authorization: global.token } }
    );

    navigation.navigate("Dashboard");
  };

  return (
    <View>
      <TextInput placeholder="Amount" onChangeText={setAmount} />
      <TextInput placeholder="Category" onChangeText={setCategory} />
      <Button title="Add Expense" onPress={addExpense} />
    </View>
  );
}