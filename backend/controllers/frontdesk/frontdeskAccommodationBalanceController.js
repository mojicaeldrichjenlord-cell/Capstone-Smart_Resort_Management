const db = require("../../config/db");

const {
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrder,
} = require("../../services/paypalService");

// ============================================================
// PHASE 2 - STEP 2.11B
// FRONT DESK — ACCOMMODATION BALANCE COLLECTION
//
// Scope:
// - Accommodation balance only.
// - Cash / GCash / Maya are staff-confirmed manual collections.
// - PayPal is created/captured through PayPal Sandbox automation.
// - Browser never sends the amount to collect.
// - Backend recalculates accommodation_total - paid_amount.
// - required_downpayment remains historical.
// - Entrance Fee and booking_charges remain separate.
// - Every new balance collection is written to payment_transactions
//   with payment_purpose = 'accommodation_balance'.
// ============================================================

const MONEY_EPSILON = 0.005;
const PAYPAL_CURRENCY = "PHP";
const PAYMENT_PURPOSE = "accommodation_balance";

function normalize(value) {
  return String(value || "").trim();
}

function normalizeLower(value) {
  return normalize(value).toLowerCase();
}

function toMoney(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round((Math.max(amount, 0) + Number.EPSILON) * 100) / 100;
}

function sameMoney(left, right) {
  return Math.abs(toMoney(left) - toMoney(right)) <= MONEY_EPSILON;
}

async function getReservation(connection, reservationId, lock = false) {
  const lockSql = lock ? "FOR UPDATE" : "";

  const [rows] = await connection.query(
    `
    SELECT
      id,
      reservation_code,
      reservation_status,
      payment_status,
      payment_method,
      COALESCE(is_checked_in, 0) AS is_checked_in,
      COALESCE(accommodation_total, 0) AS accommodation_total,
      COALESCE(required_downpayment, 0) AS required_downpayment,
      COALESCE(paid_amount, 0) AS paid_amount,
      COALESCE(remaining_balance, 0) AS remaining_balance
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
  const status = normalizeLower(reservation?.reservation_status);

  if (!reservation) {
    return "Reservation not found.";
  }

  if (["cancelled", "rejected", "completed"].includes(status)) {
    return "Accommodation balance cannot be collected for cancelled, rejected, or completed reservations.";
  }

  if (status !== "approved") {
    return "Only approved reservations can receive onsite accommodation balance collection.";
  }

  if (Number(reservation.is_checked_in || 0) !== 1) {
    return "Accommodation balance can only be collected after the guest is checked in.";
  }

  return null;
}

function buildBalanceSummary(reservation) {
  const accommodationTotal = toMoney(reservation.accommodation_total);
  const paidAmount = toMoney(reservation.paid_amount);
  const storedRemainingBalance = toMoney(reservation.remaining_balance);

  const calculatedRemainingBalance = toMoney(
    Math.max(accommodationTotal - paidAmount, 0),
  );

  const overpaidAmount = toMoney(
    Math.max(paidAmount - accommodationTotal, 0),
  );

  const balanceMismatch =
    Math.abs(storedRemainingBalance - calculatedRemainingBalance) >
    MONEY_EPSILON;

  return {
    reservation_id: Number(reservation.id),
    reservation_code: reservation.reservation_code,
    reservation_status: reservation.reservation_status,
    payment_status: reservation.payment_status,
    payment_method: reservation.payment_method,
    is_checked_in: Number(reservation.is_checked_in || 0),
    accommodation_total: accommodationTotal,
    required_downpayment: toMoney(reservation.required_downpayment),
    paid_amount: paidAmount,
    stored_remaining_balance: storedRemainingBalance,
    remaining_balance: calculatedRemainingBalance,
    overpaid_amount: overpaidAmount,
    balance_mismatch: balanceMismatch,
    settled:
      calculatedRemainingBalance <= MONEY_EPSILON &&
      overpaidAmount <= MONEY_EPSILON,
    payment_methods: ["cash", "gcash", "paymaya", "paypal"],
    collection_scope: {
      accommodation_balance_only: true,
      entrance_fee_included: false,
      booking_charges_included: false,
    },
    note:
      "This workflow collects accommodation balance only. Entrance Fee and onsite booking charges remain separate.",
  };
}

function validateBalanceCanBeCollected(summary) {
  if (summary.overpaid_amount > MONEY_EPSILON) {
    const error = new Error(
      "Paid accommodation amount is already above the accommodation total. Review the reservation before collecting more.",
    );
    error.status = 409;
    throw error;
  }

  if (summary.remaining_balance <= MONEY_EPSILON) {
    const error = new Error(
      "Accommodation balance is already fully settled.",
    );
    error.status = 409;
    error.alreadySettled = true;
    throw error;
  }
}

function normalizeManualPaymentMethod(value) {
  const method = normalizeLower(value);

  if (["cash", "gcash", "paymaya"].includes(method)) {
    return method;
  }

  return "";
}

function normalizeReferenceNumber(value) {
  return normalize(value).replace(/\s+/g, "");
}

async function insertManualBalanceTransaction(
  connection,
  {
    reservationId,
    paymentMethod,
    referenceNumber,
    amount,
  },
) {
  const [result] = await connection.query(
    `
    INSERT INTO payment_transactions (
      reservation_id,
      provider,
      reference_number,
      amount,
      currency,
      payment_method,
      payment_purpose,
      status,
      paid_at
    )
    VALUES (?, 'frontdesk', ?, ?, ?, ?, ?, 'paid', CURRENT_TIMESTAMP)
    `,
    [
      reservationId,
      referenceNumber || null,
      amount,
      PAYPAL_CURRENCY,
      paymentMethod,
      PAYMENT_PURPOSE,
    ],
  );

  return result.insertId;
}

// ============================================================
// GET /api/admin/bookings/:id/accommodation-balance
// ============================================================
exports.getAccommodationBalanceSummary = async (req, res) => {
  const reservationId = Number(req.params.id);

  if (!Number.isInteger(reservationId) || reservationId <= 0) {
    return res.status(400).json({
      success: false,
      message: "A valid reservation ID is required.",
    });
  }

  const connection = await db.promise().getConnection();

  try {
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

    const operationalError = validateOperationalReservation(reservation);

    if (operationalError) {
      return res.status(400).json({
        success: false,
        message: operationalError,
      });
    }

    return res.status(200).json({
      success: true,
      ...buildBalanceSummary(reservation),
    });
  } catch (error) {
    console.error("getAccommodationBalanceSummary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load accommodation balance.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// ============================================================
// PUT /api/admin/bookings/:id/accommodation-balance/collect
//
// Manual Front Desk collection only:
// - Cash
// - GCash
// - Maya
//
// PayPal is intentionally rejected here and must use the automated
// PayPal order + capture endpoints below.
// ============================================================
exports.collectAccommodationBalance = async (req, res) => {
  const reservationId = Number(req.params.id);
  const paymentMethod = normalizeManualPaymentMethod(
    req.body?.payment_method,
  );
  const referenceNumber = normalizeReferenceNumber(
    req.body?.reference_number || req.body?.proof_reference,
  );

  if (!Number.isInteger(reservationId) || reservationId <= 0) {
    return res.status(400).json({
      success: false,
      message: "A valid reservation ID is required.",
    });
  }

  if (!paymentMethod) {
    return res.status(400).json({
      success: false,
      message:
        "Manual accommodation balance collection requires Cash, GCash, or Maya. Use the PayPal flow for PayPal.",
    });
  }

  const connection = await db.promise().getConnection();

  try {
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

    const operationalError = validateOperationalReservation(reservation);

    if (operationalError) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: operationalError,
      });
    }

    const before = buildBalanceSummary(reservation);

    if (before.overpaid_amount > MONEY_EPSILON) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Paid accommodation amount is already above the accommodation total. Review the reservation before collecting more.",
        ...before,
      });
    }

    // Duplicate-safe: do not create a second transaction if already settled.
    if (before.remaining_balance <= MONEY_EPSILON) {
      await connection.query(
        `
        UPDATE reservations
        SET
          paid_amount = accommodation_total,
          remaining_balance = 0,
          payment_status = 'paid'
        WHERE id = ?
        `,
        [reservationId],
      );

      await connection.commit();

      return res.status(200).json({
        success: true,
        message: "Accommodation balance is already fully settled.",
        collected_amount: 0,
        duplicate_collection_prevented: true,
        ...before,
        paid_amount: before.accommodation_total,
        remaining_balance: 0,
        payment_status: "paid",
        settled: true,
      });
    }

    const collectedAmount = before.remaining_balance;
    const newPaidAmount = before.accommodation_total;

    const transactionId = await insertManualBalanceTransaction(
      connection,
      {
        reservationId,
        paymentMethod,
        referenceNumber,
        amount: collectedAmount,
      },
    );

    await connection.query(
      `
      UPDATE reservations
      SET
        paid_amount = ?,
        remaining_balance = 0,
        payment_status = 'paid'
      WHERE id = ?
      `,
      [newPaidAmount, reservationId],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Collected ₱${collectedAmount.toFixed(2)} accommodation balance via ${paymentMethod.toUpperCase()} successfully.`,
      reservation_id: reservationId,
      reservation_code: reservation.reservation_code,
      transaction_id: transactionId,
      payment_method: paymentMethod,
      payment_purpose: PAYMENT_PURPOSE,
      collected_amount: collectedAmount,
      accommodation_total: before.accommodation_total,
      required_downpayment: before.required_downpayment,
      previous_paid_amount: before.paid_amount,
      paid_amount: newPaidAmount,
      remaining_balance: 0,
      payment_status: "paid",
      duplicate_collection_prevented: false,
      settled: true,
      collection_scope: before.collection_scope,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}

    console.error("collectAccommodationBalance error:", error);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message || "Failed to collect accommodation balance.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// ============================================================
// PAYPAL HELPERS — accommodation_balance purpose only
// ============================================================

function buildCreateRequestId(reservationId, attemptNumber) {
  return `arvic-bal-create-${reservationId}-${attemptNumber}`;
}

function buildCaptureRequestId(reservationId, transactionId) {
  return `arvic-bal-capture-${reservationId}-${transactionId}`;
}

async function findLatestBalancePayPalTransaction(reservationId) {
  const [rows] = await db.promise().query(
    `
    SELECT
      id,
      reservation_id,
      provider,
      paypal_order_id,
      paypal_order_status,
      paypal_capture_id,
      paypal_capture_status,
      paypal_payer_id,
      amount,
      currency,
      payment_method,
      payment_purpose,
      status,
      paid_at,
      created_at,
      updated_at
    FROM payment_transactions
    WHERE reservation_id = ?
      AND provider = 'paypal'
      AND payment_purpose = ?
    ORDER BY id DESC
    LIMIT 1
    `,
    [reservationId, PAYMENT_PURPOSE],
  );

  return rows[0] || null;
}

async function countBalancePayPalAttempts(reservationId) {
  const [rows] = await db.promise().query(
    `
    SELECT COUNT(*) AS total
    FROM payment_transactions
    WHERE reservation_id = ?
      AND provider = 'paypal'
      AND payment_purpose = ?
    `,
    [reservationId, PAYMENT_PURPOSE],
  );

  return Number(rows[0]?.total || 0);
}

async function findBalancePayPalTransactionByOrder(
  reservationId,
  orderId,
) {
  const [rows] = await db.promise().query(
    `
    SELECT
      id,
      reservation_id,
      provider,
      paypal_order_id,
      paypal_order_status,
      paypal_capture_id,
      paypal_capture_status,
      paypal_payer_id,
      amount,
      currency,
      payment_method,
      payment_purpose,
      status,
      paid_at
    FROM payment_transactions
    WHERE reservation_id = ?
      AND provider = 'paypal'
      AND payment_purpose = ?
      AND paypal_order_id = ?
    LIMIT 1
    `,
    [reservationId, PAYMENT_PURPOSE, orderId],
  );

  return rows[0] || null;
}

function getCompletedCaptureFromOrder(paypalOrder) {
  const purchaseUnits = Array.isArray(paypalOrder?.purchase_units)
    ? paypalOrder.purchase_units
    : [];

  for (const unit of purchaseUnits) {
    const captures = Array.isArray(unit?.payments?.captures)
      ? unit.payments.captures
      : [];

    const completed = captures.find(
      (capture) =>
        normalizeLower(capture?.status) === "completed",
    );

    if (completed) {
      return completed;
    }
  }

  return null;
}

function getCaptureAmount(capture) {
  return toMoney(capture?.amount?.value);
}

function getCaptureCurrency(capture) {
  return normalize(capture?.amount?.currency_code).toUpperCase();
}

function assertPayPalCaptureMatchesBalance(capture, expectedAmount) {
  const actualAmount = getCaptureAmount(capture);
  const actualCurrency = getCaptureCurrency(capture);

  if (!sameMoney(actualAmount, expectedAmount)) {
    const error = new Error(
      "PayPal captured amount does not match the current accommodation balance.",
    );
    error.status = 409;
    throw error;
  }

  if (actualCurrency !== PAYPAL_CURRENCY) {
    const error = new Error(
      `PayPal captured currency must be ${PAYPAL_CURRENCY}.`,
    );
    error.status = 409;
    throw error;
  }
}

async function tryReuseBalancePayPalOrder(transaction, expectedAmount) {
  if (!transaction?.paypal_order_id) {
    return null;
  }

  if (!sameMoney(transaction.amount, expectedAmount)) {
    return null;
  }

  // If the local transaction is already fully captured, the capture endpoint
  // will handle idempotent reconciliation instead of creating a new order.
  if (
    normalizeLower(transaction.paypal_capture_status) === "completed" &&
    transaction.paypal_capture_id
  ) {
    return {
      transactionId: transaction.id,
      paypalOrder: {
        id: transaction.paypal_order_id,
        status: transaction.paypal_order_status || "COMPLETED",
      },
      alreadyCapturedLocally: true,
    };
  }

  try {
    const paypalOrder = await getPayPalOrder(
      transaction.paypal_order_id,
    );

    const status = normalizeLower(paypalOrder?.status);

    if (
      [
        "created",
        "payer_action_required",
        "approved",
        "completed",
      ].includes(status)
    ) {
      await db.promise().query(
        `
        UPDATE payment_transactions
        SET
          paypal_order_status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [paypalOrder.status || null, transaction.id],
      );

      return {
        transactionId: transaction.id,
        paypalOrder,
        alreadyCapturedLocally: false,
      };
    }

    return null;
  } catch (error) {
    console.warn(
      "Unable to reuse accommodation balance PayPal order:",
      error.message,
    );

    return null;
  }
}

async function getCurrentBalanceReservation(reservationId) {
  const connection = await db.promise().getConnection();

  try {
    const reservation = await getReservation(
      connection,
      reservationId,
      false,
    );

    return reservation;
  } finally {
    connection.release();
  }
}

// ============================================================
// POST /api/admin/bookings/:id/accommodation-balance/paypal/order
//
// Browser sends NO amount.
// The backend uses the current calculated remaining accommodation balance.
// ============================================================
exports.createAccommodationBalancePayPalOrder = async (req, res) => {
  const reservationId = Number(req.params.id);

  try {
    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid reservation ID is required.",
      });
    }

    const reservation = await getCurrentBalanceReservation(
      reservationId,
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    const operationalError = validateOperationalReservation(reservation);

    if (operationalError) {
      return res.status(400).json({
        success: false,
        message: operationalError,
      });
    }

    const summary = buildBalanceSummary(reservation);
    validateBalanceCanBeCollected(summary);

    const expectedAmount = summary.remaining_balance;

    const latestTransaction =
      await findLatestBalancePayPalTransaction(reservationId);

    const reusableOrder = await tryReuseBalancePayPalOrder(
      latestTransaction,
      expectedAmount,
    );

    if (reusableOrder) {
      return res.status(200).json({
        success: true,
        reused: true,
        alreadyCapturedLocally:
          Boolean(reusableOrder.alreadyCapturedLocally),
        reservationId,
        reservationCode: reservation.reservation_code,
        transactionId: reusableOrder.transactionId,
        orderId: reusableOrder.paypalOrder.id,
        orderStatus: reusableOrder.paypalOrder.status,
        amount: expectedAmount.toFixed(2),
        currency: PAYPAL_CURRENCY,
        paymentPurpose: PAYMENT_PURPOSE,
      });
    }

    const existingAttempts =
      await countBalancePayPalAttempts(reservationId);

    const attemptNumber = existingAttempts + 1;
    const requestId = buildCreateRequestId(
      reservationId,
      attemptNumber,
    );

    const paypalOrder = await createPayPalOrder({
      amount: expectedAmount,
      currency: PAYPAL_CURRENCY,
      reservationCode: reservation.reservation_code,
      description: `Accommodation balance for ${reservation.reservation_code}`,
      requestId,
    });

    if (!paypalOrder?.id) {
      return res.status(502).json({
        success: false,
        message: "PayPal did not return an order ID.",
      });
    }

    let transactionId = null;

    try {
      const [insertResult] = await db.promise().query(
        `
        INSERT INTO payment_transactions (
          reservation_id,
          provider,
          paypal_order_id,
          paypal_order_status,
          amount,
          currency,
          payment_method,
          payment_purpose,
          status
        )
        VALUES (?, 'paypal', ?, ?, ?, ?, 'paypal', ?, 'pending')
        `,
        [
          reservationId,
          paypalOrder.id,
          paypalOrder.status || null,
          expectedAmount,
          PAYPAL_CURRENCY,
          PAYMENT_PURPOSE,
        ],
      );

      transactionId = insertResult.insertId;
    } catch (databaseError) {
      if (databaseError?.code === "ER_DUP_ENTRY") {
        const [duplicateRows] = await db.promise().query(
          `
          SELECT id
          FROM payment_transactions
          WHERE paypal_order_id = ?
          LIMIT 1
          `,
          [paypalOrder.id],
        );

        if (duplicateRows.length > 0) {
          transactionId = duplicateRows[0].id;
        } else {
          throw databaseError;
        }
      } else {
        throw databaseError;
      }
    }

    return res.status(201).json({
      success: true,
      reused: false,
      reservationId,
      reservationCode: reservation.reservation_code,
      transactionId,
      orderId: paypalOrder.id,
      orderStatus: paypalOrder.status,
      amount: expectedAmount.toFixed(2),
      currency: PAYPAL_CURRENCY,
      paymentPurpose: PAYMENT_PURPOSE,
    });
  } catch (error) {
    console.error(
      "createAccommodationBalancePayPalOrder error:",
      error.paypal || error,
    );

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to create PayPal accommodation balance order.",
    });
  }
};

async function finalizeAccommodationBalancePayPalCapture({
  reservationId,
  transaction,
  paypalOrder,
  capture,
}) {
  const captureId = normalize(capture?.id);
  const captureStatus = normalize(capture?.status) || "COMPLETED";
  const payerId = normalize(paypalOrder?.payer?.payer_id);

  if (!captureId) {
    const error = new Error(
      "PayPal did not return a capture ID.",
    );
    error.status = 502;
    throw error;
  }

  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    const reservation = await getReservation(
      connection,
      reservationId,
      true,
    );

    if (!reservation) {
      await connection.rollback();

      const error = new Error("Reservation not found.");
      error.status = 404;
      throw error;
    }

    const operationalError = validateOperationalReservation(reservation);

    if (operationalError) {
      await connection.rollback();

      const error = new Error(operationalError);
      error.status = 409;
      throw error;
    }

    const [transactionRows] = await connection.query(
      `
      SELECT
        id,
        paypal_order_id,
        paypal_capture_id,
        paypal_capture_status,
        amount,
        currency,
        status
      FROM payment_transactions
      WHERE id = ?
        AND reservation_id = ?
        AND provider = 'paypal'
        AND payment_purpose = ?
      FOR UPDATE
      `,
      [transaction.id, reservationId, PAYMENT_PURPOSE],
    );

    if (!transactionRows.length) {
      await connection.rollback();

      const error = new Error(
        "Accommodation balance PayPal transaction was not found.",
      );
      error.status = 404;
      throw error;
    }

    const lockedTransaction = transactionRows[0];
    const before = buildBalanceSummary(reservation);
    const capturedAmount = getCaptureAmount(capture);

    // Always verify the PayPal result against the transaction amount.
    assertPayPalCaptureMatchesBalance(
      capture,
      lockedTransaction.amount,
    );

    const alreadyRecorded =
      normalizeLower(lockedTransaction.paypal_capture_status) ===
        "completed" &&
      Boolean(lockedTransaction.paypal_capture_id) &&
      normalizeLower(lockedTransaction.status) === "paid";

    if (before.overpaid_amount > MONEY_EPSILON) {
      await connection.rollback();

      const error = new Error(
        "Reservation already has an accommodation overpayment. Review it before applying this PayPal capture.",
      );
      error.status = 409;
      throw error;
    }

    // Recovery/idempotency:
    // If this exact capture was already recorded and the reservation is settled,
    // return success without applying money again.
    if (
      alreadyRecorded &&
      before.remaining_balance <= MONEY_EPSILON
    ) {
      await connection.commit();

      return {
        success: true,
        alreadyCaptured: true,
        duplicateCollectionPrevented: true,
        reservationId,
        reservationCode: reservation.reservation_code,
        transactionId: lockedTransaction.id,
        orderId: paypalOrder.id || lockedTransaction.paypal_order_id,
        captureId: lockedTransaction.paypal_capture_id,
        captureStatus: lockedTransaction.paypal_capture_status,
        amount: toMoney(lockedTransaction.amount).toFixed(2),
        currency: PAYPAL_CURRENCY,
        paymentPurpose: PAYMENT_PURPOSE,
        paidAmount: before.accommodation_total.toFixed(2),
        remainingBalance: "0.00",
        paymentStatus: "paid",
      };
    }

    // Before applying, the current DB-calculated remaining balance must still
    // match the captured PayPal amount. This prevents silently applying an
    // outdated order after another collection changed the balance.
    if (!sameMoney(before.remaining_balance, capturedAmount)) {
      // Preserve the real PayPal capture in the audit table, but do not
      // overwrite reservation totals with an unsafe amount.
      await connection.query(
        `
        UPDATE payment_transactions
        SET
          paypal_capture_id = ?,
          paypal_payer_id = ?,
          paypal_order_status = ?,
          paypal_capture_status = ?,
          amount = ?,
          currency = ?,
          payment_method = 'paypal',
          payment_purpose = ?,
          status = 'paid',
          paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [
          captureId,
          payerId || null,
          paypalOrder.status || "COMPLETED",
          captureStatus,
          capturedAmount,
          PAYPAL_CURRENCY,
          PAYMENT_PURPOSE,
          lockedTransaction.id,
        ],
      );

      await connection.commit();

      return {
        success: false,
        capturedButNotApplied: true,
        requiresReview: true,
        reservationId,
        reservationCode: reservation.reservation_code,
        transactionId: lockedTransaction.id,
        orderId: paypalOrder.id,
        captureId,
        captureStatus,
        amount: capturedAmount.toFixed(2),
        currency: PAYPAL_CURRENCY,
        paymentPurpose: PAYMENT_PURPOSE,
        currentRemainingBalance:
          before.remaining_balance.toFixed(2),
        message:
          "PayPal capture completed, but the reservation balance changed before finalization. The capture was recorded for audit and requires Front Desk review before adjusting the reservation.",
      };
    }

    await connection.query(
      `
      UPDATE payment_transactions
      SET
        paypal_capture_id = ?,
        paypal_payer_id = ?,
        paypal_order_status = ?,
        paypal_capture_status = ?,
        amount = ?,
        currency = ?,
        payment_method = 'paypal',
        payment_purpose = ?,
        status = 'paid',
        paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        captureId,
        payerId || null,
        paypalOrder.status || "COMPLETED",
        captureStatus,
        capturedAmount,
        PAYPAL_CURRENCY,
        PAYMENT_PURPOSE,
        lockedTransaction.id,
      ],
    );

    await connection.query(
      `
      UPDATE reservations
      SET
        paid_amount = accommodation_total,
        remaining_balance = 0,
        payment_status = 'paid'
      WHERE id = ?
      `,
      [reservationId],
    );

    await connection.commit();

    return {
      success: true,
      alreadyCaptured: alreadyRecorded,
      duplicateCollectionPrevented: alreadyRecorded,
      reservationId,
      reservationCode: reservation.reservation_code,
      transactionId: lockedTransaction.id,
      orderId: paypalOrder.id,
      captureId,
      captureStatus,
      amount: capturedAmount.toFixed(2),
      currency: PAYPAL_CURRENCY,
      paymentPurpose: PAYMENT_PURPOSE,
      previousPaidAmount: before.paid_amount.toFixed(2),
      paidAmount: before.accommodation_total.toFixed(2),
      remainingBalance: "0.00",
      paymentStatus: "paid",
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}

    throw error;
  } finally {
    connection.release();
  }
}

// ============================================================
// POST /api/admin/bookings/:id/accommodation-balance/paypal/capture
//
// Body:
// {
//   "orderId": "<PayPal order id>"
// }
//
// Browser sends NO payment amount.
// ============================================================
exports.captureAccommodationBalancePayPalOrder = async (req, res) => {
  const reservationId = Number(req.params.id);
  const orderId = normalize(req.body?.orderId);

  try {
    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid reservation ID is required.",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "PayPal order ID is required.",
      });
    }

    const reservation = await getCurrentBalanceReservation(
      reservationId,
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    const operationalError = validateOperationalReservation(reservation);

    if (operationalError) {
      return res.status(409).json({
        success: false,
        message: operationalError,
      });
    }

    const transaction =
      await findBalancePayPalTransactionByOrder(
        reservationId,
        orderId,
      );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message:
          "No PayPal accommodation balance transaction was found for this reservation and order ID.",
      });
    }

    const currentSummary = buildBalanceSummary(reservation);

    // Fully idempotent response after a completed local capture.
    if (
      normalizeLower(transaction.paypal_capture_status) ===
        "completed" &&
      transaction.paypal_capture_id &&
      normalizeLower(transaction.status) === "paid" &&
      currentSummary.remaining_balance <= MONEY_EPSILON
    ) {
      return res.status(200).json({
        success: true,
        alreadyCaptured: true,
        duplicateCollectionPrevented: true,
        reservationId,
        reservationCode: reservation.reservation_code,
        transactionId: transaction.id,
        orderId,
        captureId: transaction.paypal_capture_id,
        captureStatus: transaction.paypal_capture_status,
        amount: toMoney(transaction.amount).toFixed(2),
        currency: PAYPAL_CURRENCY,
        paymentPurpose: PAYMENT_PURPOSE,
        paidAmount: currentSummary.accommodation_total.toFixed(2),
        remainingBalance: "0.00",
        paymentStatus: "paid",
        message:
          "Accommodation balance PayPal payment was already captured and recorded.",
      });
    }

    // Re-check immediately before asking PayPal to capture.
    if (!sameMoney(currentSummary.remaining_balance, transaction.amount)) {
      return res.status(409).json({
        success: false,
        message:
          "The current accommodation balance no longer matches this PayPal order. Refresh the balance before continuing.",
        currentRemainingBalance:
          currentSummary.remaining_balance.toFixed(2),
        orderAmount: toMoney(transaction.amount).toFixed(2),
      });
    }

    let paypalOrder = await getPayPalOrder(orderId);
    let capture = getCompletedCaptureFromOrder(paypalOrder);

    if (normalizeLower(paypalOrder?.status) === "completed") {
      if (!capture) {
        return res.status(502).json({
          success: false,
          message:
            "PayPal order is completed but no completed capture record was returned.",
        });
      }
    } else {
      if (normalizeLower(paypalOrder?.status) !== "approved") {
        return res.status(409).json({
          success: false,
          message:
            "PayPal order is not approved yet. Complete the PayPal approval first.",
          orderStatus: paypalOrder?.status || null,
        });
      }

      const requestId = buildCaptureRequestId(
        reservationId,
        transaction.id,
      );

      paypalOrder = await capturePayPalOrder(
        orderId,
        requestId,
      );

      capture = getCompletedCaptureFromOrder(paypalOrder);
    }

    if (
      normalizeLower(paypalOrder?.status) !== "completed" ||
      !capture ||
      normalizeLower(capture?.status) !== "completed"
    ) {
      return res.status(502).json({
        success: false,
        message:
          "PayPal accommodation balance capture did not complete successfully.",
        orderStatus: paypalOrder?.status || null,
        captureStatus: capture?.status || null,
      });
    }

    assertPayPalCaptureMatchesBalance(
      capture,
      transaction.amount,
    );

    const result =
      await finalizeAccommodationBalancePayPalCapture({
        reservationId,
        transaction,
        paypalOrder,
        capture,
      });

    if (result.requiresReview) {
      return res.status(409).json(result);
    }

    return res.status(200).json({
      ...result,
      message:
        "PayPal accommodation balance captured successfully. Accommodation is fully paid.",
    });
  } catch (error) {
    console.error(
      "captureAccommodationBalancePayPalOrder error:",
      error.paypal || error,
    );

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to capture PayPal accommodation balance.",
    });
  }
};
