// ============================================================
// ARVICSEASIDE ADMIN PROFILE SCRIPT
// Purpose:
// - Check admin access
// - Load admin profile details
// - Handle logout
// - Change admin password
// - Works from frontend/adminHTML/admin-profile.html
// ============================================================


// ============================================================
// SECTION 1: Page startup
// Checks admin access, loads profile, and sets password form.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const user = getAuthorizedAdminProfileUser();
  if (!user) return;

  setupLogout();
  loadProfile(user.id);
  setupPasswordForm(user.id);
  setupResortPricingSettings();
});

function getAuthorizedAdminProfileUser() {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    console.error("Invalid stored account data:", error);
  }

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return null;
  }

  const role = String(user.role || "").trim().toLowerCase();
  if (role !== "admin") {
    const destinations = {
      customer: "../customerHTML/index.html",
      frontdesk: "../frontdeskHTML/frontdeskDashboard.html",
      staff: "../frontdeskHTML/frontdeskDashboard.html",
      manager: "../managerHTML/managerDashboard.html",
      housekeeping: "../housekeepingHTML/housekeepingDashboard.html",
    };

    alert("Access denied. Admin only.");
    window.location.href = destinations[role] || "../authHTML/login.html";
    return null;
  }

  return user;
}

// ============================================================
// SECTION 2: Logout
// Clears current user and returns to login page.
// ============================================================

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();

      localStorage.removeItem("user");
      sessionStorage.removeItem("adminToken");
      showMessage("Logged out successfully.", "success");

      setTimeout(() => {
        window.location.href = "../authHTML/login.html";
      }, 700);
    });
  }
}

// ============================================================
// SECTION 3: Load profile
// Gets admin profile details from backend.
// ============================================================

async function loadProfile(userId) {
  try {
    const token = sessionStorage.getItem("adminToken");
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
// SECTION 4: Password form setup
// Validates and submits change password request.
// ============================================================

function setupPasswordForm(userId) {
  const changePasswordForm = document.getElementById("changePasswordForm");
  if (!changePasswordForm) return;

  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = document
      .getElementById("currentPassword")
      .value.trim();

    const newPassword = document.getElementById("newPassword").value.trim();

    const confirmNewPassword = document
      .getElementById("confirmNewPassword")
      .value.trim();

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
    const originalBtnText = submitBtn
      ? submitBtn.textContent
      : "Change Password";

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Updating Password...";
        submitBtn.style.opacity = "0.75";
        submitBtn.style.cursor = "not-allowed";
      }

      const token = sessionStorage.getItem("adminToken");
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
      changePasswordForm.reset();
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
// SECTION 5: Admin-controlled resort pricing (persistent MySQL).
// Only signed Admin sessions may update this server-owned value.
// Front Desk uses a separate read-only API and cannot alter rate.
// ============================================================
function setupResortPricingSettings() {
  const form = document.getElementById("extraGuestRateForm");
  const input = document.getElementById("adminExtraGuestRate");
  const saveBtn = document.getElementById("saveAdminExtraGuestRate");
  const status = document.getElementById("adminExtraGuestRateStatus");
  if (!form || !input || !saveBtn) return;

  let latestSavedRate = null;
  function setStatus(message) {
    if (status) status.textContent = message;
  }
  function getAdminToken() {
    const token = sessionStorage.getItem("adminToken");
    if (!token) throw new Error("Admin session expired. Please log in again.");
    return token;
  }

  async function loadRate() {
    input.disabled = true;
    saveBtn.disabled = true;
    setStatus("Loading current resort pricing...");
    try {
      const response = await fetch(`${API_BASE}/guest-rate/admin`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Rate unavailable.");
      const rate = Number(data.extra_guest_rate);
      if (!Number.isFinite(rate) || rate < 0 || rate > 100000) {
        throw new Error("Invalid stored guest rate.");
      }
      latestSavedRate = rate;
      input.value = rate.toFixed(2);
      input.disabled = false;
      saveBtn.disabled = false;
      setStatus(`Current Extra Guest Rate: ₱${rate.toFixed(2)} per pax.`);
    } catch (error) {
      setStatus("Rate unavailable. Saving disabled.");
      showMessage(error.message || "Unable to load resort pricing.", "error");
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const newRate = Number(input.value);
    if (!input.value.trim() || !Number.isFinite(newRate) ||
        newRate < 0 || newRate > 100000 ||
        Math.abs(Math.round(newRate * 100) - newRate * 100) > 1e-6) {
      showMessage("Enter a rate from ₱0 to ₱100,000 with up to 2 decimals.", "error");
      return;
    }
    if (latestSavedRate !== null && newRate === latestSavedRate) {
      showMessage("Extra guest rate is already up to date.", "success");
      return;
    }
    saveBtn.disabled = true;
    input.disabled = true;
    setStatus("Saving rate...");
    try {
      const response = await fetch(`${API_BASE}/guest-rate/admin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({ extra_guest_rate: newRate }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save rate.");
      latestSavedRate = Number(data.extra_guest_rate);
      input.value = latestSavedRate.toFixed(2);
      showMessage(data.message || "Resort rate updated.", "success");
      setStatus(`Current Extra Guest Rate: ₱${latestSavedRate.toFixed(2)} per pax.`);
    } catch (error) {
      showMessage(error.message || "Unable to save resort pricing.", "error");
      setStatus("Rate not saved. Check resort pricing storage and try again.");
    } finally {
      input.disabled = false;
      saveBtn.disabled = false;
    }
  });
  void loadRate();
}

// ============================================================
// SECTION 6: Message helper
// Uses toast if available, otherwise alert.
// ============================================================

function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}