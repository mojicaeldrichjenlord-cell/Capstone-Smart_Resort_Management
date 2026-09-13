/* ============================================================
   STEP 3F-H: FRONT DESK — FINAL CHECKOUT VALIDATION
   File: frontend/frontdeskJS/frontdeskCheckout.js

   Backend:
   GET /api/admin/bookings/:id/checkout-summary
   PUT /api/admin/bookings/:id/checkout

   Scope:
   - Show backend-recalculated final checkout requirements.
   - Block checkout while any required balance/verification remains.
   - Complete reservation only when backend says checkout is allowed.
   - Do not send any payment amount from the browser.
============================================================ */

(() => {
  let activeReservationId = null;
  let activeReservationCode = "";
  let currentSummary = null;
  let isLoading = false;
  let isCompleting = false;

  function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function formatPeso(value) {
    return toNumber(value, 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function titleCase(value) {
    return String(value || "-")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function notify(message, type = "success") {
    if (typeof showMessage === "function") {
      showMessage(message, type);
      return;
    }

    alert(message);
  }

  async function readJsonSafely(response) {
    try {
      return await response.json();
    } catch {
      return {
        message: "The server returned an invalid response.",
      };
    }
  }

  function getCardReservationId(card) {
    const text = card?.querySelector(".reservation-id")?.textContent || "";
    const match = text.match(/#\s*(\d+)/);
    const id = Number(match?.[1]);

    return Number.isInteger(id) && id > 0 ? id : null;
  }

  function getCardReservationCode(card) {
    return String(
      card?.querySelector(".reservation-code")?.textContent || "",
    ).trim();
  }

  function injectButtons() {
    document
      .querySelectorAll(".guest-record-card.state-inside")
      .forEach((card) => {
        const actions = card.querySelector(".guest-actions");

        if (!actions || actions.querySelector(".final-checkout-action-btn")) {
          return;
        }

        const reservationId = getCardReservationId(card);

        if (!reservationId) {
          return;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "final-checkout-action-btn";
        button.dataset.reservationId = String(reservationId);
        button.dataset.reservationCode = getCardReservationCode(card);
        button.textContent = "Final Checkout";

        const disabledBadge = actions.querySelector(".guest-action-disabled");

        if (disabledBadge) {
          actions.insertBefore(button, disabledBadge);
        } else {
          actions.appendChild(button);
        }
      });
  }

  function ensureModal() {
    if (document.getElementById("finalCheckoutModal")) {
      return;
    }

    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div class="final-checkout-modal" id="finalCheckoutModal">
        <div class="final-checkout-modal-box">
          <div class="final-checkout-header">
            <div>
              <p class="final-checkout-eyebrow">FRONT DESK OPERATION</p>
              <h2>Final Checkout Validation</h2>
              <p id="finalCheckoutReservationText">
                Review all final requirements before completing checkout.
              </p>
            </div>

            <button
              type="button"
              class="final-checkout-close-btn"
              id="closeFinalCheckoutBtn"
              aria-label="Close Final Checkout modal"
            >×</button>
          </div>

          <div class="final-checkout-summary-grid">
            <div class="final-checkout-summary-item">
              <span>Accommodation Balance</span>
              <strong id="checkoutAccommodationRemainingText">₱0.00</strong>
            </div>

            <div class="final-checkout-summary-item">
              <span>Entrance Fee Balance</span>
              <strong id="checkoutEntranceRemainingText">₱0.00</strong>
            </div>

            <div class="final-checkout-summary-item">
              <span>Unpaid Booking Charges</span>
              <strong id="checkoutBookingChargesRemainingText">₱0.00</strong>
            </div>

            <div class="final-checkout-summary-item total">
              <span>Total Outstanding</span>
              <strong id="checkoutTotalOutstandingText">₱0.00</strong>
            </div>
          </div>

          <div class="final-checkout-status-grid">
            <div>
              <span>Reservation Status</span>
              <strong id="checkoutReservationStatusText">-</strong>
            </div>

            <div>
              <span>Accommodation Payment</span>
              <strong id="checkoutPaymentStatusText">-</strong>
            </div>

            <div>
              <span>Guest Count Verified</span>
              <strong id="checkoutGuestVerifiedText">-</strong>
            </div>

            <div>
              <span>Extra Bed Reconciled</span>
              <strong id="checkoutExtraBedStatusText">-</strong>
            </div>
          </div>

          <div class="final-checkout-blockers" id="finalCheckoutBlockers">
            Loading final checkout requirements...
          </div>

          <div class="final-checkout-policy-note">
            Checkout does <strong>not</strong> auto-pay anything. The backend
            recalculates accommodation, entrance, Extra Bed, and all unpaid
            booking charges before allowing completion.
          </div>

          <div class="final-checkout-warning">
            Completing checkout marks the reservation as
            <strong>Completed</strong> and clears the guest from
            <strong>Already Inside</strong>. Existing payment and check-in
            history is preserved.
          </div>

          <div class="final-checkout-actions">
            <button
              type="button"
              class="final-checkout-complete-btn"
              id="completeFinalCheckoutBtn"
              disabled
            >
              Loading Validation...
            </button>

            <button
              type="button"
              class="final-checkout-cancel-btn"
              id="cancelFinalCheckoutBtn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      `,
    );
  }

  function getModal() {
    return document.getElementById("finalCheckoutModal");
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value);
  }

  function resetModal() {
    currentSummary = null;

    setText("checkoutAccommodationRemainingText", "₱0.00");
    setText("checkoutEntranceRemainingText", "₱0.00");
    setText("checkoutBookingChargesRemainingText", "₱0.00");
    setText("checkoutTotalOutstandingText", "₱0.00");
    setText("checkoutReservationStatusText", "-");
    setText("checkoutPaymentStatusText", "-");
    setText("checkoutGuestVerifiedText", "-");
    setText("checkoutExtraBedStatusText", "-");

    const blockers = document.getElementById("finalCheckoutBlockers");
    if (blockers) {
      blockers.className = "final-checkout-blockers";
      blockers.textContent = "Loading final checkout requirements...";
    }

    const button = document.getElementById("completeFinalCheckoutBtn");
    if (button) {
      button.disabled = true;
      button.textContent = "Loading Validation...";
    }
  }

  function renderBlockers(summary) {
    const box = document.getElementById("finalCheckoutBlockers");
    if (!box) return;

    const blockers = Array.isArray(summary.blockers) ? summary.blockers : [];

    if (summary.already_completed) {
      box.className = "final-checkout-blockers ready";
      box.innerHTML = `
        <strong>Reservation already completed.</strong>
        <span>No duplicate checkout will be recorded.</span>
      `;
      return;
    }

    if (!blockers.length) {
      box.className = "final-checkout-blockers ready";
      box.innerHTML = `
        <strong>Ready for checkout.</strong>
        <span>All required balances and verification checks are settled.</span>
      `;
      return;
    }

    box.className = "final-checkout-blockers blocked";
    box.innerHTML = `
      <strong>${blockers.length} checkout requirement${
        blockers.length === 1 ? "" : "s"
      } still need attention:</strong>

      <div class="final-checkout-blocker-list">
        ${blockers
          .map((blocker) => {
            const amount = Math.max(toNumber(blocker.amount), 0);

            return `
              <div class="final-checkout-blocker-item">
                <div>
                  <span>${String(blocker.label || "Requirement")}</span>
                  <small>${String(blocker.message || "Needs review.")}</small>
                </div>

                ${
                  amount > 0.005
                    ? `<strong>₱${formatPeso(amount)}</strong>`
                    : `<strong>Review</strong>`
                }
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderSummary(summary) {
    currentSummary = summary;

    const accommodation = summary.accommodation || {};
    const entrance = summary.entrance || {};
    const bookingCharges = summary.booking_charges || {};
    const extraBed = summary.extra_bed || {};

    setText(
      "checkoutAccommodationRemainingText",
      `₱${formatPeso(accommodation.accommodation_remaining)}`,
    );
    setText(
      "checkoutEntranceRemainingText",
      `₱${formatPeso(entrance.entrance_fee_remaining)}`,
    );
    setText(
      "checkoutBookingChargesRemainingText",
      `₱${formatPeso(bookingCharges.unpaid_booking_charges)}`,
    );
    setText(
      "checkoutTotalOutstandingText",
      `₱${formatPeso(summary.outstanding_balance)}`,
    );
    setText(
      "checkoutReservationStatusText",
      titleCase(summary.reservation_status),
    );
    setText(
      "checkoutPaymentStatusText",
      titleCase(summary.payment_status),
    );
    setText(
      "checkoutGuestVerifiedText",
      entrance.has_verified_actual_guest_count ? "Yes" : "No",
    );
    setText(
      "checkoutExtraBedStatusText",
      extraBed.settled ? "Settled" : "Needs Review",
    );

    renderBlockers(summary);

    const button = document.getElementById("completeFinalCheckoutBtn");
    if (!button) return;

    if (summary.already_completed) {
      button.disabled = true;
      button.textContent = "Already Completed";
      return;
    }

    if (summary.checkout_allowed) {
      button.disabled = false;
      button.textContent = "Complete Checkout";
    } else {
      button.disabled = true;
      button.textContent = "Checkout Blocked";
    }
  }

  async function loadSummary() {
    if (!activeReservationId || isLoading) {
      return;
    }

    isLoading = true;

    try {
      const response = await fetch(
        `${API_BASE}/admin/bookings/${activeReservationId}/checkout-summary`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load checkout validation.");
      }

      renderSummary(data);
    } catch (error) {
      console.error("loadFinalCheckoutSummary error:", error);

      const blockers = document.getElementById("finalCheckoutBlockers");
      if (blockers) {
        blockers.className = "final-checkout-blockers blocked";
        blockers.textContent =
          error.message || "Failed to load checkout validation.";
      }

      notify(error.message || "Failed to load checkout validation.", "error");
    } finally {
      isLoading = false;
    }
  }

  async function openModal(reservationId, reservationCode) {
    ensureModal();

    activeReservationId = Number(reservationId);
    activeReservationCode = String(reservationCode || "").trim();

    resetModal();

    setText(
      "finalCheckoutReservationText",
      `Reservation ${activeReservationCode || `#${activeReservationId}`}`,
    );

    getModal()?.classList.add("show");
    document.body.classList.add("final-checkout-modal-open");

    await loadSummary();
  }

  function closeModal() {
    activeReservationId = null;
    activeReservationCode = "";
    currentSummary = null;

    getModal()?.classList.remove("show");
    document.body.classList.remove("final-checkout-modal-open");
  }

  async function completeCheckout() {
    if (
      !activeReservationId ||
      !currentSummary ||
      !currentSummary.checkout_allowed ||
      currentSummary.already_completed ||
      isCompleting
    ) {
      return;
    }

    const confirmed = confirm(
      `Complete checkout for reservation ${
        activeReservationCode || `#${activeReservationId}`
      }?\n\n` +
        "This will mark the reservation Completed and remove the guest from Already Inside. No payment will be collected by this action.",
    );

    if (!confirmed) {
      return;
    }

    const button = document.getElementById("completeFinalCheckoutBtn");
    isCompleting = true;

    try {
      if (button) {
        button.disabled = true;
        button.textContent = "Completing Checkout...";
      }

      const response = await fetch(
        `${API_BASE}/admin/bookings/${activeReservationId}/checkout`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const data = await readJsonSafely(response);

      if (!response.ok) {
        renderSummary(data);
        throw new Error(data.message || "Checkout is still blocked.");
      }

      notify(
        data.message || "Checkout completed successfully.",
        "success",
      );

      closeModal();

      if (typeof loadGuestBookings === "function") {
        await loadGuestBookings();

        const filter = document.getElementById("arrivalFilter");
        if (filter) {
          filter.value = "inside";

          if (typeof applyGuestFilters === "function") {
            applyGuestFilters();
          }
        }
      }
    } catch (error) {
      console.error("completeFinalCheckout error:", error);
      notify(error.message || "Failed to complete checkout.", "error");

      if (activeReservationId) {
        await loadSummary();
      }
    } finally {
      isCompleting = false;
    }
  }

  function bindEvents() {
    ensureModal();

    document
      .getElementById("closeFinalCheckoutBtn")
      ?.addEventListener("click", closeModal);

    document
      .getElementById("cancelFinalCheckoutBtn")
      ?.addEventListener("click", closeModal);

    document
      .getElementById("completeFinalCheckoutBtn")
      ?.addEventListener("click", completeCheckout);

    getModal()?.addEventListener("click", (event) => {
      if (event.target === getModal()) {
        closeModal();
      }
    });

    document.addEventListener("click", (event) => {
      const button = event.target.closest(".final-checkout-action-btn");

      if (!button) {
        return;
      }

      openModal(
        Number(button.dataset.reservationId),
        button.dataset.reservationCode,
      );
    });

    const guestRecords = document.getElementById("guestRecords");

    if (guestRecords) {
      new MutationObserver(injectButtons).observe(guestRecords, {
        childList: true,
        subtree: true,
      });
    }

    injectButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindEvents);
  } else {
    bindEvents();
  }
})();
