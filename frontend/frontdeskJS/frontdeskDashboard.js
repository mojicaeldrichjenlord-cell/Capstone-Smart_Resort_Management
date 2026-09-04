// ============================================================
// SMARTRESORT FRONT DESK DASHBOARD
// Create: frontend/frontdeskJS/frontdeskDashboard.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const user = getLoggedInUser();

  if (!user) {
    window.location.href = "../authHTML/login.html";
    return;
  }

  const role = normalizeRole(user.role);

  if (role !== "frontdesk") {
    redirectToCorrectDashboard(role);
    return;
  }

  if (
    String(user.account_status || "active").toLowerCase() === "disabled"
  ) {
    localStorage.removeItem("user");
    window.location.href = "../authHTML/login.html";
    return;
  }

  renderAccount(user);
  setupLogout();
});

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  const value = String(role || "").trim().toLowerCase();
  return value === "staff" ? "frontdesk" : value;
}

function renderAccount(user) {
  const name = document.getElementById("accountName");
  const email = document.getElementById("accountEmail");

  if (name) name.textContent = user.fullname || "Front Desk Staff";
  if (email) email.textContent = user.email || "-";
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");

    if (typeof showToast === "function") {
      showToast("Logged out successfully.", "success");
    }

    setTimeout(() => {
      window.location.href = "../authHTML/login.html";
    }, 500);
  });
}

function redirectToCorrectDashboard(role) {
  const routes = {
    customer: "../customerHTML/index.html",
    admin: "../adminHTML/admin.html",
    manager: "../managerHTML/managerDashboard.html",
    housekeeping: "../housekeepingHTML/housekeepingDashboard.html",
  };

  window.location.href = routes[role] || "../authHTML/login.html";
}
