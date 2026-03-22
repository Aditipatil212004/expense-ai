const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  userId: String,
  amount: Number,
  category: String,
  date: Date,
  isRecurring: Boolean,
});

module.exports = mongoose.model("Expense", expenseSchema);