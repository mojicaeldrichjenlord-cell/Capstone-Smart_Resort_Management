// ============================================================
// SMART RESORT BOOKING SYSTEM
// Phase 2 - PayPal Sandbox Service
// Target file: backend/services/paypalService.js
//
// Purpose:
// - Keep PayPal REST API calls in one backend-only module.
// - Obtain OAuth 2.0 access tokens using Client ID + Secret.
// - Create PayPal Orders for the server-calculated downpayment.
// - Capture approved PayPal Orders.
// - Never expose PAYPAL_CLIENT_SECRET to the frontend.
// ============================================================

const axios = require("axios");

const PAYPAL_BASE_URL =
  process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

let cachedAccessToken = null;
let cachedAccessTokenExpiresAt = 0;

function assertPayPalConfig() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    const error = new Error(
      "PayPal credentials are missing. Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in backend/.env.",
    );
    error.status = 500;
    throw error;
  }
}

function normalizeMoney(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error("PayPal amount must be greater than zero.");
    error.status = 400;
    throw error;
  }

  return amount.toFixed(2);
}

function cleanText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function buildPayPalError(error, fallbackMessage) {
  const paypalData = error?.response?.data;
  const status = Number(error?.response?.status || 500);

  const message =
    paypalData?.message ||
    paypalData?.details?.[0]?.description ||
    error?.message ||
    fallbackMessage;

  const wrappedError = new Error(message);
  wrappedError.status = status;
  wrappedError.paypal = paypalData || null;

  return wrappedError;
}

async function getPayPalAccessToken() {
  assertPayPalConfig();

  const now = Date.now();

  if (
    cachedAccessToken &&
    cachedAccessTokenExpiresAt &&
    now < cachedAccessTokenExpiresAt - 60_000
  ) {
    return cachedAccessToken;
  }

  const basicAuth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  try {
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 20_000,
      },
    );

    const accessToken = response.data?.access_token;
    const expiresInSeconds = Number(response.data?.expires_in || 0);

    if (!accessToken) {
      throw new Error("PayPal did not return an OAuth access token.");
    }

    cachedAccessToken = accessToken;
    cachedAccessTokenExpiresAt =
      Date.now() + Math.max(expiresInSeconds, 60) * 1000;

    return accessToken;
  } catch (error) {
    throw buildPayPalError(
      error,
      "Failed to authenticate with PayPal Sandbox.",
    );
  }
}

async function createPayPalOrder({
  amount,
  currency = "PHP",
  reservationCode,
  description,
  requestId,
}) {
  const accessToken = await getPayPalAccessToken();

  const cleanAmount = normalizeMoney(amount);
  const cleanCurrency = cleanText(currency, "PHP").toUpperCase();
  const cleanReservationCode = cleanText(
    reservationCode,
    "RESERVATION",
  );

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  if (requestId) {
    headers["PayPal-Request-Id"] = cleanText(requestId);
  }

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: cleanReservationCode,
        custom_id: cleanReservationCode,
        description: cleanText(
          description,
          `50% accommodation downpayment for ${cleanReservationCode}`,
        ),
        amount: {
          currency_code: cleanCurrency,
          value: cleanAmount,
        },
      },
    ],
  };

  try {
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      body,
      {
        headers,
        timeout: 20_000,
      },
    );

    return response.data;
  } catch (error) {
    throw buildPayPalError(
      error,
      "Failed to create PayPal order.",
    );
  }
}

async function capturePayPalOrder(orderId, requestId = null) {
  const cleanOrderId = cleanText(orderId);

  if (!cleanOrderId) {
    const error = new Error("PayPal order ID is required.");
    error.status = 400;
    throw error;
  }

  const accessToken = await getPayPalAccessToken();

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  if (requestId) {
    headers["PayPal-Request-Id"] = cleanText(requestId);
  }

  try {
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(
        cleanOrderId,
      )}/capture`,
      {},
      {
        headers,
        timeout: 20_000,
      },
    );

    return response.data;
  } catch (error) {
    throw buildPayPalError(
      error,
      "Failed to capture PayPal order.",
    );
  }
}

async function getPayPalOrder(orderId) {
  const cleanOrderId = cleanText(orderId);

  if (!cleanOrderId) {
    const error = new Error("PayPal order ID is required.");
    error.status = 400;
    throw error;
  }

  const accessToken = await getPayPalAccessToken();

  try {
    const response = await axios.get(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(
        cleanOrderId,
      )}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 20_000,
      },
    );

    return response.data;
  } catch (error) {
    throw buildPayPalError(
      error,
      "Failed to retrieve PayPal order.",
    );
  }
}

module.exports = {
  getPayPalAccessToken,
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrder,
};
