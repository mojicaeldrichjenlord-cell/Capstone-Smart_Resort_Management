// Isolated browser-navigation tests: no Express, database, or PayPal calls.
// Run from backend: node --test tests/frontdesk-receipt-tab-navigation.test.js
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const frontend = path.resolve(__dirname, "../../frontend/frontdeskJS");
const code = (filename) => fs.readFileSync(path.join(frontend, filename), "utf8");

function simulateReservationReceiptLink({ completed = true } = {}) {
  const elements = [];
  const card = {
    querySelector(selector) {
      if (selector === ".status-completed") return completed ? {} : null;
      if (selector === ".view-final-receipt-btn") return null;
      if (selector === ".reservation-id") return { textContent: "Reservation # 10" };
      return null;
    },
    appendChild(element) { elements.push(element); },
  };
  const document = {
    addEventListener() {},
    createElement(tag) {
      return {
        tag,
        children: [],
        appendChild(element) { this.children.push(element); },
      };
    },
  };
  const context = vm.createContext({ document, MutationObserver: class {} });
  vm.runInContext(code("frontdeskReservationReceiptActions.js"), context);
  context.addCompletedReceiptAction(card);
  return elements[0]?.children[0] || null;
}

test("Completed reservation receipt stays in same authenticated browser tab", () => {
  const link = simulateReservationReceiptLink();
  assert.ok(link, "Completed reservation should offer receipt");
  assert.equal(link.href,
    "frontdesk-booking-receipt.html?id=10&from=reservations");
  assert.notEqual(link.target, "_blank",
    "New noopener tabs do not share Front Desk sessionStorage credentials.");
  assert.equal(link.textContent, "View Final Receipt");
});

test("Pending reservation does not display completed receipt link", () => {
  assert.equal(simulateReservationReceiptLink({ completed: false }), null);
});

test("Post-checkout receipt reuses the authenticated tab", () => {
  const source = code("frontdeskCheckout.js");
  assert.match(source, /window\.location\.href\s*=\s*receiptUrl\s*;/);
  assert.doesNotMatch(source,
    /window\.open\(\s*receiptUrl\s*,\s*["_']_blank["_']/);
});

test("Receipt back link returns to Reservation Records when opened there", () => {
  const link = { href: "frontdeskGuests.html", textContent: "Guest Management" };
  const document = {
    addEventListener() {},
    querySelector(selector) {
      return selector === ".top-actions .back-btn" ? link : null;
    },
  };
  const context = vm.createContext({
    document, URLSearchParams,
    window: { location: { search: "?id=10&from=reservations" } },
  });
  vm.runInContext(code("frontdesk-booking-receipt.js"), context);
  context.configureReceiptReturnLink();
  assert.equal(link.href, "frontdeskReservations.html");
  assert.match(link.textContent, /Back to Reservation Records/);
});

test("Receipt from Guest Management keeps Guest Management back link", () => {
  const link = { href: "frontdeskGuests.html", textContent: "Back to Guest Management" };
  const context = vm.createContext({
    document: {
      addEventListener() {},
      querySelector() { return link; },
    },
    URLSearchParams,
    window: { location: { search: "?id=10" } },
  });
  vm.runInContext(code("frontdesk-booking-receipt.js"), context);
  context.configureReceiptReturnLink();
  assert.equal(link.href, "frontdeskGuests.html");
});
