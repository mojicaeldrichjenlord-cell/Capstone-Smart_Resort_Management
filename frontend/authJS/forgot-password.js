// ============================================================
// SMARTRESORT FORGOT PASSWORD SCRIPT
// Purpose:
// - Send email OTP
// - Show OTP reset form
// - Reset password using OTP
// - Hide Send OTP after first successful send
// - Add resend OTP cooldown timer
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
const resendTimerText = document.getElementById("resendTimerText");

// ============================================================
// SECTION 2: Cooldown settings
// User must wait before requesting another OTP.
// ============================================================

let resendCooldownInterval = null;
const RESEND_COOLDOWN_SECONDS = 60;

// ============================================================
// SECTION 3: Send OTP button event
// First OTP request.
// ============================================================

if (sendOtpBtn) {
  sendOtpBtn.addEventListener("click", () => {
    sendOtpToEmail("send");
  });
}

// ============================================================
// SECTION 4: Resend OTP button event
// Reuses the same backend endpoint but starts cooldown again.
// ============================================================

if (resendOtpBtn) {
  resendOtpBtn.addEventListener("click", () => {
    sendOtpToEmail("resend");
  });
}

// ============================================================
// SECTION 5: Reset password form submit event
// Sends email, OTP, and new password to backend.
// ============================================================

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", resetPassword);
}

// ============================================================
// SECTION 6: Send OTP to email
// Calls POST /api/auth/forgot-password/send-otp.
// type can be "send" or "resend".
// ============================================================

async function sendOtpToEmail(type = "send") {
  const email = emailInput.value.trim();

  if (!email) {
    showMessage("Please enter your registered email.", "error");
    return;
  }

  const isResend = type === "resend";
  const activeButton = isResend ? resendOtpBtn : sendOtpBtn;
  const originalText = isResend ? "Resend OTP" : "Send OTP";

  try {
    setButtonLoading(activeButton, "Sending OTP...");

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

    if (otpSection) {
      otpSection.classList.add("show");
    }

    if (sendOtpBtn) {
      sendOtpBtn.style.display = "none";
    }

    localStorage.setItem("resetEmail", email);

    showMessage(data.message || "OTP has been sent to your email.", "success");

    startResendCooldown(RESEND_COOLDOWN_SECONDS);
  } catch (error) {
    console.error("sendOtpToEmail error:", error);

    showMessage(error.message || "Failed to send OTP.", "error");

    resetButton(activeButton, originalText);
  }
}

// ============================================================
// SECTION 7: Start resend OTP cooldown
// Disables Resend OTP button and shows countdown.
// ============================================================

function startResendCooldown(seconds) {
  let remainingSeconds = seconds;

  if (resendCooldownInterval) {
    clearInterval(resendCooldownInterval);
  }

  if (resendOtpBtn) {
    resendOtpBtn.disabled = true;
    resendOtpBtn.textContent = `Resend OTP (${remainingSeconds}s)`;
  }

  updateResendTimerText(remainingSeconds);

  resendCooldownInterval = setInterval(() => {
    remainingSeconds -= 1;

    updateResendTimerText(remainingSeconds);

    if (resendOtpBtn) {
      resendOtpBtn.textContent = `Resend OTP (${remainingSeconds}s)`;
    }

    if (remainingSeconds <= 0) {
      clearInterval(resendCooldownInterval);
      resendCooldownInterval = null;

      if (resendOtpBtn) {
        resendOtpBtn.disabled = false;
        resendOtpBtn.textContent = "Resend OTP";
      }

      if (resendTimerText) {
        resendTimerText.textContent = "You can request a new OTP now.";
      }
    }
  }, 1000);
}

// ============================================================
// SECTION 8: Update resend timer text
// Shows countdown below the Resend OTP button.
// ============================================================

function updateResendTimerText(seconds) {
  if (resendTimerText) {
    resendTimerText.textContent = `Please wait ${seconds} seconds before requesting another OTP.`;
  }
}

// ============================================================
// SECTION 9: Reset password using OTP
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

  const originalText = resetPasswordBtn
    ? resetPasswordBtn.textContent
    : "Reset Password";

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
// SECTION 10: Button loading helper
// Disables button while request is running.
// ============================================================

function setButtonLoading(button, text) {
  if (!button) return;

  button.disabled = true;
  button.textContent = text;
}

// ============================================================
// SECTION 11: Reset button helper
// Returns button to normal state.
// ============================================================

function resetButton(button, text) {
  if (!button) return;

  button.disabled = false;
  button.textContent = text;
}

// ============================================================
// SECTION 12: Message helper
// Shows message inside the forgot password card only.
// We do not call showToast here to avoid duplicate messages.
// ============================================================

function showMessage(message, type = "success") {
  if (forgotMessage) {
    forgotMessage.textContent = message;
    forgotMessage.style.color = type === "error" ? "#dc2626" : "#047857";
  }
}