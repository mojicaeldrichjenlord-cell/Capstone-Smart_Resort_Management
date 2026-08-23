// ============================================================
// SMART RESORT BOOKING SYSTEM - BACKEND SERVER
// File: backend/server.js
// STEP 2: Added PayMongo preparation routes.
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
const aiRoutes = require("./routes/aiRoutes");
const mapMarkerRoutes = require("./routes/mapMarkerRoutes");
const paymongoRoutes = require("./routes/paymongoRoutes");

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (req, res) => {
  res.send("Smart Resort Booking System API is running.");
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/map-markers", mapMarkerRoutes);
app.use("/api/paymongo", paymongoRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
