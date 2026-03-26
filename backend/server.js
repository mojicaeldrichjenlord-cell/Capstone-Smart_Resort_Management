require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminBookingRoutes = require("./routes/adminBookingRoutes");
const adminPaymentRoutes = require("./routes/adminPaymentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Smart Resort Booking System API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);

/* NEW ADMIN ROUTES */
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});