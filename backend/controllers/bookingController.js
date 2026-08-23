// ============================================================
// COMMENTED VERSION
// This copy keeps the same logic and adds block comments so groupmates can follow the code easier.
// ============================================================

const db = require("../config/db");
const fs = require("fs");

// ============================================================
// BLOCK: Normalize text
// Purpose: Handles the normalize text part of this file.
// ============================================================
function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeNullableText(value) {
  const text = String(value || "").trim();
  return text ? text : null;
}

// ============================================================
// BLOCK: To number
// Purpose: Handles the to number part of this file.
// ============================================================
function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

// ============================================================
// BLOCK: Normalize contact number
// Purpose: Handles the normalize contact number part of this file.
// ============================================================

function formatLocalDateOnly(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeReferenceNumber(value) {
  return String(value || "").replace(/\D/g, "");
}

function validateReferenceNumberByMethod(referenceNumber, paymentMethod) {
  const cleanMethod = String(paymentMethod || "").toLowerCase();
  const digits = normalizeReferenceNumber(referenceNumber);

  if (cleanMethod === "gcash") {
    return {
      valid: /^\d{13}$/.test(digits),
      message: "GCash reference number must be exactly 13 digits.",
      digits,
    };
  }

  if (cleanMethod === "paymaya") {
    return {
      valid: /^\d{6,30}$/.test(digits),
      message:
        "Maya / PayMaya reference number must be numbers only, 6 to 30 digits.",
      digits,
    };
  }

  return {
    valid: true,
    message: "",
    digits,
  };
}

function normalizeContactNumber(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .trim();
}

function isValidPhilippineMobileNumber(value) {
  return /^09\d{9}$/.test(String(value || "").trim());
}

// ============================================================
// BLOCK: Get month abbrev
// Purpose: Handles the get month abbrev part of this file.
// ============================================================
function getMonthAbbrev(date = new Date()) {
  return date.toLocaleString("en-US", { month: "short" }).toUpperCase();
}

function parseRequestReservationBody(req) {
  let parsedBody = req.body || {};

  if (parsedBody.payload) {
    try {
      parsedBody = JSON.parse(parsedBody.payload);
    } catch (error) {
      throw {
        status: 400,
        message: "Invalid reservation payload format.",
      };
    }
  }

  const uploadedProofPath = req.file
    ? `/uploads/payment-proofs/${req.file.filename}`
    : null;

  /*
    Uploaded proof screenshots are already saved by multer inside:
    backend/uploads/payment-proofs

    Important:
    Do not convert uploaded proof files to Base64 here.
    Large screenshots can make the /walk-in request stay pending before the
    frontend receives the success response. The database will store the file
    path in proof_of_payment instead, which is enough for View Proof.
  */
  const proofImageData = normalizeNullableText(parsedBody.proof_image_data);

  const proofReference = normalizeNullableText(
    normalizeReferenceNumber(
      parsedBody.proof_reference || parsedBody.proof_of_payment,
    ),
  );

  return {
    ...parsedBody,
    proof_reference: proofReference,
    proof_of_payment: uploadedProofPath || proofReference,
    proof_image_data: proofImageData,
  };
}

// ============================================================
// BLOCK: Generate reservation code
// Purpose: Handles the generate reservation code part of this file.
// ============================================================
async function generateReservationCode(connection) {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }),
  );

  const month = getMonthAbbrev(now);
  const day = String(now.getDate()).padStart(2, "0");
  const prefix = `${month}-${day}`;

  const [rows] = await connection.query(
    `
    SELECT reservation_code
    FROM reservations
    WHERE reservation_code LIKE ?
    ORDER BY CAST(SUBSTRING_INDEX(reservation_code, '-', -1) AS UNSIGNED) DESC
    LIMIT 1
    `,
    [`${prefix}-%`],
  );

  let nextNumber = 1;

  if (rows.length && rows[0].reservation_code) {
    const parts = String(rows[0].reservation_code).split("-");
    const lastPart = parts[parts.length - 1];
    const parsed = Number(lastPart);

    if (Number.isFinite(parsed)) {
      nextNumber = parsed + 1;
    }
  }

  let reservationCode = `${prefix}-${String(nextNumber).padStart(3, "0")}`;

  while (true) {
    const [existingRows] = await connection.query(
      `
      SELECT id
      FROM reservations
      WHERE reservation_code = ?
      LIMIT 1
      `,
      [reservationCode],
    );

    if (!existingRows.length) {
      break;
    }

    nextNumber += 1;
    reservationCode = `${prefix}-${String(nextNumber).padStart(3, "0")}`;
  }

  return reservationCode;
}

// ============================================================
// BLOCK: Get entrance rate
// Purpose: Handles the get entrance rate part of this file.
// ============================================================
function getEntranceRate(entranceType, hasOvernight) {
  const type = String(entranceType || "pool_beach").toLowerCase();

  if (type === "beach_only") {
    return hasOvernight ? 200 : 150;
  }

  return hasOvernight ? 300 : 250;
}

// ============================================================
// BLOCK: Get total free entrance pax from items
// Purpose: Handles the get total free entrance pax from items part of this file.
// ============================================================
function getTotalFreeEntrancePaxFromItems(items, accommodationMap, guestCount) {
  let totalFreePax = 0;

  for (const item of items) {
    const accommodationId = Number(item.accommodation_id);
    const accommodation = accommodationMap[accommodationId];

    if (!accommodation) continue;

    totalFreePax += Number(accommodation.free_entrance_pax || 0);
  }

  return Math.min(totalFreePax, Number(guestCount || 0));
}

// ============================================================
// BLOCK: Build slot config
// Purpose: Handles the build slot config part of this file.
// ============================================================
function buildSlotConfig(accommodation, slotType) {
  const categoryName = String(accommodation.category_name || "").toLowerCase();

  const isRoom = categoryName.includes("room");
  const isCottage =
    categoryName.includes("cottage") ||
    categoryName.includes("shade") ||
    categoryName.includes("hut");
  const isFunction =
    categoryName.includes("function") ||
    categoryName.includes("pavilion");

  let dayStart = "08:00:00";
  let dayEnd = "18:00:00";
  let nightStart = "20:00:00";
  let nightEnd = "06:00:00";
  let dayExtendedEnd = "06:00:00";
  let nightExtendedEnd = "18:00:00";
  let extendedLabel = "23 Hours";

  if (isRoom) {
    dayStart = "07:00:00";
    dayEnd = "17:00:00";
    nightStart = "19:00:00";
    nightEnd = "05:00:00";
    dayExtendedEnd = "05:00:00";
    nightExtendedEnd = "17:00:00";
    extendedLabel = "22 Hours";
  } else if (isCottage) {
    dayStart = "06:00:00";
    dayEnd = "17:00:00";
    nightStart = "18:00:00";
    nightEnd = "05:00:00";
    dayExtendedEnd = "05:00:00";
    nightExtendedEnd = "17:00:00";
    extendedLabel = "23 Hours";
  } else if (isFunction) {
    dayStart = "08:00:00";
    dayEnd = "18:00:00";
    nightStart = "20:00:00";
    nightEnd = "06:00:00";
    dayExtendedEnd = "06:00:00";
    nightExtendedEnd = "18:00:00";
    extendedLabel = "23 Hours";
  }

  if (slotType === "day_tour") {
    return {
      slot_label: "Day Tour",
      price: Number(accommodation.day_price || 0),
      start_time: dayStart,
      end_time: dayEnd,
    };
  }

  if (slotType === "night") {
    return {
      slot_label: "Night",
      price: Number(accommodation.overnight_price || 0),
      start_time: nightStart,
      end_time: nightEnd,
    };
  }

  if (slotType === "day_extended") {
    return {
      slot_label: `Day ${extendedLabel}`,
      price: Number(accommodation.extended_price || 0),
      start_time: dayStart,
      end_time: dayExtendedEnd,
    };
  }

  if (slotType === "night_extended") {
    return {
      slot_label: `Night ${extendedLabel}`,
      price: Number(accommodation.extended_price || 0),
      start_time: nightStart,
      end_time: nightExtendedEnd,
    };
  }

  return {
    slot_label: "Day Tour",
    price: Number(accommodation.day_price || 0),
    start_time: dayStart,
    end_time: dayEnd,
  };
}

// ============================================================
// BLOCK: Build check out date
// Purpose: Handles the build check out date part of this file.
// ============================================================
function buildCheckOutDate(checkInDate, startTime, endTime, stayDuration = 1) {
  const start = String(startTime || "");
  const end = String(endTime || "");

  const startParts = start.split(":");
  const endParts = end.split(":");

  if (startParts.length < 2 || endParts.length < 2) {
    return checkInDate;
  }

  const startMinutes = Number(startParts[0]) * 60 + Number(startParts[1]);
  const endMinutes = Number(endParts[0]) * 60 + Number(endParts[1]);

  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) {
    return checkInDate;
  }

  const cleanDuration = Math.max(
    1,
    Math.min(5, Math.floor(Number(stayDuration || 1))),
  );

  /*
    Final defense rule:
    - Day Tour and Night are fixed schedules before this function is called.
    - Day/Night 22 Hours or 23 Hours can use 1 to 5 days.
    - If the schedule ends earlier than it starts, it crosses midnight.
  */
  const daysToAdd =
    cleanDuration > 1 ? cleanDuration : endMinutes <= startMinutes ? 1 : 0;

  if (daysToAdd > 0) {
    const date = new Date(`${checkInDate}T00:00:00`);
    date.setDate(date.getDate() + daysToAdd);
    return formatLocalDateOnly(date);
  }

  return checkInDate;
}

function toDateOnlyString(value) {
  if (!value) return "";

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function addDaysToDateOnly(dateValue, daysToAdd = 0) {
  const cleanDate = toDateOnlyString(dateValue);

  if (!cleanDate) return "";

  const date = new Date(`${cleanDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) return cleanDate;

  date.setDate(date.getDate() + Number(daysToAdd || 0));
  return formatLocalDateOnly(date);
}

function getDurationUnitLabel(slotType, amount = 1) {
  const cleanSlotType = String(slotType || "").toLowerCase();
  const isPlural = Number(amount || 0) !== 1;

  if (cleanSlotType === "overnight") {
    return isPlural ? "nights" : "night";
  }

  return isPlural ? "days" : "day";
}

function normalizeExtensionType(value) {
  const cleanType = normalizeText(value || "full_day").toLowerCase();

  if (cleanType === "overnight_half" || cleanType === "day_half") {
    return cleanType;
  }

  return "full_day";
}

function buildExtensionWindowFromItem(
  item,
  extensionDuration = 1,
  extensionType = "full_day",
) {
  const oldCheckOutDate = toDateOnlyString(item.check_out_date);
  const oldCheckOutTime = String(item.check_out_time || "00:00:00");
  const cleanExtensionType = normalizeExtensionType(extensionType);
  const cleanDuration = Math.max(
    1,
    Math.min(5, Math.floor(toNumber(extensionDuration, 1))),
  );

  if (!oldCheckOutDate) {
    return null;
  }

  if (cleanExtensionType === "overnight_half") {
    return {
      accommodation_id: item.accommodation_id,
      check_in_date: oldCheckOutDate,
      check_in_time: oldCheckOutTime,
      check_out_date: addDaysToDateOnly(oldCheckOutDate, 1),
      check_out_time: "05:00:00",
      extension_type: cleanExtensionType,
      extension_duration: 1,
    };
  }

  if (cleanExtensionType === "day_half") {
    return {
      accommodation_id: item.accommodation_id,
      check_in_date: oldCheckOutDate,
      check_in_time: oldCheckOutTime,
      check_out_date: oldCheckOutDate,
      check_out_time: "17:00:00",
      extension_type: cleanExtensionType,
      extension_duration: 1,
    };
  }

  return {
    accommodation_id: item.accommodation_id,
    check_in_date: oldCheckOutDate,
    check_in_time: oldCheckOutTime,
    check_out_date: addDaysToDateOnly(oldCheckOutDate, cleanDuration),
    check_out_time: oldCheckOutTime,
    extension_type: cleanExtensionType,
    extension_duration: cleanDuration,
  };
}

function getExtensionFeeFromItem(
  item,
  extensionDuration = 1,
  extensionType = "full_day",
) {
  const cleanExtensionType = normalizeExtensionType(extensionType);

  if (cleanExtensionType === "overnight_half") {
    return Number(item.overnight_price || 0);
  }

  if (cleanExtensionType === "day_half") {
    return Number(item.day_price || 0);
  }

  const fallbackUnitPrice =
    Number(item.item_price || 0) / Math.max(1, Number(item.stay_duration || 1));

  const slotConfig = buildSlotConfig(
    item,
    String(item.slot_type || "day_tour"),
  );
  const unitPrice = Number(slotConfig.price || 0) || fallbackUnitPrice || 0;

  return (
    unitPrice *
    Math.max(1, Math.min(5, Math.floor(toNumber(extensionDuration, 1))))
  );
}

function getExtensionUnitText(extensionType, amount = 1) {
  const cleanExtensionType = normalizeExtensionType(extensionType);

  if (cleanExtensionType === "overnight_half") {
    return "half-day / overnight";
  }

  if (cleanExtensionType === "day_half") {
    return "half-day / day extension";
  }

  return getDurationUnitLabel("day_extended", amount);
}

// ============================================================
// BLOCK: Philippine "now" helper for schedule validation
// Purpose: Blocks add-on bookings whose selected start date/time is already in the past.
// ============================================================
function getPhilippineNow() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }),
  );
}

function buildLocalDateTime(dateValue, timeValue) {
  const cleanDate = normalizeText(dateValue);
  const cleanTime = normalizeText(timeValue || "00:00:00");

  if (!cleanDate || !cleanTime) return null;

  const dateTime = new Date(`${cleanDate}T${cleanTime}`);

  return Number.isNaN(dateTime.getTime()) ? null : dateTime;
}

function isScheduleStartInPast(dateValue, timeValue) {
  const startDateTime = buildLocalDateTime(dateValue, timeValue);

  if (!startDateTime) return true;

  return startDateTime < getPhilippineNow();
}

function isScheduleWindowAlreadyEnded(item) {
  if (!item) return true;

  const endDateTime = buildLocalDateTime(
    item.check_out_date,
    item.check_out_time,
  );

  if (!endDateTime) return true;

  /*
    Important business rule:
    - Do not block only because the start time already passed.
    - Staff may still allow late entry while the schedule window is still active.
    - Block only when the whole selected time frame has already ended.
  */
  return endDateTime <= getPhilippineNow();
}

function getScheduleEndedMessage(accommodationName = "Selected accommodation") {
  return `${accommodationName} is no longer available for this time frame because the selected schedule has already ended. Please choose a schedule that has not ended yet.`;
}

// ============================================================
// BLOCK: Check reservation conflicts
// Purpose: Handles the check reservation conflicts part of this file.
// ============================================================
async function checkReservationConflicts(
  connection,
  reservationItems,
  ignoreReservationId = null,
) {
  for (const item of reservationItems) {
    const params = [
      item.accommodation_id,
      item.check_out_date,
      item.check_out_time,
      item.check_in_date,
      item.check_in_time,
    ];

    let ignoreClause = "";

    if (ignoreReservationId) {
      ignoreClause = "AND r.id != ?";
      params.push(ignoreReservationId);
    }

    const [conflictRows] = await connection.query(
      `
      SELECT
        r.id,
        r.reservation_code,
        r.reservation_status,
        r.payment_status,
        ri.check_in_date,
        ri.check_in_time,
        ri.check_out_date,
        ri.check_out_time,
        a.name AS accommodation_name
      FROM reservation_items ri
      INNER JOIN reservations r ON ri.reservation_id = r.id
      INNER JOIN accommodations a ON ri.accommodation_id = a.id
      WHERE ri.accommodation_id = ?
        AND LOWER(COALESCE(r.reservation_status, 'pending')) NOT IN ('cancelled', 'rejected', 'completed')
        AND LOWER(COALESCE(r.payment_status, 'pending')) NOT IN ('rejected', 'refunded')
        AND TIMESTAMP(ri.check_in_date, ri.check_in_time) < TIMESTAMP(?, ?)
        AND TIMESTAMP(?, ?) < TIMESTAMP(ri.check_out_date, ri.check_out_time)
        ${ignoreClause}
      LIMIT 1
      `,
      params,
    );

    if (conflictRows.length) {
      const conflict = conflictRows[0];

      throw {
        status: 409,
        message: `${conflict.accommodation_name} is already reserved for the selected date and time. Please choose another date, slot, or accommodation.`,
      };
    }
  }
}

// ============================================================
// BLOCK: Get accommodations map by ids
// Purpose: Handles the get accommodations map by ids part of this file.
// ============================================================
async function getAccommodationsMapByIds(ids) {
  const uniqueIds = [...new Set(ids.map((id) => Number(id)).filter(Boolean))];

  if (!uniqueIds.length) return {};

  const placeholders = uniqueIds.map(() => "?").join(",");

  const [rows] = await db.promise().query(
    `
    SELECT
      a.id,
      a.category_id,
      c.name AS category_name,
      a.name,
      a.description,
      a.max_capacity,
      a.free_entrance_pax,
      a.image,
      a.map_label,
      a.status,
      a.day_price,
      a.overnight_price,
      a.extended_price,
      a.day_start_time,
      a.day_end_time,
      a.overnight_start_time,
      a.overnight_end_time,
      a.extended_start_time,
      a.extended_end_time
    FROM accommodations a
    INNER JOIN accommodation_categories c ON a.category_id = c.id
    WHERE a.id IN (${placeholders})
    `,
    uniqueIds,
  );

  const map = {};

  rows.forEach((row) => {
    map[row.id] = row;
  });

  return map;
}

// ============================================================
// BLOCK: Get reservation items
// Purpose: Handles the get reservation items part of this file.
// ============================================================
async function getReservationItems(reservationId) {
  const [rows] = await db.promise().query(
    `
    SELECT
      ri.id,
      ri.reservation_id,
      ri.accommodation_id,
      ri.slot_type,
      ri.slot_label,
      ri.check_in_date,
      ri.check_in_time,
      ri.check_out_date,
      ri.check_out_time,
      ri.item_price,
      COALESCE(ri.stay_duration, 1) AS stay_duration,
      a.name AS accommodation_name,
      a.image,
      a.map_label,
      a.max_capacity,
      a.free_entrance_pax,
      c.name AS category_name
    FROM reservation_items ri
    INNER JOIN accommodations a ON ri.accommodation_id = a.id
    INNER JOIN accommodation_categories c ON a.category_id = c.id
    WHERE ri.reservation_id = ?
    ORDER BY ri.id ASC
    `,
    [reservationId],
  );

  return rows;
}

// ============================================================
// BLOCK: Create reservation
// Purpose: Handles the create reservation part of this file.
// ============================================================
async function createReservation({
  source = "online",
  user_id = null,
  body,
  autoApprove = false,
}) {
  const {
    first_name,
    middle_name,
    last_name,
    contact_no,
    guest_count,
    entrance_type,
    note,
    payment_method,
    payment_type,
    reservation_type,
    manual_reservation_type,
    proof_of_payment,
    proof_image_data,
    proof_reference,
    items,
  } = body;

  const cleanFirstName = normalizeText(first_name);
  const cleanMiddleName = normalizeNullableText(middle_name);
  const cleanLastName = normalizeText(last_name);
  const cleanContactNo = normalizeContactNumber(contact_no);
  const cleanEntranceType = normalizeText(entrance_type || "pool_beach");
  const cleanNote = normalizeNullableText(note);

  // PayMongo is still an ONLINE booking in the database.
  // "paymongo" is only an internal controller mode so we can
  // skip manual proof validation before redirecting to checkout.
  const isManualReservation = source === "manual";
  const isPayMongoReservation = source === "paymongo";
  const databaseBookingSource = isManualReservation ? "manual" : "online";

  // The exact GCash/Maya method is not known until PayMongo
  // confirms the payment, so the reservation starts as "other".
  const cleanPaymentMethod = isPayMongoReservation
    ? "other"
    : normalizeText(payment_method || "gcash");

  const cleanProof = normalizeNullableText(proof_of_payment);
  const cleanProofImageData = normalizeNullableText(proof_image_data);
  const cleanProofReference = normalizeReferenceNumber(proof_reference);
  const proofReferenceValidation = validateReferenceNumberByMethod(
    cleanProofReference,
    cleanPaymentMethod,
  );
  const cleanPaymentType = normalizeText(payment_type || "downpayment");
  const totalGuests = toNumber(guest_count, 0);
  const rawManualReservationType = normalizeText(
    reservation_type || manual_reservation_type || "",
  ).toLowerCase();
  const manualReservationType = isManualReservation
    ? rawManualReservationType === "facebook"
      ? "facebook"
      : "walkin"
    : null;
  const isWalkInManualReservation =
    isManualReservation && manualReservationType === "walkin";
  const isFacebookManualReservation =
    isManualReservation && manualReservationType === "facebook";

  if (!cleanFirstName || !cleanLastName || !cleanContactNo || !totalGuests) {
    throw {
      status: 400,
      message: "Please fill in all required guest information fields.",
    };
  }

  if (!isValidPhilippineMobileNumber(cleanContactNo)) {
    throw {
      status: 400,
      message: "Contact number must be exactly 11 digits and start with 09.",
    };
  }

  if (!Array.isArray(items) || !items.length) {
    throw {
      status: 400,
      message: "Please add at least one accommodation item.",
    };
  }

  if (!isManualReservation && !isPayMongoReservation) {
    if (!["gcash", "paymaya"].includes(cleanPaymentMethod.toLowerCase())) {
      throw {
        status: 400,
        message: "Online reservations only accept GCash or PayMaya payments.",
      };
    }

    if (!cleanProofReference) {
      throw {
        status: 400,
        message: "Reference number is required.",
      };
    }

    if (!proofReferenceValidation.valid) {
      throw {
        status: 400,
        message: proofReferenceValidation.message,
      };
    }

    if (!cleanProof && !cleanProofImageData) {
      throw {
        status: 400,
        message: "Payment proof or reference is required.",
      };
    }
  }

  if (isWalkInManualReservation) {
    if (cleanPaymentMethod.toLowerCase() !== "cash") {
      throw {
        status: 400,
        message: "Walk-in manual reservations must use cash payment only.",
      };
    }

    if (cleanPaymentType !== "full") {
      throw {
        status: 400,
        message: "Walk-in manual reservations must be full payment only.",
      };
    }
  }

  if (isFacebookManualReservation) {
    if (!["gcash", "paymaya"].includes(cleanPaymentMethod.toLowerCase())) {
      throw {
        status: 400,
        message:
          "Facebook/Messenger manual reservations must use GCash or PayMaya only.",
      };
    }

    if (!cleanProofReference) {
      throw {
        status: 400,
        message:
          "Reference number is required for Facebook/Messenger reservations.",
      };
    }

    if (!proofReferenceValidation.valid) {
      throw {
        status: 400,
        message: proofReferenceValidation.message,
      };
    }

    if (!cleanProof && !cleanProofImageData) {
      throw {
        status: 400,
        message:
          "Proof screenshot is required for Facebook/Messenger reservations.",
      };
    }
  }

  const accommodationMap = await getAccommodationsMapByIds(
    items.map((item) => item.accommodation_id),
  );

  const reservationItems = [];
  let accommodationTotal = 0;
  let hasOvernightStyle = false;

  for (const rawItem of items) {
    const accommodationId = Number(rawItem.accommodation_id);
    const slotType = normalizeText(rawItem.slot_type || "day_tour");
    const checkInDate = normalizeText(rawItem.check_in_date);
    const requestedStayDuration = Math.max(
      1,
      Math.min(5, Math.floor(toNumber(rawItem.stay_duration, 1))),
    );

    if (
      !accommodationId ||
      !checkInDate ||
      !["day_tour", "night", "day_extended", "night_extended"].includes(slotType)
    ) {
      throw {
        status: 400,
        message:
          "Each accommodation item must have a valid accommodation, slot type, and date.",
      };
    }

    const accommodation = accommodationMap[accommodationId];

    if (!accommodation) {
      throw {
        status: 404,
        message: "One of the selected accommodations was not found.",
      };
    }

    if (String(accommodation.status || "").toLowerCase() !== "available") {
      throw {
        status: 400,
        message: `${accommodation.name} is currently unavailable.`,
      };
    }

    const slotConfig = buildSlotConfig(accommodation, slotType);

    const stayDuration = ["day_extended", "night_extended"].includes(slotType)
      ? requestedStayDuration
      : 1;

    if (["day_tour", "night"].includes(slotType) && requestedStayDuration > 1) {
      throw {
        status: 400,
        message:
          "Day Tour and Night reservations are fixed schedules only. Use Day/Night 22 Hours or 23 Hours for multi-day stays.",
      };
    }

    const checkOutDate = buildCheckOutDate(
      checkInDate,
      slotConfig.start_time,
      slotConfig.end_time,
      stayDuration,
    );

    const newReservationItem = {
      accommodation_id: accommodation.id,
      slot_type: slotType,
      slot_label: slotConfig.slot_label,
      check_in_date: checkInDate,
      check_in_time: slotConfig.start_time,
      check_out_date: checkOutDate,
      check_out_time: slotConfig.end_time,
      stay_duration: stayDuration,
      item_price: slotConfig.price * stayDuration,
    };

    if (isScheduleWindowAlreadyEnded(newReservationItem)) {
      throw {
        status: 400,
        message: getScheduleEndedMessage(accommodation.name),
      };
    }

    reservationItems.push(newReservationItem);

    accommodationTotal += slotConfig.price * stayDuration;

    if (slotType === "night" || slotType === "day_extended" || slotType === "night_extended") {
      hasOvernightStyle = true;
    }
  }

  const totalFreeEntrancePax = getTotalFreeEntrancePaxFromItems(
    items,
    accommodationMap,
    totalGuests,
  );

  const chargeableEntranceGuests = Math.max(
    totalGuests - totalFreeEntrancePax,
    0,
  );

  const estimatedEntranceFee =
    getEntranceRate(cleanEntranceType, hasOvernightStyle) *
    chargeableEntranceGuests;

  const requiredDownpayment = accommodationTotal * 0.5;

  // Online customer reservations start as pending until admin verifies proof.
  // Manual reservations are encoded by staff:
  // - Walk-in: cash, full payment, auto checked-in.
  // - Facebook/Messenger: GCash/PayMaya proof, approved but not checked-in.
  let paidAmount = 0;
  let remainingBalance = accommodationTotal;
  let reservationStatus = "pending";
  let paymentStatus = "pending";
  let isCheckedIn = 0;
  let checkedInAtSql = null;
  let entranceFeePaid = 0;
  let entranceFeeCollected = 0;

  if (isPayMongoReservation) {
    // Automated online payment has not happened yet.
    paidAmount = 0;
    remainingBalance = accommodationTotal;
    reservationStatus = "pending";
    paymentStatus = "unpaid";
  } else if (isWalkInManualReservation) {
    paidAmount = accommodationTotal;
    remainingBalance = 0;
    reservationStatus = "approved";
    paymentStatus = "paid";
    isCheckedIn = 1;
    checkedInAtSql = new Date();
    entranceFeePaid = 1;
    entranceFeeCollected = estimatedEntranceFee;
  } else if (isFacebookManualReservation) {
    reservationStatus = "approved";

    if (cleanPaymentType === "full") {
      paidAmount = accommodationTotal;
      remainingBalance = 0;
      paymentStatus = "paid";
    } else {
      paidAmount = requiredDownpayment;
      remainingBalance = accommodationTotal - paidAmount;
      paymentStatus = "partially_paid";
    }
  }

  const noteParts = [];

  noteParts.push(
    `Entrance Type: ${
      cleanEntranceType === "beach_only" ? "Beach Only" : "Pool & Beach"
    }`,
  );

  noteParts.push(`Free Entrance Included: ${totalFreeEntrancePax} pax`);
  noteParts.push(`Chargeable Entrance Guests: ${chargeableEntranceGuests}`);
  noteParts.push(
    "Discount reminder: Senior/PWD/Kids discount will be verified at the front desk.",
  );

  if (isManualReservation) {
    noteParts.push(
      `Manual Reservation Type: ${
        isWalkInManualReservation
          ? "Walk-in Guest"
          : "Facebook / Messenger Reservation"
      }`,
    );

    if (isWalkInManualReservation) {
      noteParts.push("Manual Reservation Payment Type: Full Cash Payment");
      noteParts.push(
        "Walk-in guest automatically checked in after manual reservation creation.",
      );
    } else if (cleanPaymentType === "full") {
      noteParts.push("Manual Reservation Payment Type: Full Payment");
    } else {
      noteParts.push("Manual Reservation Payment Type: 50% Down Payment");
    }

    if (cleanProofReference) {
      noteParts.push(`Reference Number: ${cleanProofReference}`);
    }
  } else if (isPayMongoReservation) {
    noteParts.push(
      "Online Reservation Payment: PayMongo automated checkout.",
    );
    noteParts.push(
      "Payment Status: Awaiting PayMongo payment confirmation.",
    );
  } else {
    noteParts.push(`Reference Number: ${cleanProofReference}`);
    noteParts.push(
      "Online Reservation Payment Status: Pending admin verification of submitted GCash/Maya proof.",
    );
  }

  if (cleanNote) {
    noteParts.push(`Customer Note: ${cleanNote}`);
  }

  const finalNote = noteParts.join(" | ");

  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    await checkReservationConflicts(connection, reservationItems);

    const reservationCode = await generateReservationCode(connection);

    const [reservationResult] = await connection.query(
      `
      INSERT INTO reservations (
        reservation_code,
        user_id,
        booking_source,
        first_name,
        middle_name,
        last_name,
        contact_no,
        guest_count,
        estimated_entrance_fee,
        accommodation_total,
        required_downpayment,
        paid_amount,
        remaining_balance,
        note,
        payment_method,
        payment_status,
        reservation_status,
        proof_of_payment,
        proof_image_data,
        is_checked_in,
        checked_in_at,
        entrance_fee_paid,
        entrance_fee_collected,
        reserved_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        reservationCode,
        user_id,
        databaseBookingSource,
        cleanFirstName,
        cleanMiddleName,
        cleanLastName,
        cleanContactNo,
        totalGuests,
        estimatedEntranceFee,
        accommodationTotal,
        requiredDownpayment,
        paidAmount,
        remainingBalance,
        finalNote,
        cleanPaymentMethod,
        paymentStatus,
        reservationStatus,
        cleanProof,
        cleanProofImageData,
        isCheckedIn,
        checkedInAtSql,
        entranceFeePaid,
        entranceFeeCollected,
      ],
    );

    const reservationId = reservationResult.insertId;

    // For PayMongo flow, a pending transaction record is created
    // in the SAME MySQL transaction as the reservation.
    let paymentTransactionId = null;

    for (const item of reservationItems) {
      await connection.query(
        `
        INSERT INTO reservation_items (
          reservation_id,
          accommodation_id,
          slot_type,
          slot_label,
          stay_duration,
          check_in_date,
          check_in_time,
          check_out_date,
          check_out_time,
          item_price
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          reservationId,
          item.accommodation_id,
          item.slot_type,
          item.slot_label,
          item.stay_duration,
          item.check_in_date,
          item.check_in_time,
          item.check_out_date,
          item.check_out_time,
          item.item_price,
        ],
      );
    }

    if (isPayMongoReservation) {
      const [paymentTransactionResult] = await connection.query(
        `
        INSERT INTO payment_transactions (
          reservation_id,
          provider,
          amount,
          currency,
          payment_method,
          status
        )
        VALUES (?, 'paymongo', ?, 'PHP', NULL, 'pending')
        `,
        [reservationId, requiredDownpayment],
      );

      paymentTransactionId = paymentTransactionResult.insertId;
    }

    await connection.commit();

    return {
      reservationId,
      reservationCode,
      paymentTransactionId,
      requiredDownpayment,
      estimatedEntranceFee,
      accommodationTotal,
      totalFreeEntrancePax,
      chargeableEntranceGuests,
      isCheckedIn: Boolean(isCheckedIn),
      message: isManualReservation
        ? "Manual reservation created successfully."
        : isPayMongoReservation
          ? "Reservation prepared successfully for PayMongo checkout."
          : "Reservation request submitted successfully. Please wait for admin payment verification.",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// ============================================================
// BACKEND/API HANDLER: Create booking
// Purpose: Handles the create booking part of this file.
// ============================================================
exports.createBooking = async (req, res) => {
  try {
    const parsedBody = parseRequestReservationBody(req);
    const user_id = Number(parsedBody.user_id);

    if (!user_id) {
      return res.status(400).json({
        message: "User ID is required.",
      });
    }

    const result = await createReservation({
      source: "online",
      user_id,
      body: parsedBody,
      autoApprove: false,
    });

    return res.status(201).json({
      message: result.message,
      bookingId: result.reservationId,
      reservationCode: result.reservationCode,
      proofPath: parsedBody.proof_of_payment || null,
      proofImageDataSaved: Boolean(parsedBody.proof_image_data),
      isCheckedIn: Boolean(result.isCheckedIn),
    });
  } catch (error) {
    console.error("createBooking error:", error);

    return res.status(error.status || 500).json({
      message: error.message || "Failed to create reservation.",
      error: error.message,
    });
  }
};


// ============================================================
// BACKEND/API HANDLER: Create PayMongo-ready reservation
// Purpose:
// - Reuses the normal reservation validation and conflict logic.
// - Does NOT require manual GCash/Maya proof/reference.
// - Creates reservation + pending payment_transactions row.
// - Does NOT mark anything paid.
// ============================================================
exports.createPayMongoBooking = async (req, res) => {
  try {
    const parsedBody = parseRequestReservationBody(req);
    const user_id = Number(parsedBody.user_id);

    if (!user_id) {
      return res.status(400).json({
        message: "User ID is required.",
      });
    }

    // PayMongo will determine the final GCash/Maya method later.
    parsedBody.payment_method = "other";
    parsedBody.payment_type = "downpayment";
    parsedBody.proof_reference = null;
    parsedBody.proof_of_payment = null;
    parsedBody.proof_image_data = null;

    const result = await createReservation({
      source: "paymongo",
      user_id,
      body: parsedBody,
      autoApprove: false,
    });

    return res.status(201).json({
      success: true,
      message: result.message,
      bookingId: result.reservationId,
      reservationCode: result.reservationCode,
      paymentTransactionId: result.paymentTransactionId,
      requiredDownpayment: result.requiredDownpayment,
      accommodationTotal: result.accommodationTotal,
      estimatedEntranceFee: result.estimatedEntranceFee,
      paymentStatus: "unpaid",
    });
  } catch (error) {
    console.error("createPayMongoBooking error:", error);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message || "Failed to prepare reservation for PayMongo checkout.",
      error: error.message,
    });
  }
};

// ============================================================
// BACKEND/API HANDLER: Create walk in booking
// Purpose: Handles the create walk in booking part of this file.
// ============================================================
exports.createWalkInBooking = async (req, res) => {
  try {
    const parsedBody = parseRequestReservationBody(req);

    const result = await createReservation({
      source: "manual",
      user_id: null,
      body: parsedBody,
      autoApprove: true,
    });

    return res.status(201).json({
      message: result.message,
      bookingId: result.reservationId,
      reservationCode: result.reservationCode,
      proofPath: parsedBody.proof_of_payment || null,
      proofImageDataSaved: Boolean(parsedBody.proof_image_data),
      isCheckedIn: Boolean(result.isCheckedIn),
    });
  } catch (error) {
    console.error("createWalkInBooking error:", error);

    return res.status(error.status || 500).json({
      message: error.message || "Failed to create manual reservation.",
      error: error.message,
    });
  }
};

// ============================================================
// BACKEND/API HANDLER: Get user bookings
// Purpose: Handles the get user bookings part of this file.
// ============================================================
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.promise().query(
      `
      SELECT
        r.id,
        r.reservation_code,
        r.user_id,
        r.booking_source,
        r.first_name,
        r.middle_name,
        r.last_name,
        r.contact_no,
        r.guest_count,
        r.actual_guest_count,
        r.estimated_entrance_fee,
        r.accommodation_total,
        r.required_downpayment,
        r.paid_amount,
        r.remaining_balance,
        r.is_checked_in,
        r.checked_in_at,
        r.entrance_fee_paid,
        r.entrance_fee_collected,
        r.extra_bed_count,
        r.extra_bed_fee,
        r.extra_bed_paid,
        r.extra_bed_paid_at,
        r.note,
        r.payment_method,
        r.payment_status,
        r.reservation_status AS status,
        r.proof_of_payment,
        r.proof_image_data,
        r.reserved_at,
        r.created_at,

        first_item.slot_label,
        first_item.check_in_date,
        first_item.check_in_time,
        first_item.check_out_date,
        first_item.check_out_time,
        first_item.item_price,
        COALESCE(first_item.stay_duration, 1) AS stay_duration,

        a.name AS room_name,
        a.image,

        item_counts.total_items,
        acc_list.accommodation_list
      FROM reservations r
      LEFT JOIN (
        SELECT
          reservation_id,
          MIN(id) AS first_item_id
        FROM reservation_items
        GROUP BY reservation_id
      ) first_ref ON r.id = first_ref.reservation_id
      LEFT JOIN reservation_items first_item ON first_ref.first_item_id = first_item.id
      LEFT JOIN accommodations a ON first_item.accommodation_id = a.id
      LEFT JOIN (
        SELECT reservation_id, COUNT(*) AS total_items
        FROM reservation_items
        GROUP BY reservation_id
      ) item_counts ON r.id = item_counts.reservation_id
      LEFT JOIN (
        SELECT
          ri.reservation_id,
          GROUP_CONCAT(a2.name ORDER BY ri.id ASC SEPARATOR ', ') AS accommodation_list
        FROM reservation_items ri
        INNER JOIN accommodations a2 ON ri.accommodation_id = a2.id
        GROUP BY ri.reservation_id
      ) acc_list ON r.id = acc_list.reservation_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      `,
      [userId],
    );

    const bookings = rows.map((row) => ({
      ...row,
      check_in: row.check_in_date,
      check_out: row.check_out_date,
      check_in_time: row.check_in_time,
      check_out_time: row.check_out_time,
      guests: Number(row.actual_guest_count ?? row.guest_count ?? 0),
      booked_guests: Number(row.guest_count || 0),
      actual_guests: Number(row.actual_guest_count ?? row.guest_count ?? 0),
      room_name: row.accommodation_list || row.room_name || "N/A",
    }));

    return res.status(200).json({
      bookings,
    });
  } catch (error) {
    console.error("getUserBookings error:", error);

    return res.status(500).json({
      message: "Failed to fetch user reservations.",
      error: error.message,
    });
  }
};

// ============================================================
// BACKEND/API HANDLER: Cancel booking
// Purpose: Handles the cancel booking part of this file.
// ============================================================
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.promise().query(
      `
      SELECT
        r.id,
        r.reservation_status,
        MIN(ri.check_in_date) AS check_in_date
      FROM reservations r
      LEFT JOIN reservation_items ri ON r.id = ri.reservation_id
      WHERE r.id = ?
      GROUP BY r.id
      LIMIT 1
      `,
      [id],
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Reservation not found.",
      });
    }

    const reservation = rows[0];
    const status = String(reservation.reservation_status || "").toLowerCase();

    if (["cancelled", "rejected", "completed"].includes(status)) {
      return res.status(400).json({
        message: "This reservation can no longer be cancelled.",
      });
    }

    if (!reservation.check_in_date) {
      return res.status(400).json({
        message: "This reservation has no valid check-in date.",
      });
    }

    const checkInDate = new Date(reservation.check_in_date);
    const today = new Date();

    checkInDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const daysBeforeCheckIn = Math.floor(
      (checkInDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
    );

    if (daysBeforeCheckIn < 1) {
      return res.status(400).json({
        message: "Cancellation is only allowed at least 1 day before check-in.",
      });
    }

    await db.promise().query(
      `
      UPDATE reservations
      SET reservation_status = 'cancelled'
      WHERE id = ?
      `,
      [id],
    );

    return res.status(200).json({
      message: "Reservation cancelled successfully.",
    });
  } catch (error) {
    console.error("cancelBooking error:", error);

    return res.status(500).json({
      message: "Failed to cancel reservation.",
      error: error.message,
    });
  }
};

// ============================================================
// BACKEND/API HANDLER: Get booking receipt
// Purpose:
// - Loads reservation receipt
// - Includes reserved accommodation items
// - Includes additional charges from booking_charges table
// ============================================================
// ============================================================
// BACKEND/API HANDLER: Get booking receipt
// Purpose:
// - Loads reservation receipt
// - Includes reserved accommodation items
// - Includes additional charges from booking_charges table
// - Separates total charges, paid charges, and unpaid charges
// ============================================================
exports.getBookingReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.promise().query(
      `
      SELECT
        r.id,
        r.reservation_code,
        r.user_id,
        r.booking_source,
        r.first_name,
        r.middle_name,
        r.last_name,
        r.contact_no,
        r.guest_count,
        r.actual_guest_count,
        r.estimated_entrance_fee,
        r.accommodation_total,
        r.required_downpayment,
        r.paid_amount,
        r.remaining_balance,
        r.is_checked_in,
        r.checked_in_at,
        r.entrance_fee_paid,
        r.entrance_fee_collected,
        r.extra_bed_count,
        r.extra_bed_fee,
        r.extra_bed_paid,
        r.extra_bed_paid_at,
        r.note,
        r.payment_method,
        r.payment_status,
        r.reservation_status AS status,
        r.proof_of_payment,
        r.proof_image_data,
        r.reserved_at,
        r.created_at,
        u.email,

        first_item.slot_label,
        first_item.check_in_date,
        first_item.check_in_time,
        first_item.check_out_date,
        first_item.check_out_time,
        COALESCE(first_item.stay_duration, 1) AS stay_duration,

        a.name AS room_name,
        a.image,

        item_counts.total_items,
        acc_list.accommodation_list
      FROM reservations r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN (
        SELECT reservation_id, MIN(id) AS first_item_id
        FROM reservation_items
        GROUP BY reservation_id
      ) first_ref ON r.id = first_ref.reservation_id
      LEFT JOIN reservation_items first_item ON first_ref.first_item_id = first_item.id
      LEFT JOIN accommodations a ON first_item.accommodation_id = a.id
      LEFT JOIN (
        SELECT reservation_id, COUNT(*) AS total_items
        FROM reservation_items
        GROUP BY reservation_id
      ) item_counts ON r.id = item_counts.reservation_id
      LEFT JOIN (
        SELECT
          ri.reservation_id,
          GROUP_CONCAT(a2.name ORDER BY ri.id ASC SEPARATOR ', ') AS accommodation_list
        FROM reservation_items ri
        INNER JOIN accommodations a2 ON ri.accommodation_id = a2.id
        GROUP BY ri.reservation_id
      ) acc_list ON r.id = acc_list.reservation_id
      WHERE r.id = ?
      LIMIT 1
      `,
      [id],
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Reservation receipt not found.",
      });
    }

    const booking = rows[0];
    const items = await getReservationItems(id);

    /* ======================================================
       ADDITIONAL CHARGES
       booking_charges.booking_id references reservations.id
       Important:
       - Include is_paid and paid_at so receipt knows what is still unpaid.
    ====================================================== */
    const [chargeRows] = await db.promise().query(
      `
      SELECT
        id,
        booking_id,
        charge_name,
        charge_amount,
        charge_note,
        COALESCE(is_paid, 0) AS is_paid,
        paid_at,
        created_at
      FROM booking_charges
      WHERE booking_id = ?
      ORDER BY created_at ASC, id ASC
      `,
      [id],
    );

    /* ======================================================
       FRONT-DESK DISCOUNT
       booking_discounts.booking_id references reservations.id.
       One active discount adjustment may exist per reservation.
    ====================================================== */
    const [discountRows] = await db.promise().query(
      `
      SELECT
        id,
        booking_id,
        discount_type,
        qualified_pax,
        discount_amount,
        discount_note,
        created_at,
        updated_at
      FROM booking_discounts
      WHERE booking_id = ?
      ORDER BY FIELD(discount_type, 'senior', 'pwd', 'kid_free'), id ASC
      `,
      [id],
    );

    const bookingDiscount = discountRows[0] || null;
    const discountTotal = discountRows.reduce(
      (sum, discount) => sum + Number(discount.discount_amount || 0),
      0,
    );

    const additionalChargesTotal = chargeRows.reduce(
      (sum, charge) => sum + Number(charge.charge_amount || 0),
      0,
    );

    const unpaidAdditionalChargesTotal = chargeRows.reduce((sum, charge) => {
      return Number(charge.is_paid || 0) === 1
        ? sum
        : sum + Number(charge.charge_amount || 0);
    }, 0);

    const paidAdditionalChargesTotal = Math.max(
      additionalChargesTotal - unpaidAdditionalChargesTotal,
      0,
    );

    const totalFreeEntrancePax = Math.min(
      items.reduce((sum, item) => sum + Number(item.free_entrance_pax || 0), 0),
      Number(booking.guest_count || 0),
    );

    booking.fullname = [
      booking.first_name,
      booking.middle_name,
      booking.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    booking.phone = booking.contact_no || "-";
    booking.address = "-";
    booking.check_in = booking.check_in_date;
    booking.check_out = booking.check_out_date;
    booking.check_in_time = booking.check_in_time;
    booking.check_out_time = booking.check_out_time;
    booking.booked_guests = Number(booking.guest_count || 0);
    booking.actual_guests = Number(
      booking.actual_guest_count ?? booking.guest_count ?? 0,
    );
    booking.guests = booking.actual_guests;
    booking.free_entrance_pax = totalFreeEntrancePax;

    booking.chargeable_entrance_guests = Math.max(
      Number(booking.guest_count || 0) - totalFreeEntrancePax,
      0,
    );

    booking.room_name =
      booking.accommodation_list || booking.room_name || "N/A";

    booking.items = items;

    booking.discount = bookingDiscount;
    booking.discounts = discountRows;
    booking.entrance_adjustments = discountRows;
    booking.discount_total = discountTotal;
    booking.front_desk_discount_total = discountTotal;
    booking.entrance_adjustment_total = discountTotal;

    booking.additional_charges = chargeRows;
    booking.additional_charges_total = additionalChargesTotal;
    booking.unpaid_additional_charges_total = unpaidAdditionalChargesTotal;
    booking.paid_additional_charges_total = paidAdditionalChargesTotal;
    booking.additional_charges_paid =
      chargeRows.length > 0 && unpaidAdditionalChargesTotal <= 0 ? 1 : 0;

    return res.status(200).json({
      booking,
    });
  } catch (error) {
    console.error("getBookingReceipt error:", error);

    return res.status(500).json({
      message: "Failed to load reservation receipt.",
      error: error.message,
    });
  }
};

// ============================================================
// BACKEND/API HANDLER: Get all bookings
// Purpose: Handles the get all bookings part of this file.
// ============================================================
exports.getAllBookings = async (req, res) => {
  try {
    const scope = String(req.query.scope || "today").toLowerCase();
    const startDate = String(req.query.startDate || "").trim();
    const endDate = String(req.query.endDate || "").trim();

    let dateWhereClause = "";
    const dateParams = [];

    /*
      Default behavior:
      - If no query is passed, load TODAY only.
      - Uses +08:00 for Philippines date consistency.
      - scope=all is still available only when intentionally requested.
    */
    if (startDate && endDate) {
      dateWhereClause = `
        WHERE (
          DATE(CONVERT_TZ(r.created_at, '+00:00', '+08:00')) BETWEEN ? AND ?
          OR DATE(CONVERT_TZ(r.checked_in_at, '+00:00', '+08:00')) BETWEEN ? AND ?
          OR DATE(CONVERT_TZ(r.extra_bed_paid_at, '+00:00', '+08:00')) BETWEEN ? AND ?
          OR EXISTS (
            SELECT 1
            FROM reservation_items ri_active
            WHERE ri_active.reservation_id = r.id
              AND ri_active.check_in_date <= ?
              AND ri_active.check_out_date >= ?
          )
        )
      `;
      dateParams.push(
        startDate,
        endDate,
        startDate,
        endDate,
        startDate,
        endDate,
        endDate,
        startDate,
      );
    } else if (scope === "dashboard_today") {
      dateWhereClause = `
        WHERE (
          DATE(CONVERT_TZ(r.created_at, '+00:00', '+08:00')) =
            DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
          OR DATE(CONVERT_TZ(r.checked_in_at, '+00:00', '+08:00')) =
            DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
          OR DATE(CONVERT_TZ(r.extra_bed_paid_at, '+00:00', '+08:00')) =
            DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
          OR EXISTS (
            SELECT 1
            FROM reservation_items ri_active
            WHERE ri_active.reservation_id = r.id
              AND ri_active.check_in_date <= DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
              AND ri_active.check_out_date >= DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
          )
        )
      `;
    } else if (scope === "all") {
      dateWhereClause = "";
    } else if (scope === "month") {
      dateWhereClause = `
        WHERE YEAR(CONVERT_TZ(r.created_at, '+00:00', '+08:00')) =
              YEAR(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
          AND MONTH(CONVERT_TZ(r.created_at, '+00:00', '+08:00')) =
              MONTH(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
      `;
    } else if (scope === "year") {
      dateWhereClause = `
        WHERE YEAR(CONVERT_TZ(r.created_at, '+00:00', '+08:00')) =
              YEAR(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
      `;
    } else {
      dateWhereClause = `
        WHERE (
          DATE(CONVERT_TZ(r.created_at, '+00:00', '+08:00')) =
            DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
          OR DATE(CONVERT_TZ(r.checked_in_at, '+00:00', '+08:00')) =
            DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
          OR DATE(CONVERT_TZ(r.extra_bed_paid_at, '+00:00', '+08:00')) =
            DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
          OR EXISTS (
            SELECT 1
            FROM reservation_items ri_active
            WHERE ri_active.reservation_id = r.id
              AND ri_active.check_in_date <= DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
              AND ri_active.check_out_date >= DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
          )
        )
      `;
    }

    const [rows] = await db.promise().query(
      `
      SELECT
        r.id,
        r.reservation_code,
        r.user_id,
        r.booking_source,
        r.first_name,
        r.middle_name,
        r.last_name,
        r.contact_no,
        r.guest_count,
        r.actual_guest_count,
        r.estimated_entrance_fee,
        r.accommodation_total,
        r.required_downpayment,
        r.paid_amount,
        r.remaining_balance,
        r.is_checked_in,
        r.checked_in_at,
        r.entrance_fee_paid,
        r.entrance_fee_collected,
        r.extra_bed_count,
        r.extra_bed_fee,
        r.extra_bed_paid,
        r.extra_bed_paid_at,
        r.note,
        r.payment_method,
        r.payment_status,
        r.reservation_status AS status,
        r.proof_of_payment,
        r.proof_image_data,
        r.reserved_at,
        r.created_at,
        u.email,

        first_item.slot_label,
        first_item.check_in_date,
        first_item.check_in_time,
        first_item.check_out_date,
        first_item.check_out_time,
        COALESCE(first_item.stay_duration, 1) AS stay_duration,

        a.name AS room_name,
        a.image,

        item_counts.total_items,
        acc_list.accommodation_list
      FROM reservations r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN (
        SELECT reservation_id, MIN(id) AS first_item_id
        FROM reservation_items
        GROUP BY reservation_id
      ) first_ref ON r.id = first_ref.reservation_id
      LEFT JOIN reservation_items first_item ON first_ref.first_item_id = first_item.id
      LEFT JOIN accommodations a ON first_item.accommodation_id = a.id
      LEFT JOIN (
        SELECT reservation_id, COUNT(*) AS total_items
        FROM reservation_items
        GROUP BY reservation_id
      ) item_counts ON r.id = item_counts.reservation_id
      LEFT JOIN (
        SELECT
          ri.reservation_id,
          GROUP_CONCAT(a2.name ORDER BY ri.id ASC SEPARATOR ', ') AS accommodation_list
        FROM reservation_items ri
        INNER JOIN accommodations a2 ON ri.accommodation_id = a2.id
        GROUP BY ri.reservation_id
      ) acc_list ON r.id = acc_list.reservation_id
      ${dateWhereClause}
      ORDER BY r.created_at DESC
      `,
      dateParams,
    );

    const bookings = rows.map((row) => ({
      ...row,
      fullname: [row.first_name, row.middle_name, row.last_name]
        .filter(Boolean)
        .join(" "),
      phone: row.contact_no || "-",
      check_in: row.check_in_date,
      check_out: row.check_out_date,
      check_in_time: row.check_in_time,
      check_out_time: row.check_out_time,
      guests: Number(row.actual_guest_count ?? row.guest_count ?? 0),
      booked_guests: Number(row.guest_count || 0),
      actual_guests: Number(row.actual_guest_count ?? row.guest_count ?? 0),
      room_name: row.accommodation_list || row.room_name || "N/A",
      items: [],
    }));

    /*
      Detailed reservation items for admin pages:
      - Needed by Guests Inside so added accommodations show their own schedule.
      - Example: main room has Overnight 2 nights, added shade has Day Tour 1 day.
      - The table can now display each accommodation with check-in/out date and time.
    */
    const reservationIds = bookings
      .map((booking) => Number(booking.id))
      .filter(Boolean);

    if (reservationIds.length) {
      const placeholders = reservationIds.map(() => "?").join(",");

      const [itemRows] = await db.promise().query(
        `
        SELECT
          ri.id,
          ri.reservation_id,
          ri.accommodation_id,
          ri.slot_type,
          ri.slot_label,
          COALESCE(ri.stay_duration, 1) AS stay_duration,
          ri.check_in_date,
          ri.check_in_time,
          ri.check_out_date,
          ri.check_out_time,
          ri.item_price,
          a.name AS accommodation_name,
          c.name AS category_name
        FROM reservation_items ri
        INNER JOIN accommodations a ON ri.accommodation_id = a.id
        INNER JOIN accommodation_categories c ON a.category_id = c.id
        WHERE ri.reservation_id IN (${placeholders})
        ORDER BY ri.reservation_id ASC, ri.id ASC
        `,
        reservationIds,
      );

      const itemsByReservationId = {};

      itemRows.forEach((item) => {
        const reservationId = Number(item.reservation_id);

        if (!itemsByReservationId[reservationId]) {
          itemsByReservationId[reservationId] = [];
        }

        itemsByReservationId[reservationId].push(item);
      });

      bookings.forEach((booking) => {
        booking.items = itemsByReservationId[Number(booking.id)] || [];
      });
    }

    return res.status(200).json({
      scope,
      startDate: startDate || null,
      endDate: endDate || null,
      bookings,
    });
  } catch (error) {
    console.error("getAllBookings error:", error);

    return res.status(500).json({
      message: "Failed to fetch all reservations.",
      error: error.message,
    });
  }
};

// ============================================================
// BACKEND/API HANDLER: Update booking status
// Purpose: Handles the update booking status part of this file.
// ============================================================
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "approved",
      "cancelled",
      "completed",
      "rejected",
    ];

    if (!allowedStatuses.includes(String(status).toLowerCase())) {
      return res.status(400).json({
        message: "Invalid reservation status.",
      });
    }

    const [rows] = await db
      .promise()
      .query(`SELECT id FROM reservations WHERE id = ? LIMIT 1`, [id]);

    if (!rows.length) {
      return res.status(404).json({
        message: "Reservation not found.",
      });
    }

    await db
      .promise()
      .query(`UPDATE reservations SET reservation_status = ? WHERE id = ?`, [
        status,
        id,
      ]);

    return res.status(200).json({
      message: "Reservation status updated successfully.",
    });
  } catch (error) {
    console.error("updateBookingStatus error:", error);

    return res.status(500).json({
      message: "Failed to update reservation status.",
      error: error.message,
    });
  }
};

// ============================================================
// BACKEND/API HANDLER: Update payment status
// Purpose: Handles the update payment status part of this file.
// ============================================================
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const normalizedPaymentStatus = String(payment_status || "").toLowerCase();

    const allowedPaymentStatuses = [
      "unpaid",
      "pending",
      "paid",
      "partially_paid",
      "rejected",
    ];

    if (!allowedPaymentStatuses.includes(normalizedPaymentStatus)) {
      return res.status(400).json({
        message: "Invalid payment status.",
      });
    }

    const [rows] = await db.promise().query(
      `
      SELECT
        id,
        accommodation_total,
        required_downpayment,
        reservation_status
      FROM reservations
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Reservation not found.",
      });
    }

    const reservation = rows[0];
    const accommodationTotal = Number(reservation.accommodation_total || 0);
    const requiredDownpayment = Number(
      reservation.required_downpayment || accommodationTotal * 0.5,
    );

    let paidAmount = 0;
    let remainingBalance = accommodationTotal;
    let nextReservationStatus = String(
      reservation.reservation_status || "pending",
    ).toLowerCase();

    if (normalizedPaymentStatus === "paid") {
      paidAmount = accommodationTotal;
      remainingBalance = 0;
      nextReservationStatus = "approved";
    } else if (normalizedPaymentStatus === "partially_paid") {
      paidAmount = requiredDownpayment;
      remainingBalance = Math.max(accommodationTotal - paidAmount, 0);
      nextReservationStatus = "approved";
    } else if (normalizedPaymentStatus === "rejected") {
      paidAmount = 0;
      remainingBalance = accommodationTotal;
      nextReservationStatus = "rejected";
    } else if (normalizedPaymentStatus === "pending") {
      paidAmount = 0;
      remainingBalance = accommodationTotal;
      nextReservationStatus = "pending";
    } else if (normalizedPaymentStatus === "unpaid") {
      paidAmount = 0;
      remainingBalance = accommodationTotal;

      if (
        !["cancelled", "completed", "rejected"].includes(nextReservationStatus)
      ) {
        nextReservationStatus = "pending";
      }
    }

    await db.promise().query(
      `
      UPDATE reservations
      SET
        payment_status = ?,
        paid_amount = ?,
        remaining_balance = ?,
        reservation_status = ?
      WHERE id = ?
      `,
      [
        normalizedPaymentStatus,
        paidAmount,
        remainingBalance,
        nextReservationStatus,
        id,
      ],
    );

    return res.status(200).json({
      message: "Payment status updated successfully.",
      payment_status: normalizedPaymentStatus,
      reservation_status: nextReservationStatus,
      paid_amount: paidAmount,
      remaining_balance: remainingBalance,
    });
  } catch (error) {
    console.error("updatePaymentStatus error:", error);

    return res.status(500).json({
      message: "Failed to update payment status.",
      error: error.message,
    });
  }
};

// ============================================================
// BACKEND/API HANDLER: Check in booking
// Purpose: Handles the check in booking part of this file.
// ============================================================
exports.checkInBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.promise().query(
      `
      SELECT
        id,
        reservation_status,
        payment_status,
        accommodation_total,
        estimated_entrance_fee,
        is_checked_in
      FROM reservations
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Reservation not found.",
      });
    }

    const reservation = rows[0];
    const status = String(reservation.reservation_status || "").toLowerCase();

    if (["cancelled", "rejected", "completed"].includes(status)) {
      return res.status(400).json({
        message: "This reservation can no longer be checked in.",
      });
    }

    if (status !== "approved") {
      return res.status(400).json({
        message:
          "This reservation must be approved after payment verification before check-in.",
      });
    }

    const paymentStatus = String(
      reservation.payment_status || "",
    ).toLowerCase();

    if (!["partially_paid", "paid"].includes(paymentStatus)) {
      return res.status(400).json({
        message:
          "Payment proof must be verified before this reservation can be checked in.",
      });
    }

    if (Number(reservation.is_checked_in || 0) === 1) {
      return res.status(400).json({
        message: "This reservation is already checked in.",
      });
    }

    const accommodationTotal = Number(reservation.accommodation_total || 0);
    const entranceFee = Number(reservation.estimated_entrance_fee || 0);

    await db.promise().query(
      `
      UPDATE reservations
      SET
        reservation_status = 'approved',
        payment_status = 'paid',
        paid_amount = ?,
        remaining_balance = 0,
        entrance_fee_paid = 1,
        entrance_fee_collected = ?,
        is_checked_in = 1,
        checked_in_at = NOW()
      WHERE id = ?
      `,
      [accommodationTotal, entranceFee, id],
    );

    return res.status(200).json({
      message: "Guest checked in successfully.",
      payment_status: "paid",
      paid_amount: accommodationTotal,
      remaining_balance: 0,
      entrance_fee_paid: 1,
      entrance_fee_collected: entranceFee,
      is_checked_in: 1,
    });
  } catch (error) {
    console.error("checkInBooking error:", error);

    return res.status(500).json({
      message: "Failed to check in reservation.",
      error: error.message,
    });
  }
};

// ============================================================
// BACKEND/API HANDLER: Check item availability
// Purpose:
// - Used by Guests Inside modals before saving Add Accommodation / Extend Stay.
// - Add Accommodation checks the selected accommodation/date/slot/duration.
// - Extend Stay checks the extension window from current checkout to new checkout.
// ============================================================
exports.checkItemAvailability = async (req, res) => {
  try {
    const mode = normalizeText(req.body.mode || "add").toLowerCase();
    const reservationId = Number(
      req.body.reservation_id || req.body.booking_id || 0,
    );

    let availabilityItem = null;
    let ignoreReservationId = null;
    let accommodationName = "Selected accommodation";

    if (mode === "extend") {
      const reservationItemId = Number(
        req.body.reservation_item_id || req.body.item_id || 0,
      );
      const extensionDuration = Math.max(
        1,
        Math.min(
          5,
          Math.floor(
            toNumber(req.body.extension_duration || req.body.stay_duration, 1),
          ),
        ),
      );

      if (!reservationId || !reservationItemId) {
        return res.status(400).json({
          available: false,
          message: "Reservation and accommodation item are required.",
        });
      }

      const [rows] = await db.promise().query(
        `
        SELECT
          r.id AS reservation_id,
          r.reservation_status,
          r.is_checked_in,
          ri.id AS reservation_item_id,
          ri.accommodation_id,
          ri.slot_type,
          ri.slot_label,
          ri.check_out_date,
          ri.check_out_time,
          a.name AS accommodation_name,
          a.day_price,
          a.overnight_price,
          a.extended_price,
          a.day_start_time,
          a.day_end_time,
          a.overnight_start_time,
          a.overnight_end_time,
          a.extended_start_time,
          a.extended_end_time,
          c.name AS category_name
        FROM reservation_items ri
        INNER JOIN reservations r ON ri.reservation_id = r.id
        INNER JOIN accommodations a ON ri.accommodation_id = a.id
        INNER JOIN accommodation_categories c ON a.category_id = c.id
        WHERE r.id = ? AND ri.id = ?
        LIMIT 1
        `,
        [reservationId, reservationItemId],
      );

      if (!rows.length) {
        return res.status(404).json({
          available: false,
          message: "Selected accommodation item was not found.",
        });
      }

      const item = rows[0];
      const extensionType = normalizeExtensionType(req.body.extension_type);
      const extensionWindow = buildExtensionWindowFromItem(
        item,
        extensionDuration,
        extensionType,
      );

      if (!extensionWindow) {
        return res.status(400).json({
          available: false,
          message: "This item has no valid checkout date to extend.",
        });
      }

      availabilityItem = {
        accommodation_id: extensionWindow.accommodation_id,
        check_in_date: extensionWindow.check_in_date,
        check_in_time: extensionWindow.check_in_time,
        check_out_date: extensionWindow.check_out_date,
        check_out_time: extensionWindow.check_out_time,
      };

      ignoreReservationId = reservationId;
      accommodationName = item.accommodation_name || accommodationName;
    } else {
      const accommodationId = Number(req.body.accommodation_id || 0);
      const slotType = normalizeText(req.body.slot_type || "day_tour");
      const checkInDate = normalizeText(req.body.check_in_date);
      const requestedStayDuration = Math.max(
        1,
        Math.min(5, Math.floor(toNumber(req.body.stay_duration, 1))),
      );

      if (
        !accommodationId ||
        !checkInDate ||
        !["day_tour", "night", "day_extended", "night_extended"].includes(slotType)
      ) {
        return res.status(400).json({
          available: false,
          message: "Please select accommodation, slot, date, and duration.",
        });
      }

      const stayDuration = ["day_extended", "night_extended"].includes(slotType)
        ? requestedStayDuration
        : 1;

      if (["day_tour", "night"].includes(slotType) && requestedStayDuration > 1) {
        return res.status(400).json({
          available: false,
          message: "Day Tour add-ons are limited to 1 day only.",
        });
      }

      const accommodationMap = await getAccommodationsMapByIds([
        accommodationId,
      ]);
      const accommodation = accommodationMap[accommodationId];

      if (!accommodation) {
        return res.status(404).json({
          available: false,
          message: "Selected accommodation was not found.",
        });
      }

      if (String(accommodation.status || "").toLowerCase() !== "available") {
        return res.status(400).json({
          available: false,
          message: `${accommodation.name} is currently unavailable.`,
        });
      }

      const slotConfig = buildSlotConfig(accommodation, slotType);

      const checkOutDate = buildCheckOutDate(
        checkInDate,
        slotConfig.start_time,
        slotConfig.end_time,
        stayDuration,
      );

      availabilityItem = {
        accommodation_id: accommodation.id,
        check_in_date: checkInDate,
        check_in_time: slotConfig.start_time,
        check_out_date: checkOutDate,
        check_out_time: slotConfig.end_time,
      };

      accommodationName = accommodation.name || accommodationName;
    }

    if (isScheduleWindowAlreadyEnded(availabilityItem)) {
      return res.status(200).json({
        available: false,
        message: getScheduleEndedMessage(accommodationName),
        schedule: availabilityItem,
      });
    }

    const connection = await db.promise().getConnection();

    try {
      await checkReservationConflicts(
        connection,
        [availabilityItem],
        ignoreReservationId,
      );
    } finally {
      connection.release();
    }

    return res.status(200).json({
      available: true,
      message: `${accommodationName} is available for the selected schedule.`,
      schedule: availabilityItem,
    });
  } catch (error) {
    if (Number(error.status) === 409) {
      return res.status(200).json({
        available: false,
        message: error.message || "Selected accommodation is not available.",
      });
    }

    console.error("checkItemAvailability error:", error);

    return res.status(error.status || 500).json({
      available: false,
      message: error.message || "Failed to check availability.",
      error: error.message,
    });
  }
};

// ============================================================
// BACKEND/API HANDLER: Add accommodation to reservation
// Purpose: Handles the add accommodation to reservation part of this file.
// ============================================================
exports.addAccommodationToReservation = async (req, res) => {
  const connection = await db.promise().getConnection();

  try {
    const reservationId = Number(req.params.id);
    const accommodationId = Number(req.body.accommodation_id);
    const slotType = normalizeText(req.body.slot_type || "day_tour");
    const checkInDate = normalizeText(req.body.check_in_date);
    const requestedStayDuration = Math.max(
      1,
      Math.min(5, Math.floor(toNumber(req.body.stay_duration, 1))),
    );

    if (!reservationId) {
      throw {
        status: 400,
        message: "Reservation ID is required.",
      };
    }

    if (
      !accommodationId ||
      !checkInDate ||
      !["day_tour", "night", "day_extended", "night_extended"].includes(slotType)
    ) {
      throw {
        status: 400,
        message:
          "Please select a valid accommodation, slot type, and reservation date.",
      };
    }

    const stayDuration = ["day_extended", "night_extended"].includes(slotType)
      ? requestedStayDuration
      : 1;

    if (["day_tour", "night"].includes(slotType) && requestedStayDuration > 1) {
      throw {
        status: 400,
        message:
          "Day Tour and Night add-ons are fixed schedules only. Use Day/Night 22 Hours or 23 Hours for multi-day add-ons.",
      };
    }

    await connection.beginTransaction();

    const [reservationRows] = await connection.query(
      `
      SELECT
        id,
        reservation_code,
        reservation_status,
        payment_status,
        is_checked_in,
        accommodation_total,
        required_downpayment,
        paid_amount,
        remaining_balance,
        note
      FROM reservations
      WHERE id = ?
      LIMIT 1
      `,
      [reservationId],
    );

    if (!reservationRows.length) {
      throw {
        status: 404,
        message: "Reservation not found.",
      };
    }

    const reservation = reservationRows[0];
    const reservationStatus = String(
      reservation.reservation_status || "",
    ).toLowerCase();

    if (["cancelled", "rejected", "completed"].includes(reservationStatus)) {
      throw {
        status: 400,
        message:
          "Cannot add accommodation to a cancelled, rejected, or completed reservation.",
      };
    }

    if (reservationStatus !== "approved") {
      throw {
        status: 400,
        message: "Only approved reservations can receive onsite add-ons.",
      };
    }

    if (Number(reservation.is_checked_in || 0) !== 1) {
      throw {
        status: 400,
        message:
          "Guest must be checked in before adding an onsite accommodation.",
      };
    }

    const accommodationMap = await getAccommodationsMapByIds([accommodationId]);
    const accommodation = accommodationMap[accommodationId];

    if (!accommodation) {
      throw {
        status: 404,
        message: "Selected accommodation was not found.",
      };
    }

    if (String(accommodation.status || "").toLowerCase() !== "available") {
      throw {
        status: 400,
        message: `${accommodation.name} is currently unavailable.`,
      };
    }

    const slotConfig = buildSlotConfig(accommodation, slotType);
    const checkOutDate = buildCheckOutDate(
      checkInDate,
      slotConfig.start_time,
      slotConfig.end_time,
      stayDuration,
    );

    const newItem = {
      accommodation_id: accommodation.id,
      slot_type: slotType,
      slot_label: slotConfig.slot_label,
      stay_duration: stayDuration,
      check_in_date: checkInDate,
      check_in_time: slotConfig.start_time,
      check_out_date: checkOutDate,
      check_out_time: slotConfig.end_time,
      item_price: Number(slotConfig.price || 0) * stayDuration,
    };

    if (isScheduleWindowAlreadyEnded(newItem)) {
      throw {
        status: 400,
        message: getScheduleEndedMessage(accommodation.name),
      };
    }

    await checkReservationConflicts(connection, [newItem]);

    await connection.query(
      `
      INSERT INTO reservation_items (
        reservation_id,
        accommodation_id,
        slot_type,
        slot_label,
        stay_duration,
        check_in_date,
        check_in_time,
        check_out_date,
        check_out_time,
        item_price
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        reservationId,
        newItem.accommodation_id,
        newItem.slot_type,
        newItem.slot_label,
        newItem.stay_duration,
        newItem.check_in_date,
        newItem.check_in_time,
        newItem.check_out_date,
        newItem.check_out_time,
        newItem.item_price,
      ],
    );

    const oldAccommodationTotal = Number(reservation.accommodation_total || 0);
    const oldPaidAmount = Number(reservation.paid_amount || 0);
    const oldRemainingBalance = Number(reservation.remaining_balance || 0);

    const newAccommodationTotal = oldAccommodationTotal + newItem.item_price;
    const newPaidAmount = oldPaidAmount + newItem.item_price;
    const newRemainingBalance = Math.max(oldRemainingBalance, 0);
    const newRequiredDownpayment = newAccommodationTotal * 0.5;

    const addOnNote =
      `Onsite add-on: ${accommodation.name} - ${newItem.slot_label}` +
      ` (${newItem.check_in_date} ${newItem.check_in_time} to ${newItem.check_out_date} ${newItem.check_out_time})` +
      `, Stay Duration: ${newItem.stay_duration} ${newItem.slot_type === "night" ? "night(s)" : "day(s)"}, Cash Paid: ₱${newItem.item_price.toFixed(2)}`;

    const updatedNote = [reservation.note, addOnNote]
      .filter(Boolean)
      .join(" | ");

    await connection.query(
      `
      UPDATE reservations
      SET
        accommodation_total = ?,
        required_downpayment = ?,
        paid_amount = ?,
        remaining_balance = ?,
        payment_status = ?,
        note = ?
      WHERE id = ?
      `,
      [
        newAccommodationTotal,
        newRequiredDownpayment,
        newPaidAmount,
        newRemainingBalance,
        newRemainingBalance > 0 ? "partially_paid" : "paid",
        updatedNote,
        reservationId,
      ],
    );

    await connection.commit();

    return res.status(201).json({
      message: "Accommodation added to active reservation successfully.",
      reservationId,
      accommodation_name: accommodation.name,
      slot_label: newItem.slot_label,
      stay_duration: newItem.stay_duration,
      check_in_date: newItem.check_in_date,
      check_in_time: newItem.check_in_time,
      check_out_date: newItem.check_out_date,
      check_out_time: newItem.check_out_time,
      item_price: newItem.item_price,
      accommodation_total: newAccommodationTotal,
      paid_amount: newPaidAmount,
      remaining_balance: newRemainingBalance,
    });
  } catch (error) {
    await connection.rollback();

    console.error("addAccommodationToReservation error:", error);

    return res.status(error.status || 500).json({
      message: error.message || "Failed to add accommodation.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// ============================================================
// BACKEND/API HANDLER: Extend reservation item
// Purpose:
// - Allows front desk to extend the same accommodation if no conflict exists
// - Extension is recorded as onsite cash paid
// - Updates receipt/reports through reservation_items and reservation totals
// ============================================================
exports.extendReservationItem = async (req, res) => {
  const connection = await db.promise().getConnection();

  try {
    const reservationId = Number(req.params.id);
    const reservationItemId = Number(
      req.body.reservation_item_id || req.body.item_id || 0,
    );
    const extensionType = normalizeExtensionType(req.body.extension_type);
    const extensionDuration = Math.max(
      1,
      Math.min(
        5,
        Math.floor(
          toNumber(req.body.extension_duration || req.body.stay_duration, 1),
        ),
      ),
    );

    if (!reservationId) {
      throw {
        status: 400,
        message: "Reservation ID is required.",
      };
    }

    if (!reservationItemId) {
      throw {
        status: 400,
        message: "Please select the accommodation item to extend.",
      };
    }

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT
        r.id AS reservation_id,
        r.reservation_code,
        r.reservation_status,
        r.payment_status,
        r.is_checked_in,
        r.accommodation_total,
        r.required_downpayment,
        r.paid_amount,
        r.remaining_balance,
        r.note,

        ri.id AS reservation_item_id,
        ri.accommodation_id,
        ri.slot_type,
        ri.slot_label,
        COALESCE(ri.stay_duration, 1) AS stay_duration,
        ri.check_in_date,
        ri.check_in_time,
        ri.check_out_date,
        ri.check_out_time,
        ri.item_price,

        a.name AS accommodation_name,
        a.status AS accommodation_status,
        a.day_price,
        a.overnight_price,
        a.extended_price,
        a.day_start_time,
        a.day_end_time,
        a.overnight_start_time,
        a.overnight_end_time,
        a.extended_start_time,
        a.extended_end_time,
        c.name AS category_name
      FROM reservation_items ri
      INNER JOIN reservations r ON ri.reservation_id = r.id
      INNER JOIN accommodations a ON ri.accommodation_id = a.id
      INNER JOIN accommodation_categories c ON a.category_id = c.id
      WHERE r.id = ? AND ri.id = ?
      LIMIT 1
      `,
      [reservationId, reservationItemId],
    );

    if (!rows.length) {
      throw {
        status: 404,
        message:
          "Selected accommodation item was not found for this reservation.",
      };
    }

    const item = rows[0];
    const reservationStatus = String(
      item.reservation_status || "",
    ).toLowerCase();

    if (["cancelled", "completed", "rejected"].includes(reservationStatus)) {
      throw {
        status: 400,
        message: "This reservation can no longer be extended.",
      };
    }

    if (reservationStatus !== "approved") {
      throw {
        status: 400,
        message: "Only approved reservations can be extended.",
      };
    }

    if (Number(item.is_checked_in || 0) !== 1) {
      throw {
        status: 400,
        message: "Guest must be checked in before extending stay.",
      };
    }

    const paymentStatus = String(item.payment_status || "").toLowerCase();

    if (!["partially_paid", "paid"].includes(paymentStatus)) {
      throw {
        status: 400,
        message: "Reservation payment must be verified before extending stay.",
      };
    }

    const oldCheckOutDate = toDateOnlyString(item.check_out_date);
    const oldCheckOutTime = String(item.check_out_time || "00:00:00");
    const extensionWindowDetails = buildExtensionWindowFromItem(
      item,
      extensionDuration,
      extensionType,
    );

    if (!extensionWindowDetails) {
      throw {
        status: 400,
        message: "This reservation item has no valid checkout date to extend.",
      };
    }

    const newCheckOutDate = extensionWindowDetails.check_out_date;
    const newCheckOutTime = extensionWindowDetails.check_out_time;

    const extensionWindow = {
      accommodation_id: extensionWindowDetails.accommodation_id,
      check_in_date: extensionWindowDetails.check_in_date,
      check_in_time: extensionWindowDetails.check_in_time,
      check_out_date: extensionWindowDetails.check_out_date,
      check_out_time: extensionWindowDetails.check_out_time,
    };

    if (isScheduleWindowAlreadyEnded(extensionWindow)) {
      throw {
        status: 400,
        message: getScheduleEndedMessage(item.accommodation_name),
      };
    }

    await checkReservationConflicts(
      connection,
      [extensionWindow],
      reservationId,
    );

    const extensionFee = getExtensionFeeFromItem(
      item,
      extensionWindowDetails.extension_duration,
      extensionWindowDetails.extension_type,
    );

    const oldStayDuration = Math.max(1, Number(item.stay_duration || 1));
    const addedStayDuration = ["overnight_half", "day_half"].includes(
      normalizeExtensionType(extensionType),
    )
      ? 1
      : extensionDuration;
    const newStayDuration = oldStayDuration + addedStayDuration;
    const newItemPrice = Number(item.item_price || 0) + extensionFee;

    const oldAccommodationTotal = Number(item.accommodation_total || 0);
    const oldPaidAmount = Number(item.paid_amount || 0);
    const oldRemainingBalance = Number(item.remaining_balance || 0);

    const newAccommodationTotal = oldAccommodationTotal + extensionFee;
    const newPaidAmount = oldPaidAmount + extensionFee;
    const newRemainingBalance = Math.max(oldRemainingBalance, 0);
    const newRequiredDownpayment = newAccommodationTotal * 0.5;

    await connection.query(
      `
      UPDATE reservation_items
      SET
        stay_duration = ?,
        check_out_date = ?,
        check_out_time = ?,
        item_price = ?
      WHERE id = ? AND reservation_id = ?
      `,
      [
        newStayDuration,
        newCheckOutDate,
        newCheckOutTime,
        newItemPrice,
        reservationItemId,
        reservationId,
      ],
    );

    const unitLabel = getExtensionUnitText(extensionType, addedStayDuration);
    const extensionNote =
      `Onsite stay extension: ${item.accommodation_name} - ${item.slot_label}` +
      `, Added ${addedStayDuration} ${unitLabel}` +
      ` (${oldCheckOutDate} ${oldCheckOutTime} to ${newCheckOutDate} ${newCheckOutTime})` +
      `, Cash Paid: ₱${extensionFee.toFixed(2)}`;

    const updatedNote = [item.note, extensionNote].filter(Boolean).join(" | ");

    await connection.query(
      `
      UPDATE reservations
      SET
        accommodation_total = ?,
        required_downpayment = ?,
        paid_amount = ?,
        remaining_balance = ?,
        payment_status = ?,
        note = ?
      WHERE id = ?
      `,
      [
        newAccommodationTotal,
        newRequiredDownpayment,
        newPaidAmount,
        newRemainingBalance,
        newRemainingBalance > 0 ? "partially_paid" : "paid",
        updatedNote,
        reservationId,
      ],
    );

    await connection.commit();

    return res.status(200).json({
      message:
        "Stay extended successfully. Extension was recorded as cash paid.",
      reservationId,
      reservation_item_id: reservationItemId,
      accommodation_name: item.accommodation_name,
      slot_label: item.slot_label,
      extension_type: extensionType,
      extension_duration: addedStayDuration,
      added_unit: unitLabel,
      old_check_out_date: oldCheckOutDate,
      old_check_out_time: oldCheckOutTime,
      new_check_out_date: newCheckOutDate,
      new_check_out_time: newCheckOutTime,
      extension_fee: extensionFee,
      accommodation_total: newAccommodationTotal,
      paid_amount: newPaidAmount,
      remaining_balance: newRemainingBalance,
    });
  } catch (error) {
    await connection.rollback();

    console.error("extendReservationItem error:", error);

    return res.status(error.status || 500).json({
      message: error.message || "Failed to extend stay.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// ============================================================
// BACKEND/API HANDLER: Request booking modification
// Purpose: Handles the request booking modification part of this file.
// ============================================================
exports.requestBookingModification = async (req, res) => {
  const connection = await db.promise().getConnection();

  try {
    const { id } = req.params;

    const {
      user_id,
      requested_check_in_date,
      requested_slot_type,
      requested_guest_count,
      requested_note,
    } = req.body;

    const cleanUserId = Number(user_id);
    const reservationId = Number(id);
    const cleanRequestedDate = requested_check_in_date || null;
    const cleanRequestedSlot = requested_slot_type || null;
    const cleanRequestedGuestCount = requested_guest_count
      ? Number(requested_guest_count)
      : null;
    const cleanRequestedNote = String(requested_note || "").trim();

    if (!reservationId) {
      return res.status(400).json({
        message: "Reservation ID is required.",
      });
    }

    if (!cleanUserId) {
      return res.status(400).json({
        message: "User ID is required.",
      });
    }

    if (
      !cleanRequestedDate &&
      !cleanRequestedSlot &&
      !cleanRequestedGuestCount &&
      !cleanRequestedNote
    ) {
      return res.status(400).json({
        message: "Please enter at least one requested change.",
      });
    }

    if (
      cleanRequestedSlot &&
      !["day_tour", "night", "day_extended", "night_extended"].includes(cleanRequestedSlot)
    ) {
      return res.status(400).json({
        message: "Invalid requested slot type.",
      });
    }

    if (
      cleanRequestedGuestCount !== null &&
      (!Number.isFinite(cleanRequestedGuestCount) ||
        cleanRequestedGuestCount < 1)
    ) {
      return res.status(400).json({
        message: "Guest count must be at least 1.",
      });
    }

    await connection.beginTransaction();

    const [reservationRows] = await connection.query(
      `
      SELECT
        r.id,
        r.user_id,
        r.guest_count,
        r.accommodation_total,
        r.required_downpayment,
        r.paid_amount,
        r.remaining_balance,
        r.reservation_status,
        r.note,
        MIN(ri.check_in_date) AS check_in_date
      FROM reservations r
      LEFT JOIN reservation_items ri ON r.id = ri.reservation_id
      WHERE r.id = ?
        AND r.user_id = ?
      GROUP BY r.id
      LIMIT 1
      `,
      [reservationId, cleanUserId],
    );

    if (!reservationRows.length) {
      throw {
        status: 404,
        message: "Reservation not found.",
      };
    }

    const reservation = reservationRows[0];
    const status = String(reservation.reservation_status || "").toLowerCase();

    if (["cancelled", "rejected", "completed"].includes(status)) {
      throw {
        status: 400,
        message: "This reservation can no longer be modified.",
      };
    }

    if (!reservation.check_in_date) {
      throw {
        status: 400,
        message: "This reservation has no valid check-in date.",
      };
    }

    const checkInDate = new Date(reservation.check_in_date);
    const today = new Date();

    checkInDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const daysBeforeCheckIn = Math.floor(
      (checkInDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
    );

    if (daysBeforeCheckIn < 1) {
      throw {
        status: 400,
        message: "Modification is only allowed at least 1 day before check-in.",
      };
    }

    const [currentItems] = await connection.query(
      `
      SELECT
        ri.id,
        ri.reservation_id,
        ri.accommodation_id,
        ri.slot_type,
        COALESCE(ri.stay_duration, 1) AS stay_duration,
        ri.check_in_date,
        a.category_id,
        c.name AS category_name,
        a.name,
        a.description,
        a.max_capacity,
        a.free_entrance_pax,
        a.image,
        a.map_label,
        a.status,
        a.day_price,
        a.overnight_price,
        a.extended_price,
        a.day_start_time,
        a.day_end_time,
        a.overnight_start_time,
        a.overnight_end_time,
        a.extended_start_time,
        a.extended_end_time
      FROM reservation_items ri
      INNER JOIN accommodations a ON ri.accommodation_id = a.id
      INNER JOIN accommodation_categories c ON a.category_id = c.id
      WHERE ri.reservation_id = ?
      ORDER BY ri.id ASC
      `,
      [reservationId],
    );

    if (!currentItems.length) {
      throw {
        status: 400,
        message: "This reservation has no accommodation items to update.",
      };
    }

    const updatedItems = [];
    let accommodationTotal = 0;

    for (const currentItem of currentItems) {
      const slotType = cleanRequestedSlot || currentItem.slot_type;
      const checkInDateValue = cleanRequestedDate || currentItem.check_in_date;
      const stayDuration = ["day_extended", "night_extended"].includes(slotType)
        ? Math.max(1, Math.min(5, Number(currentItem.stay_duration || 1)))
        : 1;
      const slotConfig = buildSlotConfig(currentItem, slotType);
      const checkOutDate = buildCheckOutDate(
        checkInDateValue,
        slotConfig.start_time,
        slotConfig.end_time,
        stayDuration,
      );

      updatedItems.push({
        item_id: currentItem.id,
        accommodation_id: currentItem.accommodation_id,
        slot_type: slotType,
        slot_label: slotConfig.slot_label,
        stay_duration: stayDuration,
        check_in_date: checkInDateValue,
        check_in_time: slotConfig.start_time,
        check_out_date: checkOutDate,
        check_out_time: slotConfig.end_time,
        item_price: slotConfig.price * stayDuration,
      });

      accommodationTotal += slotConfig.price * stayDuration;
    }

    await checkReservationConflicts(connection, updatedItems, reservationId);

    for (const item of updatedItems) {
      await connection.query(
        `
        UPDATE reservation_items
        SET
          slot_type = ?,
          slot_label = ?,
          stay_duration = ?,
          check_in_date = ?,
          check_in_time = ?,
          check_out_date = ?,
          check_out_time = ?,
          item_price = ?
        WHERE id = ?
          AND reservation_id = ?
        `,
        [
          item.slot_type,
          item.slot_label,
          item.stay_duration,
          item.check_in_date,
          item.check_in_time,
          item.check_out_date,
          item.check_out_time,
          item.item_price,
          item.item_id,
          reservationId,
        ],
      );
    }

    const paidAmount = Number(reservation.paid_amount || 0);
    const requiredDownpayment = accommodationTotal * 0.5;
    const remainingBalance = Math.max(accommodationTotal - paidAmount, 0);

    const noteParts = [];

    if (reservation.note) {
      noteParts.push(reservation.note);
    }

    if (cleanRequestedNote) {
      noteParts.push(`Customer Modification Note: ${cleanRequestedNote}`);
    }

    noteParts.push(
      `Modification applied by customer on ${new Date().toLocaleString("en-US")}`,
    );

    await connection.query(
      `
      UPDATE reservations
      SET
        guest_count = ?,
        accommodation_total = ?,
        required_downpayment = ?,
        remaining_balance = ?,
        note = ?
      WHERE id = ?
        AND user_id = ?
      `,
      [
        cleanRequestedGuestCount || reservation.guest_count,
        accommodationTotal,
        requiredDownpayment,
        remainingBalance,
        noteParts.join(" | "),
        reservationId,
        cleanUserId,
      ],
    );

    await connection.commit();

    return res.status(200).json({
      message: "Reservation updated successfully.",
    });
  } catch (error) {
    await connection.rollback();

    console.error("requestBookingModification error:", error);

    return res.status(error.status || 500).json({
      message: error.message || "Failed to update reservation.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};
