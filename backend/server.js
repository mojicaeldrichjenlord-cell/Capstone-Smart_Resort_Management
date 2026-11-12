// ============================================================
// SMART RESORT BOOKING SYSTEM - BACKEND SERVER
// File: backend/server.js
// ============================================================

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminBookingRoutes = require("./routes/adminBookingRoutes");
const adminPaymentRoutes = require("./routes/adminPaymentRoutes");
const adminStaffRoutes = require("./routes/adminStaffRoutes");
const aiRoutes = require("./routes/aiRoutes");
const managerRoutes = require("./routes/managerRoutes");
const housekeepingRoutes = require("./routes/housekeepingRoutes");
const mapMarkerRoutes = require("./routes/mapMarkerRoutes");
const paypalRoutes = require("./routes/paypalRoutes");

const app = express();

// Stage 95-G: never serve confidential payment screenshots as public assets.
// Authorized staff now use GET /api/bookings/:id/payment-proof-image.
// Keep other uploaded assets working exactly as before.
const { isSensitiveUploadPath } = require("./utils/paymentProofAccess");
app.use("/uploads", (req, res, next) => {
  if (isSensitiveUploadPath(req.path)) {
    return res.status(403).json({ message: "Payment proofs require staff authorization." });
  }
  return next();
}, express.static(path.join(__dirname, "uploads")));

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  }),
);

app.get("/", (req, res) => {
  res.send("Smart Resort Booking System API is running.");
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);
// Admin manages staff identities; authorization enforced inside the router.
app.use("/api/admin/staff", adminStaffRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/manager", managerRoutes);
// Housekeeping API has independent signed-role checks and never inherits Admin rights.
app.use("/api/housekeeping", housekeepingRoutes);
app.use("/api/map-markers", mapMarkerRoutes);
app.use("/api/paypal", paypalRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
