// Signed, own-account-only profile authorization.
// Reuse the established Customer/Admin/Front Desk token verification used
// for receipts (signature, expiration, active account and current DB role).
const { requireReceiptAuth } = require("./receiptAuth");

function requireOwnProfileAuth(req, res, next) {
  return requireReceiptAuth(req, res, () => {
    const id = Number(req.params.id);
    const viewerId = Number(req.receiptViewer?.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false, message: "Invalid profile account ID."
      });
    }
    if (!Number.isSafeInteger(viewerId) || id !== viewerId) {
      return res.status(403).json({
        success: false, message: "You may only access your own profile."
      });
    }
    req.profileUser = { id: viewerId, role: req.receiptViewer.role };
    return next();
  });
}

module.exports = { requireOwnProfileAuth };
