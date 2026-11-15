// Customer-only Remember Me regression checks.
// Uses fake browser storage and fake login responses; no real credentials,
// database writes, network calls, or customer personal information.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "../../frontend");
const script = fs.readFileSync(path.join(root, "authJS/login.js"), "utf8");
const html = fs.readFileSync(path.join(root, "authHTML/login.html"), "utf8");
const key = "arvic_customer_remembered_email_v1";

function mount({ initial = {}, role = "customer", checked = false, valid = true } = {}) {
  const storage = new Map(Object.entries(initial));
  const session = new Map();
  const nodes = {};
  function element(id) {
    return nodes[id] ||= {
      id, value: "", checked: false, type: "password", textContent: "",
      disabled: false, hidden: false, className: "", listeners: {},
      addEventListener(event, handler) { this.listeners[event] = handler; },
      setAttribute() {}, querySelector() { return nodes.submit; },
    };
  }
  for (const id of ["loginForm", "loginMessage", "email", "password",
    "rememberMe", "togglePassword", "passwordEyeIcon", "submit"]) element(id);
  nodes.email.value = "example@resort.test";
  nodes.password.value = "Synthetic-Password!123";
  nodes.rememberMe.checked = checked;

  const store = {
    getItem(name) { return storage.get(name) ?? null; },
    setItem(name, value) { storage.set(name, value); },
    removeItem(name) { storage.delete(name); },
  };
  const sessions = {
    setItem(name, value) { session.set(name, value); },
    removeItem(name) { session.delete(name); },
  };
  const context = {
    document: { getElementById: id => nodes[id] || null },
    localStorage: store, sessionStorage: sessions,
    window: { location: { href: "" } },
    API_BASE: "/api",
    showToast() {}, setTimeout() {},
    fetch: async () => ({
      ok: valid,
      async json() {
        if (!valid) return { message: "Invalid email or password." };
        return {
          user: { id: 7, role, email: "example@resort.test",
            account_status: "active", is_verified: 1 },
          customerToken: "cus1.abc.def",
          frontDeskToken: "fd1.abc.def",
          adminToken: "adm1.abc.def",
        };
      }
    }),
    console: { error() {} },
  };
  vm.runInNewContext(script, context, { filename: "login.js" });
  return {
    storage, nodes, session,
    submit: async () => nodes.loginForm.listeners.submit({ preventDefault() {} }),
  };
}

test("Remember me checkbox and password-manager attributes are accessible", () => {
  assert.match(html, /id="rememberMe"/);
  assert.match(html, /for="rememberMe"/);
  assert.match(html, /autocomplete="username"/);
  assert.match(html, /autocomplete="current-password"/);
  assert.doesNotMatch(script, /localStorage\.setItem\(["'](?:password|customerToken)["']/);
});

test("Customer opt-in remembers only the email after valid login", async () => {
  const h = mount({ checked: true });
  await h.submit();
  assert.equal(h.storage.get(key), "example@resort.test");
  assert.equal(h.session.get("customerToken"), "cus1.abc.def");
  assert.equal(h.storage.has("customerToken"), false);
  assert.equal(h.storage.has("password"), false);
});

test("Remembered email pre-fills and unchecking clears it immediately", async () => {
  const h = mount({ initial: { [key]: "saved@resort.test" } });
  assert.equal(h.nodes.email.value, "saved@resort.test");
  assert.equal(h.nodes.rememberMe.checked, true);
  h.nodes.rememberMe.checked = false;
  h.nodes.rememberMe.listeners.change();
  assert.equal(h.storage.has(key), false);
  await h.submit();
  assert.equal(h.storage.has(key), false);
});

test("Staff login and failed login do not remember credentials", async () => {
  const staff = mount({ role: "frontdesk", checked: true });
  await staff.submit();
  assert.equal(staff.storage.has(key), false);
  const invalid = mount({ checked: true, valid: false });
  await invalid.submit();
  assert.equal(invalid.storage.has(key), false);
});

test("Register/forgot-password email handoff overrides an older remembered email", () => {
  const h = mount({ initial: { [key]: "older@resort.test",
    registeredEmail: "recent@resort.test" } });
  assert.equal(h.nodes.email.value, "recent@resort.test");
  assert.equal(h.storage.has("registeredEmail"), false);
});

test("Confirmed Customer logout clears the bearer token but not remembered email", () => {
  const source = fs.readFileSync(path.join(root, "customerJS/index.js"), "utf8");
  assert.match(source, /localStorage\.removeItem\("user"\)/);
  assert.match(source, /sessionStorage\.removeItem\("customerToken"\)/);
  assert.doesNotMatch(source, /removeItem\("arvic_customer_remembered_email_v1"\)/);
});
