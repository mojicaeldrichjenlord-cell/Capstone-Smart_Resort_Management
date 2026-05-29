// ============================================================
// SMARTRESORT LOGIN SCRIPT
// Purpose:
// - Handles login form submission
// - Saves logged-in user to localStorage
// - Redirects admin/staff/customer to correct page
// ============================================================

const API_BASE = "http://127.0.0.1:5000/api";

// ============================================================
// SECTION 1: Get login page elements
// These are the form, message display, and email input.
// ============================================================

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const emailInput = document.getElementById("email");

// ============================================================
// SECTION 2: Auto-fill email after registration or password reset
// registeredEmail can come from register page.
// resetEmail can come from forgot password page.
// ============================================================

const savedRegisteredEmail = localStorage.getItem("registeredEmail");
const savedResetEmail = localStorage.getItem("resetEmail");

if (savedRegisteredEmail && emailInput) {
  emailInput.value = savedRegisteredEmail;
  localStorage.removeItem("registeredEmail");
}

if (savedResetEmail && emailInput) {
  emailInput.value = savedResetEmail;
  localStorage.removeItem("resetEmail");
}

// ============================================================
// SECTION 3: Login form submit event
// Sends email and password to backend /api/auth/login.
// ============================================================

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (loginMessage) {
      loginMessage.textContent = "";
    }

    if (!email || !password) {
      showMessage("Please enter your email and password.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      if (data.user?.account_status === "disabled") {
        showMessage(
          "Your account has been disabled. Please contact the resort administrator.",
          "error",
        );
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      showMessage("Login successful!", "success");

      setTimeout(() => {
        const role = String(data.user.role || "").toLowerCase();

        if (role === "admin" || role === "staff") {
          window.location.href = "../adminHTML/admin.html";
        } else {
          window.location.href = "../index.html";
        }
      }, 900);
    } catch (error) {
      console.error("login error:", error);
      showMessage(
        error.message || "Something went wrong. Please try again.",
        "error",
      );
    }
  });
}

// ============================================================
// SECTION 4: Message helper
// Uses toast notification if available, otherwise uses alert.
// ============================================================

function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}
