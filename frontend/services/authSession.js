import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";

const AUTH_STATE_CHANGED = "authStateChanged";

export const setSession = async ({ token, user }) => {
  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("user", JSON.stringify(user));
  DeviceEventEmitter.emit(AUTH_STATE_CHANGED, true);
};

export const clearSession = async () => {
  await AsyncStorage.removeItem("token");
  
  DeviceEventEmitter.emit(AUTH_STATE_CHANGED, false);
};

export const getStoredToken = () => AsyncStorage.getItem("token");

export const subscribeToAuthState = (callback) => {
  return DeviceEventEmitter.addListener(AUTH_STATE_CHANGED, callback);
};
