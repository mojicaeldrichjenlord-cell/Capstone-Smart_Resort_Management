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
// Manager-only housekeeping endpoints are under the same signed Manager guard.
// They never expose guest contact or payment details.
router.get("/housekeeping/tasks", listManagerHousekeepingTasks);
// Assignment dropdown (active, verified Housekeeping users only).
router.get("/housekeeping/staff", listHousekeepingStaff);
// Candidate completed checkouts; do not auto-create tasks on checkout.
router.get("/housekeeping/eligible-items", listEligibleHousekeepingItems);
// Create task manually; UNIQUE reservation_item_id blocks duplicates.
router.post("/housekeeping/tasks", createHousekeepingTask);
// Assign/reassign before cleaning starts, using a version check.
router.put("/housekeeping/tasks/:id/assign", reassignHousekeepingTask);
// Manager alone signs off a cleaned task, not room listing availability.
router.put("/housekeeping/tasks/:id/verify", verifyHousekeepingTask);

module.exports = router;
