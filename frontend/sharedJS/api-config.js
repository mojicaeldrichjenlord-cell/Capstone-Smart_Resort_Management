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