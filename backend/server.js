const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB, sequelize } = require("./config/db"); // Import sequelize to sync tables
const User = require("./models/User"); // Import models to define relations
const Leave = require("./models/Leave");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:4200",
      "https://leave-management-system-alpha.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());

// --- 1. Define Database Relationships ---
// This tells MySQL: "A User can have many Leaves, and a Leave belongs to one User"
User.hasMany(Leave, { foreignKey: "userId" });
Leave.belongsTo(User, { foreignKey: "userId" });

// --- 2. Routes ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));

app.get("/", (req, res) => {
  res.send("Leave Management API is running...");
});

// --- 3. Start Server & Sync Database ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MySQL
    await connectDB();

    // Sync tables (creates them if they don't exist)
    // force: false means "don't delete my data if the table already exists"
    await sequelize.sync({ alter: true }); // Use alter: true to update tables without dropping data
    console.log("✅ MySQL Tables Synced Successfully");

    app.listen(PORT, () => {
      console.log(`✅ Server running in development mode on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
  }
};

startServer();
