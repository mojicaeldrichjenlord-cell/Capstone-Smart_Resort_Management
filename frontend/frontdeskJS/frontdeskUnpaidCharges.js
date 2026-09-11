/* ============================================================
   STEP 3F-E: FRONT DESK — COLLECT UNPAID CHARGES
   File: frontend/frontdeskJS/frontdeskUnpaidCharges.js

   Backend:
   GET /api/admin/bookings/:id/unpaid-charges
   PUT /api/admin/bookings/:id/unpaid-charges/collect

   Scope:
   - Extra Guest Charge
   - Extra Bed Charge
   - Manual Additional Charges
   - Other valid booking_charges rows

   Not included here:
   - Entrance Fee
   - Accommodation balance
============================================================ */

(() => {
  let activeReservationId = null;
  let activeReservationCode = "";
  let currentSummary = null;
  let isLoading = false;
  let isCollecting = false;

  function toNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function formatPeso(value) {
    return toNumber(value).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function readJsonSafely(response) {
    try {
      return await response.json();
    } catch {
      return { message: "The server returned an invalid response." };
    }
  }

  function notify(message, type = "success") {
    if (typeof showMessage === "function") {
      showMessage(message, type);
    } else {
      alert(message);
    }
  }

  function getCardReservationId(card) {
    const text =
      card?.querySelector(".reservation-id")?.textContent || "";
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
    if (document.getElementById("unpaidChargesModal")) {
      return;
    }

    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div class="unpaid-charges-modal" id="unpaidChargesModal">
        <div class="unpaid-charges-modal-box">
          <div class="unpaid-charges-header">
            <div>
              <p class="unpaid-charges-eyebrow">FRONT DESK OPERATION</p>
              <h2>Collect Unpaid Charges</h2>
              <p id="unpaidChargesReservationText">
                Review the current unpaid onsite booking charges.
              </p>
            </div>

            <button
              type="button"
              class="unpaid-charges-close-btn"
              id="closeUnpaidChargesBtn"
              aria-label="Close"
            >×</button>
          </div>

          <div class="unpaid-charges-summary-grid">
            <div class="unpaid-summary-item">
              <span>Total Booking Charges</span>
              <strong id="unpaidAllTotalText">₱0.00</strong>
            </div>

            <div class="unpaid-summary-item paid">
              <span>Previously Collected</span>
              <strong id="unpaidPaidTotalText">₱0.00</strong>
            </div>

            <div class="unpaid-summary-item due">
              <span>Amount to Collect Now</span>
              <strong id="unpaidDueTotalText">₱0.00</strong>
            </div>
          </div>

          <div id="unpaidChargesList" class="unpaid-charges-list">
            <div class="unpaid-charges-state">
              Loading unpaid charges...
            </div>
          </div>

          <div id="unpaidCategorySummary"></div>

          <div class="unpaid-charges-policy-note">
            This modal collects unpaid <strong>booking charges only</strong>:
            Extra Guest, Extra Bed, and Additional Charges.
            <strong>Entrance Fee is not included</strong> because it has its
            own Entrance Adjustment collection. Accommodation balance is also
            handled separately.
          </div>

          <div
            class="unpaid-charges-status-note"
            id="unpaidChargesStatusNote"
          >
            Loading current balance...
          </div>

          <div class="unpaid-charges-actions">
            <button
              type="button"
              class="unpaid-charges-collect-btn"
              id="collectAllUnpaidChargesBtn"
              disabled
            >
              Loading Balance...
            </button>

            <button
              type="button"
              class="unpaid-charges-cancel-btn"
              id="cancelUnpaidChargesBtn"
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
    return document.getElementById("unpaidChargesModal");
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  function injectButtons() {
    document
      .querySelectorAll(".guest-record-card.state-inside")
      .forEach((card) => {
        const actions = card.querySelector(".guest-actions");

        if (
          !actions ||
          actions.querySelector(".collect-unpaid-action-btn")
        ) {
          return;
        }

        const reservationId = getCardReservationId(card);

        if (!reservationId) {
          return;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "collect-unpaid-action-btn";
        button.dataset.reservationId = String(reservationId);
        button.dataset.reservationCode = getCardReservationCode(card);
        button.textContent = "Collect Unpaid";

        const disabledBadge =
          actions.querySelector(".guest-action-disabled");

        if (disabledBadge) {
          actions.insertBefore(button, disabledBadge);
        } else {
          actions.appendChild(button);
        }
      });
  }

  function openModal(reservationId, reservationCode) {
    activeReservationId = reservationId;
    activeReservationCode = reservationCode || "";
    currentSummary = null;

    setText(
      "unpaidChargesReservationText",
      activeReservationCode
        ? `Reservation ${activeReservationCode}`
        : `Reservation #${reservationId}`,
    );

    renderLoading();

    getModal()?.classList.add("show");
    document.body.classList.add("guest-modal-open");

    loadSummary();
  }

  function closeModal() {
    activeReservationId = null;
    activeReservationCode = "";
    currentSummary = null;
    isLoading = false;
    isCollecting = false;

    getModal()?.classList.remove("show");
    document.body.classList.remove("guest-modal-open");
  }

  function renderLoading() {
    setText("unpaidAllTotalText", "₱0.00");
    setText("unpaidPaidTotalText", "₱0.00");
    setText("unpaidDueTotalText", "₱0.00");

    const list = document.getElementById("unpaidChargesList");

    if (list) {
      list.innerHTML = `
        <div class="unpaid-charges-state">
          Loading unpaid charges...
        </div>
      `;
    }

    const category = document.getElementById("unpaidCategorySummary");
    if (category) category.innerHTML = "";

    const status = document.getElementById("unpaidChargesStatusNote");

    if (status) {
      status.className = "unpaid-charges-status-note";
      status.textContent = "Loading current balance...";
    }

    updateCollectButton();
  }

  function renderCategories(totals) {
    const wrapper = document.getElementById("unpaidCategorySummary");

    if (!wrapper) {
      return;
    }

    const rows = [
      ["Extra Guest", toNumber(totals?.extra_guest)],
      ["Extra Bed", toNumber(totals?.extra_bed)],
      ["Additional Charges", toNumber(totals?.additional)],
      ["Other", toNumber(totals?.other)],
    ].filter(([, amount]) => amount > 0);

    if (!rows.length) {
      wrapper.innerHTML = "";
      return;
    }

    wrapper.innerHTML = `
      <div class="unpaid-category-box">
        <h3>Unpaid Category Summary</h3>

        ${rows
          .map(
            ([label, amount]) => `
              <div class="unpaid-category-row">
                <span>${escapeHtml(label)}</span>
                <strong>₱${formatPeso(amount)}</strong>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }

  function renderSummary(data) {
    currentSummary = data;

    setText(
      "unpaidAllTotalText",
      `₱${formatPeso(data?.total_booking_charges)}`,
    );

    setText(
      "unpaidPaidTotalText",
      `₱${formatPeso(data?.paid_booking_charges)}`,
    );

    setText(
      "unpaidDueTotalText",
      `₱${formatPeso(data?.unpaid_booking_charges)}`,
    );

    renderCategories(data?.category_totals);

    const charges = Array.isArray(data?.unpaid_charges)
      ? data.unpaid_charges
      : [];

    const list = document.getElementById("unpaidChargesList");

    if (list) {
      if (!charges.length) {
        list.innerHTML = `
          <div class="unpaid-charges-state settled">
            No unpaid onsite booking charges remain.
          </div>
        `;
      } else {
        list.innerHTML = charges
          .map(
            (charge) => `
              <article class="unpaid-charge-row">
                <div>
                  <div class="unpaid-charge-title">
                    <strong>
                      ${escapeHtml(
                        charge.category_label ||
                          charge.charge_name ||
                          "Onsite Charge",
                      )}
                    </strong>
                    <span>Unpaid</span>
                  </div>

                  <p>${escapeHtml(charge.charge_note || "No note")}</p>
                  <small>${escapeHtml(charge.charge_name || "")}</small>
                </div>

                <strong class="unpaid-charge-amount">
                  ₱${formatPeso(charge.charge_amount)}
                </strong>
              </article>
            `,
          )
          .join("");
      }
    }

    const due = toNumber(data?.unpaid_booking_charges);
    const count = Number(data?.unpaid_charge_count || 0);
    const status = document.getElementById("unpaidChargesStatusNote");

    if (status) {
      if (due > 0 && count > 0) {
        status.className = "unpaid-charges-status-note due";
        status.innerHTML = `
          Collect <strong>₱${formatPeso(due)}</strong> only after
          Front Desk has actually received the full amount. The backend
          recalculates and locks the current unpaid rows before saving.
        `;
      } else {
        status.className = "unpaid-charges-status-note settled";
        status.textContent =
          "All current onsite booking charges are settled. Duplicate collection is disabled.";
      }
    }

    updateCollectButton();
  }

  async function loadSummary() {
    if (!activeReservationId || isLoading) {
      return;
    }

    try {
      isLoading = true;
      updateCollectButton();

      const response = await fetch(
        `${API_BASE}/admin/bookings/${activeReservationId}/unpaid-charges`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        },
      );

      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load unpaid charges.",
        );
      }

      renderSummary(data);
    } catch (error) {
      console.error("loadUnpaidChargesSummary error:", error);

      const list = document.getElementById("unpaidChargesList");
      if (list) {
        list.innerHTML = `
          <div class="unpaid-charges-state error">
            ${escapeHtml(error.message || "Failed to load unpaid charges.")}
          </div>
        `;
      }

      const status = document.getElementById("unpaidChargesStatusNote");
      if (status) {
        status.className = "unpaid-charges-status-note error";
        status.textContent =
          error.message || "Failed to load unpaid charges.";
      }
    } finally {
      isLoading = false;
      updateCollectButton();
    }
  }

  async function collectAllUnpaid() {
    if (
      !activeReservationId ||
      !currentSummary ||
      isLoading ||
      isCollecting
    ) {
      return;
    }

    const due = toNumber(currentSummary.unpaid_booking_charges);
    const count = Number(currentSummary.unpaid_charge_count || 0);

    if (due <= 0 || count <= 0) {
      notify("No unpaid onsite booking charges remain.", "success");
      return;
    }

    const confirmed = confirm(
      [
        "Confirm collection of all unpaid onsite booking charges?",
        "",
        `Reservation: ${
          activeReservationCode || `#${activeReservationId}`
        }`,
        `Charge rows: ${count}`,
        `Amount to collect: ₱${formatPeso(due)}`,
        "",
        "Entrance Fee and accommodation balance are NOT included.",
        "Click OK only after Front Desk has received the full amount.",
      ].join("\n"),
    );

    if (!confirmed) {
      return;
    }

    try {
      isCollecting = true;
      updateCollectButton();

      const response = await fetch(
        `${API_BASE}/admin/bookings/${activeReservationId}/unpaid-charges/collect`,
        {
          method: "PUT",
          headers: { Accept: "application/json" },
        },
      );

      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to collect unpaid charges.",
        );
      }

      notify(
        data.message || "Unpaid onsite charges collected.",
        "success",
      );

      await loadSummary();

      if (typeof loadGuestBookings === "function") {
        await loadGuestBookings();
      }
    } catch (error) {
      console.error("collectAllUnpaid error:", error);

      notify(
        error.message || "Failed to collect unpaid charges.",
        "error",
      );
    } finally {
      isCollecting = false;
      updateCollectButton();
    }
  }

  function updateCollectButton() {
    const button = document.getElementById(
      "collectAllUnpaidChargesBtn",
    );

    if (!button) {
      return;
    }

    const due = toNumber(currentSummary?.unpaid_booking_charges);
    const count = Number(currentSummary?.unpaid_charge_count || 0);

    button.disabled =
      isLoading ||
      isCollecting ||
      !activeReservationId ||
      !currentSummary ||
      due <= 0 ||
      count <= 0;

    if (isCollecting) {
      button.textContent = "Collecting...";
    } else if (isLoading || !currentSummary) {
      button.textContent = "Loading Balance...";
    } else if (due <= 0 || count <= 0) {
      button.textContent = "All Charges Settled";
    } else {
      button.textContent =
        `Collect ₱${formatPeso(due)} (${count} charge${
          count === 1 ? "" : "s"
        })`;
    }
  }

  function setup() {
    ensureModal();
    injectButtons();

    document.addEventListener("click", (event) => {
      const openButton = event.target.closest?.(
        ".collect-unpaid-action-btn",
      );

      if (!openButton) {
        return;
      }

      const reservationId = Number(
        openButton.dataset.reservationId,
      );

      if (
        Number.isInteger(reservationId) &&
        reservationId > 0
      ) {
        openModal(
          reservationId,
          openButton.dataset.reservationCode || "",
        );
      }
    });

    document
      .getElementById("collectAllUnpaidChargesBtn")
      ?.addEventListener("click", collectAllUnpaid);

    ["closeUnpaidChargesBtn", "cancelUnpaidChargesBtn"].forEach(
      (id) => {
        document
          .getElementById(id)
          ?.addEventListener("click", closeModal);
      },
    );

    getModal()?.addEventListener("click", (event) => {
      if (event.target === getModal()) {
        closeModal();
      }
    });

    const guestRecords = document.getElementById("guestRecords");

    if (guestRecords) {
      new MutationObserver(injectButtons).observe(guestRecords, {
        childList: true,
        subtree: true,
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();
