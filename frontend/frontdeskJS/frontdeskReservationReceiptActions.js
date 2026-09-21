// ============================================================
// FRONT DESK COMPLETED RESERVATION RECEIPT ACTIONS
// File: frontend/frontdeskJS/frontdeskReservationReceiptActions.js
//
// Purpose:
// - Add "View Final Receipt" only to completed reservation cards.
// - Keep frontdeskReservations.js read-only and untouched.
// - Reuse the dedicated Front Desk final thermal receipt page.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("reservationRecords");

  if (!container) {
    return;
  }

  const refreshReceiptActions = () => {
    container
      .querySelectorAll(".frontdesk-reservation-card")
      .forEach(addCompletedReceiptAction);
  };

  const observer = new MutationObserver(() => {
    refreshReceiptActions();
  });

  observer.observe(container, {
    childList: true,
    subtree: true,
  });

  refreshReceiptActions();
});

function addCompletedReceiptAction(card) {
  if (!card) {
    return;
  }

  const completedBadge = card.querySelector(".status-completed");

  if (!completedBadge) {
    return;
  }

  if (card.querySelector(".view-final-receipt-btn")) {
    return;
  }

  const reservationIdText =
    card.querySelector(".reservation-id")?.textContent || "";

  const idMatch = reservationIdText.match(/#\s*(\d+)/);

  if (!idMatch) {
    return;
  }

  const reservationId = Number(idMatch[1]);

  if (!Number.isInteger(reservationId) || reservationId <= 0) {
    return;
  }

  const actions = document.createElement("div");
  actions.className = "reservation-card-actions";

  const receiptLink = document.createElement("a");
  receiptLink.className = "view-final-receipt-btn";
  receiptLink.href =
    `frontdesk-booking-receipt.html?id=${encodeURIComponent(reservationId)}`;
  receiptLink.target = "_blank";
  receiptLink.rel = "noopener";
  receiptLink.textContent = "View Final Receipt";

  actions.appendChild(receiptLink);
  card.appendChild(actions);
}
