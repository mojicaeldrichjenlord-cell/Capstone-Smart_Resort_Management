const express = require("express");
const router = express.Router();

// ============================================================
// EXISTING ADMIN BOOKING OPERATIONS
// ============================================================
const {
  getAllAdminBookings,
  updateAdminBookingStatus,
} = require("../controllers/admin/adminBookingController");

// ============================================================
// FRONT DESK GUEST ADJUSTMENT
// ============================================================
const {
  updateGuestAdjustment,
} = require(
  "../controllers/frontdesk/frontdeskGuestAdjustmentController",
);

// ============================================================
// STEP 3F-C: FRONT DESK EXTRA BED
// ============================================================
const {
  getExtraBedSummary,
  updateExtraBed,
  collectExtraBedFee,
} = require(
  "../controllers/frontdesk/frontdeskExtraBedController",
);

// ============================================================
// STEP 3F-D: FRONT DESK ADDITIONAL CHARGES
//
// Manual categories:
// - Damage
// - Missing Item
// - Service
// - Custom
//
// New rows remain unpaid here.
// Step 3F-E will collect all unpaid onsite charges.
// ============================================================
const {
  getAdditionalCharges,
  addAdditionalCharge,
  deleteAdditionalCharge,
} = require(
  "../controllers/frontdesk/frontdeskAdditionalChargeController",
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

// ------------------------------------------------------------
// Extra Bed
// ------------------------------------------------------------
router.get(
  "/:id/extra-bed",
  getExtraBedSummary,
);

router.put(
  "/:id/extra-bed",
  updateExtraBed,
);

router.put(
  "/:id/extra-bed-paid",
  collectExtraBedFee,
);

// ------------------------------------------------------------
// Additional Charges
// ------------------------------------------------------------
router.get(
  "/:id/additional-charges",
  getAdditionalCharges,
);

router.post(
  "/:id/additional-charges",
  addAdditionalCharge,
);

router.delete(
  "/:id/additional-charges/:chargeId",
  deleteAdditionalCharge,
);

module.exports = router;
