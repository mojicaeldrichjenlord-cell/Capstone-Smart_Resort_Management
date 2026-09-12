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
// ============================================================
const {
  getUnpaidChargesSummary,
  collectUnpaidCharges,
} = require(
  "../controllers/frontdesk/frontdeskUnpaidChargeController",
);

// ============================================================
// STEP 3F-G: FRONT DESK ACCOMMODATION BALANCE COLLECTION
// ============================================================
const {
  getAccommodationBalanceSummary,
  collectAccommodationBalance,
} = require(
  "../controllers/frontdesk/frontdeskAccommodationBalanceController",
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

// ------------------------------------------------------------
// Accommodation Balance
// ------------------------------------------------------------
router.get(
  "/:id/accommodation-balance",
  getAccommodationBalanceSummary,
);

router.put(
  "/:id/accommodation-balance/collect",
  collectAccommodationBalance,
);

module.exports = router;
