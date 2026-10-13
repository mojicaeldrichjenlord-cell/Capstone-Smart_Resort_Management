// Read-only Manager overview. No guest names, contact information, proofs,
// account lists, raw receipts, payment credentials, or write operations.
const db = require("../../config/db");

// Defensive integer conversion for summary counts; avoid NaN in the API.
function safeInt(value) {
  const num = Number(value);
  return Number.isSafeInteger(num) && num >= 0 ? num : 0;
}
// Financial summaries are snapshots; they are not reconciled net revenue.
function safeMoney(value) {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : 0;
}

// Send only the authenticated Manager identity confirmed by role middleware.
exports.getManagerMe = (req, res) => res.status(200).json({
  success: true,
  user: {
    id: req.managerUser.id, role: "manager",
    fullname: req.managerUser.fullname, email: req.managerUser.email,
  },
});

// Use read-only aggregate queries; never return guest contacts or payment proof.
exports.getManagerOverview = async (_req, res) => {
  try {
    const [reservationRows] = await db.promise().query(
      "SELECT COUNT(*) AS total_reservations, " +
      "COALESCE(SUM(CASE WHEN reservation_status = 'pending' THEN 1 ELSE 0 END),0) AS pending_reservations, " +
      "COALESCE(SUM(CASE WHEN reservation_status = 'approved' THEN 1 ELSE 0 END),0) AS approved_reservations, " +
      "COALESCE(SUM(CASE WHEN COALESCE(is_checked_in,0) = 1 AND " +
        "reservation_status NOT IN ('completed','cancelled','rejected') THEN 1 ELSE 0 END),0) AS guests_inside, " +
      "COALESCE(SUM(CASE WHEN reservation_status = 'completed' THEN 1 ELSE 0 END),0) AS completed_reservations, " +
      "COALESCE(SUM(COALESCE(paid_amount,0)),0) AS recorded_reservation_payments " +
      "FROM reservations");
    const [inventoryRows] = await db.promise().query(
      "SELECT COUNT(*) AS total_accommodations, " +
      "COALESCE(SUM(CASE WHEN LOWER(status) = 'available' THEN 1 ELSE 0 END),0) AS listed_available " +
      "FROM accommodations");
    const [activityRows] = await db.promise().query(
      "SELECT reservation_code, reservation_status, booking_source, created_at " +
      "FROM reservations ORDER BY created_at DESC LIMIT 8");

    const summary = reservationRows[0] || {};
    const inventory = inventoryRows[0] || {};
    return res.status(200).json({
      success: true,
      summary: {
        total_reservations: safeInt(summary.total_reservations),
        pending_reservations: safeInt(summary.pending_reservations),
        approved_reservations: safeInt(summary.approved_reservations),
        guests_inside: safeInt(summary.guests_inside),
        completed_reservations: safeInt(summary.completed_reservations),
        recorded_reservation_payments: safeMoney(summary.recorded_reservation_payments),
        total_accommodations: safeInt(inventory.total_accommodations),
        listed_available: safeInt(inventory.listed_available),
      },
      recent_activity: activityRows.map(row => ({
        reservation_code: String(row.reservation_code || ""),
        status: String(row.reservation_status || ""),
        booking_source: String(row.booking_source || ""),
        created_at: row.created_at || null,
      })),
      notes: {
        payments: "Recorded reservation payments only; excludes separate front-desk charges and adjustments.",
        inventory: "Listed-available status is not date-specific reservation availability.",
      },
    });
  } catch (error) {
    console.error("Manager overview failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load Manager overview." });
  }
};
