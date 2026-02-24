const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db"); // Import connection

const Leave = sequelize.define("Leave", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  startDate: {
    type: DataTypes.DATEONLY, // DATEONLY stores just YYYY-MM-DD
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("Pending", "Approved", "Rejected", "Cancelled"),
    defaultValue: "Pending",
  },
  adminRemarks: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  // Note: We don't manually add 'employeeId' here.
  // Sequelize adds it automatically when we define the relationship below.
});

module.exports = Leave;
