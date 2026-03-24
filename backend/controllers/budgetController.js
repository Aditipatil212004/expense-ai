const Budget = require("../models/Budget");

// ➕ Add Budget
exports.addBudget = async (req, res) => {
  const { category, limit } = req.body;

  const budget = await Budget.create({
    category,
    limit,
    userId: req.user.id,
  });

  res.json(budget);
};

// 📥 Get Budgets
exports.getBudgets = async (req, res) => {
  const budgets = await Budget.find({ userId: req.user.id });
  res.json(budgets);
};

// ❌ Delete Budget
exports.deleteBudget = async (req, res) => {
  await Budget.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};