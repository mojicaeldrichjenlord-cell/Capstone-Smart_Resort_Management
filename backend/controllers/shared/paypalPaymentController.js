// ============================================================
// SMART RESORT BOOKING SYSTEM
// Phase 2 - PayPal Sandbox Payment Controller
// Target file: backend/controllers/shared/paypalPaymentController.js
//
// PHASE 2 scope:
// - Expose the public PayPal Client ID to the frontend.
// - Create/reuse a PayPal Sandbox Order for an EXISTING reservation.
// - Customer-account online reservations: PayPal 50% accommodation downpayment.
// - Front Desk Facebook/Messenger PayPal: 50% or full accommodation payment,
//   based on the reservation intent saved by bookingController.
// - Front Desk Walk-in PayPal: full accommodation payment.
// - The backend, not the browser, determines the official amount.
// - Capture only after PayPal reports APPROVED/COMPLETED.
// - Walk-in PayPal is checked in only AFTER successful capture.
// - Entrance fee and later onsite/additional charges remain outside this
//   initial-reservation PayPal controller.
// - Front Desk remaining-balance PayPal collection will use a separate
//   collection flow so initial-reservation logic stays auditable.
// ============================================================

const db = require("../../config/db");

const {
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrder,
} = require("../../services/paypalService");

const PAYPAL_CURRENCY = "PHP";

function toMoney(value) {
  const number = Number(value || 0);
  return Math.round((number + Number.EPSILON) * 100) / 100;
}

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function buildCreateRequestId(reservationId, attemptNumber) {
  return `arvic-paypal-create-${reservationId}-${attemptNumber}`;
}

async function getReservationForPayPal(reservationId) {
  const [rows] = await db.promise().query(
    `
      SELECT
        id,
        reservation_code,
        user_id,
        created_by,
        booking_source,
        accommodation_total,
        required_downpayment,
        paid_amount,
        remaining_balance,
        payment_method,
        payment_status,
        reservation_status,
        note,
        is_checked_in,
        checked_in_at,
        entrance_fee_paid,
        entrance_fee_collected
      FROM reservations
      WHERE id = ?
      LIMIT 1
    `,
    [reservationId],
  );

  return rows[0] || null;
}

function getManualReservationType(reservation) {
  const note = String(reservation?.note || "").toLowerCase();

  if (note.includes("manual reservation type: walk-in guest")) {
    return "walkin";
  }

  if (note.includes("manual reservation type: facebook / messenger reservation")) {
    return "facebook";
  }

  return "";
}

function getManualPayPalIntent(reservation) {
  const note = String(reservation?.note || "").toLowerCase();

  if (note.includes("paypal intended payment type: full payment")) {
    return "full";
  }

  if (note.includes("paypal intended payment type: 50% down payment")) {
    return "downpayment";
  }

  return "";
}

function calculateRequiredDownpayment(reservation) {
  // Required downpayment stays the official 50% accommodation baseline.
  // Entrance fee and later onsite/additional charges are excluded.
  return toMoney(
    toMoney(reservation.accommodation_total) * 0.5,
  );
}

function buildPayPalPaymentPlan(reservation) {
  const bookingSource = normalizeStatus(reservation?.booking_source);
  const accommodationTotal = toMoney(reservation?.accommodation_total);
  const requiredDownpayment = calculateRequiredDownpayment(reservation);

  if (bookingSource === "online") {
    return {
      flow: "customer_online_downpayment",
      label: "Customer Online - 50% Downpayment",
      amount: requiredDownpayment,
      description: `50% accommodation downpayment for ${reservation.reservation_code}`,
      paymentStatusAfterCapture:
        accommodationTotal - requiredDownpayment <= 0
          ? "paid"
          : "partially_paid",
      reservationStatusAfterCapture: "approved",
      paidAmountAfterCapture: requiredDownpayment,
      remainingBalanceAfterCapture: toMoney(
        Math.max(accommodationTotal - requiredDownpayment, 0),
      ),
      shouldCheckInAfterCapture: false,
    };
  }

  if (bookingSource === "manual") {
    const manualType = getManualReservationType(reservation);
    const paypalIntent = getManualPayPalIntent(reservation);

    if (manualType === "walkin") {
      return {
        flow: "frontdesk_walkin_full",
        label: "Front Desk Walk-in - Full PayPal Payment",
        amount: accommodationTotal,
        description: `Walk-in full accommodation payment for ${reservation.reservation_code}`,
        paymentStatusAfterCapture: "paid",
        reservationStatusAfterCapture: "approved",
        paidAmountAfterCapture: accommodationTotal,
        remainingBalanceAfterCapture: 0,
        shouldCheckInAfterCapture: true,
      };
    }

    if (manualType === "facebook") {
      if (paypalIntent === "full") {
        return {
          flow: "frontdesk_facebook_full",
          label: "Front Desk Facebook/Messenger - Full PayPal Payment",
          amount: accommodationTotal,
          description: `Facebook/Messenger full accommodation payment for ${reservation.reservation_code}`,
          paymentStatusAfterCapture: "paid",
          reservationStatusAfterCapture: "approved",
          paidAmountAfterCapture: accommodationTotal,
          remainingBalanceAfterCapture: 0,
          shouldCheckInAfterCapture: false,
        };
      }

      if (paypalIntent === "downpayment") {
        return {
          flow: "frontdesk_facebook_downpayment",
          label: "Front Desk Facebook/Messenger - 50% PayPal Downpayment",
          amount: requiredDownpayment,
          description: `Facebook/Messenger 50% accommodation downpayment for ${reservation.reservation_code}`,
          paymentStatusAfterCapture:
            accommodationTotal - requiredDownpayment <= 0
              ? "paid"
              : "partially_paid",
          reservationStatusAfterCapture: "approved",
          paidAmountAfterCapture: requiredDownpayment,
          remainingBalanceAfterCapture: toMoney(
            Math.max(accommodationTotal - requiredDownpayment, 0),
          ),
          shouldCheckInAfterCapture: false,
        };
      }

      const error = new Error(
        "Facebook/Messenger PayPal reservation is missing its intended payment type.",
      );
      error.status = 409;
      throw error;
    }

    const error = new Error(
      "Manual PayPal reservation type could not be identified.",
    );
    error.status = 409;
    throw error;
  }

  const error = new Error(
    "This reservation source is not supported by the PayPal reservation-payment flow.",
  );
  error.status = 400;
  throw error;
}

function validateReservationForPayPalOrder(reservation) {
  if (!reservation) {
    const error = new Error("Reservation not found.");
    error.status = 404;
    throw error;
  }

  const bookingSource = normalizeStatus(reservation.booking_source);

  if (!["online", "manual"].includes(bookingSource)) {
    const error = new Error(
      "This reservation source is not supported by PayPal checkout.",
    );
    error.status = 400;
    throw error;
  }

  if (normalizeStatus(reservation.payment_method) !== "paypal") {
    const error = new Error(
      "This reservation is not configured for PayPal payment.",
    );
    error.status = 400;
    throw error;
  }

  const reservationStatus = normalizeStatus(
    reservation.reservation_status,
  );

  if (
    ["cancelled", "completed", "rejected"].includes(
      reservationStatus,
    )
  ) {
    const error = new Error(
      `PayPal checkout cannot continue because the reservation is ${reservationStatus}.`,
    );
    error.status = 409;
    throw error;
  }

  const paymentStatus = normalizeStatus(reservation.payment_status);
  const paidAmount = toMoney(reservation.paid_amount);

  if (paymentStatus === "paid") {
    const error = new Error("This reservation is already fully paid.");
    error.status = 409;
    throw error;
  }

  /*
    This controller handles the INITIAL reservation PayPal payment only.

    If a reservation already has a recorded partial payment, the later
    Front Desk remaining-balance PayPal collection must use the dedicated
    remaining-balance collection flow instead of creating another initial
    reservation order.
  */
  if (paymentStatus === "partially_paid" || paidAmount > 0) {
    const error = new Error(
      "The initial PayPal reservation payment has already been recorded. Use the Front Desk remaining-balance collection flow for any outstanding balance.",
    );
    error.status = 409;
    throw error;
  }

  const accommodationTotal = toMoney(
    reservation.accommodation_total,
  );

  if (accommodationTotal <= 0) {
    const error = new Error(
      "Reservation accommodation total must be greater than zero before PayPal checkout.",
    );
    error.status = 400;
    throw error;
  }

  const paymentPlan = buildPayPalPaymentPlan(reservation);

  if (paymentPlan.amount <= 0) {
    const error = new Error(
      "The calculated PayPal payment amount must be greater than zero.",
    );
    error.status = 400;
    throw error;
  }

  return paymentPlan;
}

async function findLatestPayPalTransaction(reservationId) {
  const [rows] = await db.promise().query(
    `
      SELECT
        id,
        paypal_order_id,
        paypal_order_status,
        paypal_capture_id,
        paypal_capture_status,
        amount,
        currency,
        status,
        created_at
      FROM payment_transactions
      WHERE reservation_id = ?
        AND provider = 'paypal'
      ORDER BY id DESC
      LIMIT 1
    `,
    [reservationId],
  );

  return rows[0] || null;
}

async function countPayPalTransactions(reservationId) {
  const [rows] = await db.promise().query(
    `
      SELECT COUNT(*) AS total
      FROM payment_transactions
      WHERE reservation_id = ?
        AND provider = 'paypal'
    `,
    [reservationId],
  );

  return Number(rows[0]?.total || 0);
}

async function tryReuseExistingOrder(transaction, expectedAmount) {
  if (!transaction?.paypal_order_id) {
    return null;
  }

  const localCaptureStatus = normalizeStatus(
    transaction.paypal_capture_status,
  );

  if (localCaptureStatus === "completed") {
    return null;
  }

  if (
    Math.abs(
      toMoney(transaction.amount) - toMoney(expectedAmount),
    ) > 0.009
  ) {
    return null;
  }

  try {
    const paypalOrder = await getPayPalOrder(
      transaction.paypal_order_id,
    );

    const paypalStatus = normalizeStatus(paypalOrder?.status);

    // CREATED -> buyer has not approved yet.
    // PAYER_ACTION_REQUIRED -> buyer action is still required.
    // APPROVED -> buyer approved; capture can be performed next.
    if (
      ["created", "payer_action_required", "approved"].includes(
        paypalStatus,
      )
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
      };
    }

    return null;
  } catch (error) {
    // If PayPal cannot retrieve an old/local order, do not trust it
    // as reusable. The caller may safely create a new attempt.
    console.warn(
      "Unable to reuse previous PayPal order:",
      error.message,
    );

    return null;
  }
}

// ============================================================
// GET /api/paypal/config
//
// The Client ID is public by design and is required by the
// PayPal JavaScript SDK. The Client Secret is NEVER returned.
// ============================================================
exports.getPayPalClientConfig = async (req, res) => {
  const clientId = String(process.env.PAYPAL_CLIENT_ID || "").trim();

  if (!clientId) {
    return res.status(500).json({
      success: false,
      message: "PayPal Client ID is not configured on the backend.",
    });
  }

  return res.status(200).json({
    success: true,
    clientId,
    currency: PAYPAL_CURRENCY,
    environment:
      String(process.env.PAYPAL_BASE_URL || "").includes("sandbox")
        ? "sandbox"
        : "live",
  });
};

// ============================================================
// POST /api/paypal/reservations/:reservationId/order
//
// No amount is accepted from the browser.
// The backend computes the official amount from the reservation:
// - Customer online: 50% accommodation downpayment.
// - Facebook/Messenger: saved 50% or full PayPal intent.
// - Walk-in: full accommodation payment.
// ============================================================
exports.createOrderForReservation = async (req, res) => {
  try {
    const reservationId = Number(req.params.reservationId);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation ID.",
      });
    }

    const reservation = await getReservationForPayPal(
      reservationId,
    );

    const paymentPlan =
      validateReservationForPayPalOrder(reservation);

    const requiredDownpayment =
      calculateRequiredDownpayment(reservation);

    // Keep required_downpayment aligned with the official 50% baseline.
    // A Walk-in or Facebook FULL PayPal payment can be larger than this
    // baseline, but required_downpayment must still mean 50%.
    if (
      Math.abs(
        toMoney(reservation.required_downpayment) -
          requiredDownpayment,
      ) > 0.009
    ) {
      await db.promise().query(
        `
          UPDATE reservations
          SET required_downpayment = ?
          WHERE id = ?
        `,
        [requiredDownpayment, reservationId],
      );
    }

    const latestTransaction =
      await findLatestPayPalTransaction(reservationId);

    const reusableOrder =
      await tryReuseExistingOrder(
        latestTransaction,
        paymentPlan.amount,
      );

    if (reusableOrder) {
      return res.status(200).json({
        success: true,
        reused: true,
        reservationId,
        reservationCode: reservation.reservation_code,
        transactionId: reusableOrder.transactionId,
        orderId: reusableOrder.paypalOrder.id,
        orderStatus: reusableOrder.paypalOrder.status,
        amount: paymentPlan.amount.toFixed(2),
        currency: PAYPAL_CURRENCY,
        paymentFlow: paymentPlan.flow,
        paymentLabel: paymentPlan.label,
      });
    }

    const existingAttempts =
      await countPayPalTransactions(reservationId);

    const attemptNumber = existingAttempts + 1;

    const requestId = buildCreateRequestId(
      reservationId,
      attemptNumber,
    );

    const paypalOrder = await createPayPalOrder({
      amount: paymentPlan.amount,
      currency: PAYPAL_CURRENCY,
      reservationCode: reservation.reservation_code,
      description: paymentPlan.description,
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
            status
          )
          VALUES (?, 'paypal', ?, ?, ?, ?, 'paypal', 'pending')
        `,
        [
          reservationId,
          paypalOrder.id,
          paypalOrder.status || null,
          paymentPlan.amount,
          PAYPAL_CURRENCY,
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
      amount: paymentPlan.amount.toFixed(2),
      currency: PAYPAL_CURRENCY,
      paymentFlow: paymentPlan.flow,
      paymentLabel: paymentPlan.label,
    });
  } catch (error) {
    console.error(
      "createOrderForReservation error:",
      error.paypal || error,
    );

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message || "Failed to create PayPal order.",
    });
  }
};

// ============================================================
// PAYPAL CAPTURE HELPERS
// ============================================================

function buildCaptureRequestId(reservationId, transactionId) {
  return `arvic-paypal-capture-${reservationId}-${transactionId}`;
}

async function findPayPalTransactionByOrder(
  reservationId,
  paypalOrderId,
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
        status,
        paid_at
      FROM payment_transactions
      WHERE reservation_id = ?
        AND provider = 'paypal'
        AND paypal_order_id = ?
      LIMIT 1
    `,
    [reservationId, paypalOrderId],
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

    const completedCapture = captures.find(
      (capture) =>
        normalizeStatus(capture?.status) === "completed",
    );

    if (completedCapture) {
      return completedCapture;
    }
  }

  return null;
}

function getOrderAmount(paypalOrder) {
  const purchaseUnits = Array.isArray(paypalOrder?.purchase_units)
    ? paypalOrder.purchase_units
    : [];

  const value =
    purchaseUnits[0]?.amount?.value ??
    purchaseUnits[0]?.payments?.captures?.[0]?.amount?.value ??
    0;

  return toMoney(value);
}

function getOrderCurrency(paypalOrder) {
  const purchaseUnits = Array.isArray(paypalOrder?.purchase_units)
    ? paypalOrder.purchase_units
    : [];

  return String(
    purchaseUnits[0]?.amount?.currency_code ||
      purchaseUnits[0]?.payments?.captures?.[0]?.amount?.currency_code ||
      "",
  )
    .trim()
    .toUpperCase();
}

function getCaptureAmount(capture) {
  return toMoney(capture?.amount?.value || 0);
}

function getCaptureCurrency(capture) {
  return String(capture?.amount?.currency_code || "")
    .trim()
    .toUpperCase();
}

function assertPayPalAmountAndCurrency({
  expectedAmount,
  paypalOrder,
  capture,
}) {
  const orderAmount = getOrderAmount(paypalOrder);
  const orderCurrency = getOrderCurrency(paypalOrder);
  const captureAmount = getCaptureAmount(capture);
  const captureCurrency = getCaptureCurrency(capture);

  if (
    Math.abs(orderAmount - expectedAmount) > 0.009 ||
    Math.abs(captureAmount - expectedAmount) > 0.009
  ) {
    const error = new Error(
      "PayPal captured amount does not match the reservation's official server-calculated payment amount.",
    );
    error.status = 409;
    throw error;
  }

  if (
    orderCurrency !== PAYPAL_CURRENCY ||
    captureCurrency !== PAYPAL_CURRENCY
  ) {
    const error = new Error(
      `PayPal payment currency must be ${PAYPAL_CURRENCY}.`,
    );
    error.status = 409;
    throw error;
  }
}

async function finalizeSuccessfulPayPalCapture({
  reservation,
  transaction,
  paypalOrder,
  capture,
}) {
  const paymentPlan = buildPayPalPaymentPlan(reservation);
  const expectedAmount = paymentPlan.amount;

  assertPayPalAmountAndCurrency({
    expectedAmount,
    paypalOrder,
    capture,
  });

  const captureId = String(capture?.id || "").trim();

  if (!captureId) {
    const error = new Error(
      "PayPal did not return a capture ID.",
    );
    error.status = 502;
    throw error;
  }

  const payerId = String(
    paypalOrder?.payer?.payer_id || "",
  ).trim();

  const requiredDownpayment =
    calculateRequiredDownpayment(reservation);

  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    const [lockedRows] = await connection.query(
      `
        SELECT
          id,
          paypal_capture_id,
          paypal_capture_status,
          status
        FROM payment_transactions
        WHERE id = ?
        FOR UPDATE
      `,
      [transaction.id],
    );

    if (!lockedRows.length) {
      const error = new Error(
        "PayPal transaction record was not found.",
      );
      error.status = 404;
      throw error;
    }

    const lockedTransaction = lockedRows[0];

    const alreadyCompleted =
      normalizeStatus(
        lockedTransaction.paypal_capture_status,
      ) === "completed" &&
      Boolean(lockedTransaction.paypal_capture_id);

    if (!alreadyCompleted) {
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
            status = 'paid',
            paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        [
          captureId,
          payerId || null,
          paypalOrder.status || "COMPLETED",
          capture.status || "COMPLETED",
          expectedAmount,
          PAYPAL_CURRENCY,
          transaction.id,
        ],
      );

      if (paymentPlan.shouldCheckInAfterCapture) {
        /*
          Walk-in + PayPal:
          The guest is physically onsite, but must NOT be checked in until
          PayPal capture succeeds. Entrance is still NOT collected here.
        */
        await connection.query(
          `
            UPDATE reservations
            SET
              required_downpayment = ?,
              paid_amount = ?,
              remaining_balance = ?,
              payment_method = 'paypal',
              payment_status = ?,
              reservation_status = ?,
              is_checked_in = 1,
              checked_in_at = COALESCE(checked_in_at, CURRENT_TIMESTAMP),
              entrance_fee_paid = COALESCE(entrance_fee_paid, 0),
              entrance_fee_collected = COALESCE(entrance_fee_collected, 0)
            WHERE id = ?
          `,
          [
            requiredDownpayment,
            paymentPlan.paidAmountAfterCapture,
            paymentPlan.remainingBalanceAfterCapture,
            paymentPlan.paymentStatusAfterCapture,
            paymentPlan.reservationStatusAfterCapture,
            reservation.id,
          ],
        );
      } else {
        /*
          Customer online and Facebook/Messenger:
          Approve after successful capture, but do not check the guest in.
        */
        await connection.query(
          `
            UPDATE reservations
            SET
              required_downpayment = ?,
              paid_amount = ?,
              remaining_balance = ?,
              payment_method = 'paypal',
              payment_status = ?,
              reservation_status = ?
            WHERE id = ?
          `,
          [
            requiredDownpayment,
            paymentPlan.paidAmountAfterCapture,
            paymentPlan.remainingBalanceAfterCapture,
            paymentPlan.paymentStatusAfterCapture,
            paymentPlan.reservationStatusAfterCapture,
            reservation.id,
          ],
        );
      }
    }

    await connection.commit();

    return {
      reservationId: reservation.id,
      reservationCode: reservation.reservation_code,
      transactionId: transaction.id,
      orderId: paypalOrder.id,
      orderStatus: paypalOrder.status,
      captureId:
        lockedTransaction.paypal_capture_id || captureId,
      captureStatus:
        lockedTransaction.paypal_capture_status ||
        capture.status ||
        "COMPLETED",
      amount: expectedAmount.toFixed(2),
      currency: PAYPAL_CURRENCY,
      paymentFlow: paymentPlan.flow,
      paymentLabel: paymentPlan.label,
      paymentStatus: paymentPlan.paymentStatusAfterCapture,
      reservationStatus:
        paymentPlan.reservationStatusAfterCapture,
      remainingBalance:
        paymentPlan.remainingBalanceAfterCapture.toFixed(2),
      checkedIn: Boolean(
        paymentPlan.shouldCheckInAfterCapture ||
          Number(reservation.is_checked_in || 0) === 1
      ),
      alreadyRecorded: alreadyCompleted,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// ============================================================
// POST /api/paypal/reservations/:reservationId/capture
//
// Body:
// {
//   "orderId": "PAYPAL_ORDER_ID"
// }
//
// Important:
// - Browser sends ONLY the order ID.
// - Backend reloads reservation + transaction from MySQL.
// - Backend re-computes the official payment plan and verifies
//   both amount and PHP currency.
// - Reservation becomes approved only after PayPal reports a
//   COMPLETED capture.
// - Walk-in is checked in only after successful capture.
// ============================================================
exports.captureOrderForReservation = async (req, res) => {
  try {
    const reservationId = Number(req.params.reservationId);
    const orderId = String(req.body?.orderId || "").trim();

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation ID.",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "PayPal order ID is required.",
      });
    }

    const reservation = await getReservationForPayPal(
      reservationId,
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    const bookingSource = normalizeStatus(
      reservation.booking_source,
    );

    if (!["online", "manual"].includes(bookingSource)) {
      return res.status(400).json({
        success: false,
        message:
          "This reservation source is not supported by PayPal capture.",
      });
    }

    if (normalizeStatus(reservation.payment_method) !== "paypal") {
      return res.status(400).json({
        success: false,
        message:
          "This reservation is not configured for PayPal payment.",
      });
    }

    const reservationStatus = normalizeStatus(
      reservation.reservation_status,
    );

    if (
      ["cancelled", "completed", "rejected"].includes(
        reservationStatus,
      )
    ) {
      return res.status(409).json({
        success: false,
        message: `PayPal capture cannot continue because the reservation is ${reservationStatus}.`,
      });
    }

    const paymentPlan = buildPayPalPaymentPlan(reservation);

    const transaction = await findPayPalTransactionByOrder(
      reservationId,
      orderId,
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message:
          "No PayPal transaction was found for this reservation and order ID.",
      });
    }

    if (
      Math.abs(
        toMoney(transaction.amount) -
          toMoney(paymentPlan.amount),
      ) > 0.009
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Stored PayPal transaction amount does not match the reservation's official payment amount.",
      });
    }

    // Local idempotency: once this exact PayPal capture is recorded,
    // return success without charging again.
    if (
      normalizeStatus(transaction.paypal_capture_status) ===
        "completed" &&
      transaction.paypal_capture_id
    ) {
      return res.status(200).json({
        success: true,
        alreadyCaptured: true,
        reservationId,
        reservationCode: reservation.reservation_code,
        transactionId: transaction.id,
        orderId,
        captureId: transaction.paypal_capture_id,
        captureStatus: transaction.paypal_capture_status,
        amount: paymentPlan.amount.toFixed(2),
        currency: PAYPAL_CURRENCY,
        paymentFlow: paymentPlan.flow,
        paymentLabel: paymentPlan.label,
        paymentStatus:
          paymentPlan.paymentStatusAfterCapture,
        reservationStatus:
          paymentPlan.reservationStatusAfterCapture,
        remainingBalance:
          paymentPlan.remainingBalanceAfterCapture.toFixed(2),
        checkedIn: Boolean(
          paymentPlan.shouldCheckInAfterCapture ||
            Number(reservation.is_checked_in || 0) === 1
        ),
      });
    }

    let paypalOrder = await getPayPalOrder(orderId);
    let capture = getCompletedCaptureFromOrder(paypalOrder);

    if (
      normalizeStatus(paypalOrder?.status) === "completed"
    ) {
      if (!capture) {
        return res.status(502).json({
          success: false,
          message:
            "PayPal order is completed but no completed capture record was returned.",
        });
      }
    } else {
      if (
        normalizeStatus(paypalOrder?.status) !== "approved"
      ) {
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
      normalizeStatus(paypalOrder?.status) !== "completed" ||
      !capture ||
      normalizeStatus(capture?.status) !== "completed"
    ) {
      return res.status(502).json({
        success: false,
        message:
          "PayPal capture did not complete successfully.",
        orderStatus: paypalOrder?.status || null,
        captureStatus: capture?.status || null,
      });
    }

    const result = await finalizeSuccessfulPayPalCapture({
      reservation,
      transaction,
      paypalOrder,
      capture,
    });

    const successMessage =
      result.paymentFlow === "customer_online_downpayment"
        ? "PayPal downpayment captured successfully. Reservation is confirmed."
        : result.paymentFlow === "frontdesk_walkin_full"
          ? "Walk-in PayPal payment captured successfully. Reservation is approved and the guest is checked in."
          : "Front Desk PayPal payment captured successfully. Reservation is approved.";

    return res.status(200).json({
      success: true,
      alreadyCaptured: Boolean(result.alreadyRecorded),
      ...result,
      message: successMessage,
    });
  } catch (error) {
    console.error(
      "captureOrderForReservation error:",
      error.paypal || error,
    );

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message || "Failed to capture PayPal order.",
    });
  }
};