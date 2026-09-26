// ============================================================
// SMART RESORT BOOKING SYSTEM
// Phase 2 - PayPal Sandbox Routes
// Target file: backend/routes/paypalRoutes.js
//
// Scope:
// - Expose PayPal client config to the frontend.
// - Create/reuse a PayPal order for an existing reservation.
// - Capture an approved PayPal order and finalize the
//   reservation downpayment on the backend.
// ============================================================

const express = require("express");
const router = express.Router();

const {
  getPayPalClientConfig,
  createOrderForReservation,
  captureOrderForReservation,
} = require("../controllers/shared/paypalPaymentController");

// Public configuration needed by the PayPal JavaScript SDK.
// Important: the backend returns only the Client ID, never the Client Secret.
router.get("/config", getPayPalClientConfig);

// Create or reuse a PayPal order for the reservation's official
// 50% accommodation downpayment.
router.post(
  "/reservations/:reservationId/order",
  createOrderForReservation,
);

// Capture the PayPal order after the customer approves it.
// The backend verifies the amount/currency before updating MySQL.
router.post(
  "/reservations/:reservationId/capture",
  captureOrderForReservation,
);

module.exports = router;
