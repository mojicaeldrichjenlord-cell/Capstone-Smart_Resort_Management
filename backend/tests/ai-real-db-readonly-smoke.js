/**
 * Stage 85-C: read-only verification against the database configured for the
 * backend. Run from backend/: node tests/ai-real-db-readonly-smoke.js
 *
 * Safety:
 * - SELECT statements inside a READ ONLY transaction; never creates,
 *   changes or cancels a booking, and never performs a payment.
 * - No Gemini/AI request and no customer personal information is printed.
 * - Uses the same .env DB_* settings as server.js (local MySQL or Aiven).
 * - Existing reservation data is inspected only for overlap consistency.
 */
const assert = require("node:assert/strict");
const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env"), quiet: true });
const mysql = require("mysql2/promise");

const activeReservation = `
  LOWER(COALESCE(r.reservation_status, 'pending'))
    NOT IN ('cancelled', 'rejected', 'completed')
  AND LOWER(COALESCE(r.payment_status, 'pending'))
    NOT IN ('rejected', 'refunded')
`;

// Keep this predicate aligned with getAvailableRooms in
// controllers/ai/geminiChatController.js and checkReservationConflicts in
// controllers/shared/bookingController.js.
const aiAvailabilitySQL = `
  SELECT a.id, a.name AS room_name, a.day_price, a.overnight_price,
         a.extended_price, a.max_capacity AS capacity
  FROM accommodations a
  JOIN accommodation_categories c ON c.id = a.category_id
  WHERE LOWER(COALESCE(a.status, '')) = 'available'
    AND a.max_capacity >= ?
    AND NOT EXISTS (
      SELECT 1 FROM reservation_items ri
      JOIN reservations r ON r.id = ri.reservation_id
      WHERE ri.accommodation_id = a.id
        AND ${activeReservation}
        AND TIMESTAMP(ri.check_in_date, ri.check_in_time) < TIMESTAMP(?, ?)
        AND TIMESTAMP(?, ?) < TIMESTAMP(ri.check_out_date, ri.check_out_time)
    )
`;

async function main() {
  assert.ok(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME,
    "Missing DB settings. Confirm backend/.env, without sharing credentials.");
  const useSSL = String(process.env.DB_SSL || "").toLowerCase() === "true";
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: true,
    multipleStatements: false,
    connectTimeout: 10000,
    ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  });
  try {
    // Enforced by MySQL/MariaDB: queries inside this transaction cannot write.
    await connection.query("START TRANSACTION READ ONLY");
    const [[stats]] = await connection.query(`
      SELECT COUNT(*) AS total,
        SUM(LOWER(COALESCE(status, '')) = 'available') AS available_count,
        SUM(day_price IS NULL OR day_price <= 0 OR
            overnight_price IS NULL OR overnight_price <= 0 OR
            extended_price IS NULL OR extended_price <= 0) AS incomplete_rates
      FROM accommodations
    `);
    console.log("PASS: Read-only MySQL connection and accommodations table.");
    console.log("Inventory totals:", {
      accommodations: Number(stats.total),
      admin_available: Number(stats.available_count || 0),
      records_with_missing_or_nonpositive_rates: Number(stats.incomplete_rates || 0),
    });
    // Read the actual catalog query to catch schema/join incompatibility.
    const [catalog] = await connection.query(`
      SELECT a.id, a.name AS room_name, a.day_price, a.overnight_price,
             a.extended_price, a.max_capacity AS capacity,
             c.name AS category_name
      FROM accommodations a
      JOIN accommodation_categories c ON c.id = a.category_id
      ORDER BY a.id DESC LIMIT 150
    `);
    console.log("PASS: Fresh accommodation catalog query (rows:", catalog.length + ").");

    // Prefer a future reservation, but older active rows still verify SQL
    // conflict behavior without creating test reservations.
    const [existing] = await connection.query(`
      SELECT ri.accommodation_id, ri.check_in_date, ri.check_in_time,
             ri.check_out_date, ri.check_out_time
      FROM reservation_items ri
      JOIN reservations r ON r.id = ri.reservation_id
      JOIN accommodations a ON a.id = ri.accommodation_id
      WHERE LOWER(COALESCE(a.status, '')) = 'available'
        AND a.max_capacity >= 1
        AND ${activeReservation}
      ORDER BY (TIMESTAMP(ri.check_out_date, ri.check_out_time) >= NOW()) DESC,
               ri.check_in_date DESC, ri.id DESC
      LIMIT 1
    `);
    if (!existing.length) {
      console.log("SKIP: No existing active reservation on an admin-available accommodation.");
      console.log("The real overlap test remains PENDING; no test booking was created.");
      return;
    }
    const item = existing[0];
    const values = [
      1,
      item.check_out_date, item.check_out_time,
      item.check_in_date, item.check_in_time,
    ];
    const [aiResults] = await connection.query(aiAvailabilitySQL, values);
    assert.ok(!aiResults.some((r) => Number(r.id) === Number(item.accommodation_id)),
      "FAIL: AI preliminary availability includes an actively reserved accommodation.");

    // Independent positive control: the booking-style overlap check must
    // detect at least one active item in the exact same interval.
    const [[overlap]] = await connection.query(`
      SELECT COUNT(*) AS conflicts
      FROM reservation_items ri
      JOIN reservations r ON r.id = ri.reservation_id
      WHERE ri.accommodation_id = ? AND ${activeReservation}
        AND TIMESTAMP(ri.check_in_date, ri.check_in_time) < TIMESTAMP(?, ?)
        AND TIMESTAMP(?, ?) < TIMESTAMP(ri.check_out_date, ri.check_out_time)
    `, [item.accommodation_id,
      item.check_out_date, item.check_out_time,
      item.check_in_date, item.check_in_time]);
    assert.ok(Number(overlap.conflicts) >= 1,
      "FAIL: Reservation conflict control did not find the known active booking.");
    console.log("PASS: Active reservation excluded from AI available rooms.");
    console.log("PASS: Booking conflict query independently detects overlap.");
    console.log("PASS: No database writes, Gemini calls, or payments were made.");
  } finally {
    try {
      await connection.query("ROLLBACK");
    } finally {
      await connection.end();
    }
  }
}

main().catch((error) => {
  console.error("Stage 85-C read-only verification FAILED:", error.message);
  process.exitCode = 1;
});
