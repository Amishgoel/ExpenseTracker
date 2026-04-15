const express = require("express");
const { protect } = require("../middleware/auth");
const { getInsights } = require("../controllers/aiController");

const router = express.Router();

router.use(protect);
router.get("/insights", getInsights);

module.exports = router;

