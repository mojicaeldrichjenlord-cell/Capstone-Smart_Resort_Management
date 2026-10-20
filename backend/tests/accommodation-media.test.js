// Accommodation image validator tests, no DB or image uploads required.
// Run: node --test tests/accommodation-media.test.js

const test = require("node:test");
const assert = require("node:assert/strict");
const { detectImageMime, validMediaId, MAX_IMAGE_BYTES } =
  require("../utils/accommodationMediaValidation");

test("accepts valid JPEG, PNG, WebP signatures", () => {
  assert.equal(detectImageMime(Buffer.from([255, 216, 255, 224])), "image/jpeg");
  assert.equal(detectImageMime(Buffer.from([137,80,78,71,13,10,26,10])), "image/png");
  assert.equal(detectImageMime(Buffer.from("RIFF0000WEBP1234")), "image/webp");
});

test("rejects scripts, renamed files and arbitrary bytes", () => {
  assert.equal(detectImageMime(Buffer.from("<script>alert(1)</script>")), null);
  assert.equal(detectImageMime(Buffer.from("GIF89a")), null);
  assert.equal(detectImageMime(null), null);
});

test("prevents malformed media identifiers", () => {
  assert.equal(validMediaId("2"), true);
  assert.equal(validMediaId("0"), false);
  assert.equal(validMediaId("../../private"), false);
  assert.equal(validMediaId("2 OR 1=1"), false);
});

test("enforces bounded photo size", () => {
  assert.equal(MAX_IMAGE_BYTES, 3 * 1024 * 1024);
});
