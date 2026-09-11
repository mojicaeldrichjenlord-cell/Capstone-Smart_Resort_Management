const db = require("../config/db");

// ============================================================
// STEP 3F-D: FRONT DESK ADDITIONAL CHARGES
//
// Purpose:
// - Add operational charges for checked-in guests.
// - Supported categories:
//   Damage, Missing Item, Service, Custom.
// - Every new charge starts UNPAID.
// - Multiple different charges are allowed.
// - Exact duplicate unpaid rows are blocked.
// - Paid rows cannot be deleted.
// - Collection is intentionally handled by the NEXT step:
//   Step 3F-E — Collect Unpaid Charges.
//
// Existing booking_charges table is reused.
// System-generated rows such as Extra Guest Charge and
// Extra Bed Charge remain separate from these manual charges.
// ============================================================

const ADDITIONAL_PREFIX = "Additional - ";
const MAX_AMOUNT = 1000000;

const CATEGORY_LABELS = {
  damage: "Damage",
  missing_item: "Missing Item",
  service: "Service",
  custom: "Custom",
};

function normalize(value) {
  return String(value || "").trim();
}

function normalizeLower(value) {
  return normalize(value).toLowerCase();
}

function toMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : NaN;
}

async function getReservation(connection, reservationId, lock = false) {
  const lockSql = lock ? "FOR UPDATE" : "";

  const [rows] = await connection.query(
    `
    SELECT
      id,
      reservation_code,
      reservation_status,
      COALESCE(is_checked_in, 0) AS is_checked_in
    FROM reservations
    WHERE id = ?
    LIMIT 1
    ${lockSql}
    `,
    [reservationId],
  );

  return rows[0] || null;
}

function validateOperationalReservation(reservation) {
  const status = normalizeLower(reservation.reservation_status);

  if (["cancelled", "rejected", "completed"].includes(status)) {
    return "Additional Charges cannot be changed for cancelled, rejected, or completed reservations.";
  }

  if (Number(reservation.is_checked_in || 0) !== 1) {
    return "Additional Charges are only available after the guest is checked in.";
  }

  return null;
}

function buildChargeName(category, customName = "") {
  const key = normalizeLower(category);

  if (!CATEGORY_LABELS[key]) {
    return {
      valid: false,
      message: "Invalid additional charge category.",
    };
  }

  if (key === "custom") {
    const label = normalize(customName);

    if (!label) {
      return {
        valid: false,
        message: "Custom charge name is required.",
      };
    }

    if (label.length > 70) {
      return {
        valid: false,
        message: "Custom charge name must be 70 characters or fewer.",
      };
    }

    return {
      valid: true,
      category: key,
      label,
      chargeName: `${ADDITIONAL_PREFIX}Custom: ${label}`,
    };
  }

  return {
    valid: true,
    category: key,
    label: CATEGORY_LABELS[key],
    chargeName: `${ADDITIONAL_PREFIX}${CATEGORY_LABELS[key]}`,
  };
}

function parseChargeCategory(chargeName) {
  const name = normalize(chargeName);

  if (!name.startsWith(ADDITIONAL_PREFIX)) {
    return {
      category: "unknown",
      category_label: name,
      custom_name: null,
    };
  }

  const suffix = name.slice(ADDITIONAL_PREFIX.length);

  if (suffix === "Damage") {
    return {
      category: "damage",
      category_label: "Damage",
      custom_name: null,
    };
  }

  if (suffix === "Missing Item") {
    return {
      category: "missing_item",
      category_label: "Missing Item",
      custom_name: null,
    };
  }

  if (suffix === "Service") {
    return {
      category: "service",
      category_label: "Service",
      custom_name: null,
    };
  }

  if (suffix.startsWith("Custom: ")) {
    return {
      category: "custom",
      category_label: "Custom",
      custom_name: suffix.slice("Custom: ".length),
    };
  }

  return {
    category: "unknown",
    category_label: suffix || name,
    custom_name: null,
  };
}

async function loadAdditionalChargeRows(connection, reservationId, lock = false) {
  const lockSql = lock ? "FOR UPDATE" : "";

  const [rows] = await connection.query(
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
      AND charge_name LIKE ?
    ORDER BY created_at DESC, id DESC
    ${lockSql}
    `,
    [reservationId, `${ADDITIONAL_PREFIX}%`],
  );

  return rows.map((row) => ({
    ...row,
    ...parseChargeCategory(row.charge_name),
  }));
}

function summarize(rows) {
  const total = rows.reduce(
    (sum, row) => sum + Number(row.charge_amount || 0),
    0,
  );

  const unpaidTotal = rows.reduce(
    (sum, row) =>
      Number(row.is_paid || 0) === 1
        ? sum
        : sum + Number(row.charge_amount || 0),
    0,
  );

  return {
    total_additional_charges: total,
    unpaid_additional_charges: unpaidTotal,
    paid_additional_charges: Math.max(total - unpaidTotal, 0),
    charge_count: rows.length,
    unpaid_count: rows.filter((row) => Number(row.is_paid || 0) !== 1).length,
  };
}

// ============================================================
// GET /api/admin/bookings/:id/additional-charges
// ============================================================

const getAdditionalCharges = async (req, res) => {
  try {
    const reservationId = Number(req.params.id);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation ID.",
      });
    }

    const connection = db.promise();

    const reservation = await getReservation(
      connection,
      reservationId,
      false,
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    const rows = await loadAdditionalChargeRows(
      connection,
      reservationId,
      false,
    );

    return res.status(200).json({
      success: true,
      reservation_id: reservationId,
      reservation_code: reservation.reservation_code,
      charges: rows,
      ...summarize(rows),
    });
  } catch (error) {
    console.error("getAdditionalCharges error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load Additional Charges.",
      error: error.message,
    });
  }
};

// ============================================================
// POST /api/admin/bookings/:id/additional-charges
//
// Body:
// {
//   "category": "damage|missing_item|service|custom",
//   "custom_name": "...",        // required only for custom
//   "charge_amount": 500,
//   "charge_note": "Verified broken table glass"
// }
// ============================================================

const addAdditionalCharge = async (req, res) => {
  const connection = await db.promise().getConnection();

  try {
    const reservationId = Number(req.params.id);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation ID.",
      });
    }

    const categoryResult = buildChargeName(
      req.body.category,
      req.body.custom_name,
    );

    if (!categoryResult.valid) {
      return res.status(400).json({
        success: false,
        message: categoryResult.message,
      });
    }

    const amount = toMoney(req.body.charge_amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Charge amount must be greater than zero.",
      });
    }

    if (amount > MAX_AMOUNT) {
      return res.status(400).json({
        success: false,
        message: "Charge amount is above the allowed limit.",
      });
    }

    const note = normalize(req.body.charge_note);

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "Verification / charge note is required.",
      });
    }

    if (note.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Charge note must be 500 characters or fewer.",
      });
    }

    await connection.beginTransaction();

    const reservation = await getReservation(
      connection,
      reservationId,
      true,
    );

    if (!reservation) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    const validationMessage = validateOperationalReservation(reservation);

    if (validationMessage) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    // Exact duplicate unpaid rows are blocked.
    // This protects against accidental double-click / repeat submission.
    const [duplicateRows] = await connection.query(
      `
      SELECT id
      FROM booking_charges
      WHERE booking_id = ?
        AND LOWER(TRIM(charge_name)) = LOWER(TRIM(?))
        AND charge_amount = ?
        AND LOWER(TRIM(COALESCE(charge_note, ''))) =
            LOWER(TRIM(?))
        AND COALESCE(is_paid, 0) = 0
      LIMIT 1
      FOR UPDATE
      `,
      [
        reservationId,
        categoryResult.chargeName,
        amount,
        note,
      ],
    );

    if (duplicateRows.length) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "An identical unpaid Additional Charge already exists. Change the details if this is a separate charge.",
      });
    }

    const [result] = await connection.query(
      `
      INSERT INTO booking_charges (
        booking_id,
        charge_name,
        charge_amount,
        charge_note,
        is_paid,
        paid_at
      )
      VALUES (?, ?, ?, ?, 0, NULL)
      `,
      [
        reservationId,
        categoryResult.chargeName,
        amount,
        note,
      ],
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Additional Charge added as unpaid.",
      charge: {
        id: result.insertId,
        booking_id: reservationId,
        charge_name: categoryResult.chargeName,
        charge_amount: amount,
        charge_note: note,
        is_paid: 0,
        paid_at: null,
        category: categoryResult.category,
        category_label: categoryResult.label,
        custom_name:
          categoryResult.category === "custom"
            ? categoryResult.label
            : null,
      },
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "addAdditionalCharge rollback error:",
        rollbackError,
      );
    }

    console.error("addAdditionalCharge error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add Additional Charge.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// ============================================================
// DELETE /api/admin/bookings/:id/additional-charges/:chargeId
//
// Only an UNPAID manual Additional Charge can be removed.
// Paid rows are financial history and are preserved.
// ============================================================

const deleteAdditionalCharge = async (req, res) => {
  const connection = await db.promise().getConnection();

  try {
    const reservationId = Number(req.params.id);
    const chargeId = Number(req.params.chargeId);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation ID.",
      });
    }

    if (!Number.isInteger(chargeId) || chargeId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid charge ID.",
      });
    }

    await connection.beginTransaction();

    const reservation = await getReservation(
      connection,
      reservationId,
      true,
    );

    if (!reservation) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    const validationMessage = validateOperationalReservation(reservation);

    if (validationMessage) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    const [rows] = await connection.query(
      `
      SELECT
        id,
        booking_id,
        charge_name,
        COALESCE(is_paid, 0) AS is_paid
      FROM booking_charges
      WHERE id = ?
        AND booking_id = ?
        AND charge_name LIKE ?
      LIMIT 1
      FOR UPDATE
      `,
      [
        chargeId,
        reservationId,
        `${ADDITIONAL_PREFIX}%`,
      ],
    );

    if (!rows.length) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Additional Charge not found.",
      });
    }

    if (Number(rows[0].is_paid || 0) === 1) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Paid Additional Charges cannot be deleted because they are part of the payment history.",
      });
    }

    await connection.query(
      `
      DELETE FROM booking_charges
      WHERE id = ?
        AND booking_id = ?
        AND COALESCE(is_paid, 0) = 0
      `,
      [chargeId, reservationId],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Unpaid Additional Charge removed successfully.",
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "deleteAdditionalCharge rollback error:",
        rollbackError,
      );
    }

    console.error("deleteAdditionalCharge error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove Additional Charge.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getAdditionalCharges,
  addAdditionalCharge,
  deleteAdditionalCharge,
};
