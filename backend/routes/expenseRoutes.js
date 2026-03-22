const express = require("express");
const router = express.Router();

// Example route
router.get("/", (req, res) => {
  res.send("Get all expenses");
});

router.post("/", (req, res) => {
  res.send("Add expense");
});

module.exports = router; // ✅ MUST