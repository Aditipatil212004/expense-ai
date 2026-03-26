const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  amount: Number,
  category: String,
  userId: String,
});

module.exports = mongoose.model("Expense", expenseSchema);