require("dotenv").config();
const nodemailer = require("nodemailer");

// ✅ Gmail SMTP Transporter
// Uses Gmail's secure service shorthand — no need to set host/port manually.
// Requires an App Password (NOT your normal Gmail password).
// See: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address e.g. yourapp@gmail.com
    pass: process.env.EMAIL_PASS, // Gmail App Password (16 chars, no spaces)
  },
});

// Verify transporter on startup (helps catch config errors early)
transporter.verify((error) => {
  if (error) {
    console.error("❌ Email service config error:", error.message);
  } else {
    console.log("✅ Email service ready (Gmail SMTP)");
  }
});

// ─────────────────────────────────────────────
// Welcome email on registration
// ─────────────────────────────────────────────
const sendWelcomeEmail = async (toEmail, userName) => {
  const mailOptions = {
    from: `"Leave Management System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Welcome to Leave Management System 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; background: #ffffff;">
        
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="background: #EBF4FF; width: 64px; height: 64px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
            <span style="font-size: 28px;">👋</span>
          </div>
        </div>

        <h2 style="color: #1a56db; text-align: center; margin-bottom: 8px;">Welcome, ${userName}!</h2>
        <p style="color: #374151; text-align: center; margin-bottom: 24px;">Your account has been successfully created.</p>

        <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="color: #374151; margin: 0 0 8px 0;">✅ You can now <strong>log in</strong> and start applying for leaves.</p>
          <p style="color: #374151; margin: 0 0 8px 0;">📋 View your <strong>leave history</strong> and track approvals.</p>
          <p style="color: #374151; margin: 0;">🔔 You'll receive email notifications on status updates.</p>
        </div>

        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL}/login"
             style="background: #1a56db; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
            Go to Login
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          If you didn't register, please ignore this email.<br/>
          Leave Management System &copy; ${new Date().getFullYear()}
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Welcome email sent to ${toEmail}`);
};

// ─────────────────────────────────────────────
// Forgot password email — reset code + link
// Both expire in 15 minutes
// ─────────────────────────────────────────────
const sendPasswordResetEmail = async (
  toEmail,
  userName,
  resetCode,
  resetToken,
) => {
  const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Leave Management System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Password Reset Request 🔐",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; background: #ffffff;">
        
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="background: #FEF3C7; width: 64px; height: 64px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
            <span style="font-size: 28px;">🔐</span>
          </div>
        </div>

        <h2 style="color: #1a56db; text-align: center; margin-bottom: 8px;">Password Reset Request</h2>
        <p style="color: #374151; text-align: center; margin-bottom: 4px;">Hi <strong>${userName}</strong>,</p>
        <p style="color: #6b7280; text-align: center; margin-bottom: 28px; font-size: 14px;">
          We received a request to reset your password. Use either option below.<br/>
          <strong style="color: #dc2626;">Both expire in 15 minutes.</strong>
        </p>

        <!-- Option 1: OTP Code -->
        <div style="background: #EBF4FF; border: 2px dashed #1a56db; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <p style="color: #374151; margin: 0 0 8px 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Option 1 — Enter this code manually</p>
          <div style="font-size: 38px; font-weight: bold; letter-spacing: 12px; color: #1a56db; font-family: monospace;">${resetCode}</div>
          <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 12px;">Go to the Reset Password page and type this code</p>
        </div>

        <!-- Option 2: Reset Link -->
        <div style="text-align: center; margin-bottom: 28px;">
          <p style="color: #374151; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Option 2 — Click the button below</p>
          <a href="${resetLink}"
             style="background: #1a56db; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
            Reset My Password
          </a>
          <p style="color: #9ca3af; font-size: 11px; margin-top: 10px; word-break: break-all;">${resetLink}</p>
        </div>

        <!-- Warning -->
        <div style="background: #FEF2F2; border: 1px solid #fca5a5; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
          <p style="color: #dc2626; font-size: 13px; margin: 0;">
            ⚠️ If you did not request this, your account is safe — simply ignore this email. No changes have been made.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 16px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Leave Management System &copy; ${new Date().getFullYear()}
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Password reset email sent to ${toEmail}`);
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
