// Reservation lists include guest contact and payment details.
// Only signed, currently-active Admin and Front Desk users may read them.
// Reuse established signature, account status and live-role verification.
const { requireReceiptAuth } = require("./receiptAuth");

function requireOperationalBookingRead(req, res, next) {
  return requireReceiptAuth(req, res, () => {
    const role = req.receiptViewer?.role;
    if (role !== "admin" && role !== "frontdesk") {
      return res.status(403).json({
        message: "Reservation monitoring is for Admin and Front Desk only.",
      });
    }
    return next();
  });
}

module.exports = { requireOperationalBookingRead };
