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
   MANUAL RESERVATION AUTHORIZATION
   - Validate a signed token and active Front Desk role before upload.
   - Never trust client-provided created_by; bind it to the token.
====================================================== */
const {
  requireFrontDeskAuth,
} = require("../middleware/frontDeskAuth");
const { requireAdminAuth } = require("../middleware/adminAuth");
const { requireCustomerAuth } = require("../middleware/customerAuth");
const { requireReceiptAuth } = require("../middleware/receiptAuth");

function bindAuthenticatedFrontDeskCreator(req, res, next) {
  const creatorId = Number(req.frontDeskUser?.id);
  if (!Number.isSafeInteger(creatorId) || creatorId <= 0) {
    return res.status(401).json({
      message: "Please log in to your Front Desk account again.",
    });
  }

  try {
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, "payload")) {
      const payload = typeof req.body.payload === "string"
        ? JSON.parse(req.body.payload)
        : req.body.payload;

      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return res.status(400).json({
          message: "Invalid reservation payload format.",
        });
      }

      // The booking controller reads and parses req.body.payload.
      req.body.payload = JSON.stringify({
        ...payload,
        created_by: creatorId,
      });
    } else {
      req.body = {
        ...(req.body || {}),
        created_by: creatorId,
      };
    }

    return next();
  } catch (error) {
    return res.status(400).json({
      message: "Invalid reservation payload format.",
    });
  }
}

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
  reconcileEntranceOverpayment,
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

// Customer online reservation flow is unchanged.
router.post(
  "/",
  upload.single("proof_image"),
  createBooking,
);

// Only authenticated Front Desk users can create manual reservations.
// Authorization MUST execute before payment proof upload.
router.post(
  "/walk-in",
  requireFrontDeskAuth,
  upload.single("proof_image"),
  bindAuthenticatedFrontDeskCreator,
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

// A customer may list only their OWN reservations.
function requireOwnCustomerId(req, res, next) {
  const requestedId = Number(req.params.userId);
  if (!Number.isSafeInteger(requestedId) || requestedId <= 0 ||
      requestedId !== Number(req.customerUser?.id)) {
    return res.status(403).json({ message: "You may only view your own bookings." });
  }
  return next();
}

router.get(
  "/user/:userId",
  requireCustomerAuth,
  requireOwnCustomerId,
  getUserBookings,
);

/* ======================================================
   ADDITIONAL CHARGES ROUTES
====================================================== */

router.get(
  "/:id/charges",
  requireFrontDeskAuth,
  getBookingCharges,
);

router.post(
  "/:id/charges",
  requireFrontDeskAuth,
  addBookingCharge,
);

router.put(
  "/:id/charges/paid",
  requireFrontDeskAuth,
  markBookingChargesPaid,
);

router.delete(
  "/charges/:chargeId",
  requireFrontDeskAuth,
  deleteBookingCharge,
);

/* ======================================================
   ENTRANCE ADJUSTMENT ROUTES
====================================================== */

router.get(
  "/:id/discounts",
  requireFrontDeskAuth,
  getBookingDiscount,
);

router.put(
  "/:id/discounts",
  requireFrontDeskAuth,
  upsertBookingDiscount,
);

router.delete(
  "/:id/discounts",
  requireFrontDeskAuth,
  deleteBookingDiscount,
);

router.post(
  "/:id/entrance-reconciliation",
  requireFrontDeskAuth,
  reconcileEntranceOverpayment,
);

/* ======================================================
   RECEIPT ROUTE
====================================================== */

router.get(
  "/:id/receipt",
  requireReceiptAuth,
  getBookingReceipt,
);

/* ======================================================
   BOOKING UPDATE ROUTES
====================================================== */

router.put(
  "/:id/cancel",
  requireCustomerAuth,
  cancelBooking,
);

router.put(
  "/:id/status",
  requireAdminAuth,
  updateBookingStatus,
);

// Only an authenticated Front Desk session can verify payment proof.
router.put(
  "/:id/payment-status",
  requireFrontDeskAuth,
  updatePaymentStatus,
);

// Only an authenticated Front Desk session can admit a guest.
router.put(
  "/:id/check-in",
  requireFrontDeskAuth,
  checkInBooking,
);

// Only Front Desk staff may add onsite accommodations or extend guest stays.
// Both operations affect availability and the remaining accommodation balance.
router.post(
  "/:id/add-accommodation",
  requireFrontDeskAuth,
  addAccommodationToReservation,
);

router.post(
  "/:id/extend-stay",
  requireFrontDeskAuth,
  extendReservationItem,
);

router.post(
  "/:id/modification-request",
  requireCustomerAuth,
  requestBookingModification,
);

module.exports = router;
