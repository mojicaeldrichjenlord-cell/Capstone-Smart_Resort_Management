// Tests Admin navigation without network, database, or payment operations.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const base = path.resolve(__dirname, "../../frontend");
const pages = [
  "admin.html", "admin-rooms.html", "admin-map-editor.html",
  "admin-reports.html", "admin-profile.html", "admin-walkin.html",
  "admin-walkin-payment.html", "admin-booking-receipt.html",
];

test("all Admin navbar pages load mobile navigation and a valid favicon path", () => {
  for (const file of pages) {
    const html = fs.readFileSync(path.join(base, "adminHTML", file), "utf8");
    assert.match(html, /admin-mobile-nav\.css/, file);
    assert.match(html, /admin-mobile-nav\.js/, file);
    assert.match(html, /rel="icon"[^>]*arvic-logo\.png/, file);
  }
  assert.ok(fs.existsSync(path.join(base, "images/arvic-logo.png")));
});
test("responsive CSS makes the mobile toggle and open menu visible", () => {
  const css = fs.readFileSync(path.join(base, "adminCSS/admin-mobile-nav.css"), "utf8");
  assert.match(css, /max-width:\s*900px/);
  assert.match(css, /nav\.mobile-open/);
  assert.match(css, /display:\s*inline-flex\s*!important/);
});
test("mobile menu supports open, Escape, link selection and desktop reset", () => {
  const code = fs.readFileSync(path.join(base, "adminJS/admin-mobile-nav.js"), "utf8");
  const events = {}, btnEvents = {}, navEvents = {}, attrs = {}, classes = new Set();
  const nav = {
    id: "",
    classList: { toggle(cls, on) { if (on) classes.add(cls); else classes.delete(cls); } },
    addEventListener(name, callback) { navEvents[name] = callback; },
  };
  const button = {
    setAttribute(name, value) { attrs[name] = value; },
    getAttribute(name) { return attrs[name]; },
    addEventListener(name, callback) { btnEvents[name] = callback; },
    focus() { events.focused = true; },
  };
  const header = {
    querySelector(selector) { return selector === "nav" ? nav : null; },
    insertBefore(element, sibling) { assert.equal(element, button); assert.equal(sibling, nav); },
    contains() { return false; },
  };
  const document = {
    readyState: "complete",
    querySelector(selector) { return selector === "header.navbar" ? header : null; },
    createElement(name) { assert.equal(name, "button"); return button; },
    addEventListener(name, callback) { events[name] = callback; },
  };
  const window = {
    innerWidth: 440,
    addEventListener(name, callback) { events[name] = callback; },
  };
  vm.runInNewContext(code, { document, window });
  assert.equal(attrs["aria-controls"], "adminAreaNavigation");
  assert.equal(attrs["aria-expanded"], "false");
  btnEvents.click();
  assert.equal(attrs["aria-expanded"], "true");
  assert.ok(classes.has("mobile-open"));
  events.keydown({key: "Escape"});
  assert.equal(attrs["aria-expanded"], "false");
  assert.equal(events.focused, true);
  btnEvents.click();
  navEvents.click({target: {closest(selector) { return selector === "a"; }}});
  assert.equal(attrs["aria-expanded"], "false");
  btnEvents.click();
  window.innerWidth = 1200;
  events.resize();
  assert.equal(attrs["aria-expanded"], "false");
  assert.ok(!classes.has("mobile-open"));
});
