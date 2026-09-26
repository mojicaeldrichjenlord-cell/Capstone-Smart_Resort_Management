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
// STEP 3F-G / PHASE 2 STEP 2.11:
// FRONT DESK ACCOMMODATION BALANCE COLLECTION
// ============================================================
const {
  getAccommodationBalanceSummary,
  collectAccommodationBalance,
  createAccommodationBalancePayPalOrder,
  captureAccommodationBalancePayPalOrder,
} = require(
  "../controllers/frontdesk/frontdeskAccommodationBalanceController",
);

// ============================================================
// STEP 3F-H: FRONT DESK FINAL CHECKOUT VALIDATION
// ============================================================
const {
  getCheckoutSummary,
  completeCheckout,
} = require(
  "../controllers/frontdesk/frontdeskCheckoutController",
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

// Manual collection only: Cash / GCash / Maya
router.put(
  "/:id/accommodation-balance/collect",
  collectAccommodationBalance,
);

// Automated PayPal remaining accommodation balance
router.post(
  "/:id/accommodation-balance/paypal/order",
  createAccommodationBalancePayPalOrder,
);

router.post(
  "/:id/accommodation-balance/paypal/capture",
  captureAccommodationBalancePayPalOrder,
);

// ------------------------------------------------------------
// Final Checkout Validation / Completion
// ------------------------------------------------------------
router.get(
  "/:id/checkout-summary",
  getCheckoutSummary,
);

router.put(
  "/:id/checkout",
  completeCheckout,
);

module.exports = router;
