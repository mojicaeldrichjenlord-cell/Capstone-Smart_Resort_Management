const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  try {
    const { fullname, email, password, phone, address } = req.body;

    if (!fullname || !email || !password || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    const [existingUsers] = await db.promise().query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.promise().query(
      `
      INSERT INTO users (fullname, email, password, phone, address, role)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [fullname, email, hashedPassword, phone, address, "customer"]
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
    });
  } catch (error) {
    console.error("register error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const [users] = await db.promise().query(
      `
      SELECT id, fullname, email, password, role, phone, address
      FROM users
      WHERE email = ?
      `,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = users[0];
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

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const [rows] = await db.promise().query(
      `
      SELECT id, fullname, email, role, phone, address
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

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullname, email, phone, address } = req.body;

    if (!fullname || !email || !phone || !address) {
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
      [email, userId]
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
      [fullname, email, phone, address, userId]
    );

    const [updatedRows] = await db.promise().query(
      `
      SELECT id, fullname, email, role, phone, address
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

    const [rows] = await db.promise().query(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

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

    await db.promise().query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId]
    );

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