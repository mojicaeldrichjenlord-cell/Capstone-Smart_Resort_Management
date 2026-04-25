require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminBookingRoutes = require("./routes/adminBookingRoutes");
const adminPaymentRoutes = require("./routes/adminPaymentRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const path = require("path");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Smart Resort Booking System API is running.");
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
