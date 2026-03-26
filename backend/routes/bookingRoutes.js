const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingStats,
  getBookingAnalytics,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBookingByCustomer,
} = require("../controllers/bookingController");

router.post("/", createBooking);
router.get("/stats/summary", getBookingStats);
router.get("/stats/analytics", getBookingAnalytics);
router.get("/user/:userId", getUserBookings);
router.get("/:id", getBookingById);
router.get("/", getAllBookings);
router.put("/cancel/:id", cancelBookingByCustomer);
router.put("/:id", updateBookingStatus);

module.exports = router;