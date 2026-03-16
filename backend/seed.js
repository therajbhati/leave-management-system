require("dotenv").config();

const { sequelize } = require("./config/db");
const User = require("./models/User");
const Leave = require("./models/Leave");

const seedDatabase = async () => {
  try {
    await sequelize.sync();

    // clear tables
    await Leave.destroy({ where: {} });
    await User.destroy({ where: {} });

    // create users
    const users = await User.bulkCreate([
      {
        name: "Admin User",
        email: "admin@test.com",
        password: "123456",
        role: "Admin",
      },
      {
        name: "Rahul Sharma",
        email: "rahul@test.com",
        password: "123456",
      },
      {
        name: "Ankit Verma",
        email: "ankit@test.com",
        password: "123456",
      },
      {
        name: "Priya Singh",
        email: "priya@test.com",
        password: "123456",
      },
    ]);

    // create leaves linked to users
    await Leave.bulkCreate([
      {
        startDate: "2025-03-20",
        endDate: "2025-03-22",
        reason: "Family Function",
        status: "Pending",
        userId: users[1].id,
      },
      {
        startDate: "2025-03-18",
        endDate: "2025-03-19",
        reason: "Medical Leave",
        status: "Approved",
        adminRemarks: "Take care",
        userId: users[2].id,
      },
      {
        startDate: "2025-03-25",
        endDate: "2025-03-27",
        reason: "Vacation",
        status: "Rejected",
        adminRemarks: "Project deadline",
        userId: users[3].id,
      },
      {
        startDate: "2025-04-01",
        endDate: "2025-04-02",
        reason: "Personal Work",
        status: "Pending",
        userId: users[1].id,
      },
    ]);

    console.log("✅ Test users and leaves inserted successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
