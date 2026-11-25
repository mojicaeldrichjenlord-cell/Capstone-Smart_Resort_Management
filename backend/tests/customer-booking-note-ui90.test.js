const test = require("node:test");
const assert = require("node:assert/strict");
const { extractCustomerNote } = require("../utils/customerBookingNote");

test("extracts only explicitly labelled original customer concern", () => {
  assert.equal(extractCustomerNote("Online Payment Method: PayPal | Customer Note: May kasamang senior. | [PAYPAL DEMO] internal audit"), "May kasamang senior.");
});
test("does not expose internal notes or customer modification notes", () => {
  for (const value of [null, "", "Reference Number: 123", "Customer Modification Note: later", "Customer Note:   | Onsite stay extension (UNPAID): room"]) {
    assert.equal(extractCustomerNote(value), null);
  }
});
test("preserves multiline text, Unicode and literal markup as data", () => {
  const note = "Paki-check po.\nSenior citizen — <b>not markup</b>";
  assert.equal(extractCustomerNote("Customer Note: " + note), note);
});
test("uses the first explicit entry, not subsequent internal segments", () => {
  assert.equal(extractCustomerNote("Customer Note: first | Customer Note: later"), "first");
});
