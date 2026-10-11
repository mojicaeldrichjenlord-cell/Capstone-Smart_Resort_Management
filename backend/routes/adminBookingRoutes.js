const express = require("express");
const router = express.Router();
const { requireAdminAuth } = require("../middleware/adminAuth");
const { requireFrontDeskAuth } = require("../middleware/frontDeskAuth");

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
  requireAdminAuth,
  updateAdminBookingStatus,
);

// Guest counts and extra-guest charges may only be adjusted by Front Desk.
router.put(
  "/:id/guest-adjustment",
  requireFrontDeskAuth,
  updateGuestAdjustment,
);

// ------------------------------------------------------------
// Extra Bed
// ------------------------------------------------------------
// Extra Bed rates, quantity, and collection are Front Desk operations.
// Authenticate before reading fee information or changing charges.
router.get(
  "/:id/extra-bed",
  requireFrontDeskAuth,
  getExtraBedSummary,
);

router.put(
  "/:id/extra-bed",
  requireFrontDeskAuth,
  updateExtraBed,
);

router.put(
  "/:id/extra-bed-paid",
  requireFrontDeskAuth,
  collectExtraBedFee,
);

// ------------------------------------------------------------
// Additional Charges
// ------------------------------------------------------------
// Additional Charges are Front Desk operations. Guard reads and writes.
router.get(
  "/:id/additional-charges",
  requireFrontDeskAuth,
  getAdditionalCharges,
);

router.post(
  "/:id/additional-charges",
  requireFrontDeskAuth,
  addAdditionalCharge,
);

router.delete(
  "/:id/additional-charges/:chargeId",
  requireFrontDeskAuth,
  deleteAdditionalCharge,
);

// ------------------------------------------------------------
// Collect Unpaid Charges
// ------------------------------------------------------------
// Prevent unauthenticated access to unpaid totals or onsite collections.
router.get(
  "/:id/unpaid-charges",
  requireFrontDeskAuth,
  getUnpaidChargesSummary,
);

router.put(
  "/:id/unpaid-charges/collect",
  requireFrontDeskAuth,
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
  requireFrontDeskAuth,
  getCheckoutSummary,
);

router.put(
  "/:id/checkout",
  requireFrontDeskAuth,
  completeCheckout,
);

module.exports = router;
