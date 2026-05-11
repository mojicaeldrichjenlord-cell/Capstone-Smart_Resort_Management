const express = require("express");
const router = express.Router();

const {
  getAllAdminBookings,
  updateAdminBookingStatus,
  updateExtraBed,
} = require("../controllers/adminBookingController");

router.get("/", getAllAdminBookings);
router.put("/:id/status", updateAdminBookingStatus);
router.put("/:id/extra-bed", updateExtraBed);

module.exports = router;