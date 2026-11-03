// Refund Phase 1 — REQUEST TRACKING ONLY; never calls PayPal or transfers funds.
// Separate from cancellation: cancelling a booking does NOT refund its payment.
// No refund amount is automatically quoted or approved (especially for demo
// reservations whose recorded downpayment may differ from real PayPal captures).
const db = require("../../config/db");

function validId(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function refundDatabaseError(res, error, action) {
  // Do not leak SQL, credentials, or private reservation details.
  console.error("refund " + action + " error:", error.message);
  if (error.code === "ER_NO_SUCH_TABLE") {
    return res.status(503).json({
      success: false, code: "REFUND_SCHEMA_PENDING",
      message: "Refund requests are not enabled on this database yet.",
    });
  }
  return res.status(500).json({
    success: false, message: "Unable to " + action + " refund requests.",
  });
}

// POST /api/refunds/customer/requests
// Creates at most one manual-review request for a cancelled, paid-on-record
// booking belonging to the signed-in customer. This is NOT an actual refund.
exports.createRefundRequest = async (req, res) => {
  const customerId = validId(req.customerUser?.id);
  const reservationId = validId(req.body?.reservation_id);
  const reason = String(req.body?.reason || "").trim();
  if (!customerId || !reservationId) {
    return res.status(400).json({ success: false, message: "Invalid reservation or session." });
  }
  if (reason.length < 10 || reason.length > 500) {
    return res.status(400).json({
      success: false, message: "Please describe your refund request in 10–500 characters.",
    });
  }

  try {
    // Only the authenticated owner can request. Booking eligibility is
    // checked AGAIN in the INSERT, protecting against racing status updates.
    const [result] = await db.promise().query(
      `INSERT INTO refund_requests (reservation_id, customer_user_id, reason)
       SELECT r.id, r.user_id, ?
         FROM reservations r
        WHERE r.id = ? AND r.user_id = ?
          AND LOWER(r.booking_source) = 'online'
          AND LOWER(r.reservation_status) IN ('cancelled','rejected')
          AND COALESCE(r.is_checked_in, 0) = 0
          AND COALESCE(r.paid_amount, 0) > 0`,
      [reason, reservationId, customerId],
    );
    if (result.affectedRows !== 1) {
      return res.status(409).json({
        success: false, code: "REFUND_REQUEST_INELIGIBLE",
        message: "Only your cancelled or rejected online reservation with recorded payment can be submitted for refund review.",
      });
    }
    return res.status(201).json({
      success: true, request_id: result.insertId, status: "pending_review",
      message: "Refund review request submitted. No money has been refunded. The resort must verify actual payments and refund policy.",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY" || Number(error.errno) === 1062) {
      return res.status(409).json({
        success: false, code: "REFUND_ALREADY_REQUESTED",
        message: "A refund review request already exists for this reservation.",
      });
    }
    return refundDatabaseError(res, error, "submit");
  }
};

// GET /api/refunds/customer/requests
// Enforces owner scoping even when the browser supplies a different ID.
exports.getCustomerRefundRequests = async (req, res) => {
  const customerId = validId(req.customerUser?.id);
  if (!customerId) return res.status(401).json({
    success: false, message: "Customer login required.",
  });
  try {
    const [rows] = await db.promise().query(
      `SELECT rr.id, rr.reservation_id, rr.status, rr.reason,
              rr.created_at, rr.reviewed_at
         FROM refund_requests rr
        WHERE rr.customer_user_id = ?
        ORDER BY rr.created_at DESC LIMIT 100`,
      [customerId],
    );
    return res.status(200).json({ success: true, requests: rows });
  } catch (error) {
    return refundDatabaseError(res, error, "load customer");
  }
};

// GET /api/refunds/admin/requests
// Read-only queue. The Admin must still verify real payment captures before
// deciding any refundable amount; there is no approve/refund endpoint yet.
exports.getAdminRefundRequests = async (_req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT rr.id, rr.reservation_id, r.reservation_code,
              rr.customer_user_id, r.booking_source, r.payment_method,
              r.reservation_status, r.payment_status,
              r.paid_amount AS recorded_paid_amount,
              rr.reason, rr.status, rr.created_at, rr.reviewed_at
         FROM refund_requests rr
         INNER JOIN reservations r ON r.id = rr.reservation_id
        ORDER BY rr.created_at DESC LIMIT 200`,
    );
    return res.status(200).json({
      success: true, requests: rows,
      disclaimer: "Recorded paid_amount is not proof of actual captured cash; verify gateway and onsite collections before any payout.",
    });
  } catch (error) {
    return refundDatabaseError(res, error, "load admin");
  }
};
