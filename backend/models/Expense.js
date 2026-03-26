const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    category: { type: String, default: "Others" },
    userId: { type: String, required: true },
    type: {
      type: String,
      enum: ["credit", "debit"],
      default: "debit",
    },
    merchant: { type: String, default: "Unknown" },
    source: { type: String, enum: ["manual", "notification"], default: "manual" },
    sourceText: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
