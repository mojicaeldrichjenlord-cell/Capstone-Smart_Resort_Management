const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingStats,
  getUserBookings,
  updateBookingStatus,
  cancelBookingByCustomer,
} = require("../controllers/bookingController");

router.post("/", createBooking);
router.get("/", getAllBookings);
router.get("/stats/summary", getBookingStats);
router.get("/user/:userId", getUserBookings);
router.put("/:id", updateBookingStatus);
router.put("/cancel/:id", cancelBookingByCustomer);

module.exports = router;