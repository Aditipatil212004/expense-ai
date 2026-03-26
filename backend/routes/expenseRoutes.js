const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware"); // ✅ important
const {
  addExpense,
  getExpenses,
} = require("../controllers/expenseController");

// ✅ REAL ROUTES
router.post("/", auth, addExpense);
router.get("/", auth, getExpenses);

module.exports = router;