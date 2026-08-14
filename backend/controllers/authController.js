// ============================================================
// SMARTRESORT AUTH CONTROLLER
// Purpose:
// - Register customer account
// - Send registration email OTP using Brevo API
// - Verify registration OTP
// - Login user
// - Forgot password OTP
// - Profile update
// - Change password
// ============================================================

const db = require("../config/db");
const bcrypt = require("bcrypt");
const axios = require("axios");

// ============================================================
// SECTION 1: Email normalizer
// Converts email into lowercase and removes extra spaces.
// ============================================================

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}


// ============================================================
// SECTION 1.1: Strong registration password validator
// Purpose:
// - Matches the Premium Password UI on the register page
// - Requires 8+ chars, uppercase, lowercase, number, special char
// - Applied to NEW REGISTRATIONS only for this phase
// ============================================================

function validateStrongRegistrationPassword(password) {
  const value = String(password || "");

  const requirements = {
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /\d/.test(value),
    special: /[^A-Za-z0-9\s]/.test(value),
  };

  const score = Object.values(requirements).filter(Boolean).length;

  // ==========================================================
  // ACCEPTANCE RULE:
  // GOOD = any 4 out of 5 password checks
  // STRONG = all 5 password checks
  // Both are accepted for registration.
  // ==========================================================
  if (score < 4) {
    return {
      valid: false,
      message:
        "Password strength must be at least Good before you can register.",
    };
  }

  return {
    valid: true,
    message: "",
  };
}

// ============================================================
// SECTION 2: OTP generator
// Generates a random 6-digit code.
// ============================================================

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ============================================================
// SECTION 3: Brevo OTP email sender
// Sends OTP for registration or forgot password using Brevo API.
// Required .env / Render Environment:
// BREVO_API_KEY
// EMAIL_FROM
// EMAIL_FROM_NAME
// ============================================================

async function sendOtpEmail({ email, otp, purpose }) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const senderName =
    process.env.EMAIL_FROM_NAME || "Arvic Seaside Beach Resort and Hotel";

  if (!brevoApiKey) {
    throw new Error("BREVO_API_KEY is missing.");
  }

  if (!senderEmail) {
    throw new Error("EMAIL_FROM is missing.");
  }

  if (!email || !otp) {
    throw new Error("Recipient email and OTP are required.");
  }

  const isRegister = purpose === "register";

  const title = isRegister
    ? "SmartResort Email Verification"
    : "SmartResort Password Reset";

  const message = isRegister
    ? "Your registration verification OTP code is:"
    : "Your password reset OTP code is:";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 560px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px;">
      <h2 style="color:#0f766e; margin-top: 0;">${title}</h2>

      <p>Hello,</p>
      <p>${message}</p>

      <div style="
        display:block;
        padding:16px 20px;
        background:#ecfeff;
        border:1px solid #99f6e4;
        border-radius:14px;
        font-size:30px;
        font-weight:800;
        letter-spacing:6px;
        color:#0f766e;
        text-align:center;
        margin: 18px 0;
      ">
        ${otp}
      </div>

      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>

      <hr style="border:none; border-top:1px solid #e5e7eb; margin:20px 0;" />

      <p style="font-size:13px; color:#64748b;">
        SmartResort - Arvic Seaside Beach Resort and Hotel
      </p>
    </div>
  `;

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email,
          },
        ],
        subject: title,
        htmlContent,
      },
      {
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 30000,
      }
    );
  } catch (error) {
    console.error("Brevo email error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    const brevoMessage =
      error.response?.data?.message ||
      error.response?.data?.code ||
      error.message ||
      "Brevo email sending failed.";

    throw new Error(`Brevo email sending failed: ${brevoMessage}`);
  }
}

// ============================================================
// SECTION 4: Register customer account
// Creates account if new.
// If email exists but not verified, updates info and sends new OTP.
// If email exists and verified, blocks registration.
// ============================================================

exports.register = async (req, res) => {
  try {
    const { fullname, email, password, phone, address } = req.body;

    const cleanEmail = normalizeEmail(email);

    if (!fullname || !cleanEmail || !password || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    const passwordValidation =
      validateStrongRegistrationPassword(password);

    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    const [existingUsers] = await db.promise().query(
      `
      SELECT 
        id,
        email,
        COALESCE(is_verified, 0) AS is_verified
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [cleanEmail]
    );

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const hashedPassword = await bcrypt.hash(password, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // ========================================================
    // CASE 1: Email already exists
    // ========================================================
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      if (Number(existingUser.is_verified) === 1) {
        return res.status(400).json({
          success: false,
          message: "Email is already registered. Please login instead.",
        });
      }

      await db.promise().query(
        `
        UPDATE users
        SET 
          fullname = ?,
          password = ?,
          phone = ?,
          address = ?,
          role = ?,
          account_status = ?,
          is_verified = 0,
          register_otp_hash = ?,
          register_otp_expires = ?
        WHERE id = ?
        `,
        [
          fullname,
          hashedPassword,
          phone,
          address,
          "customer",
          "active",
          otpHash,
          expiresAt,
          existingUser.id,
        ]
      );

      await sendOtpEmail({
        email: cleanEmail,
        otp,
        purpose: "register",
      });

      return res.status(200).json({
        success: true,
        message:
          "This email is not verified yet. We sent a new OTP to your email.",
        email: cleanEmail,
        requiresVerification: true,
      });
    }

    // ========================================================
    // CASE 2: New email, create account as unverified
    // ========================================================
    await db.promise().query(
      `
      INSERT INTO users (
        fullname,
        email,
        password,
        phone,
        address,
        role,
        account_status,
        is_verified,
        register_otp_hash,
        register_otp_expires
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        fullname,
        cleanEmail,
        hashedPassword,
        phone,
        address,
        "customer",
        "active",
        0,
        otpHash,
        expiresAt,
      ]
    );

    await sendOtpEmail({
      email: cleanEmail,
      otp,
      purpose: "register",
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for the OTP.",
      email: cleanEmail,
      requiresVerification: true,
    });
  } catch (error) {
    console.error("register error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration. Please check email settings.",
      error: error.message,
    });
  }
};

// ============================================================
// SECTION 5: Verify registration OTP
// Confirms the user's email and returns user data for auto-login.
// ============================================================

exports.verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const cleanEmail = normalizeEmail(email);
    const cleanOtp = String(otp || "").trim();

    if (!cleanEmail || !cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const [users] = await db.promise().query(
      `
      SELECT 
        id,
        fullname,
        email,
        role,
        phone,
        address,
        COALESCE(account_status, 'active') AS account_status,
        COALESCE(is_verified, 0) AS is_verified,
        register_otp_hash,
        register_otp_expires
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    const user = users[0];

    if (String(user.account_status || "active").toLowerCase() === "disabled") {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been disabled. Please contact the resort administrator.",
      });
    }

    if (Number(user.is_verified) === 1) {
      return res.status(200).json({
        success: true,
        message: "Account is already verified. Redirecting to dashboard...",
        user: {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          phone: user.phone || "",
          address: user.address || "",
          account_status: user.account_status || "active",
          is_verified: 1,
        },
      });
    }

    if (!user.register_otp_hash || !user.register_otp_expires) {
      return res.status(400).json({
        success: false,
        message: "Please request a new registration OTP.",
      });
    }

    const expiresAt = new Date(user.register_otp_expires);

    if (Date.now() > expiresAt.getTime()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const isOtpValid = await bcrypt.compare(cleanOtp, user.register_otp_hash);

    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code.",
      });
    }

    await db.promise().query(
      `
      UPDATE users
      SET is_verified = 1,
          register_otp_hash = NULL,
          register_otp_expires = NULL
      WHERE id = ?
      `,
      [user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. Redirecting to dashboard...",
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role || "customer",
        phone: user.phone || "",
        address: user.address || "",
        account_status: user.account_status || "active",
        is_verified: 1,
      },
    });
  } catch (error) {
    console.error("verifyRegistrationOtp error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP.",
      error: error.message,
    });
  }
};

// ============================================================
// SECTION 6: Resend registration OTP
// Sends a new OTP for unverified accounts.
// ============================================================

exports.resendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const [users] = await db.promise().query(
      `
      SELECT id, email, is_verified
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    const user = users[0];

    if (Number(user.is_verified) === 1) {
      return res.status(400).json({
        success: false,
        message: "This account is already verified.",
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.promise().query(
      `
      UPDATE users
      SET register_otp_hash = ?, register_otp_expires = ?
      WHERE id = ?
      `,
      [otpHash, expiresAt, user.id]
    );

    await sendOtpEmail({
      email: user.email,
      otp,
      purpose: "register",
    });

    return res.status(200).json({
      success: true,
      message: "New OTP has been sent to your email.",
    });
  } catch (error) {
    console.error("resendRegistrationOtp error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP. Please check email settings.",
      error: error.message,
    });
  }
};

// ============================================================
// SECTION 7: Login user
// Blocks disabled and unverified accounts.
// ============================================================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const [users] = await db.promise().query(
      `
      SELECT 
        id, 
        fullname, 
        email, 
        password, 
        role, 
        phone, 
        address,
        COALESCE(account_status, 'active') AS account_status,
        COALESCE(is_verified, 1) AS is_verified
      FROM users
      WHERE email = ?
      `,
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = users[0];

    if (String(user.account_status || "active").toLowerCase() === "disabled") {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been disabled. Please contact the resort administrator.",
      });
    }

    if (Number(user.is_verified) !== 1) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
        requiresVerification: true,
        email: user.email,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        address: user.address || "",
        account_status: user.account_status || "active",
        is_verified: Number(user.is_verified),
      },
    });
  } catch (error) {
    console.error("login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
      error: error.message,
    });
  }
};

// ============================================================
// SECTION 8: Request forgot password OTP
// Sends password reset OTP to registered email.
// ============================================================

exports.requestPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const [users] = await db.promise().query(
      `
      SELECT id, email, COALESCE(account_status, 'active') AS account_status
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    const user = users[0];

    if (String(user.account_status || "active").toLowerCase() === "disabled") {
      return res.status(403).json({
        success: false,
        message:
          "This account is disabled. Please contact the resort administrator.",
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.promise().query(
      `
      UPDATE users
      SET reset_otp_hash = ?, reset_otp_expires = ?
      WHERE id = ?
      `,
      [otpHash, expiresAt, user.id]
    );

    await sendOtpEmail({
      email: user.email,
      otp,
      purpose: "reset",
    });

    return res.status(200).json({
      success: true,
      message: "OTP has been sent to your email.",
    });
  } catch (error) {
    console.error("requestPasswordResetOtp error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please check email settings.",
      error: error.message,
    });
  }
};

// ============================================================
// SECTION 9: Reset password using OTP
// Verifies reset OTP and updates password.
// ============================================================

exports.resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const cleanEmail = normalizeEmail(email);
    const cleanOtp = String(otp || "").trim();

    if (!cleanEmail || !cleanOtp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long.",
      });
    }

    const [users] = await db.promise().query(
      `
      SELECT id, reset_otp_hash, reset_otp_expires
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    const user = users[0];

    if (!user.reset_otp_hash || !user.reset_otp_expires) {
      return res.status(400).json({
        success: false,
        message: "Please request an OTP first.",
      });
    }

    const expiresAt = new Date(user.reset_otp_expires);

    if (Date.now() > expiresAt.getTime()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const isOtpValid = await bcrypt.compare(cleanOtp, user.reset_otp_hash);

    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.promise().query(
      `
      UPDATE users
      SET password = ?, reset_otp_hash = NULL, reset_otp_expires = NULL
      WHERE id = ?
      `,
      [hashedPassword, user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("resetPasswordWithOtp error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password.",
      error: error.message,
    });
  }
};

// ============================================================
// SECTION 10: Get user profile
// Loads profile information.
// ============================================================

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const [rows] = await db.promise().query(
      `
      SELECT 
        id, 
        fullname, 
        email, 
        role, 
        phone, 
        address,
        COALESCE(account_status, 'active') AS account_status,
        COALESCE(is_verified, 1) AS is_verified
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: rows[0],
    });
  } catch (error) {
    console.error("getProfile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load profile.",
      error: error.message,
    });
  }
};

// ============================================================
// SECTION 11: Update user profile
// Updates name, email, phone, and address.
// ============================================================

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullname, email, phone, address } = req.body;

    const cleanEmail = normalizeEmail(email);

    if (!fullname || !cleanEmail || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all profile fields.",
      });
    }

    const [existingEmail] = await db.promise().query(
      `
      SELECT id
      FROM users
      WHERE email = ? AND id != ?
      `,
      [cleanEmail, userId]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: "That email is already used by another account.",
      });
    }

    await db.promise().query(
      `
      UPDATE users
      SET fullname = ?, email = ?, phone = ?, address = ?
      WHERE id = ?
      `,
      [fullname, cleanEmail, phone, address, userId]
    );

    const [updatedRows] = await db.promise().query(
      `
      SELECT 
        id, 
        fullname, 
        email, 
        role, 
        phone, 
        address,
        COALESCE(account_status, 'active') AS account_status,
        COALESCE(is_verified, 1) AS is_verified
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedRows[0],
    });
  } catch (error) {
    console.error("updateProfile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};

// ============================================================
// SECTION 12: Change password from profile
// Requires current password and new password.
// ============================================================

exports.changePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long.",
      });
    }

    const [rows] = await db
      .promise()
      .query("SELECT password FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.promise().query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("changePassword error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
      error: error.message,
    });
  }
};