const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

const savedRegisteredEmail = localStorage.getItem("registeredEmail");
const emailInput = document.getElementById("email");

if (savedRegisteredEmail) {
  emailInput.value = savedRegisteredEmail;
  localStorage.removeItem("registeredEmail");
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  loginMessage.textContent = "";

  if (!email || !password) {
    showToast("Please enter your email and password.", "error");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
      showToast("Login successful!", "success");

      setTimeout(() => {
        if (data.user.role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "index.html";
        }
      }, 1000);
    } else {
      showToast(data.message || "Invalid email or password.", "error");
    }
  } catch (error) {
    console.error(error);
    showToast("Something went wrong. Please try again.", "error");
  }
});