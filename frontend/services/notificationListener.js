import { DeviceEventEmitter, NativeModules, Platform } from "react-native";

const { NotificationListener } = NativeModules;

export const openNotificationListenerSettings = async () => {
  if (Platform.OS !== "android" || !NotificationListener) return false;
  try {
    return await NotificationListener.openNotificationListenerSettings();
  } catch (error) {
    console.warn("Unable to open notification settings:", error);
    return false;
  }
};

export const isNotificationServiceEnabled = async () => {
  if (Platform.OS !== "android" || !NotificationListener) return false;
  try {
    return await NotificationListener.isNotificationServiceEnabled();
  } catch (error) {
    console.warn("Unable to check notification listener status:", error);
    return false;
  }
};

export const subscribeToNotifications = (callback) => {
  if (Platform.OS !== "android" || !NotificationListener) return null;

  const subscription = DeviceEventEmitter.addListener(
    "notificationReceived",
    callback
  );
  return subscription;
};