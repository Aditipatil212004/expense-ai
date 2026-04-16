const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: { type: String, default: "Others" },
    description: { type: String, default: "" },
    userId: { type: String, required: true },
    merchant: { type: String, default: "Unknown" },
    source: { type: String, enum: ["manual", "notification"], default: "manual" },
    sourceText: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
