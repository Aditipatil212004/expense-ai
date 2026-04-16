const Transaction = require("../models/Transaction");
const User = require("../models/User");

const CATEGORY_KEYWORDS = {
  Food: ["swiggy", "zomato", "restaurant", "cafe", "food", "dining", "pizza"],
  Travel: ["uber", "ola", "irctc", "metro", "flight", "hotel", "petrol", "fuel", "travel"],
  Shopping: ["amazon", "flipkart", "myntra", "shopping", "store", "mart"],
  Bills: ["electricity", "water", "broadband", "recharge", "bill", "emi", "insurance"],
  Entertainment: ["netflix", "spotify", "movie", "bookmyshow", "gaming", "entertainment"],
};

const INCOME_RULES = [
  { pattern: /\bcredited\b/i, score: 4 },
  { pattern: /\bcredit\b/i, score: 2 },
  { pattern: /\breceived\b/i, score: 4 },
  { pattern: /\bdeposit(?:ed)?\b/i, score: 4 },
  { pattern: /\bsalary\b/i, score: 5 },
  { pattern: /\bcashback\b/i, score: 5 },
  { pattern: /\brefund(?:ed)?\b/i, score: 5 },
  { pattern: /\breversal\b/i, score: 4 },
  { pattern: /\binterest\b/i, score: 4 },
  { pattern: /\breward\b/i, score: 3 },
  { pattern: /\badded to\b/i, score: 3 },
  { pattern: /\btransferred from\b/i, score: 3 },
  { pattern: /\breceived from\b/i, score: 4 },
  { pattern: /\bdeposited in\b/i, score: 4 },
  { pattern: /\bcr\b/i, score: 2 },
];

const EXPENSE_RULES = [
  { pattern: /\bdebited\b/i, score: 5 },
  { pattern: /\bdebit\b/i, score: 2 },
  { pattern: /\bspent\b/i, score: 4 },
  { pattern: /\bpaid\b/i, score: 5 },
  { pattern: /\bpurchase\b/i, score: 4 },
  { pattern: /\bwithdrawn\b/i, score: 5 },
  { pattern: /\bsent\b/i, score: 4 },
  { pattern: /\btransferred to\b/i, score: 4 },
  { pattern: /\bauto[- ]?debit\b/i, score: 5 },
  { pattern: /\bbill paid\b/i, score: 5 },
  { pattern: /\bcharged\b/i, score: 4 },
  { pattern: /\bupi\b.*\bto\b/i, score: 3 },
  { pattern: /\bdr\b/i, score: 2 },
];

const INCOME_CATEGORY_RULES = [
  { category: "Salary", keywords: ["salary", "payroll", "bonus", "incentive"] },
  { category: "Refund", keywords: ["refund", "reversal", "reversed"] },
  { category: "Cashback", keywords: ["cashback", "cash back", "reward"] },
  { category: "Interest", keywords: ["interest"] },
  { category: "Transfer", keywords: ["received from", "transferred from", "imps", "neft", "rtgs", "upi"] },
];

function scoreRules(message, rules) {
  return rules.reduce((score, rule) => {
    return rule.pattern.test(message) ? score + rule.score : score;
  }, 0);
}

function detectType(message) {
  const incomeScore = scoreRules(message, INCOME_RULES);
  const expenseScore = scoreRules(message, EXPENSE_RULES);
  const normalized = message.toLowerCase();

  if (/\brefund\b/.test(normalized) || /\bcashback\b/.test(normalized)) {
    return "income";
  }

  if (incomeScore > expenseScore) {
    return "income";
  }

  if (expenseScore > incomeScore) {
    return "expense";
  }

  if (/\bfrom\b/.test(normalized) && /\breceived\b|\bcredited\b|\bdeposit(?:ed)?\b/.test(normalized)) {
    return "income";
  }

  if (/\bto\b/.test(normalized) && /\bpaid\b|\bsent\b|\bdebited\b/.test(normalized)) {
    return "expense";
  }

  return "expense";
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
  const normalized = message.toLowerCase();

  if (type === "income") {
    for (const rule of INCOME_CATEGORY_RULES) {
      if (rule.keywords.some((word) => normalized.includes(word))) {
        return rule.category;
      }
    }

    return "Income";
  }

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((word) => normalized.includes(word))) {
      return category;
    }
  }

  return "Others";
}

function extractMerchant(message) {
  const merchantPatterns = [
    /(?:at|to|from|by|via)\s+([a-zA-Z0-9&.\-_\s]{2,40})(?=\s+(?:on|for|ref|utr|avl|available|bal|ending|txn|trxn|upi|neft|imps|rtgs|received|credited|debited|paid|sent)\b|$)/i,
    /merchant\s+([a-zA-Z0-9&.\-_\s]{2,40})/i,
  ];

  for (const pattern of merchantPatterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      const cleanedMerchant = match[1]
        .trim()
        .replace(/\s{2,}/g, " ")
        .replace(/[.,]$/, "")
        .replace(/\b(a\/c|acct|account|xx[\w-]*)\b.*$/i, "")
        .trim();

      if (cleanedMerchant && cleanedMerchant.length >= 2) {
        return cleanedMerchant;
      }
    }
  }

  return typeSafeMerchantFallback(message);
}

function typeSafeMerchantFallback(message) {
  const normalizedWords = message
    .split(/\s+/)
    .map((word) => word.replace(/[^\w&.-]/g, ""))
    .filter(Boolean)
    .filter((word) => !/^(rs|inr|upi|acct|account|a\/c|avl|bal|utr|txn|trxn)$/i.test(word))
    .filter((word) => !/\d{4,}/.test(word));

  return normalizedWords.slice(0, 3).join(" ") || "Unknown";
}

// Update user balance based on all transactions
async function updateUserBalance(userId) {
  try {
    const transactions = await Transaction.find({ userId });
    
    const balance = transactions.reduce((total, tx) => {
      return tx.type === "income" ? total + tx.amount : total - tx.amount;
    }, 0);

    await User.findByIdAndUpdate(userId, { balance });
    console.log(`✅ Updated balance for user ${userId}: ₹${balance}`);
  } catch (err) {
    console.error("❌ Error updating balance:", err.message);
  }
}

// ➕ ADD TRANSACTION
exports.addTransaction = async (req, res) => {
  try {
    const { amount, type, category, description, merchant, sourceText } = req.body;

    if (!amount || !type || !["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Amount and valid type (income/expense) are required" });
    }

    const transaction = await Transaction.create({
      amount: Number(amount),
      type,
      category: category || (type === "income" ? "Income" : "Others"),
      description: description || "",
      userId: req.user.id,
      merchant: merchant || (type === "income" ? "Income Source" : "Manual"),
      sourceText,
      source: "manual",
    });

    // Update user balance
    await updateUserBalance(req.user.id);

    res.json(transaction);
  } catch (err) {
    console.error("Error adding transaction:", err.message);
    res.status(500).json({ message: "Error adding transaction" });
  }
};

// 📥 GET TRANSACTIONS
exports.getTransactions = async (req, res) => {
  try {
    console.log("📥 GET /transactions called");
    console.log("   req.user:", req.user);
    console.log("   req.user.id:", req.user?.id);
    
    if (!req.user || !req.user.id) {
      console.error("❌ Auth failed: req.user or req.user.id missing");
      return res.status(401).json({ message: "User not authenticated" });
    }

    console.log("🔍 Finding transactions for userId:", req.user.id);
    const transactions = await Transaction.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    console.log("✅ Found", transactions.length, "transactions");
    res.json(transactions);
  } catch (err) {
    console.error("❌ Error getting transactions:");
    console.error("   Message:", err.message);
    console.error("   Stack:", err.stack);
    res.status(500).json({ message: "Error fetching transactions", error: err.message });
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

    const transactionData = {
      amount,
      type,
      category,
      description: message, // Use the full message as description
      userId: req.user.id,
      merchant,
      sourceText: message,
      source: "notification",
    };

    console.log("💾 Creating transaction:", transactionData);

    const transaction = await Transaction.create(transactionData);

    console.log("✅ Transaction created:", transaction);

    // Update user balance
    await updateUserBalance(req.user.id);

    return res.status(201).json({
      message: "Notification processed",
      transaction: transaction,
    });
  } catch (err) {
    console.error("❌ INGEST ERROR:", err.message, err.stack);
    return res.status(500).json({ message: "Error processing notification", error: err.message });
  }
};

// 📈 INCOME/EXPENSE + SPENDING SUMMARY
exports.getTransactionSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });

    const totalIncome = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpense = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const spendingByCategory = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
      }, {});

    return res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      spendingByCategory,
      transactionCount: transactions.length,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error generating summary" });
  }
};
