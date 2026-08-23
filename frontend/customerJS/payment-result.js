// ============================================================
// PAYMONGO RETURN PAGE SCRIPT
// File: frontend/customerJS/payment-result.js
//
// IMPORTANT:
// - This script NEVER marks a payment as paid.
// - The future PayMongo webhook remains the source of truth.
// - These pages only show return/status information.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  renderPaymentReturnContext();
});

function renderPaymentReturnContext() {
  const page = document.body.dataset.paymentResult || "unknown";
  const params = new URLSearchParams(window.location.search);

  const storedContext = readStoredReturnContext();

  const reservationId =
    params.get("reservation_id") ||
    storedContext.reservation_id ||
    "-";

  const reservationCode =
    params.get("reservation_code") ||
    storedContext.reservation_code ||
    "-";

  const returnedStatus =
    String(params.get("status") || "").trim().toLowerCase();

  setText("resultReservationId", reservationId);
  setText("resultReservationCode", reservationCode);

  if (page === "success") {
    const statusText =
      returnedStatus === "paid"
        ? "Payment confirmed"
        : "Waiting for payment confirmation";

    setText("resultPaymentStatus", statusText);

    // Redirect return alone is not trusted as proof of payment.
    // The webhook will update My Bookings in the real integration.
    return;
  }

  if (page === "cancelled") {
    setText("resultPaymentStatus", "Checkout cancelled / not completed");
  }
}

function readStoredReturnContext() {
  try {
    return JSON.parse(
      sessionStorage.getItem("smartresort_paymongo_return_context") || "{}",
    );
  } catch (error) {
    return {};
  }
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value ?? "-";
  }
}
