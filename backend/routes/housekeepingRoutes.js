const express = require("express");
const router = express.Router();
const { requireHousekeepingAuth } = require("../middleware/housekeepingAuth");
const {
  getHousekeepingMe, getDailyHousekeepingSchedule,
} = require("../controllers/housekeeping/housekeepingScheduleController");

// Housekeeping cannot access these APIs using any other signed role token.
router.use(requireHousekeepingAuth);
// Identity endpoint: role verified by middleware; never accept client-provided IDs.
router.get("/me", getHousekeepingMe);
// Schedule is read-only; dates are validated in its controller.
router.get("/daily-schedule", getDailyHousekeepingSchedule);
const {
  listMyHousekeepingTasks, startHousekeepingTask, markHousekeepingCleaned,
} = require("../controllers/housekeeping/housekeepingTasksController");
// Task list is scoped to the currently authenticated Housekeeping staff member.
router.get("/tasks", listMyHousekeepingTasks);
// Only assigned staff can advance Needs Cleaning -> In Progress.
router.put("/tasks/:id/start", startHousekeepingTask);
// Only assigned staff can mark In Progress -> Cleaned; Manager verifies later.
router.put("/tasks/:id/cleaned", markHousekeepingCleaned);

module.exports = router;
