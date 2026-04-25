const API_BASE = "http://127.0.0.1:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  if (user.role !== "admin") {
    alert("Access denied. Admin only.");
    window.location.href = "index.html";
    return;
  }

  setupLogout();
  loadProfile(user.id);
  setupPasswordForm(user.id);
});

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("user");
      showMessage("Logged out successfully.", "success");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 700);
    });
  }
}

async function loadProfile(userId) {
  try {
    const response = await fetch(`${API_BASE}/auth/profile/${userId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load profile.");
    }

    const user = data.user || {};

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
  if (!changePasswordForm) return;

  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmNewPassword = document.getElementById("confirmNewPassword").value.trim();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showMessage("Please fill in all password fields.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showMessage("New password must be at least 6 characters.", "error");
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

function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}