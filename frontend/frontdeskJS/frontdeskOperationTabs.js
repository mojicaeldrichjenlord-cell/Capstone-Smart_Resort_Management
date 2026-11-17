/* ===============================================================
 * FRONT DESK OPERATION TABS — presentation-only progressive upgrade.
 * Keeps ALL original input/button IDs and click handlers in place.
 * The shared navigation splits long modals into short, fixed-height
 * sections. The existing backend remains the authority for every fee,
 * date, overlap check, and saved reservation action.
 * =============================================================== */
(() => {
  "use strict";

  const modalSpecs = [
    {
      id: "guestAdjustmentModal",
      header: ".guest-adjustment-header",
      footer: ".guest-adjustment-modal-actions",
      tabs: [
        ["Guest Count", [
          ".guest-adjustment-summary-grid",
          ".guest-adjustment-form-group:nth-of-type(1)", // resolved below by input owner instead
          ".guest-adjustment-form-group:nth-of-type(2)",
        ]],
        ["Charges & Review", [
          ".guest-adjustment-charge-preview",
          ".guest-adjustment-payment-summary",
          ".guest-adjustment-note",
        ]],
      ],
    },
    {
      id: "entranceAdjustmentModal",
      header: ".entrance-adjustment-header",
      footer: ".entrance-adjustment-actions",
      tabs: [
        ["Guest Summary", [
          "#currentEntranceAdjustmentBox",
          ".entrance-adjustment-meta-grid",
        ]],
        ["Special Rates", [
          ".entrance-adjustment-input-grid",
          "#entranceAdjustmentNoteInput",
        ]],
        ["Charges & Review", [
          ".entrance-adjustment-breakdown",
          "#entranceAdjustmentPolicyNote",
          "#entranceReconciliationPanel",
        ]],
      ],
    },
    {
      id: "addAccommodationModal",
      header: ".stay-modal-header",
      footer: ".stay-modal-actions",
      tabs: [
        ["Choose Schedule", [".stay-form-grid"]],
        ["Review & Add", [
          "#addAccommodationPreview",
          "#addAccommodationAvailabilityStatus",
          ".stay-financial-note",
        ]],
      ],
    },
    {
      id: "extendStayModal",
      header: ".stay-modal-header",
      footer: ".stay-modal-actions",
      tabs: [
        ["Extend Stay", [".stay-form-grid"]],
        ["Review Extension", [
          "#extendStayPreview",
          "#extendStayAvailabilityStatus",
          ".stay-financial-note",
        ]],
      ],
    },
    {
      id: "extraBedModal",
      header: ".extra-bed-header",
      footer: ".extra-bed-actions",
      tabs: [
        ["Bed Quantity", [
          ".extra-bed-summary-grid",
          ".extra-bed-form-group",
        ]],
        ["Charges & Review", [
          ".extra-bed-breakdown",
          "#extraBedStatusNote",
        ]],
      ],
    },
    {
      id: "additionalChargesModal",
      header: ".additional-charges-header",
      footer: ".additional-charges-actions",
      tabs: [
        ["Saved Charges", [
          ".additional-charges-summary",
          "#additionalChargesList",
        ]],
        ["Add New Charge", [
          ".additional-charges-form",
        ]],
      ],
    },
  ];

  // The Guest Adjustment form-group elements have no stable IDs on their
  // wrapper. Resolve by their child input IDs instead of nth-child (which
  // depends on the surrounding source markup).
  modalSpecs[0].tabs[0][1] = [
    ".guest-adjustment-summary-grid",
    '#actualGuestCountInput',
    '#extraGuestRateInput',
  ];

  function getSectionNode(box, selector) {
    const match = box.querySelector(selector);
    if (!match) return null;
    // For input controls, move their enclosing form group as one unit
    // so the label and help text remain accessible and visually intact.
    if (match.matches("input, select, textarea")) {
      return match.closest(".guest-adjustment-form-group, .entrance-adjustment-form-group") ||
        match;
    }
    return match;
  }

  function enhanceModal(spec) {
    const overlay = document.getElementById(spec.id);
    const box = overlay?.firstElementChild;
    if (!box || box.classList.contains("fd-tabbed-modal-box")) return;

    const header = box.querySelector(spec.header);
    const actions = box.querySelector(spec.footer);
    if (!header || !actions) return;

    // Validate every required section before moving anything. A missing
    // selector leaves the original scrollable UI fully functional.
    const groups = spec.tabs.map(([name, selectors]) => ({
      name,
      nodes: selectors.map(sel => getSectionNode(box, sel)),
    }));
    if (groups.some(group => group.nodes.some(node => !node))) {
      console.warn("Front Desk tabs: missing section; keeping original modal", spec.id);
      return;
    }
    const allNodes = groups.flatMap(group => group.nodes);
    if (new Set(allNodes).size !== allNodes.length) {
      console.warn("Front Desk tabs: duplicated section; keeping original modal", spec.id);
      return;
    }

    const nav = document.createElement("div");
    nav.className = "fd-tab-nav";
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", "Operation sections");

    const body = document.createElement("div");
    body.className = "fd-tab-body";

    const footer = document.createElement("div");
    footer.className = "fd-tab-footer";
    const tabButtons = [];
    const panels = [];

    groups.forEach(({ name, nodes }, index) => {
      const button = document.createElement("button");
      const panel = document.createElement("section");
      const prefix = spec.id + "-section-" + index;
      button.type = "button";
      button.className = "fd-tab-trigger";
      button.id = prefix + "-tab";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", prefix);
      button.textContent = name;

      panel.id = prefix;
      panel.className = "fd-tab-panel";
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", button.id);
      panel.hidden = index !== 0;
      nodes.forEach(node => panel.appendChild(node));

      nav.appendChild(button);
      body.appendChild(panel);
      tabButtons.push(button);
      panels.push(panel);
    });

    // Action buttons remain in a non-scrolling footer at every step.
    // Existing listeners survive because the actual DOM nodes are MOVED,
    // not cloned or recreated.
    footer.appendChild(actions);
    box.appendChild(nav);
    box.appendChild(body);
    box.appendChild(footer);
    box.classList.add("fd-tabbed-modal-box");

    function activate(index, focusTab = false) {
      panels.forEach((panel, i) => {
        const selected = i === index;
        panel.hidden = !selected;
        panel.classList.toggle("is-active", selected);
        tabButtons[i].classList.toggle("is-active", selected);
        tabButtons[i].setAttribute("aria-selected", String(selected));
        tabButtons[i].tabIndex = selected ? 0 : -1;
        if (selected) panel.scrollTop = 0;
      });
      if (focusTab) tabButtons[index].focus();
    }

    tabButtons.forEach((button, index) => {
      button.addEventListener("click", () => activate(index));
      button.addEventListener("keydown", (event) => {
        const last = tabButtons.length - 1;
        let next = index;
        if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
        else if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = last;
        else return;
        event.preventDefault();
        activate(next, true);
      });
    });

    activate(0);
    let lastOpen = overlay.classList.contains("show");
    // If a different reservation is opened later, always start from
    // the first section with fresh fields. Do NOT reset on ordinary tab
    // changes or while async summaries are updated inside the overlay.
    const observer = new MutationObserver(() => {
      const open = overlay.classList.contains("show");
      if (open && !lastOpen) activate(0);
      lastOpen = open;
    });
    observer.observe(overlay, { attributes: true, attributeFilter: ["class"] });
  }

  function init() {
    modalSpecs.forEach(enhanceModal);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
