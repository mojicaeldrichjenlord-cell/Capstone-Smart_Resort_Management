// Stage 95-G: ONLY signed, currently active Admin/Front Desk users may view
// confidential payment-proof images. The booking route applies
// requireOperationalBookingRead BEFORE entering this controller.
"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const db = require("../../config/db");
const {
  MAX_PROOF_BYTES,
  getStoredProofFilename,
  getVerifiedImageMime,
  decodeStoredProofData,
} = require("../../utils/paymentProofAccess");

// Internal helper. Do not return raw filesystem paths or payment references.
function unavailable(res) {
  return res.status(404).json({ message: "Payment proof image unavailable." });
}

async function getPaymentProofImage(req, res) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid reservation ID." });
  }

  // This prevents authenticated but unauthorized roles from reading proofs if
  // the route is ever mounted without the expected middleware.
  if (!["admin", "frontdesk"].includes(req.receiptViewer?.role)) {
    return res.status(403).json({ message: "Staff authorization required." });
  }

  // Proof images must never be cached by intermediary proxies or browsers.
  res.set("Cache-Control", "private, no-store, max-age=0");
  res.set("Pragma", "no-cache");
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Content-Security-Policy", "sandbox");

  try {
    const [rows] = await db.promise().query(
      "SELECT proof_of_payment, proof_image_data FROM reservations WHERE id = ? LIMIT 1",
      [id],
    );
    if (!rows.length) return unavailable(res);

    // Preserve legacy database-image behavior without exposing the original
    // base64 payload through an unauthenticated file URL.
    const embedded = decodeStoredProofData(rows[0].proof_image_data);
    if (embedded) {
      res.type(embedded.mime);
      return res.send(embedded.buffer);
    }

    const name = getStoredProofFilename(rows[0].proof_of_payment);
    if (!name) return unavailable(res);

    // A single validated basename ensures no directory traversal or arbitrary
    // file access can be triggered by a corrupted DB path.
    const file = path.join(__dirname, "..", "..", "uploads", "payment-proofs", name);
    let stat;
    try {
      stat = await fs.stat(file);
    } catch (error) {
      if (error.code === "ENOENT") return unavailable(res);
      throw error;
    }
    if (!stat.isFile() || stat.size <= 0 || stat.size > MAX_PROOF_BYTES) {
      return unavailable(res);
    }

    const image = await fs.readFile(file);
    const mime = getVerifiedImageMime(image);
    if (!mime || image.length > MAX_PROOF_BYTES) return unavailable(res);

    res.type(mime);
    return res.send(image);
  } catch (error) {
    console.error("Payment proof access failed:", error.message);
    return res.status(500).json({ message: "Unable to load payment proof." });
  }
}

module.exports = { getPaymentProofImage };
