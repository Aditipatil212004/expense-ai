import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

import AuthNavigator from "./navigation/AuthNavigator";
import DrawerNavigator from "./navigation/DrawerNavigator";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

 useEffect(() => {
  const checkLogin = async () => {
    const token = await AsyncStorage.getItem("token");
    setIsLoggedIn(!!token);
  };
  checkLogin();
}, []);

  if (isLoggedIn === null) return null;

  return (
    <NavigationContainer>
  {isLoggedIn ? <DrawerNavigator /> : <AuthNavigator />}
</NavigationContainer>
  );
}