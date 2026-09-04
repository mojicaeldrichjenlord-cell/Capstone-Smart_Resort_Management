// ============================================================
// SMARTRESORT MANAGER DASHBOARD
// Create: frontend/managerJS/managerDashboard.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const user = getUser();

  if (!user) {
    window.location.href = "../authHTML/login.html";
    return;
  }

  const role = String(user.role || "").toLowerCase();

  if (role !== "manager") {
    redirectByRole(role);
    return;
  }

  document.getElementById("accountName").textContent =
    user.fullname || "Resort Manager";

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
    housekeeping: "../housekeepingHTML/housekeepingDashboard.html",
  };

  window.location.href = routes[role] || "../authHTML/login.html";
}
