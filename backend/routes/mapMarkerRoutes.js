// API routes for map Marker Routes. Connects URLs to controllers and access checks.
// Note: Keep existing behavior unchanged when adding new features.
const express = require("express");
const router = express.Router();
const { requireAdminAuth } = require("../middleware/adminAuth");

const {
  getMarkers,
  createMarker,
  updateMarker,
  deleteMarker,
} = require("../controllers/shared/mapMarkerController");

router.get("/", getMarkers);
router.post("/", requireAdminAuth, createMarker);
router.put("/:id", requireAdminAuth, updateMarker);
router.delete("/:id", requireAdminAuth, deleteMarker);

module.exports = router;
