const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  userId: String,
  category: String,
  limit: Number,
});

module.exports = mongoose.model("Budget", budgetSchema);