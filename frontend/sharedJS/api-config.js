// const API_BASE = "http://127.0.0.1:5000/api";
// taskkill /F /IM node.exe
// cd backend
// npm start
// const API_BASE = "https://smartresort-backend.onrender.com/api";

/* ======================================================
   API CONFIG
   Local = localhost backend
   Online = Render backend
====================================================== */

const API_BASE =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000/api"
    : "https://smartresort-backend.onrender.com/api";

/* ======================================================
   FRONT DESK TOKEN LOGOUT CLEANUP

   Reservations, Payments, and Guests pages already load this
   shared script and have their own Logout button handlers.
   Clear the Front Desk token when Logout is clicked, before
   their existing handlers redirect to the login page.

   Capture phase makes this work without changing or duplicating
   any of those pages' reservation/payment/guest operations.
====================================================== */

document.addEventListener(
  "click",
  (event) => {
    if (event.target?.closest?.("#logoutBtn")) {
      sessionStorage.removeItem("frontDeskToken");
      sessionStorage.removeItem("adminToken");
    }
  },
  true,
);
