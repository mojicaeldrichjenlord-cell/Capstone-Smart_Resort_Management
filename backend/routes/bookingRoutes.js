const express = require("express");
const router = express.Router();

const {
  createBooking,
  getUserBookings,
  cancelBooking,
  getBookingReceipt,
  getAllBookings,
  updateBookingStatus,
  updatePaymentStatus,
} = require("../controllers/bookingController");

router.post("/", createBooking);
router.get("/", getAllBookings);
router.get("/user/:userId", getUserBookings);
router.get("/:id/receipt", getBookingReceipt);
router.put("/:id/cancel", cancelBooking);
router.put("/:id/status", updateBookingStatus);
router.put("/:id/payment-status", updatePaymentStatus);

module.exports = router;