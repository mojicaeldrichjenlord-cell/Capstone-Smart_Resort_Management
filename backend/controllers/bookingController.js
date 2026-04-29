const db = require("../config/db");

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

  const proofReference = normalizeNullableText(
    parsedBody.proof_reference || parsedBody.proof_of_payment
  );

  return {
    ...parsedBody,
    proof_reference: proofReference,
    proof_of_payment: uploadedProofPath || proofReference,
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
    `
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
    uniqueIds
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
    [reservationId]
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

    if (!cleanProof) {
      throw {
        status: 400,
        message: "Payment proof or reference is required.",
      };
    }
  }

  const accommodationMap = await getAccommodationsMapByIds(
    items.map((item) => item.accommodation_id)
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
      slotConfig.end_time
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
    totalGuests
  );

  const chargeableEntranceGuests = Math.max(totalGuests - totalFreeEntrancePax, 0);

  const estimatedEntranceFee =
    getEntranceRate(cleanEntranceType, hasOvernightStyle) * chargeableEntranceGuests;

  const requiredDownpayment = accommodationTotal * 0.5;

  let paidAmount = 0;
  let remainingBalance = accommodationTotal;
  let reservationStatus = autoApprove ? "approved" : "pending";
  let paymentStatus = autoApprove ? "paid" : "pending";

  const noteParts = [];

  noteParts.push(
    `Entrance Type: ${
      cleanEntranceType === "beach_only" ? "Beach Only" : "Pool & Beach"
    }`
  );

  noteParts.push(`Free Entrance Included: ${totalFreeEntrancePax} pax`);
  noteParts.push(`Chargeable Entrance Guests: ${chargeableEntranceGuests}`);
  noteParts.push(
    "Discount reminder: Senior/PWD/Kids discount will be verified at the front desk."
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
        reserved_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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
      ]
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
        ]
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
        : "Reservation submitted successfully. Please wait for admin payment review.",
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
        r.note,
        r.payment_method,
        r.payment_status,
        r.reservation_status AS status,
        r.proof_of_payment,
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
      [userId]
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
      `SELECT id, reservation_status FROM reservations WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Reservation not found.",
      });
    }

    const reservation = rows[0];

    if (String(reservation.reservation_status).toLowerCase() !== "pending") {
      return res.status(400).json({
        message: "Only pending reservations can be cancelled.",
      });
    }

    await db.promise().query(
      `UPDATE reservations SET reservation_status = 'cancelled' WHERE id = ?`,
      [id]
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
        r.note,
        r.payment_method,
        r.payment_status,
        r.reservation_status AS status,
        r.proof_of_payment,
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
      [id]
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
      Number(booking.guest_count || 0)
    );

    booking.fullname = [booking.first_name, booking.middle_name, booking.last_name]
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
      0
    );
    booking.room_name = booking.accommodation_list || booking.room_name || "N/A";
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
        r.note,
        r.payment_method,
        r.payment_status,
        r.reservation_status AS status,
        r.proof_of_payment,
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
      ORDER BY r.created_at DESC
      `
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

    const [rows] = await db.promise().query(
      `SELECT id FROM reservations WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Reservation not found.",
      });
    }

    await db.promise().query(
      `UPDATE reservations SET reservation_status = ? WHERE id = ?`,
      [status, id]
    );

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

    if (!allowedPaymentStatuses.includes(String(payment_status).toLowerCase())) {
      return res.status(400).json({
        message: "Invalid payment status.",
      });
    }

    const [rows] = await db.promise().query(
      `SELECT id, accommodation_total FROM reservations WHERE id = ? LIMIT 1`,
      [id]
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

    const remainingBalance = Number(rows[0].accommodation_total || 0) - paidAmount;

    await db.promise().query(
      `
      UPDATE reservations
      SET payment_status = ?, paid_amount = ?, remaining_balance = ?
      WHERE id = ?
      `,
      [payment_status, paidAmount, remainingBalance, id]
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