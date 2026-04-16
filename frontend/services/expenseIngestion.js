import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, DeviceEventEmitter } from "react-native";
import API from "./api";
import { API_BASE_URL } from "./config";

const BANK_NOTIFICATION_PACKAGES = [
  "com.google.android.apps.nbu.paisa.user",
  "net.one97.paytm",
  "com.phonepe.app",
  "in.org.npci.upiapp",
  "com.amazon.mShop.android.shopping",
  "com.samsung.android.spay",
  "com.google.android.apps.walletnfcrel",
];

const TRANSACTION_HINTS = [
  "debited",
  "spent",
  "purchase",
  "paid",
  "payment",
  "transaction",
  "withdrawn",
  "sent",
  "upi",
  "card",
  "credited",
  "received",
  "deposit",
  "salary",
  "refund",
  "cashback",
  "reversal",
];

const detectCategory = (merchant = "") => {
  const normalizedMerchant = merchant.toLowerCase();

  if (
    normalizedMerchant.includes("swiggy") ||
    normalizedMerchant.includes("zomato") ||
    normalizedMerchant.includes("food")
  ) {
    return "Food";
  }
  if (
    normalizedMerchant.includes("amazon") ||
    normalizedMerchant.includes("flipkart") ||
    normalizedMerchant.includes("shopping")
  ) {
    return "Shopping";
  }
  if (
    normalizedMerchant.includes("uber") ||
    normalizedMerchant.includes("ola") ||
    normalizedMerchant.includes("travel")
  ) {
    return "Travel";
  }
  if (
    normalizedMerchant.includes("netflix") ||
    normalizedMerchant.includes("spotify") ||
    normalizedMerchant.includes("entertainment")
  ) {
    return "Entertainment";
  }
  if (normalizedMerchant.includes("petrol") || normalizedMerchant.includes("fuel")) {
    return "Fuel";
  }
  if (normalizedMerchant.includes("grocery") || normalizedMerchant.includes("market")) {
    return "Groceries";
  }

  return "Others";
};

const parseAmount = (messageText) => {
  const amountMatch = messageText.match(
    /(?:rs\.?|inr|₹|amount)\s*[:\-]?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/i
  );
  const amountText = amountMatch?.[1];

  if (amountText) {
    return parseFloat(amountText.replace(/,/g, ""));
  }

  const fallbackMatch = messageText.match(/([0-9]+(?:,[0-9]{3})*(?:\.\d{1,2})?)/);
  if (!fallbackMatch) return null;

  return parseFloat(fallbackMatch[1].replace(/,/g, ""));
};

const parseMerchant = (messageText) => {
  const merchantPatterns = [
    /from\s+([A-Za-z0-9\s&./-]+?)(?:\s+(?:on|for|of|amount|inr|rs|\d))/i,
    /at\s+([A-Za-z0-9\s&./-]+?)(?:\s+(?:on|for|of|amount|inr|rs|\d))/i,
    /at\s+([A-Za-z0-9\s&./-]+?)$/i,
    /to\s+([A-Za-z0-9\s&./-]+?)(?:\s+(?:on|for|of|amount|inr|rs|\d))/i,
    /merchant\s+([A-Za-z0-9\s&./-]+?)(?:\s+(?:on|for|of|amount|inr|rs|\d))/i,
  ];

  for (const pattern of merchantPatterns) {
    const match = messageText.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  const words = messageText.trim().split(/\s+/).filter(Boolean);
  return words.slice(2, 6).join(" ").trim() || "Unknown";
};

const buildMessageFromNotification = (notification) => {
  return [notification.title, notification.text, notification.bigText]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

const shouldProcessNotification = (notification) => {
  const packageName = notification.packageName?.toLowerCase() || "";
  const messageText = buildMessageFromNotification(notification).toLowerCase();

  const looksLikeBankApp = BANK_NOTIFICATION_PACKAGES.some((pkg) =>
    packageName.includes(pkg)
  );
  const hasTransactionHint = TRANSACTION_HINTS.some((hint) => messageText.includes(hint));
  const hasCurrencyHint = /(rs\.?|inr|₹)/i.test(messageText);

  return (looksLikeBankApp || hasTransactionHint) && hasCurrencyHint;
};

const queuePendingExpense = async (expenseData) => {
  const pendingExpenses = JSON.parse(
    (await AsyncStorage.getItem("pending_sms")) || "[]"
  );
  pendingExpenses.push(expenseData);
  await AsyncStorage.setItem("pending_sms", JSON.stringify(pendingExpenses));
};

const createDedupKey = async ({ message, sender, source, occurredAt }) => {
  const dedupKey = `${source}_${sender}_${occurredAt}_${message}`;
  const lastDedupKey = await AsyncStorage.getItem("last_expense_ingest_hash");

  if (lastDedupKey === dedupKey) {
    return null;
  }

  await AsyncStorage.setItem("last_expense_ingest_hash", dedupKey);
  return dedupKey;
};

const ingestExpenseMessage = async ({
  message,
  sender,
  source,
  occurredAt,
  fallbackAmount,
  fallbackMerchant,
  silent = false,
}) => {
  if (!message || !sender) {
    return false;
  }

  const amount = parseAmount(message);
  if (amount == null || Number.isNaN(amount)) {
    console.log(`⚠️ Unable to parse amount from ${source}`);
    return false;
  }

  const dedupKey = await createDedupKey({
    message,
    sender,
    source,
    occurredAt,
  });

  if (!dedupKey) {
    console.log(`⚠️ Duplicate ${source} ignored`);
    return false;
  }

  const merchant = fallbackMerchant || parseMerchant(message);
  const expenseData = {
    message,
  };

  const token = await AsyncStorage.getItem("token");
  if (!token) {
    console.log(`❌ No token found - ${source} saved for later processing`);
    await queuePendingExpense(expenseData);
    return false;
  }

  try {
    console.log("📤 Making POST request to /expenses/notifications/ingest");
    console.log("   URL:", API_BASE_URL + "/expenses/notifications/ingest");
    console.log("   Data:", JSON.stringify(expenseData, null, 2));

    const response = await API.post("/expenses/notifications/ingest", expenseData);
    const transaction = response.data?.transaction || response.data;

    DeviceEventEmitter.emit("expenseAddedFromSms", transaction);

    if (!silent) {
      const savedAmount = transaction?.amount ?? fallbackAmount ?? amount;
      const savedCategory =
        transaction?.category ?? detectCategory(transaction?.merchant || merchant);
      const savedMerchant = transaction?.merchant ?? merchant;

      const savedType = transaction?.type;
      const isIncome = savedType === "income";
      Alert.alert(
        isIncome ? "Income Tracked" : "Expense Tracked",
        isIncome
          ? `₹${savedAmount} added to income from ${savedMerchant}`
          : `₹${savedAmount} added for ${savedCategory} at ${savedMerchant}`
      );
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to ingest ${source}:`, error.message);
    await queuePendingExpense(expenseData);

    const isExpiredSession =
      error.response?.status === 401 &&
      error.response?.data?.message === "Invalid or expired token";

    if (isExpiredSession) {
      console.log(`⚠️ ${source} saved for retry after re-login`);
      return false;
    }

    if (!silent) {
      Alert.alert(
        "Network Error",
        `Failed to send expense: ${error.message}\n\nServer response: ${
          error.response?.data?.message || JSON.stringify(error.response?.data)
        }\n\nMake sure backend is running at: ${API_BASE_URL}`
      );
    }

    return false;
  }
};

export const parseAndSendSms = async (message) => {
  console.log("🔍 [parseAndSendSms] Function called");

  const { body, originatingAddress, date } = message || {};
  const timestamp = date ? new Date(date) : new Date();
  const occurredAt = Number.isNaN(timestamp.getTime())
    ? new Date().toISOString()
    : timestamp.toISOString();

  return ingestExpenseMessage({
    message: body,
    sender: originatingAddress,
    source: "sms",
    occurredAt,
  });
};

export const parseAndSendNotification = async (notification) => {
  const messageText = buildMessageFromNotification(notification);
  if (!messageText || !shouldProcessNotification(notification)) {
    return false;
  }

  return ingestExpenseMessage({
    message: messageText,
    sender: notification.packageName || "notification",
    source: "notification",
    occurredAt: new Date().toISOString(),
    fallbackMerchant: notification.title || parseMerchant(messageText),
    silent: true,
  });
};
