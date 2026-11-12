// Shared Admin-area responsive menu: reveals the hidden navigation on phones.
// This does not grant access; all real permissions are checked by backend routes.
(() => {
  "use strict";
  function initializeMobileNavigation() {
    const header = document.querySelector("header.navbar");
    const nav = header?.querySelector("nav");
    if (!header || !nav || header.querySelector(".admin-mobile-nav-btn")) return;
    if (!nav.id) nav.id = "adminAreaNavigation";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "admin-mobile-nav-btn";
    button.setAttribute("aria-controls", nav.id);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open navigation menu");
    button.textContent = "☰ Menu";
    header.insertBefore(button, nav);

    // Keep both the visual menu and screen-reader expansion state in sync.
    function setOpen(open) {
      nav.classList.toggle("mobile-open", open);
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      button.textContent = open ? "✕ Close" : "☰ Menu";
    }
    button.addEventListener("click", () => {
      setOpen(button.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", event => {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        button.focus();
      }
    });
    document.addEventListener("click", event => {
      if (!header.contains(event.target)) setOpen(false);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) setOpen(false);
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMobileNavigation);
  } else initializeMobileNavigation();
})();
