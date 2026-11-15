// Customer scroll-navigation regression plus concise Remember Me layout.
// Synthetic browser events, no network or user-data access.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../../frontend");
const css = fs.readFileSync(path.join(root, "sharedCSS/customer-navbar.css"), "utf8");
const source = fs.readFileSync(path.join(root, "sharedJS/customer-scroll-nav.js"), "utf8");

test("Customer navbar stays viewport-fixed and slides away smoothly", () => {
  assert.match(css, /position:\s*fixed\s*!important\s*;/);
  assert.match(css, /\.navbar\.is-scroll-hidden\s*\{[^}]*translate3d\(0,\s*-110%,\s*0\)/);
  assert.match(css, /\.customer-navbar-spacer/);
  const mobileCss = css.slice(css.indexOf("@media (max-width: 900px)"),
    css.indexOf("/* Reserve the navbar"));
  assert.match(mobileCss, /position:\s*fixed\s*!important\s*;/);
  assert.doesNotMatch(mobileCss, /position:\s*relative\s*;/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("All eight Customer pages load fresh CSS and direction-aware JS", () => {
  for (const name of ["index", "rooms", "resort-map", "my-bookings",
    "profile", "booking", "booking-payment", "booking-receipt"]) {
    const html = fs.readFileSync(
      path.join(root, "customerHTML", name + ".html"), "utf8");
    assert.match(html, /class="navbar"/, name);
    assert.match(html, /customer-navbar\.css\?v=20261115-scrollnav1/, name);
    assert.match(html, /customer-scroll-nav\.js\?v=20261115-scrollnav1/, name);
    assert.match(html, /id="menuToggle"/, name);
  }
});

function mount() {
  const listeners = {};
  const navbarListeners = {};
  const toggleListeners = {};
  const classes = new Set();
  const menuClasses = new Set();
  const spacer = { className: "", style: {}, attrs: {},
    setAttribute(k, v) { this.attrs[k] = v; } };
  const menu = { classList: { contains: v => menuClasses.has(v),
    add: v => menuClasses.add(v), remove: v => menuClasses.delete(v) } };
  const toggle = { addEventListener(k, fn) { toggleListeners[k] = fn; } };
  const navbar = {
    offsetHeight: 72,
    classList: {
      add(v) { classes.add(v); }, remove(v) { classes.delete(v); },
      contains(v) { return classes.has(v); },
    },
    querySelector(selector) {
      if (selector === "#mobileNav") return menu;
      if (selector === "#menuToggle") return toggle;
      return null;
    },
    insertAdjacentElement(position, element) {
      assert.equal(position, "afterend");
      assert.equal(element, spacer);
    },
    addEventListener(k, fn) { navbarListeners[k] = fn; },
  };
  const window = {
    scrollY: 0, pageYOffset: 0,
    matchMedia() { return { matches: true }; },
    addEventListener(k, fn) { listeners[k] = fn; },
    requestAnimationFrame(fn) { fn(); },
  };
  const document = {
    querySelector: selector => selector === "body > header.navbar" ? navbar : null,
    createElement: () => spacer,
  };
  vm.runInNewContext(source, { document, window }, { filename: "customer-scroll-nav.js" });
  return {
    navbar, spacer, menuClasses, listeners, navbarListeners, toggleListeners,
    scrollTo(y) { window.scrollY = y; listeners.scroll(); },
    hidden() { return classes.has("is-scroll-hidden"); },
  };
}

test("Downward scroll hides; very small upward scroll immediately reveals", () => {
  const h = mount();
  assert.equal(h.spacer.style.height, "72px");
  assert.equal(h.hidden(), false, "initially visible");
  h.scrollTo(100);
  assert.equal(h.hidden(), true, "downward scroll hides");
  h.scrollTo(98);
  assert.equal(h.hidden(), false, "two-pixel upward scroll shows");
  h.scrollTo(150);
  assert.equal(h.hidden(), true);
  h.scrollTo(151);
  h.scrollTo(150);
  assert.equal(h.hidden(), true, "tiny noise does not make navbar jitter");
  h.scrollTo(149);
  assert.equal(h.hidden(), false, "accumulated 2px upward shows");
});

test("Top of page and expanded hamburger always keep navbar visible", () => {
  const h = mount();
  h.scrollTo(220);
  assert.equal(h.hidden(), true);
  h.menuClasses.add("show");
  h.scrollTo(245);
  assert.equal(h.hidden(), false, "open menu stays visible");
  h.menuClasses.delete("show");
  h.scrollTo(400);
  assert.equal(h.hidden(), true);
  h.scrollTo(0);
  assert.equal(h.hidden(), false, "top of page always shows");
  h.scrollTo(300);
  h.navbarListeners.focusin();
  assert.equal(h.hidden(), false, "keyboard focus shows navbar");
});

test("Safari pageshow, resizing, and menu actions reset hidden navigation", () => {
  const h = mount();
  h.scrollTo(250);
  assert.equal(h.hidden(), true);
  h.listeners.pageshow();
  assert.equal(h.hidden(), false);
  h.scrollTo(400);
  h.listeners.resize();
  assert.equal(h.hidden(), false);
  h.scrollTo(500);
  h.toggleListeners.click();
  assert.equal(h.hidden(), false);
});

test("Remember Me remains concise without the explanatory paragraph", () => {
  const html = fs.readFileSync(path.join(root, "authHTML/login.html"), "utf8");
  const css = fs.readFileSync(path.join(root, "authCSS/login.css"), "utf8");
  assert.match(html, /id="rememberMe"/);
  assert.match(html, /for="rememberMe"/);
  assert.match(html, /forgot-password\.html/);
  assert.doesNotMatch(html, /remember-me-help|Remembers your Customer email on this device/);
  assert.doesNotMatch(css, /\.auth-card \.remember-me-help/);
});
