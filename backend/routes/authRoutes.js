const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/authController");

router.post("/signup", signup);   // ✅ MUST EXIST
router.post("/login", login);
console.log("SIGNUP:", signup);
console.log("LOGIN:", login);

module.exports = router;