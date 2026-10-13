const express = require("express");
const router = express.Router();
const { requireManagerAuth } = require("../middleware/managerAuth");
const {
  getManagerMe, getManagerOverview,
} = require("../controllers/manager/managerOverviewController");

// Every Manager route requires a signed Manager token with live role checks.
router.use(requireManagerAuth);
router.get("/me", getManagerMe);
router.get("/overview", getManagerOverview);

module.exports = router;
