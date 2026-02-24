const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword, // ✅ NEW
  resetPassword, // ✅ NEW
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword); // ✅ NEW
router.post("/reset-password", resetPassword); // ✅ NEW

module.exports = router;
