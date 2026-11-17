// Finding #017 — Admin-reviewed No-Show management.
// This controller NEVER auto-cancels bookings, changes recorded payments,
// marks checkout as completed, or rewrites historical reservation items.
// Only a signed, active Admin may trigger this endpoint (route middleware).
"use strict";

const db = require("../../config/db");
const { getManilaDateTimeKey } = require("../../utils/checkInWindow");

async function markReservationNoShow(req, res) {
  const reservationId = Number(req.params.id);
  const adminId = Number(req.adminUser?.id);
  if (!Number.isSafeInteger(reservationId) || reservationId <= 0) {
    return res.status(400).json({ success: false, message: "Invalid reservation ID." });
  }
  if (!Number.isSafeInteger(adminId) || adminId <= 0) {
    return res.status(403).json({ success: false, message: "Administrator authorization required." });
  }

  let connection;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    // Serialize No-Show vs check-in/status changes on this reservation.
    const [rows] = await connection.query(
      `SELECT id, reservation_code, reservation_status,
              COALESCE(is_checked_in, 0) AS is_checked_in, checked_in_at
         FROM reservations WHERE id = ? LIMIT 1 FOR UPDATE`,
      [reservationId],
    );
    const booking = rows[0];
    if (!booking) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Reservation not found." });
    }

    const oldStatus = String(booking.reservation_status || "").toLowerCase();
    if (!["pending", "approved"].includes(oldStatus) ||
        Number(booking.is_checked_in) !== 0 || booking.checked_in_at != null) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "Only Pending/Approved reservations that were never checked in can be marked No-Show.",
      });
    }

    // Multiple booked accommodations / multi-day stays: use the LAST checkout,
    // not the first accommodation's checkout. Compare Manila-local clock text.
    const [schedules] = await connection.query(
      `SELECT COUNT(*) AS item_count,
              SUM(CASE WHEN check_out_date IS NULL OR check_out_time IS NULL
                       THEN 1 ELSE 0 END) AS invalid_items,
              DATE_FORMAT(MAX(TIMESTAMP(check_out_date, check_out_time)),
                          '%Y-%m-%d %H:%i:%s') AS latest_checkout
         FROM reservation_items WHERE reservation_id = ?`,
      [reservationId],
    );
    const schedule = schedules[0] || {};
    const checkout = String(schedule.latest_checkout || "");
    if (!Number(schedule.item_count) || Number(schedule.invalid_items) > 0 ||
        !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(checkout)) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "The reservation has an incomplete checkout schedule. Review it manually.",
      });
    }
    if (checkout > getManilaDateTimeKey()) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "No-Show is allowed only after the final scheduled checkout time.",
      });
    }

    // Guard the write even though the reservation row is locked.
    const [changed] = await connection.query(
      `UPDATE reservations SET reservation_status = 'no_show'
         WHERE id = ? AND reservation_status = ?
           AND COALESCE(is_checked_in,0) = 0 AND checked_in_at IS NULL`,
      [reservationId, booking.reservation_status],
    );
    if (changed.affectedRows !== 1) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "Reservation state changed. Please refresh and review again.",
      });
    }

    await connection.query(
      `INSERT INTO reservation_no_show_audit
         (reservation_id, marked_by_admin_id, previous_status,
          scheduled_checkout_at, marked_at_utc)
         VALUES (?, ?, ?, ?, UTC_TIMESTAMP())`,
      [reservationId, adminId, oldStatus, checkout],
    );
    await connection.commit();
    return res.status(200).json({
      success: true,
      id: reservationId,
      status: "no_show",
      message: "Reservation marked No-Show. Payment and transaction history were preserved.",
    });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    console.error("markReservationNoShow error:", error.code || error.message);
    const missingMigration = error.code === "ER_NO_SUCH_TABLE" ||
      error.code === "WARN_DATA_TRUNCATED" ||
      error.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD" ||
      error.errno === 1265;
    if (missingMigration) {
      return res.status(503).json({
        success: false,
        message: "No-Show database migration is required before this action can be used.",
      });
    }
    return res.status(500).json({ success: false, message: "Unable to mark reservation No-Show." });
  } finally {
    if (connection) connection.release();
  }
}

module.exports = { markReservationNoShow };
