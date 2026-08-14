// ============================================================
// SMARTRESORT REGISTER SCRIPT
// Purpose:
// - Submit registration form
// - First name and last name are required
// - Middle name is optional
// - Password requires minimum 8 characters and 1 special character
// - Send OTP to user's email
// - Verify OTP before account can login
// - Auto-login user after successful OTP verification
// - Resend OTP with cooldown timer
// ============================================================

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
  const phoneInput = document.getElementById("phone");
  const otpInput = document.getElementById("registerOtp");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

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

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 11);
    });
  }

  if (otpInput) {
    otpInput.addEventListener("input", () => {
      otpInput.value = otpInput.value.replace(/\D/g, "").slice(0, 6);
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      updatePasswordStrengthUi(passwordInput.value);
      updatePasswordMatchUi();
    });

    updatePasswordStrengthUi(passwordInput.value);
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", updatePasswordMatchUi);
  }

  setupPasswordToggles();
});



// ============================================================
// SECTION 2.1: Password show/hide controls
// ============================================================

function setupPasswordToggles() {
  document.querySelectorAll(".password-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.target);

      if (!input) return;

      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";

      button.setAttribute(
        "aria-label",
        isPassword ? "Hide password" : "Show password",
      );
    });
  });
}

// ============================================================
// SECTION 2.2: Password requirement checker
// ============================================================

function getPasswordRequirements(password) {
  const value = String(password || "");

  return {
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /\d/.test(value),
    special: /[^A-Za-z0-9\s]/.test(value),
  };
}

// ============================================================
// SECTION 2.3: Password strength calculator
// ============================================================

function getPasswordStrengthInfo(password) {
  const value = String(password || "");
  const requirements = getPasswordRequirements(value);
  const score = Object.values(requirements).filter(Boolean).length;

  if (!value) {
    return { label: "Not set", key: "empty", percentage: 0 };
  }

  if (score <= 2) {
    return { label: "Weak", key: "weak", percentage: 25 };
  }

  if (score === 3) {
    return { label: "Fair", key: "fair", percentage: 50 };
  }

  if (score === 4) {
    return { label: "Good", key: "good", percentage: 75 };
  }

  return { label: "Strong", key: "strong", percentage: 100 };
}

// ============================================================
// SECTION 2.4: Update premium password UI
// ============================================================

function updatePasswordStrengthUi(password) {
  const requirements = getPasswordRequirements(password);
  const strength = getPasswordStrengthInfo(password);

  const strengthBox = document.getElementById("passwordStrengthBox");
  const strengthText = document.getElementById("passwordStrengthText");
  const strengthBar = document.getElementById("passwordStrengthBar");
  const premiumField = document.getElementById("premiumPasswordField");

  const requirementElements = {
    length: document.getElementById("requirementLength"),
    uppercase: document.getElementById("requirementUppercase"),
    lowercase: document.getElementById("requirementLowercase"),
    number: document.getElementById("requirementNumber"),
    special: document.getElementById("requirementSpecial"),
  };

  Object.entries(requirementElements).forEach(([key, element]) => {
    if (!element) return;
    element.classList.toggle("met", Boolean(requirements[key]));
  });

  if (strengthBox) {
    strengthBox.dataset.strength = strength.key;
  }

  if (strengthText) {
    strengthText.textContent = strength.label;
  }

  if (strengthBar) {
    strengthBar.style.width = `${strength.percentage}%`;
  }

  if (premiumField) {
    premiumField.classList.remove("valid", "partial", "invalid");

    if (!password) return;

    if (strength.key === "strong") {
      premiumField.classList.add("valid");
    } else if (strength.key === "good" || strength.key === "fair") {
      premiumField.classList.add("partial");
    } else {
      premiumField.classList.add("invalid");
    }
  }
}

// ============================================================
// SECTION 2.5: Confirm password match indicator
// ============================================================

function updatePasswordMatchUi() {
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");
  const status = document.getElementById("passwordMatchStatus");
  const field = confirmInput?.closest(".password-field");

  if (!passwordInput || !confirmInput || !status) return;

  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  status.classList.remove("match", "no-match");
  field?.classList.remove("match", "no-match");

  if (!confirmPassword) {
    status.textContent = "Re-enter your password to confirm.";
    return;
  }

  if (password === confirmPassword) {
    status.textContent = "✓ Passwords match.";
    status.classList.add("match");
    field?.classList.add("match");
  } else {
    status.textContent = "Passwords do not match.";
    status.classList.add("no-match");
    field?.classList.add("no-match");
  }
}

// ============================================================
// SECTION 3: Submit registration
// ============================================================

async function submitRegistration(e) {
  e.preventDefault();

  const firstName = document.getElementById("firstName")?.value.trim();
  const middleName = document.getElementById("middleName")?.value.trim();
  const lastName = document.getElementById("lastName")?.value.trim();
  const email = document.getElementById("email")?.value.trim().toLowerCase();
  const phone = document.getElementById("phone")?.value.trim();
  const address = document.getElementById("address")?.value.trim();
  const password = document.getElementById("password")?.value;
  const confirmPassword = document.getElementById("confirmPassword")?.value;

  const fullname = [firstName, middleName, lastName].filter(Boolean).join(" ");

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !address ||
    !password ||
    !confirmPassword
  ) {
    showMessage("Please fill in all required fields.", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showMessage("Please enter a valid email address.", "error");
    return;
  }

  if (!isValidPhilippineMobileNumber(phone)) {
    showMessage("Phone number must be exactly 11 digits and start with 09.", "error");
    return;
  }

  const passwordValidation = validatePassword(password);

  if (!passwordValidation.valid) {
    showMessage(passwordValidation.message, "error");
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
        first_name: firstName,
        middle_name: middleName || "",
        last_name: lastName,
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
      data.message ||
        "Registration successful. Please check your email for OTP.",
      "success",
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
      data.message ||
        "Email verified successfully. Redirecting to dashboard...",
      "success",
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
    showMessage(
      `Please wait ${resendRemainingSeconds}s before resending OTP.`,
      "error",
    );
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

    showMessage(
      data.message || "New OTP has been sent to your email.",
      "success",
    );
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
    "firstName",
    "middleName",
    "lastName",
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
// SECTION 9: Validators
// ============================================================

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhilippineMobileNumber(value) {
  return /^09\d{9}$/.test(String(value || "").trim());
}

function validatePassword(password) {
  const requirements = getPasswordRequirements(password);
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

  if (!messageEl) {
    console.log(message);
    return;
  }

  messageEl.textContent = message;
  messageEl.style.color = type === "error" ? "#dc2626" : "#047857";
  messageEl.style.display = "block";
}
