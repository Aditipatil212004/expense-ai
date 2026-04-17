import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useRef } from "react";
import { PermissionsAndroid, Platform, Alert } from "react-native";

import AuthNavigator from "./navigation/AuthNavigator";
import MainStack from "./navigation/MainStack";
import { startSmsListener, testBackendConnection } from "./services/smsListener";
import { parseAndSendNotification } from "./services/expenseIngestion";
import {
  isNotificationServiceEnabled,
  subscribeToNotifications,
} from "./services/notificationListener";
import { getTransactions } from "./services/api";
import { getStoredToken, subscribeToAuthState } from "./services/authSession";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [smsPermissionGranted, setSmsPermissionGranted] = useState(false);
  const smsSubscriptionRef = useRef(null);
  const [notificationAccessGranted, setNotificationAccessGranted] = useState(false);
  const notificationSubscriptionRef = useRef(null);

  // LOGIN CHECK
  useEffect(() => {
    let isMounted = true;

    const syncAuthState = async () => {
      const token = await getStoredToken();

      if (!token) {
        if (isMounted) setIsLoggedIn(false);
        return;
      }

      try {
        // Verify stored token before enabling background listeners.
        await getTransactions({ skipSessionExpiredAlert: true });
        if (isMounted) setIsLoggedIn(true);
      } catch (error) {
        if (isMounted) setIsLoggedIn(false);
      }
    };
    
    syncAuthState();

    const subscription = subscribeToAuthState((loggedIn) => {
      if (isMounted) {
        setIsLoggedIn(Boolean(loggedIn));
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  // TEST BACKEND
  useEffect(() => {
    if (isLoggedIn) {
      testBackendConnection().then(() => {});
    }
  }, [isLoggedIn]);

  // REQUEST SMS PERMISSIONS
  useEffect(() => {
    const requestSmsPermissions = async () => {
      if (Platform.OS === "android") {
        try {
          console.log("🔐 Requesting SMS permissions...");
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
            PermissionsAndroid.PERMISSIONS.READ_SMS,
          ]);

          console.log("📋 Permission results:", granted);
          
          if (
            granted["android.permission.RECEIVE_SMS"] === "granted" &&
            granted["android.permission.READ_SMS"] === "granted"
          ) {
            console.log("✅ SMS permissions GRANTED - SMS receiver will work!");
            console.log("   RECEIVE_SMS: " + granted["android.permission.RECEIVE_SMS"]);
            console.log("   READ_SMS: " + granted["android.permission.READ_SMS"]);
            setSmsPermissionGranted(true);
          } else {
            console.warn("⚠️ SMS permissions DENIED:");
            console.warn("   RECEIVE_SMS: " + granted["android.permission.RECEIVE_SMS"]);
            console.warn("   READ_SMS: " + granted["android.permission.READ_SMS"]);
            console.warn("   SMS receiver will NOT work - please grant permissions!");
            Alert.alert(
              "Permission Required ⚠️",
              "Please allow SMS permissions for automatic expense tracking from bank messages.\n\nWithout these permissions, the app won't receive SMS.",
              [{ text: "OK", onPress: requestSmsPermissions }]
            );
          }
        } catch (err) {
          console.error("❌ Permission request error:", err);
        }
      } else {
        console.log("ℹ️ Not on Android - SMS receiver not available");
      }
    };

    requestSmsPermissions();
  }, []);

  // CHECK NOTIFICATION ACCESS
  useEffect(() => {
    const checkNotificationAccess = async () => {
      if (Platform.OS === "android") {
        const enabled = await isNotificationServiceEnabled();
        setNotificationAccessGranted(enabled);
        if (!enabled) {
          console.log("Notification listener access is not enabled");
        }
      }
    };

    checkNotificationAccess();
  }, []);

  // START SMS LISTENER
  useEffect(() => {
    if (isLoggedIn && smsPermissionGranted) {
      if (smsSubscriptionRef.current) return;

      console.log("🚀 Starting SMS Listener...");
      const subscription = startSmsListener();

      smsSubscriptionRef.current = subscription;

      return () => {
        if (smsSubscriptionRef.current) {
          smsSubscriptionRef.current.remove();
          smsSubscriptionRef.current = null;
        }
      };
    }
  }, [isLoggedIn, smsPermissionGranted]);

  // START NOTIFICATION LISTENER
  useEffect(() => {
    if (isLoggedIn && notificationAccessGranted) {
      if (notificationSubscriptionRef.current) return;

      const subscription = subscribeToNotifications(async (notification) => {
        console.log("Notification received:", notification);
        try {
          await parseAndSendNotification(notification);
        } catch (error) {
          console.error("❌ Failed to process notification:", error.message);
        }
      });

      notificationSubscriptionRef.current = subscription;

      return () => {
        subscription?.remove();
        notificationSubscriptionRef.current = null;
      };
    }
  }, [isLoggedIn, notificationAccessGranted]);

  if (isLoggedIn === null) return null;

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
