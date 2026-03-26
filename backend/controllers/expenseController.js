const Expense = require("../models/Expense");

// ➕ ADD EXPENSE
exports.addExpense = async (req, res) => {
  try {
    const { amount, category } = req.body;

    const expense = await Expense.create({
      amount,
      category,
      userId: req.user.id,
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
    });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching expenses" });
  }
};