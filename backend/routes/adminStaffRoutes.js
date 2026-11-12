// Dedicated Admin-only staff account management routes.
// Clients cannot use these routes with Manager, Front Desk, Housekeeping,
// Customer or forged localStorage role values.
const router = require("express").Router();
const { requireAdminAuth } = require("../middleware/adminAuth");
const {
  listStaff, createStaff, updateStaff, setStaffStatus, resetStaffPassword
} = require("../controllers/admin/staffAccountsController");
router.use(requireAdminAuth);
router.get("/", listStaff);
router.post("/", createStaff);
router.put("/:id", updateStaff);
router.patch("/:id/status", setStaffStatus);
router.post("/:id/reset-password", resetStaffPassword);
module.exports = router;
