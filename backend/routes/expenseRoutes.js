const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Expense = require("../models/Expense");

router.post("/", auth, async (req, res) => {
  const expense = await Expense.create({
    ...req.body,
    userId: req.user.id,
  });
  res.json(expense);
});

router.get("/", auth, async (req, res) => {
  const expenses = await Expense.find({ userId: req.user.id });
  res.json(expenses);
});

module.exports = router;