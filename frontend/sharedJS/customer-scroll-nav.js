// Customer navigation: hide on downward scroll, reveal after a small upward scroll.
// Shared by the eight signed-in Customer pages. No authentication/session changes.
(() => {
  "use strict";

  // The navbar is a direct body child. It stays fixed to the viewport on
  // mobile Safari/Chrome and desktop, not inside a scrollable section.
  const navbar = document.querySelector("body > header.navbar");
  if (!navbar) return;

  // Replaces the header's old normal-flow height, preventing the first page
  // section from sliding under the fixed header. The expanded hamburger menu
  // overlays content intentionally; its height must not shift the page.
  const spacer = document.createElement("div");
  spacer.className = "customer-navbar-spacer";
  spacer.setAttribute("aria-hidden", "true");
  navbar.insertAdjacentElement("afterend", spacer);

  const MIN_UP_DISTANCE = 2; // A tiny upward movement reveals the navigation.
  const MIN_DOWN_DISTANCE = 8; // Suppress shaking from small touch movements.
  let lastY = Math.max(0, window.scrollY || window.pageYOffset || 0);
  // Mobile Safari resizes the visual viewport as its URL bar collapses.
  // Only real width/orientation changes should reset navbar visibility.
  let lastWidth = window.innerWidth;
  let direction = 0;
  let accumulated = 0;
  let pendingFrame = false;

  function menuIsOpen() {
    const mobileMenu = navbar.querySelector("#mobileNav");
    return Boolean(mobileMenu &&
      mobileMenu.classList.contains("show") &&
      window.matchMedia("(max-width: 900px)").matches);
  }

  function showNavbar() {
    navbar.classList.remove("is-scroll-hidden");
  }

  function hideNavbar() {
    navbar.classList.add("is-scroll-hidden");
  }

  function syncSpacerHeight() {
    // Only measure the compact/closed header so the menu does not cause a
    // layout jump when expanded. The navbar itself remains above the content.
    if (!menuIsOpen()) {
      spacer.style.height = navbar.offsetHeight + "px";
    }
  }

  function updateScrollDirection() {
    pendingFrame = false;
    const nextY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    const delta = nextY - lastY;
    lastY = nextY;

    // Always show the header near the beginning of the page or when the
    // customer is navigating an already-expanded hamburger menu.
    if (nextY <= navbar.offsetHeight || menuIsOpen()) {
      direction = 0;
      accumulated = 0;
      showNavbar();
      return;
    }
    if (Math.abs(delta) < 0.5) return;

    const nextDirection = Math.sign(delta);
    if (nextDirection !== direction) {
      direction = nextDirection;
      accumulated = 0;
    }
    accumulated += Math.abs(delta);

    if (direction < 0 && accumulated >= MIN_UP_DISTANCE) showNavbar();
    if (direction > 0 && accumulated >= MIN_DOWN_DISTANCE) hideNavbar();
  }

  window.addEventListener("scroll", () => {
    if (pendingFrame) return;
    pendingFrame = true;
    window.requestAnimationFrame(updateScrollDirection);
  }, { passive: true });

  window.addEventListener("resize", () => {
    // Ignore Safari address-bar height changes during vertical scrolling.
    // Otherwise the navbar would repeatedly flash back into view.
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    syncSpacerHeight();
    showNavbar();
    lastY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    direction = 0;
    accumulated = 0;
  });

  // Safari can restore a scrolled page from its back/forward cache.
  window.addEventListener("pageshow", () => {
    syncSpacerHeight();
    showNavbar();
    lastY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    direction = 0;
    accumulated = 0;
  });

  // UI-30: Same-page navigation should return to the page heading, not
  // silently remain halfway down. Handles desktop links and mobile hamburger
  // taps without reloading; different-page links retain native navigation.
  const menuToggle = navbar.querySelector("#menuToggle");
  const mobileNav = navbar.querySelector("#mobileNav");
  function syncMenuAccessibility() {
    menuToggle?.setAttribute("aria-expanded",
      mobileNav?.classList.contains("show") ? "true" : "false");
  }
  function closeMobileMenu() {
    if (!mobileNav?.classList.contains("show")) return;
    mobileNav.classList.remove("show");
    if (menuToggle) menuToggle.textContent = "☰";
    syncMenuAccessibility();
    syncSpacerHeight();
  }

  navbar.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link || !navbar.contains(link) || event.defaultPrevented ||
        event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || link.target === "_blank" ||
        link.hasAttribute("download")) return;
    const target = new URL(link.href, window.location.href);
    const current = new URL(window.location.href);
    if (target.origin !== current.origin ||
        target.pathname !== current.pathname ||
        target.search !== current.search ||
        target.hash) return;
    // Do not bypass booking/payment's existing leave-confirmation safeguard.
    if (link.classList.contains("confirm-transaction-exit")) return;
    event.preventDefault();
    closeMobileMenu();
    showNavbar();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? "instant" : "smooth" });
    lastY = 0;
    direction = 0;
    accumulated = 0;
  });

  // Keyboard users and customers tapping the hamburger never lose the menu.
  navbar.addEventListener("focusin", showNavbar);
  menuToggle?.addEventListener("click", () => {
    showNavbar();
    syncMenuAccessibility();
  });

  syncMenuAccessibility();
  syncSpacerHeight();
})();
