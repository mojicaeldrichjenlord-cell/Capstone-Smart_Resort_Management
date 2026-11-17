"use strict";

// Read-only production preflight. It does not create bookings, touch
// payment status, simulate PayPal captures, or alter any database records.
// Restricted to verified Admin and Front Desk accounts by bookingRoutes.
const db = require("../../config/db");

const required = Object.freeze({
  reservations: [
    "id", "reservation_code", "user_id", "created_by", "booking_source",
    "first_name", "last_name", "contact_no", "guest_count",
    "accommodation_total", "required_downpayment", "paid_amount",
    "remaining_balance", "payment_method", "payment_status",
    "reservation_status", "is_checked_in", "reserved_at"
  ],
  reservation_items: [
    "reservation_id", "accommodation_id", "slot_type",
    "check_in_date", "check_in_time", "check_out_date", "check_out_time",
    "item_price", "stay_duration"
  ],
  accommodations: [
    "id", "name", "status", "day_price", "overnight_price"
  ],
  users: ["id", "role", "password"],
  payment_transactions: [
    "id", "reservation_id", "paypal_order_id", "paypal_capture_status"
  ],
  reservation_payment_proofs: [
    "id", "reservation_id", "mime_type", "image_data"
  ],
});

function summarizeReadiness(columnRows = [], env = {}, database = "") {
  const groups = new Map();
  for (const row of columnRows) {
    const table = String(row.TABLE_NAME || row.table_name || "").toLowerCase();
    const column = String(row.COLUMN_NAME || row.column_name || "").toLowerCase();
    if (!table || !column) continue;
    if (!groups.has(table)) groups.set(table, new Set());
    groups.get(table).add(column);
  }
  const missing = {};
  for (const [table, cols] of Object.entries(required)) {
    const available = groups.get(table) || new Set();
    const absent = cols.filter(x => !available.has(x));
    if (absent.length) missing[table] = absent;
  }
  const has = (...tables) => tables.every(table => !missing[table]);
  const coreTablesReady = has("reservations", "reservation_items", "accommodations", "users");
  const transactionReady = has("payment_transactions");
  const proofStorageReady = has("reservation_payment_proofs");
  const gatewayConfigured = Boolean(String(env.PAYPAL_CLIENT_ID || "").trim() &&
    String(env.PAYPAL_CLIENT_SECRET || "").trim());
  const gateway = String(env.PAYPAL_BASE_URL ||
    "https://api-m.sandbox.paypal.com").toLowerCase().includes("sandbox")
    ? "sandbox" : "live";
  const customer = coreTablesReady && transactionReady && gatewayConfigured;
  return {
    database: database || null,
    checks: {
      customerBookingDatabase: coreTablesReady,
      customerPayPal: customer,
      customerSandboxDemo: customer && gateway === "sandbox",
      frontDeskWalkInCash: coreTablesReady,
      frontDeskEwalletProof: coreTablesReady && proofStorageReady,
      frontDeskFacebookWallet: coreTablesReady && proofStorageReady,
    },
    paymentEnvironment: gateway,
    // This is schema/config readiness only. It cannot prove credentials
    // are accepted by PayPal or that a real submitted booking will succeed.
    validationScope: "Read-only schema and environment configuration, not an actual transaction",
    missing,
    reminders: [
      "Customer check-in requires at least two calendar days' advance booking.",
      "Walk-in reservation uses today's date and full payment; staff-recorded Cash is allowed.",
      "Facebook/Messenger manual reservation uses GCash or Maya with a genuine proof screenshot.",
      "For test customer checkout, use PayPal SANDBOX buyer credentials and never a real card.",
      "Demo reservations persist in the selected MySQL database and can affect availability and reports."
    ]
  };
}

async function getBookingReadiness(req, res) {
  try {
    const [dbRows] = await db.promise().query("SELECT DATABASE() AS db_name");
    const activeDatabase = String(dbRows[0]?.db_name || "");
    const [columnRows] = await db.promise().query(
      "SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
      "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (" +
      Object.keys(required).map(() => "?").join(",") + ")",
      Object.keys(required)
    );
    const report = summarizeReadiness(columnRows, process.env, activeDatabase);
    return res.status(200).json(report);
  } catch (error) {
    console.error("booking readiness check failed:", error.message);
    return res.status(503).json({
      message: "Booking readiness could not be verified. No bookings were created.",
    });
  }
}

module.exports = { getBookingReadiness, summarizeReadiness };
