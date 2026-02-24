require("dotenv").config();

const { Sequelize } = require("sequelize");

// Initialize Sequelize with your MySQL info
// Format: new Sequelize('database_name', 'username', 'password', options)
const sequelize = new Sequelize(
  process.env.DB_NAME || "leave_management_db",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "", // Default XAMPP password is empty
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false, // Set to true if you want to see raw SQL queries in terminal
  },
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Database Connected Successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
};

module.exports = { sequelize, connectDB };
