const express = require("express");
const router = express.Router();
const { updatePaymentStatus } = require("../controllers/adminPaymentController");

router.put("/:id", updatePaymentStatus);

module.exports = router;