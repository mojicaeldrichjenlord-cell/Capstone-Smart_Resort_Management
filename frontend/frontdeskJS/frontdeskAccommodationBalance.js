/* ============================================================
   STEP 3F-G: FRONT DESK — ACCOMMODATION BALANCE COLLECTION
   File: frontend/frontdeskJS/frontdeskAccommodationBalance.js

   Backend:
   GET /api/admin/bookings/:id/accommodation-balance
   PUT /api/admin/bookings/:id/accommodation-balance/collect

   Scope:
   - Accommodation balance only
   - Add Accommodation / Extend Stay unpaid amounts are collected here

   Not included:
   - Entrance Fee
   - Extra Guest / Extra Bed / Additional Charges
============================================================ */

(() => {
  let activeReservationId = null;
  let activeReservationCode = "";
  let currentSummary = null;
  let isLoading = false;
  let isCollecting = false;

  function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function formatPeso(value) {
    return toNumber(value).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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

  function ensureModal() {
    if (document.getElementById("accommodationBalanceModal")) {
      return;
    }

    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div class="accommodation-balance-modal" id="accommodationBalanceModal">
        <div class="accommodation-balance-modal-box">
          <div class="accommodation-balance-header">
            <div>
              <p class="accommodation-balance-eyebrow">FRONT DESK OPERATION</p>
              <h2>Accommodation Balance</h2>
              <p id="accommodationBalanceReservationText">
                Review the guest's current unpaid accommodation balance.
              </p>
            </div>

            <button
              type="button"
              class="accommodation-balance-close-btn"
              id="closeAccommodationBalanceBtn"
              aria-label="Close Accommodation Balance modal"
            >×</button>
          </div>

          <div class="accommodation-balance-summary-grid">
            <div class="accommodation-balance-summary-item">
              <span>Accommodation Total</span>
              <strong id="accommodationBalanceTotalText">₱0.00</strong>
            </div>

            <div class="accommodation-balance-summary-item paid">
              <span>Previously Paid</span>
              <strong id="accommodationBalancePaidText">₱0.00</strong>
            </div>

            <div class="accommodation-balance-summary-item due">
              <span>Amount to Collect Now</span>
              <strong id="accommodationBalanceDueText">₱0.00</strong>
            </div>
          </div>

          <div class="accommodation-balance-detail-grid">
            <div>
              <span>Required Downpayment</span>
              <strong id="accommodationBalanceDownpaymentText">₱0.00</strong>
            </div>

            <div>
              <span>Payment Status</span>
              <strong id="accommodationBalanceStatusText">-</strong>
            </div>
          </div>

          <div
            class="accommodation-balance-status-note"
            id="accommodationBalanceStatusNote"
          >
            Loading current accommodation balance...
          </div>

          <div class="accommodation-balance-policy-note">
            This modal collects <strong>accommodation balance only</strong>.
            Add Accommodation and Extend Stay amounts appear here after they are
            saved as unpaid. Entrance Fee and onsite booking charges are handled
            by their own collection workflows.
          </div>

          <div class="accommodation-balance-warning" id="accommodationBalanceWarning">
            The backend recalculates the current balance from the database before
            saving. The browser does not send the payment amount.
          </div>

          <div class="accommodation-balance-actions">
            <button
              type="button"
              class="accommodation-balance-collect-btn"
              id="collectAccommodationBalanceBtn"
              disabled
            >
              Loading Balance...
            </button>

            <button
              type="button"
              class="accommodation-balance-cancel-btn"
              id="cancelAccommodationBalanceBtn"
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
    return document.getElementById("accommodationBalanceModal");
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value);
  }

  function injectButtons() {
    document
      .querySelectorAll(".guest-record-card.state-inside")
      .forEach((card) => {
        const actions = card.querySelector(".guest-actions");

        if (
          !actions ||
          actions.querySelector(".accommodation-balance-action-btn")
        ) {
          return;
        }

        const reservationId = getCardReservationId(card);

        if (!reservationId) {
          return;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "accommodation-balance-action-btn";
        button.dataset.reservationId = String(reservationId);
        button.dataset.reservationCode = getCardReservationCode(card);
        button.textContent = "Accommodation Balance";

        const disabledBadge = actions.querySelector(".guest-action-disabled");

        if (disabledBadge) {
          actions.insertBefore(button, disabledBadge);
        } else {
          actions.appendChild(button);
        }
      });
  }

  function resetModal() {
    currentSummary = null;

    setText("accommodationBalanceTotalText", "₱0.00");
    setText("accommodationBalancePaidText", "₱0.00");
    setText("accommodationBalanceDueText", "₱0.00");
    setText("accommodationBalanceDownpaymentText", "₱0.00");
    setText("accommodationBalanceStatusText", "-");

    const statusNote = document.getElementById(
      "accommodationBalanceStatusNote",
    );

    if (statusNote) {
      statusNote.className = "accommodation-balance-status-note";
      statusNote.textContent = "Loading current accommodation balance...";
    }

    const collectButton = document.getElementById(
      "collectAccommodationBalanceBtn",
    );

    if (collectButton) {
      collectButton.disabled = true;
      collectButton.textContent = "Loading Balance...";
    }
  }

  async function openModal(reservationId, reservationCode) {
    ensureModal();

    activeReservationId = Number(reservationId);
    activeReservationCode = String(reservationCode || "").trim();

    resetModal();

    setText(
      "accommodationBalanceReservationText",
      `Reservation ${activeReservationCode || `#${activeReservationId}`}`,
    );

    getModal()?.classList.add("show");
    document.body.classList.add("accommodation-balance-modal-open");

    await loadSummary();
  }

  function closeModal() {
    activeReservationId = null;
    activeReservationCode = "";
    currentSummary = null;

    getModal()?.classList.remove("show");
    document.body.classList.remove("accommodation-balance-modal-open");
  }

  function renderSummary(summary) {
    currentSummary = summary;

    const due = Math.max(toNumber(summary.remaining_balance), 0);
    const settled = Boolean(summary.settled) || due <= 0.005;

    setText(
      "accommodationBalanceTotalText",
      `₱${formatPeso(summary.accommodation_total)}`,
    );
    setText(
      "accommodationBalancePaidText",
      `₱${formatPeso(summary.paid_amount)}`,
    );
    setText(
      "accommodationBalanceDueText",
      `₱${formatPeso(due)}`,
    );
    setText(
      "accommodationBalanceDownpaymentText",
      `₱${formatPeso(summary.required_downpayment)}`,
    );
    setText(
      "accommodationBalanceStatusText",
      String(summary.payment_status || "-")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    );

    const statusNote = document.getElementById(
      "accommodationBalanceStatusNote",
    );
    const collectButton = document.getElementById(
      "collectAccommodationBalanceBtn",
    );

    if (statusNote) {
      statusNote.className = "accommodation-balance-status-note";

      if (toNumber(summary.overpaid_amount) > 0.005) {
        statusNote.classList.add("error");
        statusNote.textContent =
          `Possible accommodation overpayment: ₱${formatPeso(summary.overpaid_amount)}. ` +
          "Do not collect more; review this reservation manually.";
      } else if (summary.balance_mismatch) {
        statusNote.classList.add("warning");
        statusNote.textContent =
          `Stored remaining balance differs from the recalculated balance. ` +
          `The backend will use ₱${formatPeso(due)} as the authoritative amount.`;
      } else if (settled) {
        statusNote.classList.add("settled");
        statusNote.textContent =
          "Accommodation balance is fully settled. Duplicate collection is disabled.";
      } else {
        statusNote.classList.add("due");
        statusNote.textContent =
          `Collect ₱${formatPeso(due)} only after Front Desk has actually received the full accommodation balance.`;
      }
    }

    if (collectButton) {
      if (settled || toNumber(summary.overpaid_amount) > 0.005) {
        collectButton.disabled = true;
        collectButton.textContent = settled
          ? "Accommodation Settled"
          : "Review Overpayment";
      } else {
        collectButton.disabled = false;
        collectButton.textContent = `Collect ₱${formatPeso(due)}`;
      }
    }
  }

  async function loadSummary() {
    if (!activeReservationId || isLoading) {
      return;
    }

    isLoading = true;

    try {
      const response = await fetch(
        `${API_BASE}/admin/bookings/${activeReservationId}/accommodation-balance`,
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
        throw new Error(data.message || "Failed to load accommodation balance.");
      }

      renderSummary(data);
    } catch (error) {
      console.error("loadAccommodationBalanceSummary error:", error);

      const statusNote = document.getElementById(
        "accommodationBalanceStatusNote",
      );

      if (statusNote) {
        statusNote.className = "accommodation-balance-status-note error";
        statusNote.textContent =
          error.message || "Failed to load accommodation balance.";
      }

      notify(
        error.message || "Failed to load accommodation balance.",
        "error",
      );
    } finally {
      isLoading = false;
    }
  }

  async function collectBalance() {
    if (!activeReservationId || !currentSummary || isCollecting) {
      return;
    }

    const due = Math.max(toNumber(currentSummary.remaining_balance), 0);

    if (due <= 0.005) {
      notify("Accommodation balance is already settled.", "success");
      return;
    }

    const confirmed = confirm(
      `Confirm that Front Desk has received the FULL accommodation balance of ₱${formatPeso(due)}?\n\n` +
        "This will update the reservation's paid amount and set the accommodation remaining balance to ₱0.00.",
    );

    if (!confirmed) {
      return;
    }

    const collectButton = document.getElementById(
      "collectAccommodationBalanceBtn",
    );
    const originalText = collectButton?.textContent || "Collect Balance";

    isCollecting = true;

    try {
      if (collectButton) {
        collectButton.disabled = true;
        collectButton.textContent = "Collecting...";
      }

      const response = await fetch(
        `${API_BASE}/admin/bookings/${activeReservationId}/accommodation-balance/collect`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to collect accommodation balance.");
      }

      renderSummary({
        ...currentSummary,
        ...data,
        paid_amount: data.paid_amount,
        remaining_balance: data.remaining_balance,
        payment_status: data.payment_status,
        settled: true,
        balance_mismatch: false,
        overpaid_amount: 0,
      });

      notify(
        data.message || "Accommodation balance collected successfully.",
        "success",
      );

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
      console.error("collectAccommodationBalance error:", error);

      notify(
        error.message || "Failed to collect accommodation balance.",
        "error",
      );

      await loadSummary();
    } finally {
      isCollecting = false;

      if (
        collectButton &&
        !collectButton.disabled &&
        collectButton.textContent === "Collecting..."
      ) {
        collectButton.textContent = originalText;
      }
    }
  }

  function bindEvents() {
    ensureModal();

    document
      .getElementById("closeAccommodationBalanceBtn")
      ?.addEventListener("click", closeModal);

    document
      .getElementById("cancelAccommodationBalanceBtn")
      ?.addEventListener("click", closeModal);

    document
      .getElementById("collectAccommodationBalanceBtn")
      ?.addEventListener("click", collectBalance);

    getModal()?.addEventListener("click", (event) => {
      if (event.target === getModal()) {
        closeModal();
      }
    });

    document.addEventListener("click", (event) => {
      const button = event.target.closest(".accommodation-balance-action-btn");

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
