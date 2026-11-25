const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const read = p => fs.readFileSync(path.resolve(__dirname, "../..", p), "utf8");
const backend = read("backend/controllers/shared/bookingController.js");
const frontend = read("frontend/adminJS/admin-walkin-payment.js");
test("reference required in UI and both manual wallet API paths", () => {
  assert.ok(frontend.includes("proofReference.required = requiresScreenshot"));
  assert.ok(frontend.includes("if (requiresScreenshot && !proofReference)"));
  for (const flag of ["isWalkInEWallet", "isFacebookManualWallet"]) {
    assert.ok(backend.includes("if (" + flag + " && !cleanProofReference)"));
    assert.ok(backend.includes("if (" + flag + " && !proofReferenceValidation.valid)"));
  }
});
test("existing reference format rules remain", () => {
  const context = vm.createContext({});
  vm.runInContext(backend.slice(backend.indexOf("function normalizeReferenceNumber("), backend.indexOf("function normalizeContactNumber(")), context);
  const validate = context.validateReferenceNumberByMethod;
  for (const method of ["gcash", "paymaya"]) assert.equal(validate("", method).valid, false);
  assert.equal(validate("1234567890123", "gcash").valid, true);
  assert.equal(validate("123456789012", "gcash").valid, false);
  assert.equal(validate("123456", "paymaya").valid, true);
  assert.equal(validate("12345", "paymaya").valid, false);
  assert.equal(validate("", "cash").valid, true);
  assert.equal(validate("", "paypal").valid, true);
});
test("proof file path is not a reference", () => {
  const start = backend.indexOf("  const legacyReference = ");
  const end = backend.indexOf("\n  const proofReference =", start);
  const extract = input => vm.runInNewContext(backend.slice(start, end) + "\nreferenceInput;", { parsedBody: input });
  assert.equal(extract({proof_of_payment:"/uploads/payment-proofs/1234567890123.png"}), "");
  assert.equal(extract({proof_reference:"",proof_of_payment:"1234567890123"}), "");
  assert.equal(extract({proof_reference:"1234567890123"}), "1234567890123");
});
