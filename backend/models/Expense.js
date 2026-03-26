const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    amount: Number,
    category: String,
    userId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);