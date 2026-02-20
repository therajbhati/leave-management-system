// backend/utils/generateToken.js
const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
  // The payload contains the user's ID and Role.
  // We sign it using the secret in our .env file.
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token expires in 30 days
  });
};

module.exports = generateToken;
