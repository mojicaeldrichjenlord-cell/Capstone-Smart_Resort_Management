// ============================================================
// SMARTRESORT FORGOT PASSWORD SCRIPT
// Purpose:
// - Send email OTP
// - Show OTP reset form
// - Reset password using OTP
// ============================================================

const API_BASE = "http://127.0.0.1:5000/api";

// ============================================================
// SECTION 1: Get page elements
// These elements are used for OTP and password reset.
// ============================================================

const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const emailInput = document.getElementById("email");
const otpInput = document.getElementById("otp");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const otpSection = document.getElementById("otpSection");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const resendOtpBtn = document.getElementById("resendOtpBtn");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const forgotMessage = document.getElementById("forgotMessage");

// ============================================================
// SECTION 2: Send OTP button event
// User enters email and clicks Send OTP.
// ============================================================

if (sendOtpBtn) {
  sendOtpBtn.addEventListener("click", sendOtpToEmail);
}

// ============================================================
// SECTION 3: Resend OTP button event
// Reuses the same sendOtpToEmail function.
// ============================================================

if (resendOtpBtn) {
  resendOtpBtn.addEventListener("click", sendOtpToEmail);
}

// ============================================================
// SECTION 4: Reset password form submit event
// Sends email, OTP, and new password to backend.
// ============================================================

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", resetPassword);
}

// ============================================================
// SECTION 5: Send OTP to email
// Calls POST /api/auth/forgot-password/send-otp.
// ============================================================

async function sendOtpToEmail() {
  const email = emailInput.value.trim();

  if (!email) {
    showMessage("Please enter your registered email.", "error");
    return;
  }

  const originalText = sendOtpBtn.textContent;

  try {
    setButtonLoading(sendOtpBtn, "Sending OTP...");
    setButtonLoading(resendOtpBtn, "Sending OTP...");

    const response = await fetch(`${API_BASE}/auth/forgot-password/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send OTP.");
    }

    otpSection.classList.add("show");
    showMessage(data.message || "OTP has been sent to your email.", "success");

    localStorage.setItem("resetEmail", email);
  } catch (error) {
    console.error("sendOtpToEmail error:", error);
    showMessage(error.message || "Failed to send OTP.", "error");
  } finally {
    resetButton(sendOtpBtn, originalText || "Send OTP");
    resetButton(resendOtpBtn, "Resend OTP");
  }
}

// ============================================================
// SECTION 6: Reset password using OTP
// Calls POST /api/auth/forgot-password/reset.
// ============================================================

async function resetPassword(e) {
  e.preventDefault();

  const email = emailInput.value.trim();
  const otp = otpInput.value.trim();
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  if (!email || !otp || !newPassword || !confirmPassword) {
    showMessage("Please complete all OTP and password fields.", "error");
    return;
  }

  if (otp.length !== 6) {
    showMessage("OTP must be 6 digits.", "error");
    return;
  }

  if (newPassword.length < 8) {
    showMessage("Password must be at least 8 characters long.", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showMessage("Passwords do not match.", "error");
    return;
  }

  const originalText = resetPasswordBtn.textContent;

  try {
    setButtonLoading(resetPasswordBtn, "Resetting...");

    const response = await fetch(`${API_BASE}/auth/forgot-password/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp,
        newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to reset password.");
    }

    localStorage.setItem("resetEmail", email);

    showMessage(data.message || "Password reset successful.", "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
  } catch (error) {
    console.error("resetPassword error:", error);
    showMessage(error.message || "Failed to reset password.", "error");
  } finally {
    resetButton(resetPasswordBtn, originalText || "Reset Password");
  }
}

// ============================================================
// SECTION 7: Button loading helper
// Disables button while request is running.
// ============================================================

function setButtonLoading(button, text) {
  if (!button) return;

  button.disabled = true;
  button.textContent = text;
  button.style.opacity = "0.7";
  button.style.cursor = "not-allowed";
}

// ============================================================
// SECTION 8: Reset button helper
// Returns button to normal state.
// ============================================================

function resetButton(button, text) {
  if (!button) return;

  button.disabled = false;
  button.textContent = text;
  button.style.opacity = "1";
  button.style.cursor = "pointer";
}

// ============================================================
// SECTION 9: Message helper
// Uses toast notification if available, otherwise alert.
// ============================================================

function showMessage(message, type = "success") {
  if (forgotMessage) {
    forgotMessage.textContent = message;
    forgotMessage.style.color = type === "error" ? "#dc2626" : "#047857";
  }

  if (typeof showToast === "function") {
    showToast(message, type);
  }
}