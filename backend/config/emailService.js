require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // false for 587 (TLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ✅ Welcome email on registration
const sendWelcomeEmail = async (toEmail, userName) => {
  const mailOptions = {
    from: `"Leave Management System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Welcome to Leave Management System 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4A90E2;">Welcome, ${userName}! 👋</h2>
        <p>Your account has been successfully created on the <strong>Leave Management System</strong>.</p>
        <p>You can now log in and start applying for leaves.</p>
        <br/>
        <p style="color: #888; font-size: 12px;">If you didn't register, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ✅ Forgot password email with reset code + link
const sendPasswordResetEmail = async (toEmail, resetCode, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Leave Management System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Password Reset Request 🔐",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #E24A4A;">Password Reset Request</h2>
        <p>We received a request to reset your password. Use the code below or click the link (valid for <strong>15 minutes</strong>):</p>

        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4A90E2;">${resetCode}</span>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            Reset Password
          </a>
        </div>

        <p style="color: #888; font-size: 12px;">This link and code will expire in 15 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
