// Shared logout confirmation for Customer, Admin, Front Desk, Manager,
// and Housekeeping. Existing role handlers retain session cleanup ownership.
(() => {
  "use strict";
  const LOGOUT_SELECTOR = "#logoutBtn, #mobileLogoutBtn, [data-logout-confirm]";
  let overlay = null;
  let pendingTrigger = null;
  let approvedTrigger = null;
  let previousFocus = null;

  function ensureDialog() {
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "logoutConfirmOverlay";
    overlay.className = "logout-confirm-overlay";
    overlay.hidden = true;
    overlay.innerHTML = [
      '<div class="logout-confirm-dialog" role="alertdialog" aria-modal="true"',
      ' aria-labelledby="logoutConfirmTitle" aria-describedby="logoutConfirmDescription">',
      '<div class="logout-confirm-icon" aria-hidden="true">↪</div>',
      '<h2 id="logoutConfirmTitle">Log out of your account?</h2>',
      '<p id="logoutConfirmDescription">Are you sure you want to log out? ',
      'You will need to sign in again to access your account.</p>',
      '<div class="logout-confirm-actions">',
      '<button type="button" class="logout-confirm-cancel">Cancel</button>',
      '<button type="button" class="logout-confirm-accept">Yes, Log Out</button>',
      '</div></div>'
    ].join("");
    document.body.appendChild(overlay);

    overlay.querySelector(".logout-confirm-cancel").addEventListener("click", closeDialog);
    overlay.querySelector(".logout-confirm-accept").addEventListener("click", () => {
      const trigger = pendingTrigger;
      closeDialog(false);
      if (!trigger || !trigger.isConnected) return;

      // Replay one approved click through the original role-specific handler.
      approvedTrigger = trigger;
      try {
        trigger.click();
      } finally {
        approvedTrigger = null;
      }
    });
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeDialog();
    });
    return overlay;
  }

  function openDialog(trigger) {
    const dialog = ensureDialog();
    pendingTrigger = trigger;
    previousFocus = document.activeElement;
    dialog.hidden = false;
    dialog.querySelector(".logout-confirm-cancel").focus();
  }

  function closeDialog(restoreFocus = true) {
    if (!overlay) return;
    overlay.hidden = true;
    pendingTrigger = null;
    if (restoreFocus && previousFocus?.isConnected) previousFocus.focus();
    previousFocus = null;
  }

  // Capture before page-specific logout listeners run.
  document.addEventListener("click", (event) => {
    const trigger = event.target?.closest?.(LOGOUT_SELECTOR);
    if (!trigger || !document.contains(trigger) || trigger === approvedTrigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!overlay || overlay.hidden) openDialog(trigger);
  }, true);

  // Accessible keyboard support: Escape cancels and Tab stays inside dialog.
  document.addEventListener("keydown", (event) => {
    if (!overlay || overlay.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog();
    } else if (event.key === "Tab") {
      const cancel = overlay.querySelector(".logout-confirm-cancel");
      const accept = overlay.querySelector(".logout-confirm-accept");
      if (event.shiftKey && document.activeElement === cancel) {
        event.preventDefault();
        accept.focus();
      } else if (!event.shiftKey && document.activeElement === accept) {
        event.preventDefault();
        cancel.focus();
      }
    }
  }, true);
})();
