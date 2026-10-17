// Read-only, Admin-only report on charges marked paid within selected dates.
// Separate from reservations.paid_amount, which is a cumulative snapshot.
"use strict";
const db = require("../../config/db");

// Prevent invalid dates and unbounded reporting queries.
function parseDay(input) {
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const day = new Date(input + "T00:00:00.000Z");
  return Number.isFinite(day.getTime()) && day.toISOString().slice(0, 10) === input
    ? day : null;
}

exports.getAdminReportPaidCharges = async (req, res) => {
  const from = parseDay(req.query.from);
  const to = parseDay(req.query.to);
  if (!from || !to || from > to) {
    return res.status(400).json({
      message: "Provide valid chronological from and to dates (YYYY-MM-DD).",
    });
  }
  if ((to - from) / 86400000 + 1 > 366) {
    return res.status(400).json({ message: "Report range must be 366 days or less." });
  }
  const endExclusive = new Date(to.getTime() + 86400000).toISOString().slice(0, 10);
  try {
    // Charge payment date, not reservation creation date, determines the range.
    // Group records without exposing guest PII or charge notes.
    const [rows] = await db.promise().query(
      "SELECT booking_id, LOWER(TRIM(charge_name)) AS charge_name, " +
      "COALESCE(SUM(charge_amount),0) AS amount " +
      "FROM booking_charges WHERE COALESCE(is_paid,0) = 1 " +
      "AND paid_at >= ? AND paid_at < ? " +
      "GROUP BY booking_id, LOWER(TRIM(charge_name)) ORDER BY booking_id",
      [from.toISOString().slice(0, 10), endExclusive],
    );
    // Entrance-fee overpayment history is separate from onsite charges.
    // 'refund' means value returned; 'correction' voids an erroneous receipt.
    // These events are dated independently of the original reservation.
    const [reconciliationRows] = await db.promise().query(
      "SELECT LOWER(TRIM(reconciliation_type)) AS reconciliation_type, " +
      "COALESCE(SUM(amount),0) AS amount " +
      "FROM entrance_fee_reconciliations " +
      "WHERE LOWER(TRIM(reconciliation_type)) IN ('refund','correction') " +
      "AND created_at >= ? AND created_at < ? " +
      "GROUP BY LOWER(TRIM(reconciliation_type))",
      [from.toISOString().slice(0, 10), endExclusive],
    );
    const entranceReconciliations = { refunds: 0, corrections: 0 };
    for (const row of reconciliationRows) {
      const kind = String(row.reconciliation_type || "").toLowerCase();
      const amount = Number(row.amount);
      if (!Number.isFinite(amount) || amount < 0) {
        throw new Error("Invalid entrance reconciliation aggregate.");
      }
      if (kind === "refund") entranceReconciliations.refunds += amount;
      if (kind === "correction") entranceReconciliations.corrections += amount;
    }
    return res.json({
      success: true,
      entrance_reconciliations: entranceReconciliations,
      charges: rows.map(row => ({
        booking_id: Number(row.booking_id),
        charge_name: String(row.charge_name || ""),
        amount: Number(row.amount || 0),
      })),
    });
  } catch (error) {
    console.error("getAdminReportPaidCharges failed:", error.message);
    return res.status(500).json({ message: "Unable to load paid onsite charges." });
  }
};
