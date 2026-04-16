import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function OnboardingScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Expense-Nova",
      description: "Track your expenses automatically from bank SMS",
      icon: "wallet",
    },
    {
      title: "SMS Auto-Tracking",
      description: "We'll monitor bank SMS and automatically add expenses",
      icon: "mail",
    },
    {
      title: "Smart Categories",
      description: "Expenses are auto-categorized (Food, Travel, etc.)",
      icon: "pricetags",
    },
    {
      title: "All Set! 🎉",
      description: "Ready to track your finances smartly",
      icon: "checkmark-circle",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.navigate("Login");
    }
  };

  const step = steps[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#8b5cf6", "#ec4899"]} style={styles.background}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name={step.icon} size={80} color="#ffffff" />
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          <View style={styles.dots}>
            {steps.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, idx === currentStep && styles.activeDot]}
              />
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  iconContainer: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 15, textAlign: "center" },
  description: { fontSize: 16, color: "#fff", textAlign: "center", marginBottom: 40, opacity: 0.9 },
  dots: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff", marginHorizontal: 5, opacity: 0.5 },
  activeDot: { opacity: 1, width: 24 },
  button: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginHorizontal: 20, marginBottom: 30 },
  buttonText: { textAlign: "center", fontSize: 18, fontWeight: "bold", color: "#8b5cf6" },
});