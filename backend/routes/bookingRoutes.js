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
  checkInBooking,
  addAccommodationToReservation,
  extendReservationItem,
  checkItemAvailability,
  requestBookingModification,
} = require("../controllers/bookingController");

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
   BOOKING DISCOUNT CONTROLLER
   Used for admin/staff verified front-desk discounts.
====================================================== */
const {
  getBookingDiscount,
  upsertBookingDiscount,
  deleteBookingDiscount,
} = require("../controllers/bookingDiscountController");

const uploadDir = path.join(__dirname, "..", "uploads", "payment-proofs");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";

    const safeBase = path
      .basename(file.originalname || "proof", ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    cb(null, `${Date.now()}-${safeBase}${ext}`);
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
    new Error("Only JPG, PNG, WEBP, HEIC, and HEIF image files are allowed."),
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
// Automated PayMongo reservation preparation.
// No manual proof upload is required for this route.
router.post("/paymongo", createPayMongoBooking);

// Existing manual proof-upload customer flow remains unchanged.
router.post("/", upload.single("proof_image"), createBooking);

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
router.post("/check-item-availability", checkItemAvailability);
router.get("/user/:userId", getUserBookings);

/* ======================================================
   ADDITIONAL CHARGES ROUTES
   Important:
   - Put these before /:id/receipt so Express handles them correctly.
   - /:id/charges/paid marks all unpaid charges for this reservation as paid.
====================================================== */
router.get("/:id/charges", getBookingCharges);
router.post("/:id/charges", addBookingCharge);
router.put("/:id/charges/paid", markBookingChargesPaid);
router.delete("/charges/:chargeId", deleteBookingCharge);

/* ======================================================
   FRONT-DESK DISCOUNT ROUTES
   Important:
   - One active discount adjustment per reservation.
   - Kept separate from booking_charges because discounts are deductions.
====================================================== */
router.get("/:id/discounts", getBookingDiscount);
router.put("/:id/discounts", upsertBookingDiscount);
router.delete("/:id/discounts", deleteBookingDiscount);

/* ======================================================
   RECEIPT ROUTE
====================================================== */
router.get("/:id/receipt", getBookingReceipt);

/* ======================================================
   BOOKING UPDATE ROUTES
====================================================== */
router.put("/:id/cancel", cancelBooking);
router.put("/:id/status", updateBookingStatus);
router.put("/:id/payment-status", updatePaymentStatus);
router.put("/:id/check-in", checkInBooking);
router.post("/:id/add-accommodation", addAccommodationToReservation);
router.post("/:id/extend-stay", extendReservationItem);
router.post("/:id/modification-request", requestBookingModification);

module.exports = router;