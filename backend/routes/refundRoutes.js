// Refund Phase 1: signed Customer requests and Admin read-only review queue.
// No route issues a real refund or changes reservation/payment status.
const express = require("express");
const router = express.Router();
const { requireCustomerAuth } = require("../middleware/customerAuth");
const { requireAdminAuth } = require("../middleware/adminAuth");
const {
  createRefundRequest, getCustomerRefundRequests, getAdminRefundRequests,
} = require("../controllers/shared/refundRequestController");

router.post("/customer/requests", requireCustomerAuth, createRefundRequest);
router.get("/customer/requests", requireCustomerAuth, getCustomerRefundRequests);
router.get("/admin/requests", requireAdminAuth, getAdminRefundRequests);

module.exports = router;
