// These legacy endpoints wrote directly to the obsolete bookings table and
// bypassed the Front Desk payment ledger and balance-collection checks.
// Keep a clear response for old clients; never mutate financial records here.
function retiredAdminPaymentEndpoint(req, res) {
  return res.status(410).json({
    success: false,
    code: "LEGACY_ADMIN_PAYMENT_ENDPOINT_RETIRED",
    message:
      "This legacy Admin payment endpoint is retired. Use Front Desk payment verification or accommodation balance collection.",
  });
}

exports.updatePaymentStatus = retiredAdminPaymentEndpoint;
exports.markPaymentAsPaid = retiredAdminPaymentEndpoint;
