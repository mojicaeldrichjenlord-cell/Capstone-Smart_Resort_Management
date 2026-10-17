// Tests printer selection without using the database, PayPal or actual printers.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../../frontend");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("Admin receipt offers distinct thermal and A4 controls", () => {
  const html = read("adminHTML/admin-booking-receipt.html");
  assert.match(html, /id="printThermalBtn"/);
  assert.match(html, /id="printA4Btn"/);
  assert.match(html, /Print A4 Receipt/);
});

test("A4 print stylesheet names A4 paper and retains thermal CSS", () => {
  const css = read("adminCSS/admin-booking-receipt.css");
  assert.match(css, /@page\s+adminReceiptA4\s*\{\s*size:\s*A4;/);
  assert.match(css, /body\.print-a4\s+\.receipt-page\s*\{\s*page:\s*adminReceiptA4;/);
  assert.match(css, /size:\s*80mm auto/);
  assert.match(css, /body\.print-a4\s+#thermalReceipt\.thermal-receipt-shell/);
});

test("printer controls choose a mode and return to normal after preview", () => {
  const js = read("adminJS/admin-booking-receipt.js");
  const start = js.indexOf("function setupPrintButton() {");
  const end = js.indexOf("async function loadAdminReceipt()", start);
  assert.ok(start >= 0 && end > start);
  const handlers = {};
  const winHandlers = {};
  const classes = new Set();
  let printCount = 0;
  const body = {
    classList: {
      toggle(name, on) {
        if (on) classes.add(name);
        else classes.delete(name);
      },
      remove(name) { classes.delete(name); },
    },
  };
  const document = {
    body,
    getElementById(id) {
      if (!["printThermalBtn", "printA4Btn"].includes(id)) return null;
      return { addEventListener(event, cb) { handlers[id + ":" + event] = cb; } };
    },
  };
  const window = {
    addEventListener(event, cb) { winHandlers[event] = cb; },
    print() { printCount++; },
  };

  vm.runInNewContext(js.slice(start, end) + "\nsetupPrintButton();", {document, window});
  handlers["printA4Btn:click"]();
  assert.ok(classes.has("print-a4"));
  assert.equal(printCount, 1);
  winHandlers.afterprint();
  assert.ok(!classes.has("print-a4"));
  handlers["printThermalBtn:click"]();
  assert.ok(!classes.has("print-a4"));
  assert.equal(printCount, 2);
});
