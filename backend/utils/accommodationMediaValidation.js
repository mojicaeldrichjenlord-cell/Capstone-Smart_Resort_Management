// Pure image validation helpers for Admin Accommodation photo uploads.
// This file NEVER opens a database connection, making unit tests safe to run
// without .env, Aiven credentials, or a running Node server.

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_IMAGES_PER_PICK = 10;

// Only allow supported photo formats by checking the binary signature.
// File extension and browser-provided MIME type are not trusted.
function detectImageMime(buffer) {
  if (!Buffer.isBuffer(buffer)) return null;
  if (buffer.length >= 3 &&
      buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return "image/png";
  }
  if (buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}

// Media IDs are positive decimal integers. IDs are still parameterized in SQL.
function validMediaId(value) {
  return /^[1-9]\d{0,15}$/.test(String(value || ""));
}

module.exports = {
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_PICK,
  detectImageMime,
  validMediaId
};
