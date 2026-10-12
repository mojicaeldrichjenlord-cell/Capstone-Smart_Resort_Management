// Authorization for initial reservation PayPal order creation and capture.
// Never trust reservationId, user_id, or role sent by the browser.
// Online reservations: signed Customer who owns the booking.
// Manual reservations: signed current Front Desk user.
// The PayPal config endpoint remains public (Client ID only).
const db = require("../config/db");
const { requireReceiptAuth } = require("./receiptAuth");

function requireInitialPayPalAuthorization(req, res, next) {
  return requireReceiptAuth(req, res, async () => {
    const id = Number(req.params.reservationId);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid reservation ID." });
    }
    try {
      const [rows] = await db.promise().query(
        "SELECT id, user_id, booking_source FROM reservations WHERE id = ? LIMIT 1",
        [id],
      );
      const row = rows[0];
      if (!row) {
        return res.status(404).json({
          success: false, message: "Reservation not found.",
        });
      }
      const viewer = req.receiptViewer;
      const source = String(row.booking_source || "").toLowerCase().trim();
      const allowed =
        (source === "online" &&
         viewer.role === "customer" &&
         Number(row.user_id) === viewer.id &&
         Number.isSafeInteger(Number(row.user_id)) &&
         Number(row.user_id) > 0) ||
        (source === "manual" && viewer.role === "frontdesk");
      if (!allowed) {
        // 404 masks the existence of another customer's reservation.
        return res.status(404).json({
          success: false,
          message: "Reservation not found or not accessible to this account.",
        });
      }
      return next();
    } catch (error) {
      console.error("Initial PayPal authorization error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to verify reservation payment access.",
      });
    }
  });
}
module.exports = { requireInitialPayPalAuthorization };
