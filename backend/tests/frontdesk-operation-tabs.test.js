// =============================================================
// Front Desk Guest Management — fixed operation tab UI tests.
// Offline: no browser, no DB, no network, no production writes.
// Run: node --test tests/frontdesk-operation-tabs.test.js
// =============================================================
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repo = path.resolve(__dirname, "../..");
const html = fs.readFileSync(
  path.join(repo, "frontend/frontdeskHTML/frontdeskGuests.html"), "utf8");
const source = fs.readFileSync(
  path.join(repo, "frontend/frontdeskJS/frontdeskOperationTabs.js"), "utf8");
const css = fs.readFileSync(
  path.join(repo, "frontend/frontdeskCSS/frontdeskOperationTabs.css"), "utf8");

// Tiny test-only DOM with native-like reparenting, enough to verify
// tab interactions against the ACTUAL HTML without external dependencies.
class Element {
  constructor(tag, attributes = {}) {
    this.tagName = tag;
    this.attributes = { ...attributes };
    this.parentNode = null;
    this.children = [];
    this.hidden = Object.hasOwn(attributes, "hidden");
    this.listeners = {};
    this.scrollTop = 0;
    this.classes = new Set((attributes.class || "").split(/\s+/).filter(Boolean));
    this.classList = {
      contains: name => this.classes.has(name),
      add: name => this.classes.add(name),
      remove: name => this.classes.delete(name),
      toggle: (name, force) => {
        if (force === undefined) force = !this.classes.has(name);
        if (force) this.classes.add(name);
        else this.classes.delete(name);
        return force;
      },
    };
  }
  get id() { return this.attributes.id || ""; }
  set id(value) { this.attributes.id = value; }
  get className() { return [...this.classes].join(" "); }
  set className(value) {
    this.classes = new Set(String(value).split(/\s+/).filter(Boolean));
  }
  get firstElementChild() { return this.children[0] || null; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] || null; }
  appendChild(element) {
    if (element.parentNode) {
      const siblings = element.parentNode.children;
      siblings.splice(siblings.indexOf(element), 1);
    }
    element.parentNode = this;
    this.children.push(element);
    return element;
  }
  matches(selectors) {
    return selectors.split(",").some(selector => {
      const item = selector.trim();
      if (item.startsWith(".")) return this.classes.has(item.slice(1));
      if (item.startsWith("#")) return this.id === item.slice(1);
      return this.tagName === item.toLowerCase();
    });
  }
  closest(selector) {
    let node = this;
    while (node) {
      if (node.matches(selector)) return node;
      node = node.parentNode;
    }
    return null;
  }
  querySelector(selector) {
    let found = null;
    function walk(node) {
      for (const child of node.children) {
        if (child.matches(selector)) { found = child; return; }
        walk(child);
        if (found) return;
      }
    }
    walk(this);
    return found;
  }
  addEventListener(name, listener) {
    (this.listeners[name] ||= []).push(listener);
  }
  dispatch(name, extras = {}) {
    for (const listener of this.listeners[name] || [])
      listener({ preventDefault() {}, ...extras });
  }
  focus() { this.focused = true; }
}

function parseHtml(htmlText) {
  const root = new Element("root");
  const stack = [root];
  const voidTags = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
  ]);
  const tags = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)>/g;
  let match;
  while ((match = tags.exec(htmlText))) {
    const tag = match[2].toLowerCase();
    if (match[1]) {
      while (stack.length > 1 && stack.at(-1).tagName !== tag) stack.pop();
      if (stack.length > 1) stack.pop();
      continue;
    }
    const attrs = {};
    for (const attribute of match[3].matchAll(
      /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g,
    )) attrs[attribute[1]] = attribute[2] ?? attribute[3] ?? attribute[4] ?? "";
    const element = new Element(tag, attrs);
    stack.at(-1).appendChild(element);
    if (!voidTags.has(tag) && !match[3].trim().endsWith("/")) stack.push(element);
  }
  return root;
}

const specs = [
  ["guestAdjustmentModal", 2, "saveGuestAdjustmentBtn"],
  ["entranceAdjustmentModal", 3, "saveEntranceAdjustmentBtn"],
  ["addAccommodationModal", 2, "saveAddAccommodationBtn"],
  ["extendStayModal", 2, "saveExtendStayBtn"],
  ["extraBedModal", 2, "saveExtraBedBtn"],
  ["additionalChargesModal", 2, "saveAdditionalChargeBtn"],
];

function setup() {
  const root = parseHtml(html);
  class MutationObserver {
    constructor(callback) { this.callback = callback; }
    observe(element) { element._observer = this; }
  }
  const doc = {
    readyState: "complete",
    createElement: tag => new Element(tag),
    getElementById: id => root.querySelector("#" + id),
  };
  const warnings = [];
  const originalIDs = [];
  function visit(node, into) {
    if (node.id) into.push(node.id);
    for (const child of node.children) visit(child, into);
  }
  visit(root, originalIDs);
  vm.runInNewContext(source, {
    document: doc,
    MutationObserver,
    console: { warn: (...args) => warnings.push(args) },
  });
  return { root, doc, warnings, originalIDs, visit };
}

test("All six modals upgrade to fixed tabs without losing inputs or handlers", () => {
  const { root, doc, warnings, originalIDs, visit } = setup();
  assert.deepEqual(warnings, []);
  for (const [id, count, actionId] of specs) {
    const overlay = doc.getElementById(id);
    const box = overlay.firstElementChild;
    assert.equal(box.classList.contains("fd-tabbed-modal-box"), true, id);
    const nav = box.querySelector(".fd-tab-nav");
    const body = box.querySelector(".fd-tab-body");
    const footer = box.querySelector(".fd-tab-footer");
    assert.ok(nav && body && footer, id);
    assert.equal(nav.children.length, count, id);
    assert.equal(body.children.length, count, id);
    assert.equal(body.children.filter(panel => !panel.hidden).length, 1);
    assert.ok(footer.querySelector("#" + actionId), "missing footer action " + actionId);
  }
  const finalIDs = [];
  visit(root, finalIDs);
  for (const id of originalIDs) assert.ok(finalIDs.includes(id), "lost DOM ID: " + id);
});

test("Clicking and keyboard navigation switches only the active section", () => {
  const { doc } = setup();
  for (const [id] of specs) {
    const box = doc.getElementById(id).firstElementChild;
    const buttons = box.querySelector(".fd-tab-nav").children;
    const panels = box.querySelector(".fd-tab-body").children;
    buttons.at(-1).dispatch("click");
    assert.equal(panels[0].hidden, true, id);
    assert.equal(panels.at(-1).hidden, false, id);
    buttons.at(-1).dispatch("keydown", { key: "Home" });
    assert.equal(panels[0].hidden, false, id);
    assert.equal(buttons[0].focused, true, id);
    assert.equal(buttons[0].getAttribute("aria-selected"), "true", id);
  }
});

test("Reopening a modal resets it to first tab; reconciliation remains in Review", () => {
  const { doc } = setup();
  for (const [id] of specs) {
    const overlay = doc.getElementById(id);
    const box = overlay.firstElementChild;
    const buttons = box.querySelector(".fd-tab-nav").children;
    const panels = box.querySelector(".fd-tab-body").children;
    buttons.at(-1).dispatch("click");
    overlay.classList.remove("show");
    overlay._observer.callback();
    overlay.classList.add("show");
    overlay._observer.callback();
    assert.equal(panels[0].hidden, false, "did not reset " + id);
  }
  const reconcile = doc.getElementById("entranceReconciliationPanel");
  const review = doc.getElementById("entranceAdjustmentModal")
    .firstElementChild.querySelector(".fd-tab-body").children[2];
  assert.equal(reconcile.closest(".fd-tab-panel"), review);
  assert.equal(reconcile.hidden, true);
});

test("Source is scoped to Front Desk Guest Management; small screens retain safety scroll", () => {
  assert.match(html, /frontdeskCSS\/frontdeskOperationTabs\.css/);
  assert.match(html, /frontdeskJS\/frontdeskOperationTabs\.js/);
  assert.match(css, /\.fd-tabbed-modal-box[\s\S]*?overflow:\s*hidden !important/);
  assert.match(css, /\.fd-tab-panel\[hidden\]/);
  assert.match(css, /overflow-y:\s*auto/);
  assert.match(source, /aria-selected/);
  assert.match(source, /role", "tablist"/);
  // The enhancement itself never submits reservations or charges.
  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|INSERT INTO|UPDATE\s+reservations/i);
});
