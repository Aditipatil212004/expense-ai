const express = require("express");
const router = express.Router();

// Example route
router.post("/login", (req, res) => {
  res.send("Login route working");
});

router.post("/register", (req, res) => {
  res.send("Register route working");
});

module.exports = router; // ✅ MUST