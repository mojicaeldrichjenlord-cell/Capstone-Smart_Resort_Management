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
  checkInBooking,
  addAccommodationToReservation,
  extendReservationItem,
  checkItemAvailability,
  requestBookingModification,
} = require("../controllers/bookingController");

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

router.post("/", upload.single("proof_image"), createBooking);
router.post("/walk-in", upload.single("proof_image"), createWalkInBooking);

router.get("/", getAllBookings);
router.post("/check-item-availability", checkItemAvailability);
router.get("/user/:userId", getUserBookings);
router.get("/:id/receipt", getBookingReceipt);

router.put("/:id/cancel", cancelBooking);
router.put("/:id/status", updateBookingStatus);
router.put("/:id/payment-status", updatePaymentStatus);
router.put("/:id/check-in", checkInBooking);
router.post("/:id/add-accommodation", addAccommodationToReservation);
router.post("/:id/extend-stay", extendReservationItem);

router.post("/:id/modification-request", requestBookingModification);

module.exports = router;
