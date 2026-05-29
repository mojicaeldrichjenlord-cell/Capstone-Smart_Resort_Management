// ============================================================
// CUSTOMER HOME SCRIPT
// File: frontend/customerJS/index.js
// Purpose:
// - Check customer login
// - Redirect admin users to admin dashboard
// - Handle desktop and mobile logout
// - Works from frontend/customerHTML/index.html
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "../authHTML/login.html";
    return;
  }

  if (user.role === "admin" || user.role === "staff") {
    window.location.href = "../adminHTML/admin.html";
    return;
  }

  setupLogout();
});

// ============================================================
// SECTION 1: Logout
// Handles both desktop and mobile logout buttons.
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

      if (typeof showToast === "function") {
        showToast("Logged out successfully.", "success");
      } else {
        alert("Logged out successfully.");
      }

      setTimeout(() => {
        window.location.href = "../authHTML/login.html";
      }, 700);
    });
  });
}