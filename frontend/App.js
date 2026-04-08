import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { PermissionsAndroid, Platform, Alert } from "react-native";

import AuthNavigator from "./navigation/AuthNavigator";
import DrawerNavigator from "./navigation/DrawerNavigator";
import { startSmsListener, testBackendConnection } from "./services/smsListener";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [smsPermissionGranted, setSmsPermissionGranted] = useState(false);
  const [backendReachable, setBackendReachable] = useState(false);

 useEffect(() => {
  const checkLogin = async () => {
    const token = await AsyncStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  checkLogin();

  const interval = setInterval(checkLogin, 1000); // 🔥 auto update

  return () => clearInterval(interval);
}, []);

// TEST BACKEND CONNECTION ON LOGIN
useEffect(() => {
  if (isLoggedIn) {
    console.log("🔗 Testing backend connection...");
    testBackendConnection().then(setBackendReachable);
  }
}, [isLoggedIn]);

// REQUEST SMS PERMISSIONS
useEffect(() => {
  const requestSmsPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        // Check if already granted
        const receiveSmsGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
        );
        const readSmsGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_SMS
        );

        console.log("📱 SMS Permissions - RECEIVE:", receiveSmsGranted, "READ:", readSmsGranted);

        if (receiveSmsGranted && readSmsGranted) {
          console.log("✅ SMS permissions already granted");
          setSmsPermissionGranted(true);
          return;
        }

        // Request both permissions
        const permissions = [
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          PermissionsAndroid.PERMISSIONS.READ_SMS,
        ];

        const results = await PermissionsAndroid.requestMultiple(permissions, {
          title: 'SMS Access Required',
          message: 'This app needs permission to read SMS for automatic expense tracking.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Deny',
          buttonPositive: 'Allow',
        });

        console.log("📱 Permission Results:", results);

        if (
          results[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === PermissionsAndroid.RESULTS.GRANTED &&
          results[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('✅ SMS permissions granted');
          setSmsPermissionGranted(true);
        } else {
          console.log('⚠️ SMS permissions denied');
          Alert.alert(
            'SMS Permission Required',
            'Please enable SMS permissions in Settings > Apps for SMS-based expense tracking.'
          );
        }
      } catch (err) {
        console.warn("❌ Permission Error:", err);
      }
    }
  };

  requestSmsPermissions();
}, []);

// START SMS LISTENER (ONLY AFTER LOGIN & PERMISSIONS)
useEffect(() => {
  if (isLoggedIn && smsPermissionGranted) {
    console.log("🚀 Starting SMS listener...");
    const subscription = startSmsListener();
    
    return () => {
      if (subscription) {
        console.log("🛑 Stopping SMS listener...");
        subscription.remove();
      }
    };
  }
}, [isLoggedIn, smsPermissionGranted]);

  if (isLoggedIn === null) return null;

  return (
    <NavigationContainer>
  {isLoggedIn ? <DrawerNavigator /> : <AuthNavigator />}
</NavigationContainer>
  );
}