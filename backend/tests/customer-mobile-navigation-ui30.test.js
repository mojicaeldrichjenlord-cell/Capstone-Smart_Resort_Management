"use strict";
/*
 * UI-30 Customer navigation and chatbot mobile state.
 * Static + sandboxed browser-script verification only. No API/DB/PayPal access.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const pages = [
  "index.html", "rooms.html", "booking.html", "booking-payment.html",
  "booking-receipt.html", "my-bookings.html", "profile.html", "resort-map.html",
];

test("UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved", () => {
  for (const page of pages) {
    const html = read("frontend/customerHTML/" + page);
    assert.match(html, /<a class="logo(?: confirm-transaction-exit)?" href="index\.html" aria-label="Arvic Seaside — Customer Home">Arvic Seaside<\/a>/, page);
    assert.match(html, /customer-navbar\.css\?v=20261120-ui30/, page);
    assert.match(html, /customer-scroll-nav\.js\?v=20261120-ui30/, page);
    assert.match(html, /id="menuToggle"[^>]*aria-controls="mobileNav" aria-expanded="false"/, page);
    if (["booking.html", "booking-payment.html"].includes(page)) {
      assert.match(html, /<a class="logo confirm-transaction-exit" href="index\.html"/, page);
      assert.match(html, /document\.querySelectorAll\("\.confirm-transaction-exit"\)/, page);
      assert.match(html, /cancelTransactionModal\.classList\.add\("show"\)/, page);
      assert.match(html, /confirmCancelTransactionBtn\.addEventListener\("click"/, page);
    } else {
      assert.match(html, /<a class="logo" href="index\.html"/, page);
    }
  }
  const css = read("frontend/sharedCSS/customer-navbar.css");
  assert.match(css, /\.navbar \.logo:focus-visible/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /text-decoration:\s*none/);
});

function mockNavbar(url, open = true) {
  const listeners = {};
  let scrollTo = null;
  let prevented = false;
  const attrs = {};
  function makeClassList(initial = []) {
    const values = new Set(initial);
    return {
      contains: name => values.has(name),
      add: name => values.add(name),
      remove: name => values.delete(name),
    };
  }
  const menu = {
    classList: makeClassList(),
    textContent: open ? "×" : "☰",
    setAttribute(name,value) { attrs[name] = value; },
    addEventListener(name,fn) { listeners["menu-" + name] = fn; },
  };
  const nav = { classList: makeClassList(open ? ["show"] : []) };
  const navbar = {
    classList: makeClassList(),
    offsetHeight: 64,
    insertAdjacentElement() {},
    contains() { return true; },
    querySelector(selector) {
      return selector === "#menuToggle" ? menu :
        selector === "#mobileNav" ? nav : null;
    },
    addEventListener(name,fn) { listeners["navbar-" + name] = fn; },
  };
  const doc = {
    querySelector(selector) {
      return selector === "body > header.navbar" ? navbar : null;
    },
    createElement() {
      return { className:"", style:{}, setAttribute() {} };
    },
  };
  const winListeners = {};
  const win = {
    location: {href:url}, innerWidth:390, scrollY:450, pageYOffset:450,
    matchMedia(q) { return { matches: q.includes("max-width") }; },
    requestAnimationFrame(fn) { fn(); },
    addEventListener(name,fn) { winListeners[name] = fn; },
    scrollTo(value) { scrollTo = value; this.scrollY = 0; },
  };
  vm.runInNewContext(read("frontend/sharedJS/customer-scroll-nav.js"), {
    document: doc, window: win, URL,
  });
  const click = (href, options = {}) => {
    let clickPrevented = false;
    const link = {
      href,
      id: options.logout ? "logoutBtn" : "",
      classList:{contains: name => name === "confirm-transaction-exit" && !!options.guarded},
      target: "",hasAttribute(){return false;},
      getAttribute(name){return name === "href" ? href : null;},
    };
    const event = {
      target: { closest(){return link;} },
      button: options.button ?? 0, defaultPrevented: false,
      ctrlKey: !!options.ctrlKey, metaKey:false, altKey:false,shiftKey:false,
      preventDefault(){clickPrevented=true;prevented=true;},
    };
    listeners["navbar-click"](event);
    return clickPrevented;
  };
  return {click, menu, nav, attrs, navbar, get scrollTo(){return scrollTo;},get prevented(){return prevented;}};
}

test("UI-30 same-page hamburger navigation scrolls to top and closes mobile menu", () => {
  const mock = mockNavbar("https://arvicseasideresort.com/customerHTML/rooms.html?utm=test");
  assert.equal(mock.click("https://arvicseasideresort.com/customerHTML/rooms.html"), true);
  assert.equal(mock.scrollTo.top, 0);
  assert.equal(mock.scrollTo.behavior, "smooth");
  assert.equal(mock.nav.classList.contains("show"), false);
  assert.equal(mock.menu.textContent, "☰");
  assert.equal(mock.attrs["aria-expanded"], "false");
  assert.equal(mock.navbar.classList.contains("is-scroll-hidden"), false);
});

test("UI-30 different-page, modified click and booking guard keep native browser behavior", () => {
  const nextPage = mockNavbar("https://arvicseasideresort.com/customerHTML/rooms.html");
  assert.equal(nextPage.click("https://arvicseasideresort.com/customerHTML/index.html"), false);
  assert.equal(nextPage.scrollTo, null);
  assert.equal(nextPage.nav.classList.contains("show"), true);
  assert.equal(nextPage.click("https://arvicseasideresort.com/customerHTML/rooms.html", {ctrlKey:true}), false);
  // Clicking Logout must be handled by logout-confirm.js, not scroll-to-top.
  assert.equal(nextPage.click("#", {logout:true}), false);
  assert.equal(nextPage.scrollTo, null);

  const payment = mockNavbar("https://arvicseasideresort.com/customerHTML/booking-payment.html");
  assert.equal(payment.click("https://arvicseasideresort.com/customerHTML/booking-payment.html", {guarded:true}), false);
  assert.equal(payment.scrollTo, null);
});

test("UI-30 Home logo on Home scrolls to top without reloading", () => {
  const home = mockNavbar("https://arvicseasideresort.com/customerHTML/index.html");
  assert.equal(home.click("https://arvicseasideresort.com/customerHTML/index.html"), true);
  assert.equal(home.scrollTo.top, 0);
});

test("UI-30 compact and maximized mobile chat use genuinely different dimensions", () => {
  for (const file of ["ai-chat-layout.css", "ai-chat-airy.css"]) {
    const css = read("frontend/sharedCSS/" + file);
    const area = css.slice(css.lastIndexOf("UI-30:"));
    assert.match(area, /@media \(max-width: 560px\)/, file);
    const normal = area.match(/\.ai-chat-window:not\(\.maximized\)\s*\{([^}]*)\}/)?.[1] || "";
    const max = area.match(/\.ai-chat-window\.maximized\s*\{([^}]*)\}/)?.[1] || "";
    assert.match(normal, /top:\s*auto/);
    assert.match(normal, /height:\s*min\(575px,\s*66dvh\)/);
    assert.match(max, /top:\s*max\(8px,\s*env\(safe-area-inset-top\)\)/);
    assert.match(max, /height:\s*auto/);
    assert.match(max, /max-height:\s*none/);
  }
  for (const page of ["index.html","rooms.html","booking.html","my-bookings.html","profile.html","resort-map.html"]) {
    const html = read("frontend/customerHTML/" + page);
    // UI-38 bumps only the shared chat layout; UI-30 resize behavior is preserved.
    assert.match(html, /ai-chat-layout\.css\?v=20261121-ui38/,page);
    assert.match(html, /ai-chat\.js\?v=20261121-ai45/,page);
    assert.match(html, /ai-chat-polish\.js\?v=20261120-ui30/,page);
  }
  for (const page of ["index.html","rooms.html"]) {
    assert.match(read("frontend/customerHTML/" + page),/ai-chat-airy\.css\?v=20261120-ui30/);
  }
});

test("UI-30 size button persists maximize/restore and mobile minimize reduces before hiding", () => {
  const js = read("frontend/js/ai-chat.js");
  const polish = read("frontend/js/ai-chat-polish.js");
  assert.match(js, /function syncChatSizeButton\(/);
  assert.match(js, /chatWindow\.classList\.toggle\("maximized"\)/);
  assert.match(js, /localStorage\.setItem\(AI_WINDOW_STATE_KEY, isMaximized \? "maximized" : "normal"\)/);
  assert.match(js, /maximizeBtn\.setAttribute\("aria-pressed", String\(expanded\)\)/);
  assert.match(polish, /window\.matchMedia\("\(max-width: 560px\)"\)\.matches/);
  assert.match(polish, /chat\.classList\.contains\("maximized"\)/);
  assert.match(polish, /toggleMaximize\(\)/);
  assert.match(polish, /chat\.classList\.remove\("show"\)/);
  assert.match(polish, /window\.ArvicVoice\?\.stopConversation/);
});
