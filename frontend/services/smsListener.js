import SmsListener from "react-native-android-sms-listener";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

// 🔧 CONFIGURABLE BACKEND HOST
// If you are using the Android emulator, keep 10.0.2.2.
// If you are using a physical Android device, change BACKEND_HOST to your computer's LAN IP.
// Example: http://192.168.1.123:5000
const BACKEND_HOST = "10.0.2.2";
const BACKEND_PORT = 5000;
export const BACKEND_BASE_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;
export const API_BASE_URL = `${BACKEND_BASE_URL}/api`;

// Test if backend is reachable
export const testBackendConnection = async () => {
  try {
    const response = await axios.get(BACKEND_BASE_URL, { timeout: 5000 });
    console.log("✅ Backend is reachable:", response.data);
    return true;
  } catch (error) {
    console.error("❌ Backend not reachable. Error:", error.message);
    Alert.alert(
      "Backend Connection Failed",
      `Backend is not running at ${BACKEND_BASE_URL}\n\nIf you are using a physical device, update BACKEND_HOST in frontend/services/smsListener.js to your PC LAN IP:` +
      "\nexample: http://192.168.1.123:5000"
    );
    return false;
  }
};

// 🚀 START LISTENER
export const startSmsListener = () => {
  try {
    console.log("🔴 SMS Listener starting...");
    
    const subscription = SmsListener.addListener((message) => {
      console.log("📩 Raw SMS received:", JSON.stringify(message, null, 2));
      parseAndSendSms(message);
    });

    console.log("🟢 SMS Listener started successfully");
    return subscription;
  } catch (error) {
    console.error("❌ Failed to start SMS Listener:", error);
    return null;
  }
};

// 🧠 CATEGORY DETECTION
const detectCategory = (merchant) => {
  const m = merchant.toLowerCase();

  if (m.includes("swiggy") || m.includes("zomato") || m.includes("food")) return "Food";
  if (m.includes("amazon") || m.includes("flipkart") || m.includes("shopping")) return "Shopping";
  if (m.includes("uber") || m.includes("ola") || m.includes("travel")) return "Travel";
  if (m.includes("netflix") || m.includes("spotify") || m.includes("entertainment")) return "Entertainment";
  if (m.includes("petrol") || m.includes("fuel")) return "Fuel";
  if (m.includes("grocery") || m.includes("market")) return "Groceries";

  return "Others";
};

// 🔍 MAIN PARSER
const parseAndSendSms = async (message) => {
  try {
    const { body, originatingAddress } = message;

    console.log("🔍 Processing SMS from:", originatingAddress);
    console.log("📄 SMS body:", body);

    // 💰 AMOUNT PARSING (FLEXIBLE)
    const amountMatch = body.match(/(Rs\.?|INR|₹)\s?(\d+(?:,\d+)*(?:\.\d{1,2})?)/i);

    if (!amountMatch) {
      console.log("⚠️ No amount found in SMS");
      return;
    }

    // 🏪 MERCHANT PARSING (MORE FLEXIBLE)
    let merchant = "";
    
    // Try multiple patterns
    const merchantPatterns = [
      /at\s+([A-Za-z0-9\s&.-]+?)(?:\s+(?:on|for|of|amount|INR|Rs|\d))/i,
      /at\s+([A-Za-z0-9\s&.-]+?)$/i,
      /to\s+([A-Za-z0-9\s&.-]+?)(?:\s+(?:on|for|of|amount|INR|Rs|\d))/i,
      /merchant\s+([A-Za-z0-9\s&.-]+?)(?:\s+(?:on|for|of|amount|INR|Rs|\d))/i,
    ];

    for (const pattern of merchantPatterns) {
      const match = body.match(pattern);
      if (match) {
        merchant = match[1].trim();
        break;
      }
    }

    // If no merchant found, extract some identifier
    if (!merchant) {
      const words = body.split(/\s+/);
      merchant = words.slice(2, 6).join(" "); // Get a few words from SMS
    }

    // 📅 DATE PARSING (DEFAULT TO TODAY)
    const dateMatch = body.match(/(?:on|date)\s+([\d\/\-]+)/i);
    const date = dateMatch
      ? dateMatch[1]
      : new Date().toISOString().split("T")[0];

    // 🧾 PREVENT DUPLICATES
    const smsHash = `${body}_${originatingAddress}_${date}`;
    const lastSms = await AsyncStorage.getItem("last_sms_hash");
    
    if (lastSms === smsHash) {
      console.log("⚠️ Duplicate SMS ignored");
      return;
    }
    await AsyncStorage.setItem("last_sms_hash", smsHash);

    const amount = parseFloat(amountMatch[2].replace(/,/g, ""));
    const category = detectCategory(merchant);

    const expenseData = {
      amount,
      category,
      description: `Payment at ${merchant}`,
      date,
      merchant,
    };

    console.log("📤 Sending expense:", expenseData);

    // 🔐 AUTH TOKEN
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      console.log("❌ No token found - SMS will be saved when user logs in");
      // Save SMS for later processing
      const pendingSms = JSON.parse(await AsyncStorage.getItem("pending_sms") || "[]");
      pendingSms.push(expenseData);
      await AsyncStorage.setItem("pending_sms", JSON.stringify(pendingSms));
      return;
    }

    // 🌐 API CALL WITH TIMEOUT AND DETAILED ERROR HANDLING
    try {
      const axiosInstance = axios.create({
        timeout: 10000, // 10 second timeout
      });

      const response = await axiosInstance.post(`${API_BASE_URL}/expenses`, expenseData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Expense added from SMS:", response.data);

      // 🔔 USER FEEDBACK
      Alert.alert(
        "✅ Expense Tracked", 
        `₹${amount} added for ${category} at ${merchant}`
      );
    } catch (networkError) {
      console.error("❌ Network Error Details:", {
        message: networkError.message,
        code: networkError.code,
        status: networkError.response?.status,
        statusText: networkError.response?.statusText,
        data: networkError.response?.data,
      });

      // Alert user about network issue
      Alert.alert(
        "Network Error",
        `Failed to send expense: ${networkError.message}\n\nMake sure backend is running at: http://10.0.2.2:5000`
      );

      // Save to pending for retry
      const pendingSms = JSON.parse(await AsyncStorage.getItem("pending_sms") || "[]");
      pendingSms.push(expenseData);
      await AsyncStorage.setItem("pending_sms", JSON.stringify(pendingSms));
      console.log("📝 Expense saved to pending queue for later retry");
    }
  } catch (error) {
    console.error("❌ SMS Processing Error:", error.message);
  }
};