// ============================================================
// SMARTRESORT LOGIN SCRIPT
// Purpose:
// - Handles login form submission
// - Saves logged-in user to localStorage
// - Redirects admin/staff/customer to correct page
// - Adds show/hide password toggle
// ============================================================


// ============================================================
// SECTION 1: Get login page elements
// ============================================================

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// ============================================================
// SECTION 2: Setup show/hide password
// Supports button with:
// - id="togglePassword"
// OR
// - class="toggle-password" data-target="password"
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
// SECTION 3: Auto-fill email after registration or password reset
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
// SECTION 4: Login form submit event
// Sends email and password to backend /api/auth/login.
// ============================================================

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (loginMessage) {
      loginMessage.textContent = "";
      loginMessage.className = "";
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
          window.location.href = "../customerHTML/index.html";
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
// SECTION 5: Message helper
// Uses toast notification if available.
// Falls back to loginMessage without moving layout too much.
// ============================================================

function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
    return;
  }

  if (loginMessage) {
    loginMessage.textContent = message;
    loginMessage.className = `login-message ${type}`;
    return;
  }

  alert(message);
}
