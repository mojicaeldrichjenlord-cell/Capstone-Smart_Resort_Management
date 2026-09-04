// ============================================================
// SMARTRESORT HOUSEKEEPING DASHBOARD
// Create: frontend/housekeepingJS/housekeepingDashboard.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const user = getUser();

  if (!user) {
    window.location.href = "../authHTML/login.html";
    return;
  }

  const role = String(user.role || "").toLowerCase();

  if (role !== "housekeeping") {
    redirectByRole(role);
    return;
  }

  document.getElementById("accountName").textContent =
    user.fullname || "Housekeeping Staff";

  document.getElementById("accountEmail").textContent =
    user.email || "-";

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("user");

    if (typeof showToast === "function") {
      showToast("Logged out successfully.", "success");
    }

    setTimeout(() => {
      window.location.href = "../authHTML/login.html";
    }, 500);
  });
});

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function redirectByRole(role) {
  const routes = {
    customer: "../customerHTML/index.html",
    admin: "../adminHTML/admin.html",
    frontdesk: "../frontdeskHTML/frontdeskDashboard.html",
    manager: "../managerHTML/managerDashboard.html",
  };

  window.location.href = routes[role] || "../authHTML/login.html";
}
