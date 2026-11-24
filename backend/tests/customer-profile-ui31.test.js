"use strict";
/*
 * UI-31: Customer Profile presentation and password-visibility regression.
 * No account mutation, credential submission, API, PayPal, or DB call.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const html = read("frontend/customerHTML/profile.html");
const css = read("frontend/customerCSS/profile.css");
const js = read("frontend/customerJS/profile.js");

test("UI-31 has a single compact heading and preserves all read-only profile IDs", () => {
  assert.match(html, /class="customer-manager-tone customer-profile-page"/);
  assert.match(html, /<header class="profile-intro">/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(html, /class="page-header"/);
  assert.match(html, /class="profile-readonly-tag">Read only/);
  for (const id of ["profileFullname", "profileEmail", "profilePhone", "profileAddress"]) {
    assert.equal((html.match(new RegExp('id="' + id + '"', "g")) || []).length, 1);
    assert.match(html, new RegExp('class="profile-readonly" id="' + id + '"'));
  }
  assert.equal((html.match(/class="profile-card(?: profile-security-card)?"/g) || []).length, 2);
  assert.match(html, /id="profileDetailsTitle"/);
  assert.match(html, /id="profileSecurityTitle"/);
});

test("UI-31 keeps one password form, same field IDs, validation and authenticated endpoints", () => {
  assert.equal((html.match(/id="changePasswordForm"/g) || []).length, 1);
  for (const [id,autocomplete] of [
    ["currentPassword","current-password"],
    ["newPassword","new-password"],
    ["confirmNewPassword","new-password"],
  ]) {
    assert.match(html, new RegExp('id="' + id + '"[^>]*autocomplete="' + autocomplete + '" required'));
    assert.match(html, new RegExp('data-target="' + id + '"'));
    assert.match(html, new RegExp('aria-controls="' + id + '"'));
    assert.match(html, new RegExp('class="toggle-password"[^>]*data-target="' + id + '"[^>]*aria-pressed="false"', "s"));
  }
  assert.match(html, /type="submit" class="profile-submit-btn"/);
  assert.match(html, /password-form-footer/);
  assert.match(js, /sessionStorage\.getItem\("customerToken"\)/);
  assert.match(js, /\/auth\/profile\/\$\{userId\}/);
  assert.match(js, /\/auth\/change-password\/\$\{userId\}/);
  assert.match(js, /method: "PUT"/);
  assert.match(js, /JSON\.stringify\(\{\s*currentPassword,\s*newPassword,/);
  assert.match(js, /if \(newPassword\.length < 8 \|\| newPassword\.length > 16\)/);
  assert.match(js, /if \(newPassword !== confirmNewPassword\)/);
  assert.match(js, /form\.reset\(\)/);
});

test("UI-31 profile-specific CSS loads last, stays calm and remains mobile readable", () => {
  assert.ok(html.indexOf("profile.css?v=20261124-ui72") >
            html.indexOf("customer-manager-tone.css?v=20261119-ui22"));
  assert.match(html, /customerJS\/profile\.js\?v=20261124-ui72/);
  assert.match(css, /body\.customer-manager-tone\.customer-profile-page/);
  assert.match(css, /background: #f8fafc !important/);
  assert.match(css, /\.profile-form-grid,\s*\.customer-profile-page \.password-form-grid/);
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /\.password-group input/);
  assert.match(css, /padding: 11px 83px 11px 13px/);
  assert.match(css, /\.toggle-password\s*\{[^}]*position: absolute/s);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(css, /https?:\/\/images\.unsplash\.com|#0ea5e9|border-radius: 999px;\s*background: #0f172a/);
});

test("UI-31 Show/Hide toggles update actual password input and accessible state", () => {
  const inputs = {
    currentPassword: { type: "password" },
    newPassword: { type: "password" },
    confirmNewPassword: { type: "password" },
  };
  const buttons = Object.keys(inputs).map(id => {
    const attrs = { "data-target": id, "aria-pressed": "false" };
    return {
      textContent: "Show",
      getAttribute(name) { return attrs[name]; },
      setAttribute(name,value) { attrs[name] = value; },
      addEventListener(event,handler) {
        assert.equal(event, "click");
        this.click = handler;
      },
    };
  });
  const ctx = {
    document: {
      addEventListener() {}, // Do not auto-load customer profile / API.
      querySelectorAll(selector) {
        assert.equal(selector, ".toggle-password");
        return buttons;
      },
      getElementById(id) { return inputs[id]; },
    },
  };
  vm.runInNewContext(js, ctx);
  vm.runInContext("setupPasswordToggles()", ctx);
  for (const [i, id] of Object.keys(inputs).entries()) {
    const button = buttons[i];
    button.click();
    assert.equal(inputs[id].type, "text");
    assert.equal(button.textContent, "Hide");
    assert.equal(button.getAttribute("aria-pressed"), "true");
    assert.match(button.getAttribute("aria-label"), /^Hide /);
    button.click();
    assert.equal(inputs[id].type, "password");
    assert.equal(button.textContent, "Show");
    assert.equal(button.getAttribute("aria-pressed"), "false");
    assert.match(button.getAttribute("aria-label"), /^Show /);
  }
});

test("UI-72 password form starts hidden and the accessible disclosure targets it", () => {
  assert.match(html, /id="changePasswordToggle"[^>]*aria-expanded="false"[^>]*aria-controls="changePasswordForm"/);
  assert.match(html, /<form id="changePasswordForm" class="password-form" hidden>/);
  assert.match(css, /\.password-form\[hidden\]\s*\{\s*display: none !important;/);
  assert.match(js, /setupPasswordDisclosure\(\);/);
  assert.match(js, /setPasswordFormOpen\(false\);/);
  assert.match(js, /if \(changePasswordForm.hidden\) return;/);
});

test("UI-72 open, close, clear typed credentials and reset password visibility without API calls", () => {
  const inputs = {};
  const buttons = ["currentPassword", "newPassword", "confirmNewPassword"].map(id => {
    inputs[id] = {type:"text", value:"synthetic", focus(){this.focused=true;}};
    return {
      textContent:"Hide", attrs:{"data-target":id,"aria-pressed":"true"},
      getAttribute(name){return this.attrs[name];},
      setAttribute(name,value){this.attrs[name]=value;}
    };
  });
  const submit = {disabled:false};
  const form = {hidden:true, resetCount:0,
    reset(){this.resetCount++;Object.values(inputs).forEach(input=>{input.value="";});},
    querySelectorAll(selector){assert.equal(selector,".toggle-password");return buttons;},
    querySelector(){return submit;}
  };
  const toggle = {attrs:{"aria-expanded":"false"},
    setAttribute(name,value){this.attrs[name]=value;},
    addEventListener(event,handler){assert.equal(event,"click");this.click=handler;},
    focus(){this.focused=true;}
  };
  const context = {document:{
    addEventListener(){},
    getElementById(id){return {changePasswordForm:form,changePasswordToggle:toggle,...inputs}[id];}
  }};
  vm.runInNewContext(js,context);
  vm.runInContext("setupPasswordDisclosure()",context);
  toggle.click();
  assert.equal(form.hidden,false);
  assert.equal(toggle.attrs["aria-expanded"],"true");
  assert.equal(inputs.currentPassword.focused,true);
  submit.disabled=true;
  toggle.click();
  assert.equal(form.hidden,false);
  submit.disabled=false;
  toggle.click();
  assert.equal(form.hidden,true);
  assert.equal(toggle.attrs["aria-expanded"],"false");
  assert.equal(toggle.focused,true);
  assert.equal(form.resetCount,1);
  for(const input of Object.values(inputs)){
    assert.equal(input.value,"");
    assert.equal(input.type,"password");
  }
  for(const button of buttons){
    assert.equal(button.textContent,"Show");
    assert.equal(button.attrs["aria-pressed"],"false");
    assert.match(button.attrs["aria-label"],/^Show /);
  }
  toggle.click();
  assert.equal(form.hidden,false);
  vm.runInContext("setPasswordFormOpen(false)",context);
  assert.equal(form.hidden,true);
  assert.equal(form.resetCount,2);
});
