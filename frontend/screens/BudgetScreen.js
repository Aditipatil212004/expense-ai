// javascript
import React, { useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import API from "../services/api";

export default function BudgetScreen() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");

  useFocusEffect(
    useCallback(() => {
      getExpenses();
      getBudgets();
    }, [])
  );

  const getExpenses = async () => {
    try {
      const res = await API.get("/expenses");
      setExpenses(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const getBudgets = async () => {
    try {
      const res = await API.get("/budgets");
      setBudgets(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const getSpent = (category) => {
    return expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

  const addBudget = async () => {
    if (!newCategory || !newLimit) return;

    try {
      const res = await API.post("/budgets", {
        category: newCategory,
        limit: Number(newLimit),
      });

      setBudgets([...budgets, res.data]);
      setModalVisible(false);
      setNewCategory("");
      setNewLimit("");
    } catch (err) {
      console.log(err);
    }
  };

  const deleteBudget = async (id) => {
    try {
      await API.delete(`/budgets/${id}`);
      setBudgets(budgets.filter((b) => b._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const renderItem = ({ item }) => {
    const spent = getSpent(item.category);
    const percent = item.limit ? (spent / item.limit) * 100 : 0;
    const exceeded = spent > item.limit;

    return (
      <View style={[styles.card, exceeded && styles.cardExceeded]}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryContainer}>
            <View style={[styles.categoryIcon, exceeded && styles.categoryIconExceeded]}>
              <Ionicons 
                name={exceeded ? "alert-circle" : "wallet-outline"} 
                size={20} 
                color={exceeded ? "#ef4444" : "#8b5cf6"} 
              />
            </View>
            <View>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.categoryLabel}>Budget Limit</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.deleteBtn}
            onPress={() => deleteBudget(item._id)}
          >
            <Ionicons name="trash-outline" size={18} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={styles.amountSection}>
          <View>
            <Text style={styles.amountLabel}>Spent</Text>
            <Text style={[styles.spentAmount, exceeded && styles.exceededAmount]}>
              ₹{spent.toLocaleString()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.amountLabel}>Limit</Text>
            <Text style={styles.limitAmount}>₹{item.limit.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <LinearGradient
              colors={exceeded ? ["#ef4444", "#dc2626"] : ["#8b5cf6", "#7c3aed"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progress,
                { width: `${Math.min(percent, 100)}%` },
              ]}
            />
          </View>
          <Text style={[styles.percent, { color: exceeded ? "#ef4444" : "#8b5cf6" }]}>
            {Math.floor(percent)}%
          </Text>
        </View>

        {exceeded && (
          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={14} color="#ef4444" />
            <Text style={styles.warning}>Budget exceeded by ₹{(spent - item.limit).toLocaleString()}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>Monthly Budget</Text>
          <Text style={styles.title}>Overview</Text>
        </View>
      </View>

      {/* SUMMARY CARD */}
      <View style={styles.summaryCard}>
        <LinearGradient
          colors={["#8b5cf6", "#7c3aed"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryGradient}
        >
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Total Budget</Text>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeText}>This Month</Text>
            </View>
          </View>
          
          <Text style={styles.totalBudgetAmount}>₹{totalBudget.toLocaleString()}</Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="trending-down" size={16} color="#fca5a5" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Spent</Text>
                <Text style={styles.summarySpent}>₹{totalSpent.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="trending-up" size={16} color="#86efac" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Remaining</Text>
                <Text style={styles.summaryRemaining}>
                  ₹{(totalBudget - totalSpent).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* SECTION HEADER */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Budget Categories</Text>
        <Text style={styles.sectionCount}>{budgets.length} active</Text>
      </View>

      {/* LIST */}
      <FlatList
        data={budgets}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* FLOATING ADD BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={["#8b5cf6", "#7c3aed"]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSubtitle}>Create New</Text>
                <Text style={styles.modalTitle}>Budget Category</Text>
              </View>
              <TouchableOpacity 
                style={styles.modalClose}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category Name</Text>
              <TextInput
                placeholder="e.g., Groceries, Entertainment"
                placeholderTextColor="#475569"
                style={styles.input}
                value={newCategory}
                onChangeText={setNewCategory}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Budget Limit</Text>
              <View style={styles.inputWithIcon}>
                <Text style={styles.inputIcon}>₹</Text>
                <TextInput
                  placeholder="0"
                  placeholderTextColor="#475569"
                  style={[styles.input, styles.inputWithPadding]}
                  keyboardType="numeric"
                  value={newLimit}
                  onChangeText={setNewLimit}
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={addBudget}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#8b5cf6", "#7c3aed"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Create Budget</Text>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
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
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 60,
    marginBottom: 24,
  },

  subtitle: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  title: {
    color: "#f1f5f9",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  summaryCard: {
    marginBottom: 28,
    borderRadius: 20,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },

  summaryGradient: {
    padding: 24,
    borderRadius: 20,
  },

  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  summaryTitle: {
    color: "#e9d5ff",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  summaryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  summaryBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  totalBudgetAmount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 20,
    letterSpacing: -0.5,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  summaryIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryLabel: {
    color: "#e9d5ff",
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "500",
  },

  summarySpent: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  summaryRemaining: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    color: "#f1f5f9",
    fontSize: 18,
    fontWeight: "700",
  },

  sectionCount: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  cardExceeded: {
    borderWidth: 1.5,
    borderColor: "#ef4444",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  categoryIcon: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryIconExceeded: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },

  category: {
    color: "#f1f5f9",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
  },

  categoryLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
  },

  deleteBtn: {
    backgroundColor: "#0f172a",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  amountSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },

  amountLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  spentAmount: {
    color: "#8b5cf6",
    fontSize: 20,
    fontWeight: "700",
  },

  exceededAmount: {
    color: "#ef4444",
  },

  limitAmount: {
    color: "#cbd5e1",
    fontSize: 20,
    fontWeight: "700",
  },

  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#334155",
  },

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  progressBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#0f172a",
    borderRadius: 8,
    overflow: "hidden",
  },

  progress: {
    height: 8,
    borderRadius: 8,
  },

  percent: {
    fontSize: 14,
    fontWeight: "700",
    minWidth: 45,
    textAlign: "right",
  },

  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 10,
    borderRadius: 8,
  },

  warning: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "600",
  },

  fab: {
    position: "absolute",
    bottom: 32,
    right: 20,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },

  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },

  modalContent: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },

  modalSubtitle: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  modalTitle: {
    color: "#f1f5f9",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  modalClose: {
    backgroundColor: "#0f172a",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  inputContainer: {
    marginBottom: 20,
  },

  inputLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  input: {
    backgroundColor: "#0f172a",
    color: "#f1f5f9",
    padding: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: "500",
    borderWidth: 1.5,
    borderColor: "#334155",
  },

  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#334155",
  },

  inputIcon: {
    color: "#8b5cf6",
    fontSize: 20,
    fontWeight: "700",
    paddingLeft: 16,
  },

  inputWithPadding: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 0,
  },

  modalButton: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 8,
  },

  modalButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },

  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },

  cancelText: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "600",
  },
});
