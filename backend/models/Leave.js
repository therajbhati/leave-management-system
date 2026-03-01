const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db"); // Import connection

const Leave = sequelize.define("Leave", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  startDate: {
    type: DataTypes.DATEONLY,
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
});

module.exports = Leave;
