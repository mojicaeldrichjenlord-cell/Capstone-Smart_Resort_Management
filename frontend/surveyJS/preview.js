// ============================================================
// ARVIC SEASIDE — READ-ONLY SURVEY PREVIEW
// All interactions are browser-local. Intentionally NO fetch(),
// form submission, authentication, storage, AI calls, or payments.
// This page must NEVER be used as a real booking confirmation.
// ============================================================
(() => {
  "use strict";

  // Keep mobile navigation accessible and collapse on selection.
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#primaryNav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Sample accommodation selection updates preview text only.
  const sampleRoom = document.querySelector("#selectedRoom");
  const previewSection = document.querySelector("#booking-preview");
  document.querySelectorAll("[data-select-room]").forEach((button) => {
    button.addEventListener("click", () => {
      if (sampleRoom) {
        sampleRoom.textContent = button.getAttribute("data-select-room") || "Sample accommodation";
      }
      if (previewSection) {
        previewSection.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start"
        });
      }
    });
  });

  // These replies are curated, static policy EXAMPLES—not a live AI model.
  // They deliberately make no promises about refunds, availability or price.
  const examples = Object.freeze({
    downpayment: "For online reservations, the required downpayment is 50% of the accommodation price. The remaining accommodation balance and entrance fees are handled onsite according to resort policy.",
    entrance: "Entrance fees are separate from the accommodation downpayment. The booking page provides an estimate, and Front Desk confirms the final entrance fees, guest adjustments, and eligible discounts onsite.",
    refund: "Refund requests are not processed automatically. Resort management reviews them manually under its policies and verified payment records. Cancellation does not guarantee a refund.",
    confirmation: "The AI assistant can explain policies and help guests understand accommodations, but an AI conversation cannot create or confirm a booking. Guests must use the official reservation and payment process."
  });
  const answer = document.querySelector("#faqAnswer");
  const faqButtons = [...document.querySelectorAll("[data-faq]")];
  faqButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.getAttribute("data-faq");
      if (!Object.prototype.hasOwnProperty.call(examples, key)) return;
      if (answer) answer.textContent = examples[key];
      faqButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
    });
  });
})();