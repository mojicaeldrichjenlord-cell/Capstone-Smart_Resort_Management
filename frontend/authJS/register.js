// ============================================================
// SMARTRESORT REGISTER SCRIPT
// Purpose:
// - Submit registration form
// - Send OTP to user's email
// - Verify OTP before account can login
// - Auto-login user after successful OTP verification
// - Resend OTP with cooldown timer
// ============================================================

const API_BASE = "http://127.0.0.1:5000/api";
const RESEND_COOLDOWN_SECONDS = 60;

// ============================================================
// SECTION 1: Global state
// ============================================================

let pendingVerificationEmail = "";
let resendCooldownTimer = null;
let resendRemainingSeconds = 0;

// ============================================================
// SECTION 2: Page startup
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const resendOtpBtn = document.getElementById("resendOtpBtn");

  if (!registerForm) {
    console.error("registerForm not found.");
    return;
  }

  registerForm.addEventListener("submit", submitRegistration);

  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener("click", verifyRegistrationOtp);
  }

  if (resendOtpBtn) {
    resendOtpBtn.addEventListener("click", resendRegistrationOtp);
  }
});

// ============================================================
// SECTION 3: Submit registration
// ============================================================

async function submitRegistration(e) {
  e.preventDefault();

  const fullname = document.getElementById("fullname")?.value.trim();
  const email = document.getElementById("email")?.value.trim().toLowerCase();
  const phone = document.getElementById("phone")?.value.trim();
  const address = document.getElementById("address")?.value.trim();
  const password = document.getElementById("password")?.value;
  const confirmPassword = document.getElementById("confirmPassword")?.value;

  if (!fullname || !email || !phone || !address || !password || !confirmPassword) {
    showMessage("Please fill in all fields.", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showMessage("Please enter a valid email address.", "error");
    return;
  }

  if (password.length < 8) {
    showMessage("Password must be at least 8 characters long.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Passwords do not match.", "error");
    return;
  }

  const submitBtn = document.getElementById("registerSubmitBtn");
  const originalText = submitBtn ? submitBtn.textContent : "Register Account";

  try {
    setButtonLoading(submitBtn, "Sending OTP...");

    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullname,
        email,
        phone,
        address,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed.");
    }

    pendingVerificationEmail = data.email || email;
    localStorage.setItem("pendingVerificationEmail", pendingVerificationEmail);

    showOtpBox(pendingVerificationEmail);

    showMessage(
      data.message || "Registration successful. Please check your email for OTP.",
      "success"
    );

    lockRegisterForm();
    startResendCooldown();
  } catch (error) {
    console.error("register error:", error);
    showMessage(error.message || "Registration failed.", "error");
  } finally {
    resetButton(submitBtn, originalText);
  }
}

// ============================================================
// SECTION 4: Verify registration OTP
// ============================================================

async function verifyRegistrationOtp() {
  const email =
    pendingVerificationEmail ||
    localStorage.getItem("pendingVerificationEmail") ||
    document.getElementById("email")?.value.trim().toLowerCase();

  const otp = document.getElementById("registerOtp")?.value.trim();

  if (!email) {
    showMessage("Missing email for verification.", "error");
    return;
  }

  if (!otp || otp.length !== 6) {
    showMessage("Please enter the 6-digit OTP.", "error");
    return;
  }

  const verifyBtn = document.getElementById("verifyOtpBtn");
  const originalText = verifyBtn ? verifyBtn.textContent : "Verify OTP";

  try {
    setButtonLoading(verifyBtn, "Verifying...");

    const response = await fetch(`${API_BASE}/auth/register/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "OTP verification failed.");
    }

    stopResendCooldown();

    localStorage.removeItem("pendingVerificationEmail");
    localStorage.removeItem("registeredEmail");

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    showMessage(
      data.message || "Email verified successfully. Redirecting to dashboard...",
      "success"
    );

    setTimeout(() => {
      window.location.href = "../customerHTML/index.html";
    }, 1000);
  } catch (error) {
    console.error("verifyRegistrationOtp error:", error);
    showMessage(error.message || "OTP verification failed.", "error");
  } finally {
    resetButton(verifyBtn, originalText);
  }
}

// ============================================================
// SECTION 5: Resend registration OTP with cooldown
// ============================================================

async function resendRegistrationOtp() {
  if (resendRemainingSeconds > 0) {
    showMessage(`Please wait ${resendRemainingSeconds}s before resending OTP.`, "error");
    return;
  }

  const email =
    pendingVerificationEmail ||
    localStorage.getItem("pendingVerificationEmail") ||
    document.getElementById("email")?.value.trim().toLowerCase();

  if (!email) {
    showMessage("Missing email for OTP resend.", "error");
    return;
  }

  const resendBtn = document.getElementById("resendOtpBtn");
  const originalText = resendBtn ? resendBtn.textContent : "Resend OTP";

  try {
    setButtonLoading(resendBtn, "Resending...");

    const response = await fetch(`${API_BASE}/auth/register/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to resend OTP.");
    }

    showMessage(data.message || "New OTP has been sent to your email.", "success");
    startResendCooldown();
  } catch (error) {
    console.error("resendRegistrationOtp error:", error);
    showMessage(error.message || "Failed to resend OTP.", "error");

    if (resendBtn) {
      resetButton(resendBtn, originalText);
    }
  }
}

// ============================================================
// SECTION 6: Cooldown helpers
// ============================================================

function startResendCooldown() {
  const resendBtn = document.getElementById("resendOtpBtn");
  if (!resendBtn) return;

  stopResendCooldown();

  resendRemainingSeconds = RESEND_COOLDOWN_SECONDS;
  updateResendButton();

  resendCooldownTimer = setInterval(() => {
    resendRemainingSeconds -= 1;
    updateResendButton();

    if (resendRemainingSeconds <= 0) {
      stopResendCooldown();
    }
  }, 1000);
}

function stopResendCooldown() {
  const resendBtn = document.getElementById("resendOtpBtn");

  if (resendCooldownTimer) {
    clearInterval(resendCooldownTimer);
    resendCooldownTimer = null;
  }

  resendRemainingSeconds = 0;

  if (resendBtn) {
    resendBtn.disabled = false;
    resendBtn.textContent = "Resend OTP";
    resendBtn.style.opacity = "1";
    resendBtn.style.cursor = "pointer";
  }
}

function updateResendButton() {
  const resendBtn = document.getElementById("resendOtpBtn");
  if (!resendBtn) return;

  if (resendRemainingSeconds > 0) {
    resendBtn.disabled = true;
    resendBtn.textContent = `Resend OTP in ${resendRemainingSeconds}s`;
    resendBtn.style.opacity = "0.72";
    resendBtn.style.cursor = "not-allowed";
  } else {
    resendBtn.disabled = false;
    resendBtn.textContent = "Resend OTP";
    resendBtn.style.opacity = "1";
    resendBtn.style.cursor = "pointer";
  }
}

// ============================================================
// SECTION 7: Show OTP verification box
// ============================================================

function showOtpBox(email) {
  const otpBox = document.getElementById("registerOtpBox");
  const otpEmailText = document.getElementById("otpEmailText");

  if (otpEmailText) {
    otpEmailText.textContent = email;
  }

  if (otpBox) {
    otpBox.classList.add("show");
    otpBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// ============================================================
// SECTION 8: Lock register form
// ============================================================

function lockRegisterForm() {
  const fields = [
    "fullname",
    "email",
    "phone",
    "address",
    "password",
    "confirmPassword",
  ];

  fields.forEach((id) => {
    const field = document.getElementById(id);
    if (field) {
      field.readOnly = true;
    }
  });
}

// ============================================================
// SECTION 9: Email validator
// ============================================================

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================================
// SECTION 10: Button helpers
// ============================================================

function setButtonLoading(button, text) {
  if (!button) return;

  button.disabled = true;
  button.textContent = text;
  button.style.opacity = "0.7";
  button.style.cursor = "not-allowed";
}

function resetButton(button, text) {
  if (!button) return;

  button.disabled = false;
  button.textContent = text;
  button.style.opacity = "1";
  button.style.cursor = "pointer";
}

// ============================================================
// SECTION 11: Message helper
// ============================================================

function showMessage(message, type = "success") {
  const messageEl = document.getElementById("registerMessage");

  if (messageEl) {
    messageEl.textContent = message;
    messageEl.style.color = type === "error" ? "#dc2626" : "#047857";
  }

  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}