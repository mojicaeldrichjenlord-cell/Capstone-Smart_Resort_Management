// Offline regression tests for Admin receipt preview visibility.
// Run from backend: node --test tests/admin-receipt-visibility.test.js
// No database, server, or PayPal connections.
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

const frontend = path.resolve(__dirname, "../../frontend");
const read = (name) => fs.readFileSync(path.join(frontend, name), "utf8");
const html = read("adminHTML/admin-booking-receipt.html");
const globalCss = read("css/style.css");
const receiptCss = read("adminCSS/admin-booking-receipt.css");
const receiptJs = read("adminJS/admin-booking-receipt.js");

test("Admin receipt HTML includes the preview container and stylesheet", () => {
  assert.match(html, /id="thermalReceipt"\s+class="thermal-receipt-shell"/);
  assert.match(html, /adminCSS\/admin-booking-receipt\.css/);
  assert.match(html, /adminJS\/admin-booking-receipt\.js/);
});

test("Admin CSS overrides legacy hidden #thermalReceipt rule", () => {
  assert.match(globalCss, /#thermalReceipt\s*\{\s*display:\s*none\s*;/);
  assert.match(receiptCss,
    /#thermalReceipt\.thermal-receipt-shell\s*\{[^}]*\bdisplay:\s*block\s*!important\s*;/s);
  assert.match(receiptCss,
    /#thermalReceipt\.thermal-receipt-shell\s*\{[^}]*\bvisibility:\s*visible\s*!important\s*;/s);
});

test("Admin receipt retains 80mm preview and print layout", () => {
  assert.match(receiptCss,
    /#thermalReceipt\.thermal-receipt-shell\s*\{[^}]*\bwidth:\s*80mm\s*;/s);
  assert.match(receiptCss, /@media print\s*\{/);
  assert.match(receiptCss, /@page\s*\{\s*size:\s*80mm auto\s*;/);
});

test("Admin receipt loader renders content or a visible error", () => {
  assert.match(receiptJs, /renderThermalReceipt\(booking\)/);
  assert.match(receiptJs, /thermal\.innerHTML\s*=\s*\x60[\s\S]*?Failed to load receipt/);
});
