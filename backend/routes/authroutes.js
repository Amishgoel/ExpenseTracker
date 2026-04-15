const express=require("express");

const {
  registerUser,
  loginUser,
  getUserInfo,
  googleLogin,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.get("/me", protect, getUserInfo);
module.exports=router;