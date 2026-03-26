const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  addExpense,
  getExpenses,
  ingestNotification,
  getNotificationSummary,
} = require("../controllers/expenseController");

router.post("/", auth, addExpense);
router.get("/", auth, getExpenses);
router.post("/notifications/ingest", auth, ingestNotification);
router.get("/notifications/summary", auth, getNotificationSummary);

module.exports = router;
