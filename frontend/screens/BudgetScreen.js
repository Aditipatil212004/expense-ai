import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import API from "../services/api";

export default function BudgetScreen() {
  const [budgets, setBudgets] = useState([]);
const [expenses, setExpenses] = useState([]);

 

  const [modalVisible, setModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");

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
    getExpenses();
    getBudgets();
  }, []);

  const getSpent = (category) => {
    return expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  };
 

  const totalSpent = Array.isArray(expenses)
    ? expenses.reduce((sum, e) => sum + e.amount, 0)
    : 0;

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

  // 📥 GET budgets from backend
const getBudgets = async () => {
  try {
    const res = await API.get("/budgets");
    setBudgets(res.data);
  } catch (err) {
    console.log(err);
  }
};

// ➕ ADD budget
const addBudget = async () => {
  try {
    const res = await API.post("/budgets", {
      category: newCategory,
      limit: Number(newLimit),
    });

    setBudgets([...budgets, res.data]); // update UI
    setModalVisible(false);
    setNewCategory("");
    setNewLimit("");
  } catch (err) {
    console.log(err);
  }
};

// ❌ DELETE budget
const deleteBudget = async (id) => {
  try {
    await API.delete(`/budgets/${id}`);
    setBudgets(budgets.filter((b) => b._id !== id));
  } catch (err) {
    console.log(err);
  }
};

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Budget</Text>
          <Text style={styles.subtitle}>
            ₹{totalSpent} / ₹{totalBudget}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={budgets}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const spent = getSpent(item.category);
          const percent = item.limit
            ? (spent / item.limit) * 100
            : 0;

          const exceeded = spent > item.limit;

          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.row}>
                  <View style={styles.dot} />
                  <Text style={styles.category}>{item.category}</Text>
                </View>

                <TouchableOpacity onPress={() => deleteBudget(item._id)}>
  <Ionicons name="trash-outline" size={20} color="red" />
</TouchableOpacity>
              </View>

              <Text style={styles.amount}>
                ₹{spent} / ₹{item.limit}
              </Text>

              {/* PROGRESS */}
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progress,
                    {
                      width: `${Math.min(percent, 100)}%`,
                      backgroundColor: exceeded
                        ? "#ef4444"
                        : "#10b981",
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.percent,
                  { color: exceeded ? "#ef4444" : "#10b981" },
                ]}
              >
                {Math.floor(percent)}%
              </Text>

              {/* 🚨 WARNING */}
              {exceeded && (
                <Text style={styles.warning}>
                  ⚠ Budget exceeded!
                </Text>
              )}
            </View>
          );
        }}
      />

      {/* SUMMARY */}
      <LinearGradient
        colors={["#8b5cf6", "#6366f1"]}
        style={styles.summary}
      >
        <Text style={styles.summaryTitle}>Total Budget Overview</Text>

        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.label}>Spent</Text>
            <Text style={styles.spent}>₹{totalSpent}</Text>
          </View>

          <View style={styles.divider} />

          <View>
            <Text style={styles.label}>Remaining</Text>
            <Text style={styles.remaining}>
              ₹{totalBudget - totalSpent}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* 🔥 MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Budget</Text>

            <TextInput
              placeholder="Category"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={newCategory}
              onChangeText={setNewCategory}
            />

            <TextInput
              placeholder="Limit"
              placeholderTextColor="#aaa"
              style={styles.input}
              keyboardType="numeric"
              value={newLimit}
              onChangeText={setNewLimit}
            />

            <TouchableOpacity onPress={addBudget}>
              <LinearGradient
                colors={["#8b5cf6", "#6366f1"]}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Add</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: "#aaa", marginTop: 10 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
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

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#aaa",
  },

  addBtn: {
    backgroundColor: "#8b5cf6",
    padding: 12,
    borderRadius: 30,
  },

  card: {
    backgroundColor: "#1a1a2e",
    padding: 15,
    borderRadius: 15,
    marginTop: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  category: {
    color: "#fff",
    marginLeft: 10,
    fontWeight: "bold",
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f87171",
  },

  amount: {
    color: "#aaa",
    marginVertical: 10,
  },

  progressBg: {
    height: 8,
    backgroundColor: "#111",
    borderRadius: 10,
  },

  progress: {
    height: 8,
    backgroundColor: "#10b981",
    borderRadius: 10,
  },

  percent: {
    color: "#10b981",
    textAlign: "right",
    marginTop: 5,
  },

  summary: {
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
  },

  summaryTitle: {
    color: "#ddd",
    marginBottom: 10,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "#ddd",
  },

  spent: {
    color: "#ef4444",
    fontSize: 20,
    fontWeight: "bold",
  },

  remaining: {
    color: "#10b981",
    fontSize: 20,
    fontWeight: "bold",
  },

  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#ccc",
  },
  modalContainer: {
  flex: 1,
  justifyContent: "center",
  backgroundColor: "rgba(0,0,0,0.7)",
},

modal: {
  backgroundColor: "#1a1a2e",
  margin: 20,
  padding: 20,
  borderRadius: 20,
},

modalTitle: {
  color: "#fff",
  fontSize: 18,
  marginBottom: 15,
},

input: {
  backgroundColor: "#111827",
  color: "#fff",
  padding: 12,
  borderRadius: 10,
  marginBottom: 10,
},

button: {
  padding: 12,
  borderRadius: 10,
  alignItems: "center",
},

buttonText: {
  color: "#fff",
  fontWeight: "bold",
},

warning: {
  color: "#ef4444",
  marginTop: 5,
  fontSize: 12,
},
});