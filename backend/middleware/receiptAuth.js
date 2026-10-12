// Read-only booking receipt authentication for Customer, Front Desk, and Admin.
// The existing signed-token middlewares verify signature, expiry,
// currently active account and actual database role.
const { requireCustomerAuth } = require("./customerAuth");
const { requireFrontDeskAuth } = require("./frontDeskAuth");
const { requireAdminAuth } = require("./adminAuth");

function requireReceiptAuth(req, res, next) {
  const header = String(req.get("authorization") || "");
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  if (!match) {
    return res.status(401).json({ message: "Please log in to view this receipt." });
  }

  // Never accept a role from request JSON, query params or localStorage.
  // Route only by token prefix; the role-specific middleware does the
  // real signature, account-state and database-role verification.
  const prefix = match[1].split(".", 1)[0];
  const routes = {
    cus1: {
      verify: requireCustomerAuth,
      context: (request) => ({
        role: "customer", id: Number(request.customerUser?.id),
      }),
    },
    fd1: {
      verify: requireFrontDeskAuth,
      context: (request) => ({
        role: "frontdesk", id: Number(request.frontDeskUser?.id),
      }),
    },
    adm1: {
      verify: requireAdminAuth,
      context: (request) => ({
        role: "admin", id: Number(request.adminUser?.id),
      }),
    },
  };
  const matchRole = routes[prefix];
  if (!matchRole) {
    return res.status(401).json({ message: "Invalid or unsupported receipt session." });
  }

  return matchRole.verify(req, res, () => {
    const viewer = matchRole.context(req);
    if (!Number.isSafeInteger(viewer.id) || viewer.id <= 0) {
      return res.status(401).json({ message: "Receipt session is invalid." });
    }
    req.receiptViewer = viewer;
    return next();
  });
}

module.exports = { requireReceiptAuth };
