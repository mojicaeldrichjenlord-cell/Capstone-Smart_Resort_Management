// API routes for admin Payment Routes. Connects URLs to controllers and access checks.
// Note: Keep existing behavior unchanged when adding new features.
const express = require("express");
const router = express.Router();
const { requireAdminAuth } = require("../middleware/adminAuth");

const {
  updatePaymentStatus,
  markPaymentAsPaid,
} = require("../controllers/admin/adminPaymentController");

router.put("/:id/mark-paid", requireAdminAuth, markPaymentAsPaid);
router.put("/:id", requireAdminAuth, updatePaymentStatus);

module.exports = router;
