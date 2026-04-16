import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { API_BASE_URL } from "./config";

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use(async (req) => {
  const token = await AsyncStorage.getItem("token");

  console.log("🔐 API Request Interceptor:");
  console.log("   URL:", req.url);
  console.log("   Token present:", !!token);
  console.log("   Token preview:", token ? token.substring(0, 20) + "..." : "NO TOKEN");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
    console.log("   Auth header set: Bearer", token.substring(0, 20) + "...");
  } else {
    console.log("   ⚠️  NO TOKEN FOUND - Request will likely fail with 401");
  }

  return req;
});

API.interceptors.response.use(
  (response) => {
    console.log("✅ API Response Success:", response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error("❌ API Response Error:");
    console.error("   Status:", error.response?.status);
    console.error("   URL:", error.config?.url);
    console.error("   Message:", error.response?.data?.message || error.message);
    console.error("   Data:", error.response?.data);

    // Handle token expiration
    if (error.response?.status === 401 && error.response?.data?.message === "Invalid or expired token") {
      console.log("🔄 Token expired - clearing stored token and redirecting to login");
      
      // Clear stored token
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      
      // Show alert and redirect to login
      Alert.alert(
        "Error",
        "Something Went Wrong,please try again",
        [
          {
            text: "OK",
            onPress: () => {
              // This will trigger the app to show login screen
              // since isLoggedIn will become false
            }
          }
        ]
      );
    }

    return Promise.reject(error);
  }
);

export default API;