const express = require("express");
const {
  getTransactions,
  getSummary,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.use(protect);
router.get("/", getTransactions);
router.get("/summary", getSummary);
router.post("/", addTransaction);
router.patch("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;
