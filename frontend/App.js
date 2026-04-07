import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";

import AuthNavigator from "./navigation/AuthNavigator";
import DrawerNavigator from "./navigation/DrawerNavigator";
import { startSmsListener } from "./services/smsListener";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

 useEffect(() => {
  const checkLogin = async () => {
    const token = await AsyncStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  checkLogin();

  const interval = setInterval(checkLogin, 1000); // 🔥 auto update

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const requestSmsPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          {
            title: 'SMS Permission',
            message: 'This app needs access to SMS to track expenses.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('SMS permission granted');
        } else {
          console.log('SMS permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  requestSmsPermission();
}, []);

useEffect(() => {
  if (isLoggedIn) {
    const subscription = startSmsListener();
    return () => subscription.remove();
  }
}, [isLoggedIn]);

  if (isLoggedIn === null) return null;

  return (
    <NavigationContainer>
  {isLoggedIn ? <DrawerNavigator /> : <AuthNavigator />}
</NavigationContainer>
  );
}