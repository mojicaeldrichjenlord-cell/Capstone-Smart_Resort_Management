const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullname = document.getElementById("fullname").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fullname, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("registeredEmail", email);

      message.style.color = "green";
      message.textContent = "Registration successful! Redirecting to login...";
      registerForm.reset();

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } else {
      message.style.color = "red";
      message.textContent = data.message;
    }
  } catch (error) {
    message.style.color = "red";
    message.textContent = "Something went wrong. Please try again.";
    console.error(error);
  }
});