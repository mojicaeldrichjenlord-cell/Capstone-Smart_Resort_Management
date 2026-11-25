"use strict";
// UI-88 is presentation-only. These tests guard markup and responsive CSS;
// interactive viewport QA still requires a real browser.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"../..",p),"utf8");
const html=read("frontend/authHTML/register.html");
const css=read("frontend/authCSS/register.css");
const js=read("frontend/authJS/register.js");
test("UI-88 uses a real label after the password input, with no competing placeholder",()=>{
  assert.equal((html.match(/for="password"/g)||[]).length,1);
  assert.match(html, /id="password"\s+placeholder=" "[\s\S]*?aria-describedby="passwordRequirements"[\s\S]*?\/>\s*<label class="premium-floating-label" for="password">Password<\/label>/);
  assert.match(html,/register\.css\?v=20261125-ui88/);
});
test("UI-88 label stays raised during focus, typing or autofill",()=>{
  assert.match(css,/\.premium-password-field:focus-within \.premium-floating-label/);
  assert.match(css,/input:not\(:placeholder-shown\) \+ \.premium-floating-label/);
  assert.match(css,/input:-webkit-autofill \+ \.premium-floating-label/);
});
test("UI-88 guidance is collapsed by default and expands for keyboard or pointer focus",()=>{
  assert.match(html,/<div class="password-guidance">\s*<div class="password-guidance-inner">[\s\S]*?id="passwordStrengthBox"[\s\S]*?id="passwordRequirements"/);
  assert.match(css,/\.password-guidance\s*\{[^}]*grid-template-rows: 0fr;[^}]*visibility: hidden;/);
  assert.match(css,/\.password-premium-group:focus-within \.password-guidance\s*\{[^}]*grid-template-rows: 1fr;[^}]*visibility: visible;/);
  assert.match(css,/\.password-guidance-inner\s*\{[^}]*min-height: 0;[^}]*overflow: hidden;/);
});
test("UI-88 preserves responsive layout, touch targets and reduced motion",()=>{
  assert.match(css,/@media \(max-width: 700px\) \{\s*#registerForm \.register-form-grid \{ grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css,/@media \(pointer: coarse\) \{\s*#registerForm \.password-toggle \{ width: 44px; height: 44px/);
  assert.match(css,/\.password-requirements\s*\{[^}]*flex-wrap: wrap/);
  assert.match(css,/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?#registerForm \.password-guidance,[\s\S]*?transition: none !important/);
});
test("UI-88 retains existing password limits and registration security flow",()=>{
  assert.match(html,/id="password"[^>]*minlength="8"[^>]*maxlength="16"/);
  assert.match(html,/id="confirmPassword"[^>]*minlength="8"[^>]*maxlength="16"/);
  assert.match(js,/if \(!requirements\.length\)/);
  assert.match(js,/setPasswordVisibility/);
  assert.match(js,/showOtpBox\(pendingVerificationEmail\)/);
  assert.match(js,/sessionStorage\.setItem\("customerToken", customerToken\)/);
});
