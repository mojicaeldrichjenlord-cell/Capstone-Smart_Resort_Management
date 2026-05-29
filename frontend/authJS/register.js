// ============================================================
// SMARTRESORT REGISTER SCRIPT
// Purpose:
// - Submit registration form
// - Send OTP to user's email
// - Verify OTP before account can login
// - Resend OTP when needed
// ============================================================

const API_BASE = "http://127.0.0.1:5000/api";

// ============================================================
// SECTION 1: Global state
// Stores the email currently waiting for OTP verification.
// ============================================================

let pendingVerificationEmail = "";

// ============================================================
// SECTION 2: Page startup
// Connects register form, verify OTP button, and resend button.
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
// Validates input, creates account, and sends OTP to email.
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
  } catch (error) {
    console.error("register error:", error);
    showMessage(error.message || "Registration failed.", "error");
  } finally {
    resetButton(submitBtn, originalText);
  }
}

// ============================================================
// SECTION 4: Verify registration OTP
// Sends email and OTP to backend for verification.
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

    localStorage.removeItem("pendingVerificationEmail");
    localStorage.setItem("registeredEmail", email);

    showMessage(data.message || "Email verified successfully.", "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
  } catch (error) {
    console.error("verifyRegistrationOtp error:", error);
    showMessage(error.message || "OTP verification failed.", "error");
  } finally {
    resetButton(verifyBtn, originalText);
  }
}

// ============================================================
// SECTION 5: Resend registration OTP
// Sends a new OTP for the same unverified email.
// ============================================================

async function resendRegistrationOtp() {
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
  } catch (error) {
    console.error("resendRegistrationOtp error:", error);
    showMessage(error.message || "Failed to resend OTP.", "error");
  } finally {
    resetButton(resendBtn, originalText);
  }
}

// ============================================================
// SECTION 6: Show OTP verification box
// Displays OTP section and shows the email where OTP was sent.
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
// SECTION 7: Lock register form
// Prevents editing details after OTP was sent.
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
// SECTION 8: Email format validator
// Basic frontend email format checking.
// ============================================================

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================================
// SECTION 9: Button loading helper
// Disables button while sending/verifying request.
// ============================================================

function setButtonLoading(button, text) {
  if (!button) return;

  button.disabled = true;
  button.textContent = text;
  button.style.opacity = "0.7";
  button.style.cursor = "not-allowed";
}

// ============================================================
// SECTION 10: Reset button helper
// Restores button after request finishes.
// ============================================================

function resetButton(button, text) {
  if (!button) return;

  button.disabled = false;
  button.textContent = text;
  button.style.opacity = "1";
  button.style.cursor = "pointer";
}

// ============================================================
// SECTION 11: Message helper
// Uses toast notification if available, otherwise alert.
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