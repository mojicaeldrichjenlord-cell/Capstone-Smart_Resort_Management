const API_BASE = "http://127.0.0.1:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  if (user.role === "admin") {
    window.location.href = "admin-profile.html";
    return;
  }

  setupLogout();
  loadProfile(user.id);
  setupPasswordForm(user.id);
});

function setupLogout() {
  const logoutBtns = [
    document.getElementById("logoutBtn"),
    document.getElementById("mobileLogoutBtn"),
  ].filter(Boolean);

  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("user");
      showMessage("Logged out successfully.", "success");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 700);
    });
  });
}

async function loadProfile(userId) {
  try {
    const response = await fetch(`${API_BASE}/auth/profile/${userId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load profile.");
    }

    const user = data.user;

    document.getElementById("profileFullname").textContent = user.fullname || "N/A";
    document.getElementById("profileEmail").textContent = user.email || "N/A";
    document.getElementById("profilePhone").textContent = user.phone || "N/A";
    document.getElementById("profileAddress").textContent = user.address || "N/A";
  } catch (error) {
    console.error("loadProfile error:", error);
    showMessage(error.message || "Failed to load profile.", "error");
  }
}

function setupPasswordForm(userId) {
  const changePasswordForm = document.getElementById("changePasswordForm");

  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showMessage("Please fill in all password fields.", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showMessage("New passwords do not match.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/change-password/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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
    }
  });
}

function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}