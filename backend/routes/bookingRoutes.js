const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createBooking,
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
} = require("../controllers/shared/bookingController");

/* ======================================================
   FRONT DESK CHECK-IN CONTROLLER
   Step 3F-B2 financial correction:
   - Remaining accommodation balance is finalized at check-in
   - Entrance fee remains separate for Guest/Entrance Adjustment
====================================================== */
const {
  checkInBooking,
} = require("../controllers/frontdesk/frontdeskCheckInController");

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
} = require("../controllers/shared/bookingChargeController");

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
} = require("../controllers/shared/bookingDiscountController");

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

// Current temporary online flow:
// customer submits GCash/Maya proof for verification.
// PayPal Sandbox automation will replace this in Phase 2.
router.post(
  "/",
  upload.single("proof_image"),
  createBooking,
);

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
