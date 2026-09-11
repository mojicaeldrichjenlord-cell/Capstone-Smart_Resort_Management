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
// ============================================================
const {
  getAdditionalCharges,
  addAdditionalCharge,
  deleteAdditionalCharge,
} = require(
  "../controllers/frontdesk/frontdeskAdditionalChargeController",
);

// ============================================================
// STEP 3F-E: FRONT DESK COLLECT UNPAID CHARGES
//
// Consolidates unpaid booking_charges:
// - Extra Guest Charge
// - Extra Bed Charge
// - Manual Additional Charges
// - Other valid onsite booking_charge rows
//
// Entrance Fee remains in the Entrance Adjustment workflow.
// ============================================================
const {
  getUnpaidChargesSummary,
  collectUnpaidCharges,
} = require(
  "../controllers/frontdesk/frontdeskUnpaidChargeController",
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

// ------------------------------------------------------------
// Collect Unpaid Charges
// ------------------------------------------------------------
router.get(
  "/:id/unpaid-charges",
  getUnpaidChargesSummary,
);

router.put(
  "/:id/unpaid-charges/collect",
  collectUnpaidCharges,
);

module.exports = router;
