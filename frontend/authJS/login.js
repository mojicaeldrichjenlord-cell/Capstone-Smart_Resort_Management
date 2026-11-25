// ============================================================
// ARVICSEASIDE LOGIN SCRIPT - FULL REPLACEMENT
// Replace: frontend/authJS/login.js
//
// Final roles:
// customer, admin, frontdesk, manager, housekeeping
//
// Front Desk receives a signed, short-lived bearer token from the
// backend after successful authentication. The token is stored in
// sessionStorage, not in the user profile / localStorage.
// ============================================================

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberMeInput = document.getElementById("rememberMe");
// Only a Customer email may be remembered. Passwords and signed tokens are
// never written to persistent web storage by this feature.
const CUSTOMER_REMEMBER_EMAIL_KEY = "arvic_customer_remembered_email_v1";

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

// Initialize from the opt-in preference without overriding registration/reset
// email handoffs. Browsers control whether a saved password is autofilled.
function loadRememberedCustomerEmail() {
  try {
    const rememberedEmail = localStorage.getItem(CUSTOMER_REMEMBER_EMAIL_KEY);
    if (rememberedEmail && rememberMeInput) rememberMeInput.checked = true;
    if (rememberedEmail && !savedRegisteredEmail && !savedResetEmail && emailInput) {
      emailInput.value = rememberedEmail;
    }
  } catch (_) {
    // Storage can be unavailable in some private-browsing settings.
  }
}

function updateRememberedCustomerEmail(email) {
  try {
    if (rememberMeInput?.checked) {
      localStorage.setItem(CUSTOMER_REMEMBER_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(CUSTOMER_REMEMBER_EMAIL_KEY);
    }
  } catch (_) {
    // A storage restriction must never block successful authentication.
  }
}

loadRememberedCustomerEmail();
rememberMeInput?.addEventListener("change", () => {
  // Unchecking must immediately forget a previously remembered Customer email.
  if (!rememberMeInput.checked) {
    try { localStorage.removeItem(CUSTOMER_REMEMBER_EMAIL_KEY); } catch (_) {}
  }
});

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

      const tokens = {frontdesk:data.frontDeskToken,admin:data.adminToken,manager:data.managerToken,housekeeping:data.housekeepingToken,customer:data.customerToken};
      // Validate and commit under the profile-wide account guard before any storage mutation.
      await window.ArvicAccountSession.establish({...data.user,role},tokens[role]);

      // The login page is shared by all roles. Only successful Customer
      // authentication may save the opted-in email; never store passwords.
      if (role === "customer") updateRememberedCustomerEmail(email);

      showMessage("Login successful!", "success");

      setTimeout(() => {
        window.location.href = destination;
      }, 600);
    } catch (error) {
      if (error.code === "ACTIVE_ACCOUNT_CONFLICT" && window.ArvicAccountSession.showConflict()) return;
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

// Clear the old fallback message before each request.
function clearMessage() {
  if (!loginMessage) return;

  loginMessage.textContent = "";
  loginMessage.className = "message";
  loginMessage.hidden = true;
}

// Show one centered toast rather than duplicating the error on the page.
// Retain an inline fallback for cases where toast.js fails to load.
function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
    clearMessage();
    return;
  }

  if (loginMessage) {
    loginMessage.textContent = message;
    loginMessage.className = `login-message ${type}`;
    loginMessage.hidden = false;
    return;
  }

  alert(message);
}
