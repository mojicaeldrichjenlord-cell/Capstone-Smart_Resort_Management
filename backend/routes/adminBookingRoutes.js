const express = require("express");
const router = express.Router();

// ============================================================
// EXISTING ADMIN BOOKING OPERATIONS
// ============================================================
const {
  getAllAdminBookings,
  updateAdminBookingStatus,
  updateExtraBed,
  markExtraBedPaid,
} = require("../controllers/adminBookingController");

// ============================================================
// FRONT DESK GUEST ADJUSTMENT
//
// Kept in a dedicated controller so paid Extra Guest Charge
// history can be preserved while later guest increases create
// only the new additional amount due.
// ============================================================
const {
  updateGuestAdjustment,
} = require(
  "../controllers/frontdeskGuestAdjustmentController",
);

// ============================================================
// ADMIN / FRONT DESK BOOKING ROUTES
// ============================================================
router.get("/", getAllAdminBookings);

router.put(
  "/:id/status",
  updateAdminBookingStatus,
);

router.put(
  "/:id/guest-adjustment",
  updateGuestAdjustment,
);

router.put(
  "/:id/extra-bed",
  updateExtraBed,
);

router.put(
  "/:id/extra-bed-paid",
  markExtraBedPaid,
);

module.exports = router;
