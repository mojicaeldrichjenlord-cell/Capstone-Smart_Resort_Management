// ============================================================
// PAYMONGO ROUTES
// File: backend/routes/paymongoRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();

const {
  getStatus,
  createCheckout,
  handleWebhook,
} = require("../controllers/paymongoController");

router.get("/status", getStatus);
router.post("/create-checkout", createCheckout);
router.post("/webhook", handleWebhook);

module.exports = router;
