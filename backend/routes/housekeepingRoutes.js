const express = require("express");
const router = express.Router();
const { requireHousekeepingAuth } = require("../middleware/housekeepingAuth");
const {
  getHousekeepingMe, getDailyHousekeepingSchedule,
} = require("../controllers/housekeeping/housekeepingScheduleController");

// Housekeeping cannot access these APIs using any other signed role token.
router.use(requireHousekeepingAuth);
router.get("/me", getHousekeepingMe);
router.get("/daily-schedule", getDailyHousekeepingSchedule);

module.exports = router;
