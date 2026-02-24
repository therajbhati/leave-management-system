const Leave = require("../models/Leave");
const User = require("../models/User"); // Import User for relationships

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

    // Create Leave (Sequelize automatically handles the foreign key 'userId')
    const leave = await Leave.create({
      userId: req.user.id, // Using the ID from the decoded token
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
    // Find all leaves for this specific user
    const leaves = await Leave.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findByPk(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Check ownership (Comparing integers in MySQL)
    if (leave.userId !== req.user.id) {
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
    // Fetch leaves and JOIN with User table
    const leavesRaw = await Leave.findAll({
      include: [
        {
          model: User,
          attributes: ["name", "email"], // Select only name and email
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Transform data to match MongoDB structure (Sequelize returns User inside 'User' object)
    // We map it to 'employee' so your Frontend code (leave.employee.name) still works
    const leaves = leavesRaw.map((leave) => {
      const leaveJson = leave.toJSON();
      leaveJson.employee = leaveJson.User; // Map 'User' to 'employee'
      delete leaveJson.User; // Clean up
      return leaveJson;
    });

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

    const leave = await Leave.findByPk(req.params.id);

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
    const [
      totalEmployees,
      pendingCount,
      approvedCount,
      rejectedCount,
      recentLeavesRaw,
    ] = await Promise.all([
      User.count({ where: { role: "Employee" } }),
      Leave.count({ where: { status: "Pending" } }),
      Leave.count({ where: { status: "Approved" } }),
      Leave.count({ where: { status: "Rejected" } }),
      Leave.findAll({
        where: { status: "Pending" },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
    ]);

    // Transform recent leaves to match MongoDB structure
    const recentLeaves = recentLeavesRaw.map((leave) => {
      const leaveJson = leave.toJSON();
      leaveJson.employee = leaveJson.User;
      delete leaveJson.User;
      return leaveJson;
    });

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
