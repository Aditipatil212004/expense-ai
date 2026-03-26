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

  if (!amountMatch) {
    return null;
  }

  const parsed = Number(amountMatch[1].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
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
    const { amount, category } = req.body;

    const expense = await Expense.create({
      amount,
      category,
      userId: req.user.id,
      type: "debit",
      merchant: "Manual",
    });

    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: "Error adding expense" });
  }
};

// 📥 GET EXPENSES
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching expenses" });
  }
};

// 📲 INGEST BANK/SHOP NOTIFICATION TEXT
exports.ingestNotification = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Notification message is required" });
    }

    const amount = extractAmount(message);
    if (!amount) {
      return res.status(400).json({ message: "Unable to detect amount from notification" });
    }

    const type = detectType(message);
    const category = detectCategory(message, type);
    const merchant = extractMerchant(message);

    const expense = await Expense.create({
      amount,
      category,
      userId: req.user.id,
      type,
      merchant,
      sourceText: message,
      source: "notification",
    });

    return res.status(201).json({
      message: "Notification processed",
      transaction: expense,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error processing notification" });
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
