// ============================================================
// AUTHENTICATED EXTRA GUEST RATE ROUTES
// Signed Front Desk tokens can only READ. Signed Admin tokens can
// READ and WRITE. Never trust role or user id from browser JSON.
// ============================================================
const router = require("express").Router();
const { requireAdminAuth } = require("../middleware/adminAuth");
const { requireFrontDeskAuth } = require("../middleware/frontDeskAuth");
const {
  readExtraGuestRate, updateExtraGuestRate,
} = require("../controllers/admin/extraGuestRateController");

router.get("/frontdesk", requireFrontDeskAuth, readExtraGuestRate);
router.get("/admin", requireAdminAuth, readExtraGuestRate);
router.put("/admin", requireAdminAuth, updateExtraGuestRate);

module.exports = router;
