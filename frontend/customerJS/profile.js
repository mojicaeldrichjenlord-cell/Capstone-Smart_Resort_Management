// ============================================================
// CUSTOMER PROFILE SCRIPT
// File: frontend/customerJS/profile.js
// Purpose:
// - Check customer access
// - Load customer profile details
// - Change password
// - Handle logout
// - Show/hide password fields
// - Works from frontend/customerHTML/profile.html
// ============================================================


document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return;
  }

  if (user.role === "admin" || user.role === "staff") {
    window.location.href = "../adminHTML/admin-profile.html";
    return;
  }

  setupLogout();
  setupPasswordToggles();
  loadProfile(user.id);
  setupPasswordDisclosure();
  setupPasswordForm(user.id);
});

// ============================================================
// SECTION 1: Logout
// ============================================================

function setupLogout() {
  const logoutBtns = [
    document.getElementById("logoutBtn"),
    document.getElementById("mobileLogoutBtn"),
  ].filter(Boolean);

  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      localStorage.removeItem("user");
      sessionStorage.removeItem("customerToken");
      showMessage("Logged out successfully.", "success");

      setTimeout(() => {
        window.location.href = "../authHTML/login.html";
      }, 700);
    });
  });
}

// ============================================================
// SECTION 2: Show / hide password buttons
// ============================================================

function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll(".toggle-password");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target");
      const input = document.getElementById(targetId);

      if (!input) return;

      const isVisible = input.type === "password";
      input.type = isVisible ? "text" : "password";
      button.textContent = isVisible ? "Hide" : "Show";
      // UI-31: Announce the actual visibility state to screen readers and
      // keep the compact in-field control keyboard accessible.
      button.setAttribute("aria-pressed", String(isVisible));
      const fieldName = ({
        currentPassword: "current password",
        newPassword: "new password",
        confirmNewPassword: "new password confirmation",
      })[targetId] || "password";
      button.setAttribute("aria-label",
        (isVisible ? "Hide " : "Show ") + fieldName);
    });
  });
}

// ============================================================
// SECTION 3: Load profile
// ============================================================

async function loadProfile(userId) {
  try {
    const token = sessionStorage.getItem("customerToken");
    if (!token) throw new Error("Your profile session has expired. Please log in again.");
    const response = await fetch(`${API_BASE}/auth/profile/${userId}`, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load profile.");
    }

    const user = data.user || {};

    document.getElementById("profileFullname").textContent =
      user.fullname || "N/A";

    document.getElementById("profileEmail").textContent =
      user.email || "N/A";

    document.getElementById("profilePhone").textContent =
      user.phone || "N/A";

    document.getElementById("profileAddress").textContent =
      user.address || "N/A";
  } catch (error) {
    console.error("loadProfile error:", error);
    showMessage(error.message || "Failed to load profile.", "error");
  }
}

// ============================================================
// SECTION 4: Change password form
// ============================================================

// UI-72: keep the form closed initially and clear credentials on collapse.
function setPasswordFormOpen(open) {
  const form = document.getElementById("changePasswordForm");
  const toggle = document.getElementById("changePasswordToggle");
  if (!form || !toggle) return;

  if (!open) {
    form.reset();
    form.querySelectorAll(".toggle-password").forEach((button) => {
      const input = document.getElementById(button.getAttribute("data-target"));
      if (input) input.type = "password";
      button.textContent = "Show";
      button.setAttribute("aria-pressed", "false");
      const fieldName = ({
        currentPassword: "current password",
        newPassword: "new password",
        confirmNewPassword: "new password confirmation",
      })[button.getAttribute("data-target")] || "password";
      button.setAttribute("aria-label", "Show " + fieldName);
    });
  }

  form.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  if (open) document.getElementById("currentPassword")?.focus();
  else toggle.focus();
}

function setupPasswordDisclosure() {
  const form = document.getElementById("changePasswordForm");
  const toggle = document.getElementById("changePasswordToggle");
  if (!form || !toggle) return;
  toggle.addEventListener("click", () => {
    if (form.querySelector('button[type="submit"]')?.disabled) return;
    setPasswordFormOpen(form.hidden);
  });
}

function setupPasswordForm(userId) {
  const changePasswordForm = document.getElementById("changePasswordForm");

  if (!changePasswordForm) return;

  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (changePasswordForm.hidden) return;

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showMessage("Please fill in all password fields.", "error");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
      showMessage("New password must be 8–16 characters long.", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showMessage("New passwords do not match.", "error");
      return;
    }

    const submitBtn = changePasswordForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : "Change Password";

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Updating Password...";
        submitBtn.style.opacity = "0.75";
        submitBtn.style.cursor = "not-allowed";
      }

      const token = sessionStorage.getItem("customerToken");
      if (!token) throw new Error("Your profile session has expired. Please log in again.");
      const response = await fetch(`${API_BASE}/auth/change-password/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password.");
      }

      showMessage(data.message || "Password changed successfully.", "success");
      setPasswordFormOpen(false);
    } catch (error) {
      console.error("changePassword error:", error);
      showMessage(error.message || "Failed to change password.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
      }
    }
  });
}

// ============================================================
// SECTION 5: Message helper
// ============================================================

function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}