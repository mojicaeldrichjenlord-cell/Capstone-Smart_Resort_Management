const API_BASE = "http://127.0.0.1:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");

  if (!registerForm) return;

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!fullname || !email || !phone || !address || !password || !confirmPassword) {
      showMessage("Please fill in all fields.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Passwords do not match.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname,
          email,
          phone,
          address,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      showMessage(data.message || "Registration successful.", "success");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    } catch (error) {
      console.error("register error:", error);
      showMessage(error.message || "Registration failed.", "error");
    }
  });
});

function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}