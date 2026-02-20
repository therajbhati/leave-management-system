const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  applyLeave,
  getMyLeaves,
  cancelLeave,
  getAllLeaves,
  updateLeaveStatus,
  getDashboardStats,
} = require("../controllers/leaveController");

router.post("/apply", protect, applyLeave);
router.get("/history", protect, getMyLeaves);
router.patch("/:id/cancel", protect, cancelLeave);

router.get("/admin/all", protect, adminOnly, getAllLeaves);
router.patch("/admin/:id/status", protect, adminOnly, updateLeaveStatus);
router.get("/admin/dashboard", protect, adminOnly, getDashboardStats);

module.exports = router;
