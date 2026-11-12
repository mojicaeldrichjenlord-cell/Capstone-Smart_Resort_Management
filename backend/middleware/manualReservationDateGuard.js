// ============================================================
// SMARTRESORT MANUAL RESERVATION DATE GUARD
// File: backend/middleware/manualReservationDateGuard.js
//
// Purpose:
// - Enforces manual reservation date rules on the backend.
// - Walk-in Guest = TODAY ONLY.
// - Facebook / Messenger = TODAY OR FUTURE.
// - Prevents stale/modified frontend payloads from bypassing the rule.
//
// Important:
// This middleware runs after multer has parsed multipart/form-data.
// If an invalid request already uploaded a proof file, the temporary proof
// file is removed before returning the validation error.
// ============================================================

const fs = require("fs");

// ============================================================
// SECTION 1: Manila date helper
// ============================================================

function getPhilippineTodayDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = {};

  parts.forEach((part) => {
    values[part.type] = part.value;
  });

  return `${values.year}-${values.month}-${values.day}`;
}

function normalizeDateKey(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return "";
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
}

// ============================================================
// SECTION 2: Payload parser
// ============================================================

function parseManualReservationBody(req) {
  const body = req.body || {};

  if (!body.payload) {
    return body;
  }

  try {
    return JSON.parse(body.payload);
  } catch {
    // bookingController already has the official malformed-payload response.
    // Let that controller handle it.
    return null;
  }
}

// ============================================================
// SECTION 3: Uploaded proof cleanup
// ============================================================

function removeUploadedProofIfPresent(req) {
  const filePath = req.file?.path;

  if (!filePath) {
    return;
  }

  fs.unlink(filePath, (error) => {
    if (error && error.code !== "ENOENT") {
      console.error(
        "manualReservationDateGuard proof cleanup error:",
        error,
      );
    }
  });
}

// ============================================================
// SECTION 4: Route middleware
// ============================================================

function validateManualReservationDate(req, res, next) {
  const payload = parseManualReservationBody(req);

  if (!payload) {
    return next();
  }

  const reservationType =
    String(payload.reservation_type || "walkin")
      .trim()
      .toLowerCase() === "facebook"
      ? "facebook"
      : "walkin";

  const items = Array.isArray(payload.items)
    ? payload.items
    : [];

  // Leave missing-item validation to bookingController.
  if (!items.length) {
    return next();
  }

  const today = getPhilippineTodayDateKey();

  for (const item of items) {
    const checkInDate = normalizeDateKey(item?.check_in_date);

    // Leave missing/invalid date validation to bookingController.
    if (!checkInDate) {
      continue;
    }

    if (
      reservationType === "walkin" &&
      checkInDate !== today
    ) {
      removeUploadedProofIfPresent(req);

      return res.status(400).json({
        message:
          "Walk-in guests must use today's reservation date because they are already onsite.",
      });
    }

    if (
      reservationType === "facebook" &&
      checkInDate < today
    ) {
      removeUploadedProofIfPresent(req);

      return res.status(400).json({
        message:
          "Facebook/Messenger reservations cannot use a past reservation date.",
      });
    }
  }

  return next();
}

module.exports = {
  validateManualReservationDate,
};
