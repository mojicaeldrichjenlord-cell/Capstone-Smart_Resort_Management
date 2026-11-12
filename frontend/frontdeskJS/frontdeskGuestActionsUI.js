// ============================================================
// FRONT DESK GUEST ACTIONS UI
// File: frontend/frontdeskJS/frontdeskGuestActionsUI.js
//
// UI-only progressive disclosure layer.
// It does NOT call APIs and does NOT change Front Desk business logic.
//
// Purpose:
// - Keep frequent actions visible:
//     Guest Adjustment
//     Entrance Adjustment
//     Final Checkout
// - Move lower-frequency operations under "More Actions":
//     Add Accommodation
//     Extend Stay
//     Accommodation Balance
//     Extra Bed
//     Additional Charges
//     Collect Unpaid
// - Hide the redundant "Already Inside" action-status because the
//   card already shows "Inside Resort" and the checked-in message.
//
// Existing onclick handlers and button elements are preserved.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const guestRecords =
    document.getElementById("guestRecords");

  if (!guestRecords) {
    return;
  }

  let refreshQueued = false;

  const queueCompactActionRefresh = () => {
    if (refreshQueued) {
      return;
    }

    refreshQueued = true;

    window.requestAnimationFrame(() => {
      refreshQueued = false;
      compactAllGuestActionRows();
    });
  };

  const observer =
    new MutationObserver(
      queueCompactActionRefresh,
    );

  observer.observe(
    guestRecords,
    {
      childList: true,
      subtree: true,
    },
  );

  document.addEventListener(
    "click",
    (event) => {
      const clickedMoreActions =
        event.target.closest(
          ".guest-more-actions",
        );

      document
        .querySelectorAll(
          ".guest-more-actions[open]",
        )
        .forEach((details) => {
          if (
            details !==
            clickedMoreActions
          ) {
            details.open = false;
          }
        });

      const menuAction =
        event.target.closest(
          ".guest-more-actions-menu button, .guest-more-actions-menu a",
        );

      if (menuAction) {
        const details =
          menuAction.closest(
            ".guest-more-actions",
          );

        if (details) {
          details.open = false;
        }
      }
    },
  );

  queueCompactActionRefresh();
});

function compactAllGuestActionRows() {
  document
    .querySelectorAll(
      "#guestRecords .guest-actions",
    )
    .forEach(
      compactGuestActionRow,
    );
}

function compactGuestActionRow(
  actionRow,
) {
  if (!actionRow) {
    return;
  }

  const insidePrimarySelectors = [
    ".guest-adjustment-action-btn",
    ".entrance-adjustment-action-btn",
    ".final-checkout-action-btn",
  ];

  const moreActionSelectors = [
    ".stay-add-action-btn",
    ".stay-extend-action-btn",
    ".accommodation-balance-action-btn",
    ".extra-bed-action-btn",
    ".additional-charges-action-btn",
    ".collect-unpaid-action-btn",
  ];

  const isInsideActionRow =
    insidePrimarySelectors.some(
      (selector) =>
        actionRow.querySelector(
          selector,
        ),
    ) ||
    moreActionSelectors.some(
      (selector) =>
        actionRow.querySelector(
          selector,
        ),
    );

  if (!isInsideActionRow) {
    return;
  }

  actionRow.classList.add(
    "compact-actions-ready",
  );

  // ----------------------------------------------------------
  // Hide redundant "Already Inside" status/action.
  // Other disabled states such as "Not Yet Check-in Date"
  // and "Check-in Date Passed" are left untouched.
  // ----------------------------------------------------------
  actionRow
    .querySelectorAll(
      ".guest-action-disabled",
    )
    .forEach((statusElement) => {
      const text =
        String(
          statusElement.textContent ||
            "",
        )
          .trim()
          .toLowerCase();

      if (
        text ===
        "already inside"
      ) {
        statusElement.classList.add(
          "guest-inside-redundant-status",
        );
      }
    });

  let moreDetails =
    actionRow.querySelector(
      ":scope > .guest-more-actions",
    );

  const hasSecondaryActions =
    moreActionSelectors.some(
      (selector) => {
        const candidate =
          actionRow.querySelector(
            `:scope > ${selector}`,
          );

        return Boolean(candidate);
      },
    );

  if (
    !moreDetails &&
    hasSecondaryActions
  ) {
    moreDetails =
      document.createElement(
        "details",
      );

    moreDetails.className =
      "guest-more-actions";

    const summary =
      document.createElement(
        "summary",
      );

    summary.textContent =
      "More Actions";

    const menu =
      document.createElement(
        "div",
      );

    menu.className =
      "guest-more-actions-menu";

    moreDetails.append(
      summary,
      menu,
    );

    const finalCheckout =
      actionRow.querySelector(
        ":scope > .final-checkout-action-btn",
      );

    if (finalCheckout) {
      actionRow.insertBefore(
        moreDetails,
        finalCheckout,
      );
    } else {
      actionRow.appendChild(
        moreDetails,
      );
    }
  }

  if (!moreDetails) {
    return;
  }

  const menu =
    moreDetails.querySelector(
      ".guest-more-actions-menu",
    );

  if (!menu) {
    return;
  }

  // ----------------------------------------------------------
  // Move the actual existing buttons into the menu.
  // Their onclick handlers and IDs/classes remain intact.
  // This keeps all working functionality unchanged.
  // ----------------------------------------------------------
  moreActionSelectors.forEach(
    (selector) => {
      const action =
        actionRow.querySelector(
          `:scope > ${selector}`,
        );

      if (action) {
        menu.appendChild(
          action,
        );
      }
    },
  );

  // Final Checkout should stay last among the VISIBLE actions.
  //
  // Important:
  // Do not blindly appendChild() on every MutationObserver refresh.
  // Moving the same button repeatedly creates another DOM mutation,
  // which re-triggers the observer and can cause an endless refresh loop.
  const finalCheckout =
    actionRow.querySelector(
      ":scope > .final-checkout-action-btn",
    );

  const redundantInsideStatus =
    actionRow.querySelector(
      ":scope > .guest-inside-redundant-status",
    );

  if (finalCheckout) {
    if (redundantInsideStatus) {
      if (
        finalCheckout.nextElementSibling !==
        redundantInsideStatus
      ) {
        actionRow.insertBefore(
          finalCheckout,
          redundantInsideStatus,
        );
      }
    } else if (
      actionRow.lastElementChild !==
      finalCheckout
    ) {
      actionRow.appendChild(
        finalCheckout,
      );
    }
  }

  // Remove the More Actions control if no secondary action exists.
  if (
    !menu.querySelector(
      "button, a",
    )
  ) {
    moreDetails.remove();
  }
}
