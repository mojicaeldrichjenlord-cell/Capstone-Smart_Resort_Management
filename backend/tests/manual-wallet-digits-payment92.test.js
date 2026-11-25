const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const read = p => fs.readFileSync(path.resolve(__dirname, "../..", p), "utf8");
const front = read("frontend/adminJS/admin-walkin-payment.js");
const back = read("backend/controllers/shared/bookingController.js");
function helpers(source, end) {
  const context = vm.createContext({});
  vm.runInContext(source.slice(source.indexOf("function normalizeReferenceNumber("), source.indexOf(end, source.indexOf("function normalizeReferenceNumber("))), context);
  return context;
}
test("input cleanup retains only digits with method-specific maximum and leading zeros", () => {
  const h = helpers(front, "function setupPaymentForm(");
  assert.equal(h.formatReferenceNumberForDisplay("00a12-345678901234", "gcash"), "0012345678901");
  assert.equal(h.formatReferenceNumberForDisplay("9".repeat(40), "paymaya"), "9".repeat(36));
  assert.equal(h.formatReferenceNumberForDisplay("a!@- ", "gcash"), "");
  assert.equal(h.formatReferenceNumberForDisplay("Ab12- CD34@!", "paymaya"), "Ab12-CD34");
  assert.match(front, /setAttribute\("maxlength", String\(getReferenceMaxDigits\(method\)\)\)/);
});
test("frontend and backend enforce provider-specific characters and length", () => {
  for (const h of [helpers(front, "function setupPaymentForm("), helpers(back, "function normalizeContactNumber(")]) {
    const v = h.validateReferenceNumberByMethod;
    for (const invalid of ["", "123456789012", "12345678901234", "a1234567890123", "1234-567890123", "1234567890123\n", "1234567890123 "]) assert.equal(v(invalid, "gcash").valid, false);
    assert.equal(v("0123456789012", "gcash").valid, true);
    for (const invalid of ["12345", "1".repeat(37), "123@456", "123 456", "123456\n", "------"]) assert.equal(v(invalid, "paymaya").valid, false);
    assert.equal(v("012345", "paymaya").valid, true);
    assert.equal(v("0".repeat(36), "paymaya").valid, true);
    assert.equal(v("Ab12-CD34", "paymaya").valid, true);
    assert.equal(v("fce48a15-7e54-4c36-b2af-eee19a6abd9c", "paymaya").valid, true);
    assert.equal(v("", "cash").valid, true);
    assert.equal(v("", "paypal").valid, true);
  }
});
test("request parsing retains malformed explicit reference for backend rejection", () => {
  const start = back.indexOf("  const legacyReference = ");
  const end = back.indexOf("\n\n  return {", start);
  const h = helpers(back, "function normalizeContactNumber(");
  const parsed = vm.runInNewContext(back.slice(start, end) + "\nproofReference;", {parsedBody:{proof_reference:"a1234567890123"}, normalizeReferenceNumber:h.normalizeReferenceNumber});
  assert.equal(parsed, "a1234567890123");
});
