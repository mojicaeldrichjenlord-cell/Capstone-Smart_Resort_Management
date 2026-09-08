const express = require("express");
const router = express.Router();

// ============================================================
// EXISTING ADMIN BOOKING OPERATIONS
// ============================================================
const {
  getAllAdminBookings,
  updateAdminBookingStatus,
} = require("../controllers/adminBookingController");

// ============================================================
// FRONT DESK GUEST ADJUSTMENT
// ============================================================
const {
  updateGuestAdjustment,
} = require(
  "../controllers/frontdeskGuestAdjustmentController",
);

// ============================================================
// STEP 3F-C: FRONT DESK EXTRA BED
//
// Uses a dedicated controller so:
// - ₱200/bed is calculated on the backend.
// - paid Extra Bed history is preserved.
// - later quantity increases create only the new unpaid difference.
// - duplicate collection is blocked.
// ============================================================
const {
  getExtraBedSummary,
  updateExtraBed,
  collectExtraBedFee,
} = require(
  "../controllers/frontdeskExtraBedController",
);

// ============================================================
// ADMIN / FRONT DESK BOOKING ROUTES
// ============================================================
router.get(
  "/",
  getAllAdminBookings,
);

router.put(
  "/:id/status",
  updateAdminBookingStatus,
);

router.put(
  "/:id/guest-adjustment",
  updateGuestAdjustment,
);

router.get(
  "/:id/extra-bed",
  getExtraBedSummary,
);

router.put(
  "/:id/extra-bed",
  updateExtraBed,
);

// Keep the existing endpoint name for compatibility.
// It now collects only the backend-calculated remaining amount.
router.put(
  "/:id/extra-bed-paid",
  collectExtraBedFee,
);

module.exports = router;
