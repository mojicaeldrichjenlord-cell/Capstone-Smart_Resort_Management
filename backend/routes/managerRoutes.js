const express = require("express");
const router = express.Router();
const { requireManagerAuth } = require("../middleware/managerAuth");
const {
  getManagerMe, getManagerOverview,
} = require("../controllers/manager/managerOverviewController");
const { listManagerReservations, reviewManagerReservation } = require("../controllers/manager/managerReservationsController");
const { listManagerAccommodations, updateManagerAccommodationOperations } = require("../controllers/manager/managerAccommodationsController");
const { getManagerReports } = require("../controllers/manager/managerReportsController");

// Every Manager route requires a signed Manager token with live role checks.
router.use(requireManagerAuth);
router.get("/me", getManagerMe);
router.get("/overview", getManagerOverview);
router.get("/reports", getManagerReports);
router.get("/reservations", listManagerReservations);
router.put("/reservations/:id/status", reviewManagerReservation);
router.get("/accommodations", listManagerAccommodations);
router.patch("/accommodations/:id/operations", updateManagerAccommodationOperations);
const {
  listManagerHousekeepingTasks, listHousekeepingStaff,
  listEligibleHousekeepingItems, createHousekeepingTask,
  reassignHousekeepingTask, verifyHousekeepingTask,
} = require("../controllers/housekeeping/housekeepingTasksController");
router.get("/housekeeping/tasks", listManagerHousekeepingTasks);
router.get("/housekeeping/staff", listHousekeepingStaff);
router.get("/housekeeping/eligible-items", listEligibleHousekeepingItems);
router.post("/housekeeping/tasks", createHousekeepingTask);
router.put("/housekeeping/tasks/:id/assign", reassignHousekeepingTask);
router.put("/housekeeping/tasks/:id/verify", verifyHousekeepingTask);

module.exports = router;
