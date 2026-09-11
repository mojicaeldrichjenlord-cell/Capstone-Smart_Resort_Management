const express = require("express");
const router = express.Router();

const {
  updatePaymentStatus,
  markPaymentAsPaid,
} = require("../controllers/admin/adminPaymentController");

router.put("/:id/mark-paid", markPaymentAsPaid);
router.put("/:id", updatePaymentStatus);

module.exports = router;
