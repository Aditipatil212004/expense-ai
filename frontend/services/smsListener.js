import SmsListener from "react-native-android-sms-listener";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, DeviceEventEmitter } from "react-native";
import { BACKEND_BASE_URL, API_BASE_URL } from "./config";
import API from "./api";

// 🧪 TEST FUNCTION - Call this manually to test the entire SMS flow
export const testSmsParsing = async () => {
  const testMessage = {
    body: "Your bank account debited by Rs. 327 at Amazon for SHOPPING",
    originatingAddress: "+91TEST"
  };
  
  console.log("🧪🧪🧪 MANUAL SMS TEST STARTED 🧪🧪🧪");
  console.log("Testing with message:", testMessage);
  await parseAndSendSms(testMessage);
  console.log("🧪🧪🧪 MANUAL SMS TEST FINISHED 🧪🧪🧪");
};

export const testBackendConnection = async () => {
  try {
    console.log("🧪 Testing backend connection to:", BACKEND_BASE_URL);
    const response = await axios.get(BACKEND_BASE_URL, { timeout: 5000 });
    console.log("✅ Backend is reachable:", response.data);
    return true;
  } catch (error) {
    console.error("❌ Backend not reachable.");
    console.error("  URL:", BACKEND_BASE_URL);
    console.error("  Error:", error.message);
    console.error("  Response:", error.response?.data || "No response");
    Alert.alert(
      "Backend Connection Failed",
      `Cannot reach ${BACKEND_BASE_URL}.\nError: ${error.message}`
    );
    return false;
  }
};

// 🚀 START LISTENER
export const startSmsListener = () => {
  try {
    console.log("🔴 SMS Listener starting...");
    console.log("   Using library:", "react-native-android-sms-listener");
    
    let smsReceiveCount = 0;
    
    // Add a global listener that logs all SMS
    const subscription = SmsListener.addListener((message) => {
      smsReceiveCount++;
      console.log(`📩 SMS #${smsReceiveCount} RECEIVED`);
      console.log("===== RAW SMS RECEIVED =====");
      console.log("   From:", message.originatingAddress);
      console.log("   Body:", message.body);
      console.log("   Timestamp:", message.date);
      console.log("   Raw message object:", JSON.stringify(message, null, 2));
      console.log("=============================");
      
      // Call parse function (don't await it here to prevent blocking)
      parseAndSendSms(message).catch(err => {
        console.error("❌ [SMS Callback] Error in parseAndSendSms:", err.message);
      });
    });

    console.log("🟢 SMS Listener started successfully");
    console.log("   Waiting for incoming SMS messages...");
    console.log("   Subscription ID:", subscription);
    console.log("   SMS receive count will increment with each message");
    
    return subscription;
  } catch (error) {
    console.error("❌ Failed to start SMS Listener:", error);
    console.error("   Error details:", JSON.stringify(error, null, 2));
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
export const parseAndSendSms = async (message) => {
  console.log("🔍 [parseAndSendSms] Function called");
  try {
    const { body, originatingAddress } = message;

    if (!body || !originatingAddress) {
      console.error("❌ [parseAndSendSms] Missing message properties");
      console.error("   body:", body);
      console.error("   originatingAddress:", originatingAddress);
      return;
    }

    console.log("🔍 Processing SMS from:", originatingAddress);
    console.log("📄 SMS body:", body);

    // 💰 AMOUNT PARSING (FLEXIBLE)
    const amountMatch = body.match(/(Rs\.?|INR|₹)\s?(\d+(?:,\d+)*(?:\.\d{1,2})?)/i);
    const amountText = amountMatch ? amountMatch[2] : null;

    let amount;
    if (amountText) {
      amount = parseFloat(amountText.replace(/,/g, ""));
    } else {
      const fallbackMatch = body.match(/([0-9]+(?:,[0-9]{3})*(?:\.\d{1,2})?)/);
      if (!fallbackMatch) {
        console.log("⚠️ No amount found in SMS");
        return;
      }
      amount = parseFloat(fallbackMatch[1].replace(/,/g, ""));
    }

    if (Number.isNaN(amount)) {
      console.log("⚠️ Unable to parse amount from SMS");
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

    const expenseData = {
      message: body,
    };

    console.log("📤 Sending notification to backend:", expenseData);

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
      console.log("📤 Making POST request to /expenses/notifications/ingest");
      console.log("   URL:", API_BASE_URL + "/expenses/notifications/ingest");
      console.log("   Data:", JSON.stringify(expenseData, null, 2));
      console.log("   Using configured API instance with interceptors...");
      
      const response = await API.post("/expenses/notifications/ingest", expenseData);

      console.log("✅ Backend response received");
      console.log("   Status:", response.status);
      console.log("   Response data:", JSON.stringify(response.data, null, 2));
      
      const emitData = response.data?.transaction || response.data;
      console.log("📢 About to emit event with data:", JSON.stringify(emitData, null, 2));
      DeviceEventEmitter.emit("expenseAddedFromSms", emitData);
      console.log("✅ Event emitted successfully");

      const savedAmount = response.data?.transaction?.amount ?? amount;
      const savedCategory = response.data?.transaction?.category ?? detectCategory(merchant);
      const savedMerchant = response.data?.transaction?.merchant ?? merchant;

      Alert.alert(
        "✅ Expense Tracked", 
        `₹${savedAmount} added for ${savedCategory} at ${savedMerchant}`
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
        `Failed to send expense: ${networkError.message}\n\nServer response: ${networkError.response?.data?.message || JSON.stringify(networkError.response?.data)}\n\nMake sure backend is running at: ${API_BASE_URL}`
      );

      // Save to pending for retry
      const pendingSms = JSON.parse(await AsyncStorage.getItem("pending_sms") || "[]");
      pendingSms.push(expenseData);
      await AsyncStorage.setItem("pending_sms", JSON.stringify(pendingSms));
      console.log("📝 Expense saved to pending queue for later retry");
    }
  } catch (error) {
    console.error("❌ CRITICAL SMS Processing Error:");
    console.error("   Message:", error.message);
    console.error("   Stack:", error.stack);
    console.error("   Full error:", JSON.stringify(error, null, 2));
    Alert.alert(
      "SMS Processing Error",
      `Failed to process SMS: ${error.message}`
    );
  }
};