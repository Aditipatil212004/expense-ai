const Expense = require("../models/Expense");

const CATEGORY_KEYWORDS = {
  Food: ["swiggy", "zomato", "restaurant", "cafe", "food", "dining", "pizza"],
  Travel: ["uber", "ola", "irctc", "metro", "flight", "hotel", "petrol", "fuel", "travel"],
  Shopping: ["amazon", "flipkart", "myntra", "shopping", "store", "mart"],
  Bills: ["electricity", "water", "broadband", "recharge", "bill", "emi", "insurance"],
  Entertainment: ["netflix", "spotify", "movie", "bookmyshow", "gaming", "entertainment"],
};

const CREDIT_KEYWORDS = ["credited", "deposit", "received", "refund", "salary", "cashback"];
const DEBIT_KEYWORDS = ["debited", "spent", "paid", "purchase", "withdrawn", "sent", "dr"];

function detectType(message) {
  const normalized = message.toLowerCase();

  if (CREDIT_KEYWORDS.some((word) => normalized.includes(word))) {
    return "credit";
  }

  if (DEBIT_KEYWORDS.some((word) => normalized.includes(word))) {
    return "debit";
  }

  return "debit";
}

function extractAmount(message) {
  const amountMatch = message.match(/(?:rs\.?|inr|₹)\s?([\d,]+(?:\.\d{1,2})?)/i);

  const amountText = amountMatch ? amountMatch[1] : null;
  if (amountText) {
    const parsed = Number(amountText.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  const fallbackMatch = message.match(/([0-9]+(?:,[0-9]{3})*(?:\.\d{1,2})?)/);
  if (!fallbackMatch) {
    return null;
  }

  const parsedFallback = Number(fallbackMatch[1].replace(/,/g, ""));
  return Number.isFinite(parsedFallback) ? parsedFallback : null;
}

function detectCategory(message, type) {
  if (type === "credit") {
    return "Income";
  }

  const normalized = message.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((word) => normalized.includes(word))) {
      return category;
    }
  }

  return "Others";
}

function extractMerchant(message) {
  const atMatch = message.match(/(?:at|to)\s+([a-zA-Z0-9&.\-\s]{2,40})/i);

  if (!atMatch) {
    return "Unknown";
  }

  return atMatch[1].trim().replace(/[.\n].*$/, "");
}

// ➕ ADD EXPENSE
exports.addExpense = async (req, res) => {
  try {
    const { amount, category, merchant, sourceText } = req.body;

    const expense = await Expense.create({
      amount,
      category: category || "Others",
      userId: req.user.id,
      type: "debit",
      merchant: merchant || "Manual",
      sourceText,
      source: "manual",
    });

    res.json(expense);
  } catch (err) {
    console.error("Error adding expense:", err.message);
    res.status(500).json({ message: "Error adding expense" });
  }
};

// 📥 GET EXPENSES
exports.getExpenses = async (req, res) => {
  try {
    console.log("📥 GET /expenses called");
    console.log("   req.user:", req.user);
    console.log("   req.user.id:", req.user?.id);
    
    if (!req.user || !req.user.id) {
      console.error("❌ Auth failed: req.user or req.user.id missing");
      return res.status(401).json({ message: "User not authenticated" });
    }

    console.log("🔍 Finding expenses for userId:", req.user.id);
    const expenses = await Expense.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    console.log("✅ Found", expenses.length, "expenses");
    res.json(expenses);
  } catch (err) {
    console.error("❌ Error getting expenses:");
    console.error("   Message:", err.message);
    console.error("   Stack:", err.stack);
    res.status(500).json({ message: "Error fetching expenses", error: err.message });
  }
};

// 📲 INGEST BANK/SHOP NOTIFICATION TEXT
exports.ingestNotification = async (req, res) => {
  try {
    console.log("📲 INGEST REQUEST:", {
      userId: req.user?.id,
      body: req.body,
      headers: req.headers.authorization ? "Bearer token present" : "No auth header"
    });

    const { message } = req.body;

    if (!message || typeof message !== "string") {
      console.log("❌ Invalid message:", message);
      return res.status(400).json({ message: "Notification message is required" });
    }

    console.log("🔍 Processing message:", message);

    const amount = extractAmount(message);
    console.log("💰 Extracted amount:", amount);

    if (!amount) {
      console.log("❌ No amount found in message");
      return res.status(400).json({ message: "Unable to detect amount from notification" });
    }

    const type = detectType(message);
    const category = detectCategory(message, type);
    const merchant = extractMerchant(message);

    console.log("📊 Extracted data:", { amount, type, category, merchant });

    const expenseData = {
      amount,
      category,
      userId: req.user.id,
      type,
      merchant,
      sourceText: message,
      source: "notification",
    };

    console.log("💾 Creating expense:", expenseData);

    const expense = await Expense.create(expenseData);

    console.log("✅ Expense created:", expense);

    return res.status(201).json({
      message: "Notification processed",
      transaction: expense,
    });
  } catch (err) {
    console.error("❌ INGEST ERROR:", err.message, err.stack);
    return res.status(500).json({ message: "Error processing notification", error: err.message });
  }
};

// 📈 CREDIT/DEBIT + SPENDING SUMMARY
exports.getNotificationSummary = async (req, res) => {
  try {
    const transactions = await Expense.find({ userId: req.user.id });

    const totalCredited = transactions
      .filter((tx) => tx.type === "credit")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalDebited = transactions
      .filter((tx) => tx.type !== "credit")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const spendingByCategory = transactions
      .filter((tx) => tx.type !== "credit")
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
      }, {});

    return res.json({
      totalCredited,
      totalDebited,
      spendingByCategory,
      transactionCount: transactions.length,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error generating summary" });
  }
};
