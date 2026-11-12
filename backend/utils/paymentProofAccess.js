// Stage 95-G: pure, dependency-light checks for confidential payment proofs.
// Keeping these helpers separate lets QA run without touching MySQL, Render,
// customer bookings, uploaded files, or Gemini credits.
"use strict";

const { detectImageMime } = require("./accommodationMediaValidation");

const MAX_PROOF_BYTES = 8 * 1024 * 1024;

// Express static-file middleware must never publish the payment-proofs folder.
// Decode encoded separators, reject invalid encoding, and cover traversal paths
// before allowing other (non-sensitive) /uploads assets through.
function isSensitiveUploadPath(requestPath) {
  let pathname = String(requestPath || "");
  for (let index = 0; index < 3; index += 1) {
    let next;
    try {
      next = decodeURIComponent(pathname);
    } catch {
      return true; // Fail closed for malformed percent-encoding.
    }
    if (next === pathname) break;
    pathname = next;
  }

  return pathname
    .replace(/\\/g, "/")
    .split("/")
    .some((part) => part.toLowerCase() === "payment-proofs");
}

// The DB may contain a payment reference instead of a file path. Never treat
// references, user-provided URLs or arbitrary disk paths as local files.
function getStoredProofFilename(value) {
  let raw = String(value || "").trim();
  if (/^https?:\/\//i.test(raw)) {
    try {
      raw = new URL(raw).pathname;
    } catch {
      return null;
    }
  }
  const match = /^\/?uploads\/payment-proofs\/([A-Za-z0-9_-]+\.(?:jpe?g|png|webp|heic|heif))$/i.exec(raw);
  return match ? match[1] : null;
}

// Do not trust a filename extension or a browser-supplied MIME header.
// Existing HEIC/HEIF files have ISO-BMFF "ftyp" image brands.
function getVerifiedImageMime(buffer) {
  const standard = detectImageMime(buffer);
  if (standard) return standard;
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;
  if (buffer.toString("ascii", 4, 8) !== "ftyp") return null;
  const brand = buffer.toString("ascii", 8, 12).toLowerCase();
  return ["heic", "heix", "hevc", "heim", "heis", "heif", "mif1"].includes(brand)
    ? "image/heic"
    : null;
}

// Legacy database rows may carry data:image/...;base64,.... Validate the
// payload and format before streaming bytes to an authenticated staff user.
function decodeStoredProofData(value) {
  const text = String(value || "").trim();
  if (!text || text.length > Math.ceil(MAX_PROOF_BYTES * 4 / 3) + 120) return null;
  const match = /^data:image\/(?:jpeg|jpg|png|webp|heic|heif);base64,([A-Za-z0-9+/]+={0,2})$/i.exec(text);
  if (!match) return null;
  const buffer = Buffer.from(match[1], "base64");
  if (!buffer.length || buffer.length > MAX_PROOF_BYTES) return null;
  const mime = getVerifiedImageMime(buffer);
  return mime ? { buffer, mime } : null;
}

module.exports = {
  MAX_PROOF_BYTES,
  isSensitiveUploadPath,
  getStoredProofFilename,
  getVerifiedImageMime,
  decodeStoredProofData,
};
