// ============================================================
// RESORT PRICING: READ FOR AUTHORIZED STAFF; WRITE FOR ADMIN ONLY.
// Route-level signed-token middleware guards every endpoint.
// ============================================================
const {
  getExtraGuestRate, setExtraGuestRate,
} = require("../../services/extraGuestRate");

async function readExtraGuestRate(req, res) {
  try {
    return res.status(200).json({
      extra_guest_rate: await getExtraGuestRate(),
      currency: "PHP",
    });
  } catch (error) {
    console.error("readExtraGuestRate error:", error);
    return res.status(500).json({ message: "Unable to load extra guest rate." });
  }
}

async function updateExtraGuestRate(req, res) {
  try {
    const rate = await setExtraGuestRate(
      req.body?.extra_guest_rate, req.adminUser.id,
    );
    return res.status(200).json({
      success: true,
      extra_guest_rate: rate,
      message: "Extra guest rate updated for future guest adjustments.",
    });
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({
        message: "Resort pricing storage is not installed. Apply the resort_settings migration first.",
      });
    }
    if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    }
    console.error("updateExtraGuestRate error:", error);
    return res.status(500).json({ message: "Could not update extra guest rate." });
  }
}

module.exports = { readExtraGuestRate, updateExtraGuestRate };
