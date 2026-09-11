const express = require("express");
const router = express.Router();

const {
  getMarkers,
  createMarker,
  updateMarker,
  deleteMarker,
} = require("../controllers/shared/mapMarkerController");

router.get("/", getMarkers);
router.post("/", createMarker);
router.put("/:id", updateMarker);
router.delete("/:id", deleteMarker);

module.exports = router;
