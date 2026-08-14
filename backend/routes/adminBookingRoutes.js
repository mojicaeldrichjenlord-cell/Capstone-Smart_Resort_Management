const express = require("express");
const router = express.Router();

const {
  getAllAdminBookings,
  updateAdminBookingStatus,
  updateExtraBed,
  markExtraBedPaid,
  updateGuestAdjustment,
} = require("../controllers/adminBookingController");

router.get("/", getAllAdminBookings);
router.put("/:id/status", updateAdminBookingStatus);
router.put("/:id/guest-adjustment", updateGuestAdjustment);
router.put("/:id/extra-bed", updateExtraBed);
router.put("/:id/extra-bed-paid", markExtraBedPaid);

module.exports = router;
