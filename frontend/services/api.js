import axios from "axios";
import { Alert } from "react-native";
import { API_BASE_URL } from "./config";
import { clearSession, getStoredToken } from "./authSession";

const API = axios.create({
  baseURL: API_BASE_URL,
});

const isTransactionRouteMissing = (error) => {
  return (
    error?.response?.status === 404 &&
    typeof error?.config?.url === "string" &&
    error.config.url.startsWith("/transactions")
  );
};

API.interceptors.request.use(async (req) => {
  const token = await getStoredToken();
  const isAuthRoute = req.url?.startsWith("/auth/");

  console.log("🔐 API Request Interceptor:");
  console.log("   URL:", req.url);
  console.log("   Token present:", !!token);
  console.log("   Token preview:", token ? token.substring(0, 20) + "..." : "NO TOKEN");

  if (token && !isAuthRoute) {
    req.headers.Authorization = `Bearer ${token}`;
    console.log("   Auth header set: Bearer", token.substring(0, 20) + "...");
  } else if (isAuthRoute) {
    console.log("   Skipping auth header for auth route");
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
      await clearSession();
      
      // Show alert and redirect to login
      if (!error.config?.skipSessionExpiredAlert) {
        Alert.alert(
          "Session Expired",
          "Please sign in again.",
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
    }

    return Promise.reject(error);
  }
);

export const getTransactions = async (config = {}) => {
  try {
    return await API.get("/transactions", config);
  } catch (error) {
    if (!isTransactionRouteMissing(error)) {
      throw error;
    }

    console.warn("⚠️ /transactions not available, falling back to /expenses");
    return API.get("/expenses", config);
  }
};

export const createTransaction = async (payload, config = {}) => {
  try {
    return await API.post("/transactions", payload, config);
  } catch (error) {
    if (!isTransactionRouteMissing(error)) {
      throw error;
    }

    console.warn("⚠️ /transactions not available, falling back to /expenses");
    return API.post("/expenses", payload, config);
  }
};

export default API;
