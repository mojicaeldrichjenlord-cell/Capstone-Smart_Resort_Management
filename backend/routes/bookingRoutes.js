const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createBooking,
  createPayMongoBooking,
  createWalkInBooking,
  getUserBookings,
  cancelBooking,
  getBookingReceipt,
  getAllBookings,
  updateBookingStatus,
  updatePaymentStatus,
  addAccommodationToReservation,
  extendReservationItem,
  checkItemAvailability,
  requestBookingModification,
} = require("../controllers/bookingController");

/* ======================================================
   FRONT DESK CHECK-IN CONTROLLER
   Step 3F-B2 financial correction:
   - Remaining accommodation balance is finalized at check-in
   - Entrance fee remains separate for Guest/Entrance Adjustment
====================================================== */
const {
  checkInBooking,
} = require("../controllers/frontdeskCheckInController");

/* ======================================================
   MANUAL RESERVATION DATE GUARD
   - Walk-in = today only
   - Facebook/Messenger = today or future
====================================================== */
const {
  validateManualReservationDate,
} = require("../middleware/manualReservationDateGuard");

/* ======================================================
   BOOKING CHARGE CONTROLLER
   Used for admin/staff additional charges before checkout.
====================================================== */
const {
  getBookingCharges,
  addBookingCharge,
  markBookingChargesPaid,
  deleteBookingCharge,
} = require("../controllers/bookingChargeController");

/* ======================================================
   BOOKING DISCOUNT / ENTRANCE ADJUSTMENT CONTROLLER

   Supports multiple structured entrance adjustments:
   - Senior Citizen
   - PWD
   - Qualified Kid

   These are deductions and are intentionally kept separate
   from booking_charges.
====================================================== */
const {
  getBookingDiscount,
  upsertBookingDiscount,
  deleteBookingDiscount,
} = require("../controllers/bookingDiscountController");

/* ======================================================
   PAYMENT PROOF UPLOAD SETUP
====================================================== */

const uploadDir = path.join(
  __dirname,
  "..",
  "uploads",
  "payment-proofs",
);

fs.mkdirSync(uploadDir, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext =
      path
        .extname(file.originalname || "")
        .toLowerCase() || ".jpg";

    const safeBase =
      path
        .basename(file.originalname || "proof", ext)
        .replace(/[^a-zA-Z0-9_-]/g, "_");

    cb(
      null,
      `${Date.now()}-${safeBase}${ext}`,
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "image/heic",
    "image/heif",
  ];

  if (allowed.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only JPG, PNG, WEBP, HEIC, and HEIF image files are allowed.",
    ),
  );
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});

/* ======================================================
   BOOKING CREATE ROUTES
====================================================== */

// Legacy automated PayMongo reservation preparation.
// Kept unchanged for now because PayPal migration belongs to Phase 2.
router.post(
  "/paymongo",
  createPayMongoBooking,
);

// Existing manual proof-upload customer flow remains unchanged.
router.post(
  "/",
  upload.single("proof_image"),
  createBooking,
);

// Manual reservation date guard runs after multer parses the form payload.
router.post(
  "/walk-in",
  upload.single("proof_image"),
  validateManualReservationDate,
  createWalkInBooking,
);

/* ======================================================
   GENERAL BOOKING ROUTES
====================================================== */

router.get("/", getAllBookings);

router.post(
  "/check-item-availability",
  checkItemAvailability,
);

router.get(
  "/user/:userId",
  getUserBookings,
);

/* ======================================================
   ADDITIONAL CHARGES ROUTES

   Important:
   - These are kept before /:id/receipt.
   - /:id/charges/paid marks all unpaid structured charges
     for this reservation as paid.
====================================================== */

router.get(
  "/:id/charges",
  getBookingCharges,
);

router.post(
  "/:id/charges",
  addBookingCharge,
);

router.put(
  "/:id/charges/paid",
  markBookingChargesPaid,
);

router.delete(
  "/charges/:chargeId",
  deleteBookingCharge,
);

/* ======================================================
   ENTRANCE ADJUSTMENT ROUTES

   One reservation may contain one row for each type:
   - senior
   - pwd
   - kid_free

   The database UNIQUE key on:
   booking_id + discount_type

   prevents duplicate rows for the same adjustment type.
====================================================== */

router.get(
  "/:id/discounts",
  getBookingDiscount,
);

router.put(
  "/:id/discounts",
  upsertBookingDiscount,
);

router.delete(
  "/:id/discounts",
  deleteBookingDiscount,
);

/* ======================================================
   RECEIPT ROUTE
====================================================== */

router.get(
  "/:id/receipt",
  getBookingReceipt,
);

/* ======================================================
   BOOKING UPDATE ROUTES
====================================================== */

router.put(
  "/:id/cancel",
  cancelBooking,
);

router.put(
  "/:id/status",
  updateBookingStatus,
);

router.put(
  "/:id/payment-status",
  updatePaymentStatus,
);

/* ======================================================
   FRONT DESK CHECK-IN ROUTE

   Uses frontdeskCheckInController.js instead of the old
   check-in handler inside bookingController.js.

   This prevents check-in from automatically marking the
   entrance fee as fully paid/collected.
====================================================== */
router.put(
  "/:id/check-in",
  checkInBooking,
);

router.post(
  "/:id/add-accommodation",
  addAccommodationToReservation,
);

router.post(
  "/:id/extend-stay",
  extendReservationItem,
);

router.post(
  "/:id/modification-request",
  requestBookingModification,
);

module.exports = router;
