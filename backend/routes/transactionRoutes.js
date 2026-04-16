const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  addTransaction,
  getTransactions,
  ingestNotification,
  getTransactionSummary,
} = require("../controllers/expenseController");

router.post("/", auth, addTransaction);
router.get("/", auth, getTransactions);
router.post("/notifications/ingest", auth, ingestNotification);
router.get("/summary", auth, getTransactionSummary);

module.exports = router;
