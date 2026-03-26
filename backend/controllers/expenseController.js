const Expense = require("../models/Expense");

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
    console.log(err);
    res.status(500).json({ message: "Error adding expense" });
  }
};