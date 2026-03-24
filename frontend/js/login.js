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

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

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
      loginMessage.style.color = "green";
      loginMessage.textContent = data.message;

      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        if (data.user.role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "index.html";
        }
      }, 1000);
    } else {
      loginMessage.style.color = "red";
      loginMessage.textContent = data.message;
    }
  } catch (error) {
    loginMessage.style.color = "red";
    loginMessage.textContent = "Something went wrong. Please try again.";
    console.error(error);
  }
});