// ============================================================
// SMARTRESORT AUTH ROUTES
// Purpose:
// - Handles register, login, profile, password reset, and OTP routes
// ============================================================

const express = require("express");
const router = express.Router();

// ============================================================
// SECTION 1: Import controller functions
// These functions contain the backend logic.
// ============================================================

const {
  register,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  login,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

// ============================================================
// SECTION 2: Register and login routes
// Public routes used before login.
// ============================================================

router.post("/register", register);
router.post("/register/verify-otp", verifyRegistrationOtp);
router.post("/register/resend-otp", resendRegistrationOtp);
router.post("/login", login);

// ============================================================
// SECTION 3: Forgot password routes
// Used when user forgot their password.
// ============================================================

router.post("/forgot-password/send-otp", requestPasswordResetOtp);
router.post("/forgot-password/reset", resetPasswordWithOtp);

// ============================================================
// SECTION 4: Profile routes
// Used after login.
// ============================================================

router.get("/profile/:id", getProfile);
router.put("/profile/:id", updateProfile);
router.put("/change-password/:id", changePassword);

// ============================================================
// SECTION 5: Export router
// server.js uses this under /api/auth.
// ============================================================

module.exports = router;