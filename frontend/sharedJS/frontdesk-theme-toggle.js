/*
 * FD-DM-01 | Front Desk-only theme toggle.
 * One shared switch persisted across Dashboard, Reservations, Payments, Guests,
 * and the two role-aware manual reservation screens. Light remains the default.
 * Pure presentation: no auth, booking, guest, payment or API logic changed.
 */
(() => {
  "use strict";
  const KEY = "arvic_frontdesk_theme_v1";
  const root = document.documentElement;
  const isManual = /\/adminHTML\/admin-walkin(?:-payment)?\.html$/i.test(location.pathname);

  function isFrontDeskManualUser() {
    if (!isManual) return true;
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const role = String(user?.role || "").trim().toLowerCase();
      return role === "frontdesk" || role === "staff";
    } catch (_) { return false; }
  }

  // Never style an Admin account that happens to view a shared HTML file.
  if (!isFrontDeskManualUser()) return;

  function savedMode() {
    try { return localStorage.getItem(KEY) === "dark" ? "dark" : "light"; }
    catch (_) { return "light"; }
  }
  function setMode(mode, save = false) {
    const dark = mode === "dark";
    root.setAttribute("data-frontdesk-theme", dark ? "dark" : "light");
    if (save) {
      try { localStorage.setItem(KEY, dark ? "dark" : "light"); }
      catch (_) { /* Storage may be blocked without breaking theme. */ }
    }
    const toggle = document.getElementById("frontdeskThemeToggle");
    if (!toggle) return;
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.setAttribute("aria-label", dark ? "Switch Front Desk to light mode" : "Switch Front Desk to dark mode");
    toggle.title = dark ? "Light mode" : "Dark mode";
    const symbol = toggle.querySelector(".frontdesk-theme-knob");
    if (symbol) symbol.textContent = dark ? "☾" : "☀";
  }

  // Head script runs before styles render; avoid a white flash across routes.
  setMode(savedMode());

  function mountToggle() {
    if (!document.body?.classList.contains("frontdesk-manager-tone")) return;
    if (!isFrontDeskManualUser()) return;
    const nav = document.querySelector("body.frontdesk-manager-tone > header.navbar nav");
    const logout = nav?.querySelector("#logoutBtn");
    if (!nav || !logout || document.getElementById("frontdeskThemeToggle")) return;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.id = "frontdeskThemeToggle";
    toggle.className = "frontdesk-theme-toggle";
    toggle.setAttribute("aria-pressed", "false");
    toggle.innerHTML = '<span class="frontdesk-theme-knob" aria-hidden="true">☀</span>';
    nav.insertBefore(toggle, logout);
    toggle.addEventListener("click", () => {
      setMode(root.getAttribute("data-frontdesk-theme") === "dark" ? "light" : "dark", true);
    });
    setMode(savedMode());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountToggle);
  } else {
    mountToggle();
  }
})();
