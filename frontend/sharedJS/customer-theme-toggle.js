/*
 * DM-02 | Signed-in CUSTOMER-only theme control.
 * One shared navbar button; no changes to AI, checkout, auth or any backend.
 *
 * Loaded synchronously in <head> on the eight customer account pages:
 * apply stored theme before styles paint; inject button on DOM ready.
 * Light is ALWAYS the default if no stored preference.
 */
(() => {
  "use strict";
  const KEY = "arvic_customer_theme_v1";
  const root = document.documentElement;
  function getSavedPreference() {
    try {
      const saved = window.localStorage.getItem(KEY);
      return saved === "dark" ? "dark" : "light";
    } catch (_) {
      return "light";
    }
  }
  function setTheme(value, persist) {
    const theme = value === "dark" ? "dark" : "light";
    root.setAttribute("data-customer-theme", theme);
    if (persist) {
      try { window.localStorage.setItem(KEY, theme); } catch (_) {
        // Private browsing or disabled storage: theme still works this page.
      }
    }
    const button = document.getElementById("customerThemeToggle");
    if (!button) return;
    const isDark = theme === "dark";
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    button.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
    const icon = button.querySelector(".customer-theme-icon");
    const text = button.querySelector(".customer-theme-label");
    if (icon) icon.textContent = isDark ? "☾" : "☀";
    if (text) text.textContent = isDark ? "Light Mode" : "Dark Mode";
  }

  // Apply before stylesheet evaluation to avoid a flash on page-to-page nav.
  setTheme(getSavedPreference(), false);

  function initButton() {
    const nav = document.querySelector("body.customer-manager-tone > header.navbar nav#mobileNav");
    const logout = nav?.querySelector("#logoutBtn");
    if (!nav || !logout || document.getElementById("customerThemeToggle")) return;

    const button = document.createElement("button");
    button.id = "customerThemeToggle";
    button.type = "button";
    button.className = "customer-theme-toggle";
    button.setAttribute("aria-pressed", "false");

    const icon = document.createElement("span");
    icon.className = "customer-theme-icon";
    icon.setAttribute("aria-hidden", "true");
    button.appendChild(icon);

    const label = document.createElement("span");
    label.className = "customer-theme-label";
    button.appendChild(label);

    nav.insertBefore(button, logout); // Profile → Theme → Logout.
    button.addEventListener("click", () => {
      const next = root.getAttribute("data-customer-theme") === "dark" ? "light" : "dark";
      setTheme(next, true);
      // No navigation; booking/payment draft and confirmation remain intact.
    });
    setTheme(root.getAttribute("data-customer-theme"), false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initButton, { once: true });
  } else {
    initButton();
  }

  // Synchronize another tab on the same origin, without changing account data.
  window.addEventListener("storage", (event) => {
    if (event.key === KEY || event.key === null) setTheme(getSavedPreference(), false);
  });
})();
