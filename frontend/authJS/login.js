// ============================================================
// SMARTRESORT LOGIN SCRIPT - FULL REPLACEMENT
// Replace: frontend/authJS/login.js
//
// Final roles:
// customer, admin, frontdesk, manager, housekeeping
// ============================================================

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// ============================================================
// SECTION 1: Password visibility
// ============================================================

setupPasswordToggle();

function setupPasswordToggle() {
  const toggleBtn = document.getElementById("togglePassword");
  const eyeIcon = document.getElementById("passwordEyeIcon");

  if (!toggleBtn || !passwordInput) return;

  toggleBtn.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";

    if (eyeIcon) {
      eyeIcon.textContent = isHidden ? "👁" : "⌣";
    }

    toggleBtn.setAttribute(
      "aria-label",
      isHidden ? "Hide password" : "Show password",
    );
  });
}

// ============================================================
// SECTION 2: Saved email helpers
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
// SECTION 3: Login
// ============================================================

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    clearMessage();

    if (!email || !password) {
      showMessage("Please enter your email and password.", "error");
      return;
    }

    const submitButton = loginForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton?.textContent || "Login";

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Logging in...";
      }

      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      if (!data.user) {
        throw new Error("Login response did not include a user account.");
      }

      if (
        String(data.user.account_status || "active").toLowerCase() ===
        "disabled"
      ) {
        throw new Error(
          "Your account has been disabled. Please contact the resort administrator.",
        );
      }

      const role = normalizeRole(data.user.role);
      const destination = getRoleRedirect(role);

      if (!destination) {
        throw new Error(
          "Your account role is not recognized. Please contact the resort administrator.",
        );
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...data.user,
          role,
        }),
      );

      showMessage("Login successful!", "success");

      setTimeout(() => {
        window.location.href = destination;
      }, 600);
    } catch (error) {
      console.error("login error:", error);

      showMessage(
        error.message || "Something went wrong. Please try again.",
        "error",
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
}

// ============================================================
// SECTION 4: Role routing
// ============================================================

function normalizeRole(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();

  // Legacy compatibility only.
  if (value === "staff") {
    return "frontdesk";
  }

  return value;
}

function getRoleRedirect(role) {
  const routes = {
    customer: "../customerHTML/index.html",
    admin: "../adminHTML/admin.html",
    frontdesk: "../frontdeskHTML/frontdeskDashboard.html",
    manager: "../managerHTML/managerDashboard.html",
    housekeeping: "../housekeepingHTML/housekeepingDashboard.html",
  };

  return routes[role] || null;
}

// ============================================================
// SECTION 5: Message helpers
// ============================================================

function clearMessage() {
  if (!loginMessage) return;

  loginMessage.textContent = "";
  loginMessage.className = "";
}

function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
  }

  if (loginMessage) {
    loginMessage.textContent = message;
    loginMessage.className = `login-message ${type}`;
    return;
  }

  if (typeof showToast !== "function") {
    alert(message);
  }
}
