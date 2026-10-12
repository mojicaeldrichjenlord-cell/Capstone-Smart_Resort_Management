// Financial parity tests for the Admin and Front Desk receipt renderers.
// Uses synthetic bookings only, no Aiven/MySQL/PayPal, no web requests.
// Run from backend: node --test tests/receipt-financial-parity.test.js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "../../frontend");
const scriptPaths = {
  admin: path.join(root, "adminJS/admin-booking-receipt.js"),
  frontdesk: path.join(root, "frontdeskJS/frontdesk-booking-receipt.js"),
};
const codes = Object.fromEntries(
  Object.entries(scriptPaths).map(([key, filepath]) =>
    [key, fs.readFileSync(filepath, "utf8")]),
);

function render(role, sample) {
  const receipt = { innerHTML: "" };
  const sandbox = {
    document: {
      addEventListener() {},
      getElementById(id) {
        return id === "thermalReceipt" ? receipt : null;
      },
    },
    window: { location: { search: "?id=101" } },
    URLSearchParams,
    console,
  };
  const context = vm.createContext(sandbox);
  vm.runInContext(codes[role], context, { filename: scriptPaths[role] });
  context.renderThermalReceipt(JSON.parse(JSON.stringify(sample)));
  return receipt.innerHTML;
}
function total(html) {
  const match = html.match(/<span>(?:Net Total Collected|Total Collected)<\/span>\s*<span>&#8369;([\d,.]+)<\/span>/);
  assert.ok(match, "Expected visible total collected");
  return Number(match[1].replaceAll(",", ""));
}
function onsite(html) {
  const match = html.match(/<div class="thermal-total-amount">&#8369;([\d,.]+)<\/div>/);
  assert.ok(match, "Expected visible amount to collect");
  return Number(match[1].replaceAll(",", ""));
}
function compare(sample, expectedCollected, expectedOnsite) {
  const a = render("admin", sample);
  const f = render("frontdesk", sample);
  assert.equal(total(a), total(f), "Admin collected total must match Front Desk");
  assert.equal(onsite(a), onsite(f), "Admin onsite balance must match Front Desk");
  assert.equal(total(a), expectedCollected);
  assert.equal(onsite(a), expectedOnsite);
  return { a, f };
}
const booking = () => ({
  id: 101, reservation_code: "MOCK-101",
  first_name: "Test", last_name: "Guest",
  reservation_status: "approved", payment_status: "partially_paid",
  accommodation_total: 3500, paid_amount: 1750, remaining_balance: 1750,
  estimated_entrance_fee: 1000, final_entrance_fee: 850,
  entrance_adjustment_total: 150,
  entrance_adjustments: [
    { discount_type: "senior", discount_amount: 100, qualified_pax: 1 },
    { discount_type: "kid_free", discount_amount: 50, qualified_pax: 1 },
  ],
  extra_bed_count: 0, extra_bed_fee: 0, extra_bed_paid: 0,
  additional_charges: [], additional_charges_total: 0,
  paid_additional_charges_total: 0, unpaid_additional_charges_total: 0,
  items: [],
});

test("Unpaid reservation: both receipts show the same onsite balance", () => {
  const b = booking();
  b.entrance_fee_collected = 0;
  b.entrance_fee_collected_net = 0;
  b.entrance_fee_remaining = 850;
  b.entrance_fee_paid = 0;
  compare(b, 1750, 2600);
});

test("Refund and payment correction: net collections, not gross", () => {
  const b = booking();
  b.reservation_status = "completed";
  b.accommodation_total = 3500;
  b.paid_amount = 3500;
  b.remaining_balance = 0;
  b.entrance_fee_collected = 1000;
  b.entrance_fee_collected_gross = 1000;
  b.entrance_fee_reconciled_out = 150;
  b.entrance_fee_collected_net = 850;
  b.entrance_fee_remaining = 0;
  b.entrance_fee_paid = 1;
  b.entrance_reconciliations = [
    { reconciliation_type: "refund", amount: 100, note: "Correction" },
    { reconciliation_type: "correction", amount: 50, note: "Audit" },
  ];
  b.entrance_refund_total = 100;
  b.entrance_correction_total = 50;
  const { a } = compare(b, 4350, 0);
  assert.match(a, /Entrance Reconciliation/);
  assert.match(a, /Entrance Refunded/);
  assert.match(a, /Entrance Corrected/);
  assert.match(a, /Net Total Collected/);
});

test("Legacy extra bed collected separately is counted once", () => {
  const b = booking();
  b.final_entrance_fee = 0;
  b.estimated_entrance_fee = 0;
  b.entrance_adjustment_total = 0;
  b.entrance_adjustments = [];
  b.entrance_fee_remaining = 0;
  b.entrance_fee_collected = 0;
  b.extra_bed_count = 1;
  b.extra_bed_fee = 200;
  b.extra_bed_paid = 1;
  compare(b, 1950, 1750);
});

test("Modern extra bed charge is not double-counted with legacy fee", () => {
  const b = booking();
  b.final_entrance_fee = 0;
  b.estimated_entrance_fee = 0;
  b.entrance_adjustment_total = 0;
  b.entrance_adjustments = [];
  b.entrance_fee_remaining = 0;
  b.entrance_fee_collected = 0;
  b.extra_bed_count = 1;
  b.extra_bed_fee = 200;
  b.extra_bed_paid = 1;
  b.additional_charges = [
    { charge_name: "Extra Bed", charge_amount: 200, is_paid: 1 },
    { charge_name: "Damage", charge_amount: 300, is_paid: 0 },
  ];
  b.additional_charges_total = 500;
  b.paid_additional_charges_total = 200;
  b.unpaid_additional_charges_total = 300;
  compare(b, 1950, 2050);
});
