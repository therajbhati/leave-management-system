const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB, sequelize } = require("./config/db");
const User = require("./models/User");
const Leave = require("./models/Leave");
const {
  decryptRequest,
  encryptResponse,
} = require("./middlewares/encryptionMiddleware");

dotenv.config();

const app = express();

// ── 1. CORS ───────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:4200",
      "https://leave-management-system-alpha.vercel.app",
    ],
    credentials: true,
  }),
);

// ── 2. Parse JSON bodies (must come before decryption) ────────────
app.use(express.json());

// ── 3. GLOBAL: Encrypt all responses ─────────────────────────────
// Registered before routes so every res.json() is intercepted
app.use(encryptResponse);

// ── 4. GLOBAL: Decrypt all incoming request bodies ───────────────
// Runs before routes, auth middleware, and controllers
// Order: Decrypt → JWT (protect) → Role (adminOnly) → Controller → Encrypt
app.use(decryptRequest);

// ── 5. Database Relationships ─────────────────────────────────────
User.hasMany(Leave, { foreignKey: "userId" });
Leave.belongsTo(User, { foreignKey: "userId" });

// ── 6. Routes ─────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "Leave Management API is running..." });
});

// ── 7. Start Server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync({ alter: true });
    console.log("✅ MySQL Tables Synced Successfully");

    app.listen(PORT, () => {
      console.log(`✅ Server running in development mode on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
  }
};

startServer();
