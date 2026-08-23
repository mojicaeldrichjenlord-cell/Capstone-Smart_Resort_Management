// ============================================================
// PAYMONGO CONTROLLER - STEP 5
// File: backend/controllers/paymongoController.js
//
// Purpose:
// - Uses PayMongo Hosted Checkout V2.
// - Creates a real Checkout Session only when explicitly enabled.
// - Uses the official reservation required_downpayment from MySQL.
// - Stores the PayMongo checkout_session_id in payment_transactions.
// - Uses a deterministic Idempotency-Key to prevent duplicate
//   Checkout Sessions during retries/network timeouts.
//
// IMPORTANT:
// - Leave PAYMONGO_CHECKOUT_ENABLED=false until the PayMongo
//   account/test credentials are ready.
// - This controller DOES NOT mark a reservation as paid.
// - Webhook processing remains disabled until Step 6.
// ============================================================

const axios = require("axios");
const db = require("../config/db");

const PAYMONGO_CHECKOUT_URL =
  "https://api.paymongo.com/v2/checkout_sessions";

// ============================================================
// CONFIG HELPERS
// ============================================================

function cleanEnv(name) {
  return String(process.env[name] || "").trim();
}

function isPayMongoConfigured() {
  return Boolean(cleanEnv("PAYMONGO_SECRET_KEY"));
}

function getAllowedPaymentMethods() {
  // Project requirement: GCash + Maya only.
  // The env option lets us temporarily disable one method if
  // the PayMongo account has not activated it yet.
  const configured = cleanEnv("PAYMONGO_PAYMENT_METHODS")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => ["gcash", "paymaya"].includes(value));

  return configured.length ? [...new Set(configured)] : ["gcash", "paymaya"];
}

function isCheckoutEnabled() {
  return (
    cleanEnv("PAYMONGO_CHECKOUT_ENABLED").toLowerCase() === "true" &&
    isPayMongoConfigured() &&
    Boolean(cleanEnv("PAYMONGO_SUCCESS_URL")) &&
    Boolean(cleanEnv("PAYMONGO_CANCEL_URL"))
  );
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toCentavos(pesoAmount) {
  return Math.round(toNumber(pesoAmount, 0) * 100);
}

function buildReturnUrl(baseUrl, reservation) {
  try {
    const url = new URL(baseUrl);

    url.searchParams.set(
      "reservation_id",
      String(reservation.id),
    );

    url.searchParams.set(
      "reservation_code",
      String(reservation.reservation_code || ""),
    );

    return url.toString();
  } catch (error) {
    return baseUrl;
  }
}

function getBasicAuthorizationHeader() {
  const secretKey = cleanEnv("PAYMONGO_SECRET_KEY");

  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

function getSafePayMongoError(error) {
  const responseData = error?.response?.data;

  if (Array.isArray(responseData?.errors) && responseData.errors.length) {
    const firstError = responseData.errors[0];

    return (
      firstError?.detail ||
      firstError?.code ||
      "PayMongo rejected the checkout request."
    );
  }

  return (
    responseData?.message ||
    error?.message ||
    "Failed to communicate with PayMongo."
  );
}

// ============================================================
// GET /api/paymongo/status
//
// Safe status endpoint.
// Never returns the secret key.
// ============================================================

exports.getStatus = async (req, res) => {
  try {
    await db.promise().query(
      `SELECT id FROM payment_transactions LIMIT 1`,
    );

    return res.status(200).json({
      success: true,
      module: "paymongo",
      api_version: "v2",
      database_ready: true,
      credentials_configured: isPayMongoConfigured(),
      checkout_enabled: isCheckoutEnabled(),
      webhook_enabled: false,
      payment_method_types: getAllowedPaymentMethods(),
      message: isCheckoutEnabled()
        ? "PayMongo Checkout Session creation is enabled."
        : "PayMongo backend is prepared, but checkout is still locked by configuration.",
    });
  } catch (error) {
    console.error("PayMongo status check error:", error);

    return res.status(500).json({
      success: false,
      module: "paymongo",
      api_version: "v2",
      database_ready: false,
      credentials_configured: isPayMongoConfigured(),
      checkout_enabled: false,
      webhook_enabled: false,
      payment_method_types: getAllowedPaymentMethods(),
      message:
        "PayMongo backend route is working, but payment_transactions could not be accessed.",
      error: error.message,
    });
  }
};

// ============================================================
// POST /api/paymongo/create-checkout
//
// Flow:
// 1. Validate reservation ID.
// 2. Read official payment values from MySQL.
// 3. Find/create the local pending PayMongo transaction.
// 4. Create PayMongo Hosted Checkout V2 session.
// 5. Save checkout_session_id locally.
// 6. Return checkout_url to frontend.
//
// SECURITY:
// The amount is NEVER accepted from the frontend.
// ============================================================

exports.createCheckout = async (req, res) => {
  let paymentTransactionId = null;

  try {
    const reservationId = Number(req.body.reservation_id);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid reservation_id is required.",
      });
    }

    if (!isCheckoutEnabled()) {
      return res.status(503).json({
        success: false,
        prepared: true,
        credentials_configured: isPayMongoConfigured(),
        checkout_enabled: false,
        message:
          "PayMongo checkout is not enabled yet. Complete the PayMongo test configuration first.",
      });
    }

    // --------------------------------------------------------
    // Reservation is the source of truth for amount.
    // --------------------------------------------------------

    const [reservationRows] = await db.promise().query(
      `
      SELECT
        id,
        reservation_code,
        booking_source,
        accommodation_total,
        required_downpayment,
        paid_amount,
        remaining_balance,
        payment_method,
        payment_status,
        reservation_status
      FROM reservations
      WHERE id = ?
      LIMIT 1
      `,
      [reservationId],
    );

    if (!reservationRows.length) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    const reservation = reservationRows[0];

    const requiredDownpayment = toNumber(
      reservation.required_downpayment,
      0,
    );

    const paidAmount = toNumber(
      reservation.paid_amount,
      0,
    );

    if (requiredDownpayment <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "This reservation does not have a valid required downpayment.",
      });
    }

    if (paidAmount >= requiredDownpayment) {
      return res.status(409).json({
        success: false,
        message:
          "The required reservation downpayment has already been paid.",
      });
    }

    const reservationStatus = String(
      reservation.reservation_status || "",
    ).toLowerCase();

    if (
      ["cancelled", "rejected", "completed"].includes(
        reservationStatus,
      )
    ) {
      return res.status(409).json({
        success: false,
        message:
          "PayMongo checkout cannot be created for this reservation status.",
      });
    }

    const amountToPay = Math.max(
      0,
      requiredDownpayment - paidAmount,
    );

    const amountInCentavos = toCentavos(amountToPay);

    if (amountInCentavos < 100) {
      return res.status(400).json({
        success: false,
        message:
          "PayMongo requires a payment amount of at least PHP 1.00.",
      });
    }

    // GCash/Maya e-wallet transaction maximum is PHP 100,000.
    if (amountToPay > 100000) {
      return res.status(400).json({
        success: false,
        message:
          "The online downpayment exceeds the supported GCash/Maya transaction limit.",
      });
    }

    // --------------------------------------------------------
    // Find the local PayMongo transaction created in Step 4.
    // If missing, create one as a safe fallback.
    // --------------------------------------------------------

    const [transactionRows] = await db.promise().query(
      `
      SELECT
        id,
        reservation_id,
        checkout_session_id,
        amount,
        status
      FROM payment_transactions
      WHERE reservation_id = ?
        AND provider = 'paymongo'
      ORDER BY id DESC
      LIMIT 1
      `,
      [reservationId],
    );

    let transaction = transactionRows[0] || null;

    if (!transaction) {
      const [insertResult] = await db.promise().query(
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
        [reservationId, amountToPay],
      );

      paymentTransactionId = insertResult.insertId;

      transaction = {
        id: paymentTransactionId,
        reservation_id: reservationId,
        checkout_session_id: null,
        amount: amountToPay,
        status: "pending",
      };
    } else {
      paymentTransactionId = Number(transaction.id);
    }

    // Do not create a second session after one is already linked.
    if (transaction.checkout_session_id) {
      return res.status(409).json({
        success: false,
        checkout_already_created: true,
        reservation_id: reservation.id,
        reservation_code: reservation.reservation_code,
        checkout_session_id: transaction.checkout_session_id,
        message:
          "A PayMongo checkout session is already linked to this reservation.",
      });
    }

    // Keep local transaction amount synchronized before API call.
    await db.promise().query(
      `
      UPDATE payment_transactions
      SET
        amount = ?,
        currency = 'PHP',
        status = 'pending'
      WHERE id = ?
        AND checkout_session_id IS NULL
      `,
      [amountToPay, paymentTransactionId],
    );

    // --------------------------------------------------------
    // Redirect URLs
    // --------------------------------------------------------

    const successUrl = buildReturnUrl(
      cleanEnv("PAYMONGO_SUCCESS_URL"),
      reservation,
    );

    const cancelUrl = buildReturnUrl(
      cleanEnv("PAYMONGO_CANCEL_URL"),
      reservation,
    );

    // --------------------------------------------------------
    // Idempotency
    //
    // Same internal payment transaction => same key.
    // If a timeout happens, retrying this operation within
    // PayMongo's idempotency window will not create duplicates.
    // --------------------------------------------------------

    const idempotencyKey =
      `smartresort-checkout-${paymentTransactionId}`;

    const paymentMethodTypes = getAllowedPaymentMethods();

    // --------------------------------------------------------
    // PayMongo Hosted Checkout V2 request.
    // Amounts are in centavos.
    // --------------------------------------------------------

    const requestBody = {
      data: {
        attributes: {
          line_items: [
            {
              name: `Reservation ${reservation.reservation_code} Downpayment`,
              description:
                "50% accommodation-only reservation downpayment",
              amount: amountInCentavos,
              currency: "PHP",
              quantity: 1,
            },
          ],

          payment_method_types: paymentMethodTypes,

          success_url: successUrl,
          cancel_url: cancelUrl,

          reference_number:
            String(reservation.reservation_code),

          description:
            `Arvic Seaside reservation ${reservation.reservation_code} downpayment`,

          // We keep PayMongo's transaction fee on the merchant side.
          // Do not set pass_on_fees unless the resort specifically
          // decides to charge the gateway fee to the customer.

          send_email_receipt: false,

          metadata: {
            reservation_id: String(reservation.id),
            reservation_code:
              String(reservation.reservation_code),
            payment_transaction_id:
              String(paymentTransactionId),
            payment_purpose:
              "reservation_downpayment",
          },
        },
      },
    };

    const paymongoResponse = await axios.post(
      PAYMONGO_CHECKOUT_URL,
      requestBody,
      {
        headers: {
          Authorization: getBasicAuthorizationHeader(),
          "Content-Type": "application/json",
          Accept: "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        timeout: 20000,
      },
    );

    const checkoutData = paymongoResponse?.data?.data;
    const checkoutSessionId = checkoutData?.id;
    const checkoutUrl =
      checkoutData?.attributes?.checkout_url;

    if (!checkoutSessionId || !checkoutUrl) {
      throw new Error(
        "PayMongo created an invalid Checkout Session response.",
      );
    }

    // --------------------------------------------------------
    // Save Checkout Session locally.
    // Payment is STILL NOT considered paid.
    // --------------------------------------------------------

    await db.promise().query(
      `
      UPDATE payment_transactions
      SET
        checkout_session_id = ?,
        reference_number = ?,
        status = 'processing'
      WHERE id = ?
      `,
      [
        checkoutSessionId,
        reservation.reservation_code,
        paymentTransactionId,
      ],
    );

    return res.status(200).json({
      success: true,
      reservation_id: reservation.id,
      reservation_code: reservation.reservation_code,
      payment_transaction_id: paymentTransactionId,
      checkout_session_id: checkoutSessionId,
      checkout_url: checkoutUrl,
      amount_to_pay: amountToPay,
      currency: "PHP",
      payment_method_types: paymentMethodTypes,
      message:
        "PayMongo Checkout Session created successfully.",
    });
  } catch (error) {
    const safeMessage = getSafePayMongoError(error);

    console.error("createCheckout error:", {
      message: safeMessage,
      status: error?.response?.status || null,
    });

    // We intentionally do not mark the payment transaction paid
    // or failed here. A network failure may happen after PayMongo
    // accepted the request. The deterministic Idempotency-Key lets
    // the same checkout creation operation be safely retried.
    return res.status(
      error?.response?.status >= 400 &&
      error?.response?.status < 500
        ? error.response.status
        : 502,
    ).json({
      success: false,
      payment_transaction_id:
        paymentTransactionId || null,
      message: safeMessage,
    });
  }
};

// ============================================================
// POST /api/paymongo/webhook
//
// STEP 5:
// The route exists but payment confirmation is NOT active yet.
//
// STEP 6 will:
// - verify PayMongo webhook authenticity,
// - process checkout_session.payment.paid,
// - prevent duplicate webhook processing,
// - save payment_id/payment method,
// - update reservation paid_amount,
// - update remaining_balance,
// - update payment_status.
//
// Until Step 6, never mark a PayMongo payment as paid.
// ============================================================

exports.handleWebhook = async (req, res) => {
  return res.status(501).json({
    success: false,
    prepared: true,
    message:
      "PayMongo webhook route exists, but verified webhook payment processing will be implemented in Step 6.",
  });
};
