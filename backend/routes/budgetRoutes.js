const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  addBudget,
  getBudgets,
  deleteBudget,
} = require("../controllers/budgetController");

router.post("/", auth, addBudget);
router.get("/", auth, getBudgets);
router.delete("/:id", auth, deleteBudget);

module.exports = router;