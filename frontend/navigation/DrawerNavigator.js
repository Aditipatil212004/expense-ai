import { createDrawerNavigator } from "@react-navigation/drawer";
import MainTabs from "./MainTabs";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import LogoutScreen from "../screens/LogoutScreen";


const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerStyle: {
          backgroundColor: "#0a0a12",
        },
        drawerActiveTintColor: "#8b5cf6",
        drawerInactiveTintColor: "#aaa",
      }}
    >
      <Drawer.Screen name="Home" component={MainTabs} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Logout" component={LogoutScreen} />
    </Drawer.Navigator>
  );
}