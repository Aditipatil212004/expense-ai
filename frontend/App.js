import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useRef } from "react";
import { PermissionsAndroid, Platform, Alert } from "react-native";

import AuthNavigator from "./navigation/AuthNavigator";
import DrawerNavigator from "./navigation/DrawerNavigator";
import { startSmsListener, testBackendConnection } from "./services/smsListener";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [smsPermissionGranted, setSmsPermissionGranted] = useState(false);
  const [backendReachable, setBackendReachable] = useState(false);
  const smsSubscriptionRef = useRef(null);

 useEffect(() => {
  const checkLogin = async () => {
    const token = await AsyncStorage.getItem("token");
    const newIsLoggedIn = !!token;
    console.log("🔍 Login check - Token exists:", !!token, "isLoggedIn:", newIsLoggedIn);
    setIsLoggedIn(newIsLoggedIn);
  };

  checkLogin();

  // Listen for token changes (when it gets cleared due to expiration)
  const tokenCheckInterval = setInterval(checkLogin, 2000); // Check every 2 seconds

  return () => clearInterval(tokenCheckInterval);
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

        console.log("📱 Current SMS Permissions - RECEIVE:", receiveSmsGranted, "READ:", readSmsGranted);

        if (receiveSmsGranted && readSmsGranted) {
          console.log("✅ SMS permissions already granted - Setting state to true");
          setSmsPermissionGranted(true);
          return;
        }

        console.log("🔔 Requesting SMS permissions...");
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

        console.log("📱 Permission Results:", JSON.stringify(results, null, 2));

        if (
          results[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === PermissionsAndroid.RESULTS.GRANTED &&
          results[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('✅ SMS permissions GRANTED - Setting state to true');
          setSmsPermissionGranted(true);
        } else {
          console.log('⚠️ SMS permissions DENIED or NOT ANSWERED');
          console.log('   RECEIVE_SMS result:', results[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS]);
          console.log('   READ_SMS result:', results[PermissionsAndroid.PERMISSIONS.READ_SMS]);
          Alert.alert(
            'SMS Permission Required',
            'Please enable SMS permissions in Settings > Apps > [AppName] > Permissions > SMS for SMS-based expense tracking.'
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
  console.log("📍 SMS Listener Effect - Checking conditions:");
  console.log("   isLoggedIn:", isLoggedIn);
  console.log("   smsPermissionGranted:", smsPermissionGranted);
  console.log("   Current subscription:", smsSubscriptionRef.current ? "EXISTS" : "NULL");
  
  if (isLoggedIn && smsPermissionGranted) {
    // Only start if not already started
    if (smsSubscriptionRef.current) {
      console.log("⏸ SMS listener already running");
      return;
    }
    
    console.log("✅ Both conditions met - Starting SMS listener...");
    const subscription = startSmsListener();
    
    if (subscription) {
      console.log("✅ SMS listener subscription received:", typeof subscription);
      smsSubscriptionRef.current = subscription;
    } else {
      console.error("❌ SMS listener returned null/undefined");
    }
    
    return () => {
      console.log("🛑 Cleaning up SMS listener effect...");
      if (smsSubscriptionRef.current) {
        console.log("🛑 Removing SMS listener subscription");
        smsSubscriptionRef.current.remove();
        smsSubscriptionRef.current = null;
      }
    };
  } else {
    console.log("⏳ Waiting for conditions - Login:", !!isLoggedIn, "Permissions:", !!smsPermissionGranted);
    
    // Clean up if permissions/login changed
    return () => {
      if (smsSubscriptionRef.current) {
        console.log("🛑 Cleaning up subscription due to state change");
        smsSubscriptionRef.current.remove();
        smsSubscriptionRef.current = null;
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