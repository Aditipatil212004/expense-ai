import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LogoutScreen() {
  useEffect(() => {
    const logout = async () => {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user"); // ✅ ADD THIS
    };

    logout();
  }, []);

  return null;
}