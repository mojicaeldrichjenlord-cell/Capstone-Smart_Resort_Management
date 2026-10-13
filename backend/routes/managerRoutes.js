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

module.exports = router;
