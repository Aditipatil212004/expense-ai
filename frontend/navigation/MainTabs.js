import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import DashboardScreen from "../screens/DashboardScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import BudgetScreen from "../screens/BudgetScreen";
import InsightsScreen from "../screens/InsightsScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Dashboard") iconName = "home";
          else if (route.name === "Add") iconName = "add-circle";
          else if (route.name === "Budget") iconName = "wallet";
          else if (route.name === "Insights") iconName = "pie-chart";

          return <Ionicons name={iconName} size={size} color={color} />;
        },

        tabBarActiveTintColor: "#8b5cf6",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#0a0a12",
          borderTopWidth: 0,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Add" component={AddExpenseScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
    </Tab.Navigator>
  );
}