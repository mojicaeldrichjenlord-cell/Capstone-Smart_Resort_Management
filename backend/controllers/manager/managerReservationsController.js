// Manager Reservation Management. These routes are mounted only behind
// requireManagerAuth. No Admin/Front Desk tokens are accepted.
// Manager can APPROVE or REJECT pending, not-yet-checked-in reservations.
// No cancellation, payment changes, check-in, checkout or account operations.
const db = require("../../config/db");
const SEARCH_MAX_LENGTH = 80;
const RESULT_LIMIT = 200;
const VALID_FILTERS = new Set([
  "all", "pending", "approved", "rejected", "cancelled", "completed",
]);

// Manager may search and review a bounded booking list without full Admin powers.
// Let Managers search and filter a limited list of reservations for operational review.
// This handler is read-only and must not grant Admin or Front Desk privileges.
exports.listManagerReservations = async (req, res) => {
  const status = String(req.query.status || "all").trim().toLowerCase();
  const search = String(req.query.search || "").trim();
  if (!VALID_FILTERS.has(status)) {
    return res.status(400).json({
      success: false, message: "Invalid reservation status filter.",
    });
  }
  if (search.length > SEARCH_MAX_LENGTH) {
    return res.status(400).json({
      success: false, message: "Search must be 80 characters or fewer.",
    });
  }

  const clauses = [], params = [];
  if (status !== "all") {
    clauses.push("r.reservation_status = ?");
    params.push(status);
  }
  if (search) {
    const term = search.replace(/[\\%_]/g, "\\$&");
    clauses.push(
      "(r.reservation_code LIKE ? OR r.first_name LIKE ? OR r.last_name LIKE ? OR " +
      "a.name LIKE ?)"
    );
    params.push(...Array(4).fill("%" + term + "%"));
  }
  const where = clauses.length ? "WHERE " + clauses.join(" AND ") : "";

  try {
    const [rows] = await db.promise().query(
      `
      SELECT
        r.id, r.reservation_code, r.booking_source,
        r.first_name, r.last_name, r.guest_count,
        r.reservation_status AS status, r.payment_status,
        COALESCE(r.is_checked_in, 0) AS is_checked_in,
        r.created_at,
        ri.check_in_date, ri.check_in_time,
        ri.check_out_date, ri.check_out_time,
        a.name AS accommodation_name
      FROM reservations r
      LEFT JOIN (
        SELECT reservation_id, MIN(id) AS first_item_id
        FROM reservation_items
        GROUP BY reservation_id
      ) first_ref ON first_ref.reservation_id = r.id
      LEFT JOIN reservation_items ri ON ri.id = first_ref.first_item_id
      LEFT JOIN accommodations a ON a.id = ri.accommodation_id
      ` + where +
      ` ORDER BY r.created_at DESC, r.id DESC LIMIT ` + RESULT_LIMIT,
      params,
    );

    return res.status(200).json({
      success: true,
      reservations: rows.map(row => ({
        id: Number(row.id),
        reservation_code: String(row.reservation_code || ""),
        guest_name: [row.first_name, row.last_name].filter(Boolean).join(" "),
        guests: Number(row.guest_count || 0),
        accommodation: String(row.accommodation_name || "Not specified"),
        booking_source: String(row.booking_source || ""),
        status: String(row.status || ""),
        payment_status: String(row.payment_status || ""),
        is_checked_in: Number(row.is_checked_in) === 1,
        check_in_date: row.check_in_date ?? null,
        check_in_time: row.check_in_time ?? null,
        check_out_date: row.check_out_date ?? null,
        check_out_time: row.check_out_time ?? null,
        created_at: row.created_at ?? null,
      })),
      limit: RESULT_LIMIT,
      note: "Limited to the 200 most recent matching reservations. No payment proof or personal contact details are included.",
    });
  } catch (error) {
    console.error("Manager reservation list failed:", error.message);
    return res.status(500).json({
      success: false, message: "Unable to load Manager reservations.",
    });
  }
};

// Only pending, unchecked bookings can transition to approved/rejected.
// Guarded SQL updates prevent a concurrent Manager/Admin review being overwritten.
// Managers may approve or reject only pending, not-checked-in reservations.
// The guarded database update prevents two reviewers from overwriting each other's decision.
exports.reviewManagerReservation = async (req, res) => {
  const id = Number(req.params.id);
  const target = String(req.body?.status || "").trim().toLowerCase();

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false, message: "Invalid reservation ID.",
    });
  }
  if (!["approved", "rejected"].includes(target)) {
    return res.status(400).json({
      success: false,
      message: "Manager may only approve or reject pending reservations.",
    });
  }

  try {
    // Re-check state before writing. Only 'pending' -> approved/rejected
    // is allowed; the guarded UPDATE also handles concurrent transitions.
    const [records] = await db.promise().query(
      "SELECT id, reservation_status, COALESCE(is_checked_in,0) AS is_checked_in " +
      "FROM reservations WHERE id = ? LIMIT 1",
      [id],
    );
    const current = records[0];
    if (!current) {
      return res.status(404).json({
        success: false, message: "Reservation not found.",
      });
    }
    if (String(current.reservation_status || "").toLowerCase() !== "pending" ||
        Number(current.is_checked_in) !== 0) {
      return res.status(409).json({
        success: false, code: "RESERVATION_NOT_PENDING",
        message: "Only pending, not-yet-checked-in reservations may be reviewed.",
      });
    }

    const [result] = await db.promise().query(
      "UPDATE reservations SET reservation_status = ? " +
      "WHERE id = ? AND reservation_status = 'pending' " +
      "AND COALESCE(is_checked_in,0) = 0",
      [target, id],
    );
    if (Number(result.affectedRows) !== 1) {
      return res.status(409).json({
        success: false, code: "RESERVATION_CHANGED",
        message: "Reservation changed during review. Refresh and try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: target === "approved" ? "Reservation approved." : "Reservation rejected.",
      id, status: target,
    });
  } catch (error) {
    // An older Aiven schema has reservation_status ENUM without 'rejected'.
    // Preserve the reservation and return a clear configuration error instead
    // of retrying or silently relabeling rejection as cancellation.
    const isInvalidEnumStatus =
      Number(error?.errno) === 1265 ||
      error?.code === "WARN_DATA_TRUNCATED" ||
      error?.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD";
    if (isInvalidEnumStatus) {
      console.error("Manager reservation status not supported by DB schema:", error.message);
      return res.status(409).json({
        success: false,
        code: "RESERVATION_STATUS_SCHEMA_MISMATCH",
        message: "The database does not support that reservation status yet. Ask Admin to review the reservation-status migration.",
      });
    }
    console.error("Manager reservation review failed:", error.message);
    return res.status(500).json({
      success: false, message: "Unable to update reservation status.",
    });
  }
};
