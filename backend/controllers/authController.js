const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // ✅ NEW: built-in Node module, no install needed
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("../config/emailService"); // ✅ NEW

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please add all fields" });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role: "Employee" });

    if (user) {
      // ✅ NEW: Send welcome email (non-blocking — won't crash register if mail fails)
      sendWelcomeEmail(user.email, user.name).catch((err) =>
        console.error("Welcome email failed:", err.message),
      );

      res.status(201).json({
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    };
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: @desc    Send reset code + link to email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    // Always return same message to prevent email enumeration
    if (!user) {
      return res
        .status(200)
        .json({ message: "If this email exists, a reset link has been sent." });
    }

    // Generate 6-digit code and a secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    user.resetOtp = hashedOtp;
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await sendPasswordResetEmail(user.email, otp, resetToken);

    res
      .status(200)
      .json({ message: "If this email exists, a reset link has been sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: @desc    Verify code OR token and reset password
// @route   POST /api/auth/reset-password
// @access  Public
const { token, code, newPassword } = req.body;
let user = null;

if (token) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  user = await User.findOne({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { [Op.gt]: new Date() },
    },
  });
}

if (!user && code) {
  const hashedOtp = crypto.createHash("sha256").update(code).digest("hex");

  user = await User.findOne({
    where: {
      resetOtp: hashedOtp,
      resetOtpExpires: { [Op.gt]: new Date() },
    },
  });
}

if (!user) {
  return res.status(400).json({
    message: "Invalid or expired reset link/OTP.",
  });
}

user.password = newPassword;

user.resetPasswordToken = null;
user.resetPasswordExpires = null;
user.resetOtp = null;
user.resetOtpExpires = null;

await user.save();

res.status(200).json({
  message: "Password reset successful.",
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword, // ✅ NEW
  resetPassword, // ✅ NEW
};
