const express = require("express");
const router = express.Router();
const {
  getAllAdminBookings,
  updateAdminBookingStatus,
} = require("../controllers/adminBookingController");

router.get("/", getAllAdminBookings);
router.put("/:id/status", updateAdminBookingStatus);

module.exports = router;