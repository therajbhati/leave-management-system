// backend/controllers/leaveController.js
const Leave = require("../models/Leave");

const applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res
        .status(400)
        .json({ message: "End date cannot be before start date" });
    }

    const leave = await Leave.create({
      employee: req.user._id,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({ message: "Leave applied successfully", leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.employee.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this leave" });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        message: `Cannot cancel a leave that is already ${leave.status}`,
      });
    }

    leave.status = "Cancelled";
    await leave.save();

    res.status(200).json({ message: "Leave cancelled successfully", leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be Approved or Rejected" });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        message: `This leave is already ${leave.status}`,
      });
    }

    leave.status = status;
    leave.adminRemarks = adminRemarks || "";
    await leave.save();

    res.status(200).json({ message: `Leave ${status} successfully`, leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const User = require("../models/User");

    const [
      totalEmployees,
      pendingCount,
      approvedCount,
      rejectedCount,
      recentLeaves,
    ] = await Promise.all([
      User.countDocuments({ role: "Employee" }),
      Leave.countDocuments({ status: "Pending" }),
      Leave.countDocuments({ status: "Approved" }),
      Leave.countDocuments({ status: "Rejected" }),
      Leave.find({ status: "Pending" })
        .populate("employee", "name email")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      totalEmployees,
      pendingCount,
      approvedCount,
      rejectedCount,
      recentLeaves,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  cancelLeave,
  getAllLeaves,
  updateLeaveStatus,
  getDashboardStats,
};
