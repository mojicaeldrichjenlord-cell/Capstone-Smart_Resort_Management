const user = JSON.parse(localStorage.getItem("user"));

const loginNav = document.getElementById("loginNav");
const registerNav = document.getElementById("registerNav");
const myBookingsNav = document.getElementById("myBookingsNav");
const profileNav = document.getElementById("profileNav");
const adminNav = document.getElementById("adminNav");
const logoutBtn = document.getElementById("logoutBtn");

const heroTitle = document.getElementById("heroTitle");
const heroText = document.getElementById("heroText");
const getStartedBtn = document.getElementById("getStartedBtn");
const heroLoginBtn = document.getElementById("heroLoginBtn");
const bookNowBtn = document.getElementById("bookNowBtn");

if (user) {
  loginNav.style.display = "none";
  registerNav.style.display = "none";
  logoutBtn.style.display = "inline-block";

  heroTitle.textContent = `Welcome, ${user.fullname}`;
  heroText.textContent = "You are now logged in. You can browse rooms and manage your bookings.";

  getStartedBtn.style.display = "none";
  heroLoginBtn.style.display = "none";
  bookNowBtn.style.display = "inline-block";

  if (user.role === "admin") {
    adminNav.style.display = "inline-block";
  } else {
    myBookingsNav.style.display = "inline-block";
    profileNav.style.display = "inline-block";
  }
}

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("user");
  localStorage.removeItem("selectedRoom");
  window.location.href = "login.html";
});