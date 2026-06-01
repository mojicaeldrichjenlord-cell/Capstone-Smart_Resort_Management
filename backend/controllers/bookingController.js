const db = require("../config/db");
const fs = require("fs");

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeNullableText(value) {
  const text = String(value || "").trim();
  return text ? text : null;
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

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

  let proofImageData = null;

  if (req.file && req.file.path) {
    const fileBuffer = fs.readFileSync(req.file.path);
    const mimeType = req.file.mimetype || "image/jpeg";
    proofImageData = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
  }

  const proofReference = normalizeNullableText(
    parsedBody.proof_reference || parsedBody.proof_of_payment,
  );

  return {
    ...parsedBody,
    proof_reference: proofReference,
    proof_of_payment: uploadedProofPath || proofReference,
    proof_image_data: proofImageData,
  };
}

async function generateReservationCode(connection) {
  const now = new Date();
  const month = getMonthAbbrev(now);
  const day = String(now.getDate()).padStart(2, "0");
  const prefix = `${month}-${day}`;

  const [rows] = await connection.query(
    `
    SELECT reservation_code
    FROM reservations
    WHERE DATE(reserved_at) = CURDATE()
    ORDER BY id DESC
    LIMIT 1
    `,
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

  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
}

function getEntranceRate(entranceType, hasOvernight) {
  const type = String(entranceType || "pool_beach").toLowerCase();

  if (type === "beach_only") {
    return hasOvernight ? 200 : 150;
  }

  return hasOvernight ? 300 : 250;
}

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

function buildSlotConfig(accommodation, slotType) {
  const categoryName = String(accommodation.category_name || "").toLowerCase();
  const isRoom = categoryName === "room";

  const labels = {
    day_tour: "Day Tour",
    overnight: "Overnight",
    extended: isRoom ? "22 Hours" : "23 Hours",
  };

  if (slotType === "day_tour") {
    return {
      slot_label: labels.day_tour,
      price: Number(accommodation.day_price || 0),
      start_time: accommodation.day_start_time,
      end_time: accommodation.day_end_time,
    };
  }

  if (slotType === "overnight") {
    return {
      slot_label: labels.overnight,
      price: Number(accommodation.overnight_price || 0),
      start_time: accommodation.overnight_start_time,
      end_time: accommodation.overnight_end_time,
    };
  }

  return {
    slot_label: labels.extended,
    price: Number(accommodation.extended_price || 0),
    start_time: accommodation.extended_start_time,
    end_time: accommodation.extended_end_time,
  };
}

function buildCheckOutDate(checkInDate, startTime, endTime) {
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

  if (endMinutes <= startMinutes) {
    const date = new Date(checkInDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  }

  return checkInDate;
}

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
    proof_of_payment,
    proof_image_data,
    proof_reference,
    items,
  } = body;

  const cleanFirstName = normalizeText(first_name);
  const cleanMiddleName = normalizeNullableText(middle_name);
  const cleanLastName = normalizeText(last_name);
  const cleanContactNo = normalizeText(contact_no);
  const cleanEntranceType = normalizeText(entrance_type || "pool_beach");
  const cleanNote = normalizeNullableText(note);
  const cleanPaymentMethod = normalizeText(payment_method || "gcash");
  const cleanProof = normalizeNullableText(proof_of_payment);
  const cleanProofImageData = normalizeNullableText(proof_image_data);
  const cleanProofReference = normalizeText(proof_reference);
  const cleanPaymentType = normalizeText(payment_type || "downpayment");
  const totalGuests = toNumber(guest_count, 0);
  const isManualReservation = source === "manual";

  if (!cleanFirstName || !cleanLastName || !cleanContactNo || !totalGuests) {
    throw {
      status: 400,
      message: "Please fill in all required guest information fields.",
    };
  }

  if (!Array.isArray(items) || !items.length) {
    throw {
      status: 400,
      message: "Please add at least one accommodation item.",
    };
  }

  if (!isManualReservation) {
    if (!cleanProofReference) {
      throw {
        status: 400,
        message: "Reference number is required.",
      };
    }

    if (!cleanProof && !cleanProofImageData) {
      throw {
        status: 400,
        message: "Payment proof or reference is required.",
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

    if (
      !accommodationId ||
      !checkInDate ||
      !["day_tour", "overnight", "extended"].includes(slotType)
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

    const checkOutDate = buildCheckOutDate(
      checkInDate,
      slotConfig.start_time,
      slotConfig.end_time,
    );

    reservationItems.push({
      accommodation_id: accommodation.id,
      slot_type: slotType,
      slot_label: slotConfig.slot_label,
      check_in_date: checkInDate,
      check_in_time: slotConfig.start_time,
      check_out_date: checkOutDate,
      check_out_time: slotConfig.end_time,
      item_price: slotConfig.price,
    });

    accommodationTotal += slotConfig.price;

    if (slotType === "overnight" || slotType === "extended") {
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

  let paidAmount = requiredDownpayment;
  let remainingBalance = accommodationTotal - requiredDownpayment;
  let reservationStatus = "approved";
  let paymentStatus = "partially_paid";

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
    if (cleanPaymentType === "full") {
      paidAmount = accommodationTotal;
      remainingBalance = 0;
      reservationStatus = "approved";
      paymentStatus = "paid";
      noteParts.push("Manual Reservation Payment Type: Full Payment");
    } else {
      paidAmount = requiredDownpayment;
      remainingBalance = accommodationTotal - paidAmount;
      reservationStatus = "approved";
      paymentStatus = "partially_paid";
      noteParts.push("Manual Reservation Payment Type: 50% Down Payment");
    }

    if (cleanProofReference) {
      noteParts.push(`Reference Number: ${cleanProofReference}`);
    }
  } else {
    noteParts.push(`Reference Number: ${cleanProofReference}`);
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
        reserved_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        reservationCode,
        user_id,
        source,
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
      ],
    );

    const reservationId = reservationResult.insertId;

    for (const item of reservationItems) {
      await connection.query(
        `
        INSERT INTO reservation_items (
          reservation_id,
          accommodation_id,
          slot_type,
          slot_label,
          check_in_date,
          check_in_time,
          check_out_date,
          check_out_time,
          item_price
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          reservationId,
          item.accommodation_id,
          item.slot_type,
          item.slot_label,
          item.check_in_date,
          item.check_in_time,
          item.check_out_date,
          item.check_out_time,
          item.item_price,
        ],
      );
    }

    await connection.commit();

    return {
      reservationId,
      reservationCode,
      requiredDownpayment,
      estimatedEntranceFee,
      accommodationTotal,
      totalFreeEntrancePax,
      chargeableEntranceGuests,
      message: isManualReservation
        ? "Manual reservation created successfully."
        : "Reservation approved successfully. Your downpayment is recorded as partially paid.",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

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
    });
  } catch (error) {
    console.error("createBooking error:", error);

    return res.status(error.status || 500).json({
      message: error.message || "Failed to create reservation.",
      error: error.message,
    });
  }
};

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
    });
  } catch (error) {
    console.error("createWalkInBooking error:", error);

    return res.status(error.status || 500).json({
      message: error.message || "Failed to create manual reservation.",
      error: error.message,
    });
  }
};

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
      guests: row.guest_count,
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
    booking.guests = booking.guest_count;
    booking.free_entrance_pax = totalFreeEntrancePax;
    booking.chargeable_entrance_guests = Math.max(
      Number(booking.guest_count || 0) - totalFreeEntrancePax,
      0,
    );
    booking.room_name =
      booking.accommodation_list || booking.room_name || "N/A";
    booking.items = items;

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
        )
      `;
      dateParams.push(startDate, endDate, startDate, endDate, startDate, endDate);
    } else if (scope === "dashboard_today") {
      dateWhereClause = `
        WHERE (
          DATE(CONVERT_TZ(r.created_at, '+00:00', '+08:00')) =
            DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
          OR DATE(CONVERT_TZ(r.checked_in_at, '+00:00', '+08:00')) =
            DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
          OR DATE(CONVERT_TZ(r.extra_bed_paid_at, '+00:00', '+08:00')) =
            DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
          OR (
            first_item.check_in_date <= DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
            AND first_item.check_out_date >= DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'))
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
      guests: row.guest_count,
      room_name: row.accommodation_list || row.room_name || "N/A",
    }));

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

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const allowedPaymentStatuses = [
      "unpaid",
      "pending",
      "paid",
      "partially_paid",
      "rejected",
    ];

    if (
      !allowedPaymentStatuses.includes(String(payment_status).toLowerCase())
    ) {
      return res.status(400).json({
        message: "Invalid payment status.",
      });
    }

    const [rows] = await db
      .promise()
      .query(
        `SELECT id, accommodation_total FROM reservations WHERE id = ? LIMIT 1`,
        [id],
      );

    if (!rows.length) {
      return res.status(404).json({
        message: "Reservation not found.",
      });
    }

    let paidAmount = 0;

    if (String(payment_status).toLowerCase() === "paid") {
      paidAmount = Number(rows[0].accommodation_total || 0);
    } else if (String(payment_status).toLowerCase() === "partially_paid") {
      paidAmount = Number(rows[0].accommodation_total || 0) * 0.5;
    }

    const remainingBalance =
      Number(rows[0].accommodation_total || 0) - paidAmount;

    await db.promise().query(
      `
      UPDATE reservations
      SET payment_status = ?, paid_amount = ?, remaining_balance = ?
      WHERE id = ?
      `,
      [payment_status, paidAmount, remainingBalance, id],
    );

    return res.status(200).json({
      message: "Payment status updated successfully.",
    });
  } catch (error) {
    console.error("updatePaymentStatus error:", error);

    return res.status(500).json({
      message: "Failed to update payment status.",
      error: error.message,
    });
  }
};


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
      !["day_tour", "overnight", "extended"].includes(cleanRequestedSlot)
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
      const slotConfig = buildSlotConfig(currentItem, slotType);
      const checkOutDate = buildCheckOutDate(
        checkInDateValue,
        slotConfig.start_time,
        slotConfig.end_time,
      );

      updatedItems.push({
        item_id: currentItem.id,
        accommodation_id: currentItem.accommodation_id,
        slot_type: slotType,
        slot_label: slotConfig.slot_label,
        check_in_date: checkInDateValue,
        check_in_time: slotConfig.start_time,
        check_out_date: checkOutDate,
        check_out_time: slotConfig.end_time,
        item_price: slotConfig.price,
      });

      accommodationTotal += slotConfig.price;
    }

    await checkReservationConflicts(connection, updatedItems, reservationId);

    for (const item of updatedItems) {
      await connection.query(
        `
        UPDATE reservation_items
        SET
          slot_type = ?,
          slot_label = ?,
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
