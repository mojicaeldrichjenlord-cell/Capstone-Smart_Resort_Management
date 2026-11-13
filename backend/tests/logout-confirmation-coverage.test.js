// Static QA for role-wide logout confirmation imports.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const frontend = path.resolve(__dirname, "../../frontend");
const roles = ["customerHTML", "adminHTML", "frontdeskHTML", "managerHTML", "housekeepingHTML"];

test("every account page with a logout control loads the shared confirmation", () => {
  let checked = 0;
  for (const role of roles) {
    for (const file of fs.readdirSync(path.join(frontend, role)).filter(name => name.endsWith(".html"))) {
      const html = fs.readFileSync(path.join(frontend, role, file), "utf8");
      if (!/\bid=["'](?:logoutBtn|mobileLogoutBtn)["']/.test(html)) continue;
      checked++;
      assert.match(html, /sharedCSS\/logout-confirm\.css/, role + "/" + file + " missing dialog CSS");
      assert.match(html, /sharedJS\/logout-confirm\.js/, role + "/" + file + " missing dialog JS");
      assert.equal((html.match(/sharedJS\/logout-confirm\.js/g) || []).length, 1, role + "/" + file + " imports twice");
    }
  }
  assert.ok(checked >= 28, "Expected coverage across all account roles");
});

test("original role-specific session cleanup is preserved", () => {
  const source = fs.readFileSync(path.join(frontend, "sharedJS/logout-confirm.js"), "utf8");
  assert.match(source, /stopImmediatePropagation\(\)/);
  assert.match(source, /trigger\.click\(\)/);
  assert.match(source, /approvedTrigger = trigger/);
  assert.match(source, /closeDialog\(\)/);
  assert.doesNotMatch(source, /(?:localStorage|sessionStorage)\.removeItem/);
});


test("Cancel and Escape preserve login; Confirm alone runs the original logout", () => {
  const vm = require("node:vm");
  const source = fs.readFileSync(path.join(frontend, "sharedJS/logout-confirm.js"), "utf8");
  const listeners = {};
  let dialog;
  let logoutRuns = 0;
  let document;

  const makeButton = () => ({
    handlers: {},
    isConnected: true,
    addEventListener(name, handler) { this.handlers[name] = handler; },
    focus() { document.activeElement = this; }
  });
  const cancel = makeButton();
  const confirm = makeButton();
  dialog = {
    hidden: true,
    addEventListener() {},
    querySelector(selector) {
      return selector === ".logout-confirm-cancel" ? cancel : confirm;
    }
  };
  document = {
    activeElement: { isConnected: true, focus() {} },
    body: { appendChild() {} },
    createElement() { return dialog; },
    contains() { return true; },
    addEventListener(name, handler) { listeners[name] = handler; }
  };

  vm.runInNewContext(source, { document });
  const logoutButton = {
    isConnected: true,
    closest() { return this; },
    click() {
      // Simulates capture followed by the legacy role's logout listener.
      const event = { target: this, preventDefault() {}, stopImmediatePropagation() { this.stopped = true; } };
      listeners.click(event);
      if (!event.stopped) logoutRuns++;
    }
  };
  const attempt = () => {
    logoutButton.click();
    assert.equal(logoutRuns, 0, "logout must not run before confirmation");
    assert.equal(dialog.hidden, false, "dialog should appear centered over the page");
  };

  attempt();
  cancel.handlers.click();
  assert.equal(dialog.hidden, true);
  assert.equal(logoutRuns, 0);

  attempt();
  listeners.keydown({ key: "Escape", preventDefault() {} });
  assert.equal(dialog.hidden, true);
  assert.equal(logoutRuns, 0);

  attempt();
  confirm.handlers.click();
  assert.equal(dialog.hidden, true);
  assert.equal(logoutRuns, 1, "exactly one legacy logout must run");
});
