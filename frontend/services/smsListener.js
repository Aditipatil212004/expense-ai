import SmsListener from "react-native-android-sms-listener";
import axios from "axios";
import { DeviceEventEmitter } from "react-native";
import { BACKEND_BASE_URL } from "./config";
import { parseAndSendSms } from "./expenseIngestion";

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
  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🧪 Testing backend connection (Attempt ${i + 1}/${maxRetries}) to:`, BACKEND_BASE_URL);
      const response = await axios.get(BACKEND_BASE_URL, { timeout: 10000 }); // Increased timeout
      console.log("✅ Backend is reachable:", response.data);
      return true;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Attempt ${i + 1} failed:`, error.message);
      
      if (i < maxRetries - 1) {
        // Wait before retrying (exponential backoff)
        const waitTime = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        console.log(`⏳ Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  console.error("❌ Backend not reachable after retries.");
  console.error("  URL:", BACKEND_BASE_URL);
  console.error("  Last Error:", lastError.message);
  return false;
};

// 🚀 START LISTENER
export const startSmsListener = () => {
  try {
    console.log("🔴 SMS Listener starting...");
    console.log("   Using library:", "react-native-android-sms-listener");
    console.log("   Also listening for native SMSReceiver events...");
    
    let smsReceiveCount = 0;
    const librarySubscription = SmsListener.addListener((message) => {
      smsReceiveCount++;
      console.log(`\n📩 SMS #${smsReceiveCount} RECEIVED via library`);
      console.log("===== RAW SMS RECEIVED FROM LIBRARY =====");
      console.log("   From:", message.originatingAddress);
      console.log("   Body:", message.body);
      console.log("   Timestamp:", message.date);
      console.log("   Raw message object:", JSON.stringify(message, null, 2));
      console.log("=============================\n");
      parseAndSendSms(message).catch((err) => {
        console.error("❌ [SMS Library Callback] Error in parseAndSendSms:", err.message);
      });
    });

    let nativeReceiveCount = 0;
    const nativeReceiverSubscription = DeviceEventEmitter.addListener("smsReceived", (message) => {
      nativeReceiveCount++;
      console.log(`\n📩 SMS #${nativeReceiveCount} RECEIVED via native SMSReceiver`);
      console.log("===== RAW SMS RECEIVED FROM NATIVE RECEIVER =====");
      console.log("   From:", message.originatingAddress);
      console.log("   Body:", message.body);
      console.log("   Timestamp:", message.date);
      console.log("   Raw message object:", JSON.stringify(message, null, 2));
      console.log("==============================================\n");
      parseAndSendSms(message).catch((err) => {
        console.error("❌ [Native SMSReceiver] Error in parseAndSendSms:", err.message);
      });
    });

    console.log("🟢 SMS Listener started successfully!");
    console.log("✅ Library listener active (SmsListener)");
    console.log("✅ Native listener active (SMSReceiver via DeviceEventEmitter)");
    console.log("   Waiting for incoming SMS messages...");
    console.log("   Counts - Library:", smsReceiveCount, "Native:", nativeReceiveCount);
    console.log("   TIP: Use 'Test' button on dashboard to verify parsing works!");

    return {
      remove: () => {
        console.log("🛑 Stopping SMS listeners...");
        librarySubscription?.remove?.();
        nativeReceiverSubscription?.remove?.();
        console.log("✅ SMS listeners stopped");
      },
    };
  } catch (error) {
    console.error("❌ Failed to start SMS Listener:", error);
    console.error("   Error details:", JSON.stringify(error, null, 2));
    return null;
  }
};
