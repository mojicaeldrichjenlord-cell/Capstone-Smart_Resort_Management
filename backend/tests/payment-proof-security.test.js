// Stage 95-G regression tests (pure; no live DB, files, users, or API calls).
// Run from backend/: node --test tests/payment-proof-security.test.js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  MAX_PROOF_BYTES,
  isSensitiveUploadPath,
  getStoredProofFilename,
  getVerifiedImageMime,
  decodeStoredProofData,
} = require("../utils/paymentProofAccess");

test("payment proof path is blocked even when URL-encoded", () => {
  for (const value of [
    "/payment-proofs/1730000000-proof.png",
    "/PAYMENT-PROOFS/1730000000-proof.png",
    "/payment-proofs%2F1730000000-proof.png",
    "/payment-proofs%252f1730000000-proof.png",
    "/other/../payment-proofs/photo.jpg",
    "/payment-proofs\\photo.jpg",
    "/broken%ZZ",
  ]) {
    assert.equal(isSensitiveUploadPath(value), true, value);
  }
  assert.equal(isSensitiveUploadPath("/accommodations/cover.png"), false);
  assert.equal(isSensitiveUploadPath("/public/logo.png"), false);
});

test("only approved uploaded payment-proof basenames are accepted", () => {
  assert.equal(
    getStoredProofFilename("/uploads/payment-proofs/17300000-receipt_1.png"),
    "17300000-receipt_1.png",
  );
  assert.equal(
    getStoredProofFilename("uploads/payment-proofs/17300000-sample.jpg"),
    "17300000-sample.jpg",
  );
  for (const invalid of [
    "1234567890123", // payment reference number, not a file
    "/uploads/payment-proofs/../../.env",
    "/uploads/payment-proofs/shell.svg",
    "/uploads/payment-proofs/image.png/extra",
    "/uploads/accommodations/example.png",
    "https://evil.example/uploads/payment-proofs/17300000-receipt_1.png",
    "/etc/passwd",
    "",
  ]) {
    assert.equal(getStoredProofFilename(invalid), null, invalid);
  }
});

test("proof bytes are verified by binary signature, never filename", () => {
  assert.equal(getVerifiedImageMime(Buffer.from([255, 216, 255, 224])), "image/jpeg");
  assert.equal(
    getVerifiedImageMime(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    "image/png",
  );
  assert.equal(getVerifiedImageMime(Buffer.from("<script>malicious()</script>")), null);
});

test("legacy data URL requires a valid image payload", () => {
  const jpeg = Buffer.from([255, 216, 255, 224]);
  const good = decodeStoredProofData("data:image/jpeg;base64," + jpeg.toString("base64"));
  assert.equal(good.mime, "image/jpeg");
  assert.ok(good.buffer.equals(jpeg));
  assert.equal(decodeStoredProofData("data:text/html;base64,PHNjcmlwdD4="), null);
  assert.equal(decodeStoredProofData("data:image/png;base64,YmFk"), null);
  assert.equal(decodeStoredProofData(""), null);
  assert.equal(MAX_PROOF_BYTES, 8 * 1024 * 1024);
});

test("backend route protects image GET with existing signed staff middleware", () => {
  const route = fs.readFileSync(
    path.join(__dirname, "..", "routes", "bookingRoutes.js"), "utf8",
  );
  const server = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
  assert.match(
    route,
    /"\/:id\/payment-proof-image",\s*requireOperationalBookingRead,\s*getPaymentProofImage/,
  );
  assert.match(server, /isSensitiveUploadPath\(req\.path\)/);
  assert.ok(
    server.indexOf("isSensitiveUploadPath(req.path)") < server.indexOf("express.static("),
    "Block confidential uploads before the public static handler",
  );
});

test("proof modals use authenticated fetch, not public image URLs", () => {
  for (const rel of ["adminJS/admin.js", "frontdeskJS/frontdeskPayments.js"]) {
    const source = fs.readFileSync(path.join(__dirname, "..", "..", "frontend", rel), "utf8");
    assert.match(source, /payment-proof-image/);
    assert.match(source, /Authorization:\s*"Bearer "\s*\+\s*token/);
    assert.match(source, /URL\.createObjectURL\(blob\)/);
  }
});
