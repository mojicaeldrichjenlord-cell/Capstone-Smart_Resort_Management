/* ============================================================
   PHASE 2 - STEP 2.11C
   FRONT DESK — ACCOMMODATION BALANCE COLLECTION
   File: frontend/frontdeskJS/frontdeskAccommodationBalance.js

   Backend:
   GET  /api/admin/bookings/:id/accommodation-balance
   PUT  /api/admin/bookings/:id/accommodation-balance/collect
   POST /api/admin/bookings/:id/accommodation-balance/paypal/order
   POST /api/admin/bookings/:id/accommodation-balance/paypal/capture

   Payment methods:
   - Cash
   - GCash
   - Maya / PayMaya
   - PayPal Sandbox

   Scope:
   - Accommodation balance only
   - Add Accommodation / Extend Stay unpaid amounts are collected here

   Not included:
   - Entrance Fee
   - Extra Guest / Extra Bed / Additional Charges
============================================================ */

(() => {
  const PAYPAL_SDK_SCRIPT_ID =
    "paypal-web-sdk-v6-accommodation-balance";

  // Keep the same Sandbox SDK path already proven by the project's
  // customer and manual-reservation PayPal flows.
  const PAYPAL_SDK_URL =
    "https://www.sandbox.paypal.com/web-sdk/v6/core";

  let activeReservationId = null;
  let activeReservationCode = "";
  let currentSummary = null;

  let isLoading = false;
  let isCollecting = false;
  let isPayPalBusy = false;

  let paypalSdkInstance = null;
  let paypalPaymentSession = null;
  let paypalSetupPromise = null;
  let paypalButtonBound = false;

  // ============================================================
  // BASIC HELPERS
  // ============================================================

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

  function normalizeLower(value) {
    return String(value || "").trim().toLowerCase();
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
    const text =
      card?.querySelector(".reservation-id")?.textContent || "";

    const match = text.match(/#\s*(\d+)/);
    const id = Number(match?.[1]);

    return Number.isInteger(id) && id > 0
      ? id
      : null;
  }

  function getCardReservationCode(card) {
    return String(
      card?.querySelector(".reservation-code")?.textContent || "",
    ).trim();
  }

  function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = String(value);
    }
  }

  function setStatus(message, type = "info") {
    const status = document.getElementById(
      "accommodationBalancePayPalStatus",
    );

    if (!status) {
      return;
    }

    status.className =
      `accommodation-balance-paypal-status ${type}`;

    status.textContent = message;
  }

  function getSelectedPaymentMethod() {
    return normalizeLower(
      document.getElementById(
        "accommodationBalancePaymentMethod",
      )?.value,
    );
  }

  function getReferenceNumber() {
    return String(
      document.getElementById(
        "accommodationBalanceReference",
      )?.value || "",
    ).trim();
  }

  // ============================================================
  // DYNAMIC STYLES
  // ============================================================

  function ensureStyles() {
    if (
      document.getElementById(
        "accommodationBalancePaymentStyles",
      )
    ) {
      return;
    }

    const style = document.createElement("style");

    style.id = "accommodationBalancePaymentStyles";

    style.textContent = `
      .accommodation-balance-payment-box {
        margin-top: 16px;
        padding: 16px;
        border: 1px solid #dbe4ee;
        border-radius: 16px;
        background: #f8fafc;
      }

      .accommodation-balance-payment-box h3 {
        margin: 0 0 12px;
        font-size: 16px;
        color: #0f172a;
      }

      .accommodation-balance-payment-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .accommodation-balance-payment-field {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .accommodation-balance-payment-field.full {
        grid-column: 1 / -1;
      }

      .accommodation-balance-payment-field label {
        font-size: 13px;
        font-weight: 700;
        color: #334155;
      }

      .accommodation-balance-payment-field select,
      .accommodation-balance-payment-field input {
        width: 100%;
        box-sizing: border-box;
        min-height: 44px;
        padding: 10px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        background: #ffffff;
        color: #0f172a;
        font: inherit;
      }

      .accommodation-balance-payment-help {
        margin: 8px 0 0;
        font-size: 12px;
        line-height: 1.55;
        color: #64748b;
      }

      .accommodation-balance-paypal-section {
        display: none;
        margin-top: 14px;
        padding: 16px;
        border: 1px solid #bfdbfe;
        border-radius: 16px;
        background: #ffffff;
      }

      .accommodation-balance-paypal-section.show {
        display: block;
      }

      .accommodation-balance-paypal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }

      .accommodation-balance-paypal-eyebrow {
        margin: 0 0 4px;
        color: #0f766e;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.08em;
      }

      .accommodation-balance-paypal-header h3 {
        margin: 0;
        font-size: 17px;
        color: #0f172a;
      }

      .accommodation-balance-paypal-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 7px 11px;
        border-radius: 999px;
        background: #eff6ff;
        color: #1d4ed8;
        font-size: 12px;
        font-weight: 800;
      }

      .accommodation-balance-paypal-amount {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin: 12px 0;
        padding: 12px 14px;
        border-radius: 12px;
        background: #f8fafc;
        color: #0f172a;
      }

      .accommodation-balance-paypal-amount strong {
        color: #0f766e;
      }

      .accommodation-balance-paypal-status {
        margin: 12px 0;
        padding: 11px 12px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.45;
      }

      .accommodation-balance-paypal-status.info {
        background: #eff6ff;
        color: #1e40af;
      }

      .accommodation-balance-paypal-status.success {
        background: #ecfdf5;
        color: #047857;
      }

      .accommodation-balance-paypal-status.error {
        background: #fef2f2;
        color: #b91c1c;
      }

      #accommodationBalancePayPalButton {
        width: 100%;
        margin-top: 4px;
      }

      .accommodation-balance-paypal-help {
        margin: 12px 0 0;
        color: #64748b;
        font-size: 12px;
        line-height: 1.55;
      }

      @media (max-width: 720px) {
        .accommodation-balance-payment-grid {
          grid-template-columns: 1fr;
        }

        .accommodation-balance-payment-field.full {
          grid-column: auto;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // ============================================================
  // MODAL
  // ============================================================

  function ensureModal() {
    if (
      document.getElementById(
        "accommodationBalanceModal",
      )
    ) {
      return;
    }

    ensureStyles();

    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div
        class="accommodation-balance-modal"
        id="accommodationBalanceModal"
      >
        <div class="accommodation-balance-modal-box">
          <div class="accommodation-balance-header">
            <div>
              <p class="accommodation-balance-eyebrow">
                FRONT DESK OPERATION
              </p>

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
              <strong id="accommodationBalanceTotalText">
                ₱0.00
              </strong>
            </div>

            <div class="accommodation-balance-summary-item paid">
              <span>Previously Paid</span>
              <strong id="accommodationBalancePaidText">
                ₱0.00
              </strong>
            </div>

            <div class="accommodation-balance-summary-item due">
              <span>Amount to Collect Now</span>
              <strong id="accommodationBalanceDueText">
                ₱0.00
              </strong>
            </div>
          </div>

          <div class="accommodation-balance-detail-grid">
            <div>
              <span>Required Downpayment</span>
              <strong id="accommodationBalanceDownpaymentText">
                ₱0.00
              </strong>
            </div>

            <div>
              <span>Payment Status</span>
              <strong id="accommodationBalanceStatusText">
                -
              </strong>
            </div>
          </div>

          <div
            class="accommodation-balance-status-note"
            id="accommodationBalanceStatusNote"
          >
            Loading current accommodation balance...
          </div>

          <div class="accommodation-balance-policy-note">
            This modal collects
            <strong>accommodation balance only</strong>.
            Add Accommodation and Extend Stay amounts appear here after they
            are saved as unpaid. Entrance Fee and onsite booking charges are
            handled by their own collection workflows.
          </div>

          <div
            class="accommodation-balance-warning"
            id="accommodationBalanceWarning"
          >
            The backend recalculates the current balance from the database.
            The browser never sends the amount to collect.
          </div>

          <div class="accommodation-balance-payment-box">
            <h3>Payment Details</h3>

            <div class="accommodation-balance-payment-grid">
              <div class="accommodation-balance-payment-field">
                <label for="accommodationBalancePaymentMethod">
                  Payment Method
                </label>

                <select id="accommodationBalancePaymentMethod">
                  <option value="cash">Cash</option>
                  <option value="gcash">GCash</option>
                  <option value="paymaya">Maya / PayMaya</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              <div
                class="accommodation-balance-payment-field"
                id="accommodationBalanceReferenceGroup"
                hidden
              >
                <label for="accommodationBalanceReference">
                  Reference Number
                  <span style="font-weight:500;">(Optional)</span>
                </label>

                <input
                  type="text"
                  id="accommodationBalanceReference"
                  maxlength="120"
                  placeholder="Enter GCash / Maya reference"
                  autocomplete="off"
                />
              </div>
            </div>

            <p
              class="accommodation-balance-payment-help"
              id="accommodationBalancePaymentHelp"
            >
              Cash is recorded manually after Front Desk confirms receipt.
            </p>

            <div
              class="accommodation-balance-paypal-section"
              id="accommodationBalancePayPalSection"
            >
              <div class="accommodation-balance-paypal-header">
                <div>
                  <p class="accommodation-balance-paypal-eyebrow">
                    AUTOMATED PAYPAL PAYMENT
                  </p>

                  <h3>Remaining Accommodation Balance</h3>
                </div>

                <span class="accommodation-balance-paypal-badge">
                  Sandbox
                </span>
              </div>

              <div class="accommodation-balance-paypal-amount">
                <span>PayPal Amount to Pay</span>
                <strong id="accommodationBalancePayPalAmount">
                  ₱0.00
                </strong>
              </div>

              <div
                class="accommodation-balance-paypal-status info"
                id="accommodationBalancePayPalStatus"
              >
                Preparing PayPal Sandbox...
              </div>

              <paypal-button
                id="accommodationBalancePayPalButton"
                type="pay"
                hidden
              ></paypal-button>

              <p class="accommodation-balance-paypal-help">
                PayPal will collect only the current accommodation balance
                calculated by the backend. Entrance Fee and other onsite
                charges remain separate.
              </p>
            </div>
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
    return document.getElementById(
      "accommodationBalanceModal",
    );
  }

  // ============================================================
  // ACTION BUTTON INJECTION
  // ============================================================

  function injectButtons() {
    document
      .querySelectorAll(
        ".guest-record-card.state-inside",
      )
      .forEach((card) => {
        const actions =
          card.querySelector(".guest-actions");

        if (
          !actions ||
          actions.querySelector(
            ".accommodation-balance-action-btn",
          )
        ) {
          return;
        }

        const reservationId =
          getCardReservationId(card);

        if (!reservationId) {
          return;
        }

        const button =
          document.createElement("button");

        button.type = "button";
        button.className =
          "accommodation-balance-action-btn";
        button.dataset.reservationId =
          String(reservationId);
        button.dataset.reservationCode =
          getCardReservationCode(card);
        button.textContent =
          "Accommodation Balance";

        const disabledBadge =
          actions.querySelector(
            ".guest-action-disabled",
          );

        if (disabledBadge) {
          actions.insertBefore(
            button,
            disabledBadge,
          );
        } else {
          actions.appendChild(button);
        }
      });
  }

  // ============================================================
  // MODAL STATE
  // ============================================================

  function resetModal() {
    currentSummary = null;
    isCollecting = false;
    isPayPalBusy = false;

    setText(
      "accommodationBalanceTotalText",
      "₱0.00",
    );
    setText(
      "accommodationBalancePaidText",
      "₱0.00",
    );
    setText(
      "accommodationBalanceDueText",
      "₱0.00",
    );
    setText(
      "accommodationBalanceDownpaymentText",
      "₱0.00",
    );
    setText(
      "accommodationBalanceStatusText",
      "-",
    );
    setText(
      "accommodationBalancePayPalAmount",
      "₱0.00",
    );

    const statusNote =
      document.getElementById(
        "accommodationBalanceStatusNote",
      );

    if (statusNote) {
      statusNote.className =
        "accommodation-balance-status-note";

      statusNote.textContent =
        "Loading current accommodation balance...";
    }

    const collectButton =
      document.getElementById(
        "collectAccommodationBalanceBtn",
      );

    if (collectButton) {
      collectButton.disabled = true;
      collectButton.style.display = "";
      collectButton.textContent =
        "Loading Balance...";
    }

    const paymentMethod =
      document.getElementById(
        "accommodationBalancePaymentMethod",
      );

    if (paymentMethod) {
      paymentMethod.value = "cash";
      paymentMethod.disabled = false;
    }

    const reference =
      document.getElementById(
        "accommodationBalanceReference",
      );

    if (reference) {
      reference.value = "";
      reference.disabled = false;
    }

    setStatus(
      "Preparing PayPal Sandbox...",
      "info",
    );

    updatePaymentMethodUi();
  }

  async function openModal(
    reservationId,
    reservationCode,
  ) {
    ensureModal();

    activeReservationId =
      Number(reservationId);

    activeReservationCode =
      String(reservationCode || "").trim();

    resetModal();

    setText(
      "accommodationBalanceReservationText",
      `Reservation ${
        activeReservationCode ||
        `#${activeReservationId}`
      }`,
    );

    getModal()?.classList.add("show");

    document.body.classList.add(
      "accommodation-balance-modal-open",
    );

    await loadSummary();
  }

  function closeModal() {
    if (isPayPalBusy || isCollecting) {
      notify(
        "Please wait for the current payment action to finish.",
        "error",
      );
      return;
    }

    activeReservationId = null;
    activeReservationCode = "";
    currentSummary = null;

    getModal()?.classList.remove("show");

    document.body.classList.remove(
      "accommodation-balance-modal-open",
    );
  }

  // ============================================================
  // SUMMARY RENDERING
  // ============================================================

  function renderSummary(summary) {
    currentSummary = summary;

    const due = Math.max(
      toNumber(summary.remaining_balance),
      0,
    );

    const settled =
      Boolean(summary.settled) ||
      due <= 0.005;

    setText(
      "accommodationBalanceTotalText",
      `₱${formatPeso(
        summary.accommodation_total,
      )}`,
    );

    setText(
      "accommodationBalancePaidText",
      `₱${formatPeso(
        summary.paid_amount,
      )}`,
    );

    setText(
      "accommodationBalanceDueText",
      `₱${formatPeso(due)}`,
    );

    setText(
      "accommodationBalanceDownpaymentText",
      `₱${formatPeso(
        summary.required_downpayment,
      )}`,
    );

    setText(
      "accommodationBalanceStatusText",
      String(
        summary.payment_status || "-",
      )
        .replace(/_/g, " ")
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase(),
        ),
    );

    setText(
      "accommodationBalancePayPalAmount",
      `₱${formatPeso(due)}`,
    );

    const statusNote =
      document.getElementById(
        "accommodationBalanceStatusNote",
      );

    if (statusNote) {
      statusNote.className =
        "accommodation-balance-status-note";

      if (
        toNumber(
          summary.overpaid_amount,
        ) > 0.005
      ) {
        statusNote.classList.add("error");

        statusNote.textContent =
          `Possible accommodation overpayment: ₱${formatPeso(
            summary.overpaid_amount,
          )}. Do not collect more; review this reservation manually.`;
      } else if (
        summary.balance_mismatch
      ) {
        statusNote.classList.add(
          "warning",
        );

        statusNote.textContent =
          `Stored remaining balance differs from the recalculated balance. ` +
          `The backend will use ₱${formatPeso(
            due,
          )} as the authoritative amount.`;
      } else if (settled) {
        statusNote.classList.add(
          "settled",
        );

        statusNote.textContent =
          "Accommodation balance is fully settled. Duplicate collection is disabled.";
      } else {
        statusNote.classList.add("due");

        statusNote.textContent =
          `Outstanding accommodation balance: ₱${formatPeso(
            due,
          )}. Choose how Front Desk will collect it.`;
      }
    }

    updatePaymentMethodUi();
  }

  async function loadSummary() {
    if (
      !activeReservationId ||
      isLoading
    ) {
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

      const data =
        await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load accommodation balance.",
        );
      }

      renderSummary(data);
    } catch (error) {
      console.error(
        "loadAccommodationBalanceSummary error:",
        error,
      );

      const statusNote =
        document.getElementById(
          "accommodationBalanceStatusNote",
        );

      if (statusNote) {
        statusNote.className =
          "accommodation-balance-status-note error";

        statusNote.textContent =
          error.message ||
          "Failed to load accommodation balance.";
      }

      notify(
        error.message ||
          "Failed to load accommodation balance.",
        "error",
      );
    } finally {
      isLoading = false;
    }
  }

  // ============================================================
  // PAYMENT METHOD UI
  // ============================================================

  function updatePaymentMethodUi() {
    const method =
      getSelectedPaymentMethod();

    const due = Math.max(
      toNumber(
        currentSummary?.remaining_balance,
      ),
      0,
    );

    const settled =
      Boolean(currentSummary?.settled) ||
      due <= 0.005;

    const overpaid =
      toNumber(
        currentSummary?.overpaid_amount,
      ) > 0.005;

    const referenceGroup =
      document.getElementById(
        "accommodationBalanceReferenceGroup",
      );

    const reference =
      document.getElementById(
        "accommodationBalanceReference",
      );

    const paymentHelp =
      document.getElementById(
        "accommodationBalancePaymentHelp",
      );

    const paypalSection =
      document.getElementById(
        "accommodationBalancePayPalSection",
      );

    const collectButton =
      document.getElementById(
        "collectAccommodationBalanceBtn",
      );

    const isWallet =
      ["gcash", "paymaya"].includes(
        method,
      );

    const isPayPal =
      method === "paypal";

    if (referenceGroup) {
      referenceGroup.hidden =
        !isWallet;

      // Explicit display toggle because this project's author CSS
      // uses display:flex on payment fields and can visually override
      // the native hidden attribute in some browsers.
      referenceGroup.style.display =
        isWallet ? "flex" : "none";
    }

    if (reference) {
      reference.disabled =
        !isWallet ||
        settled ||
        overpaid ||
        isCollecting ||
        isPayPalBusy;
    }

    if (paypalSection) {
      paypalSection.classList.toggle(
        "show",
        isPayPal && !settled && !overpaid,
      );
    }

    if (paymentHelp) {
      if (method === "cash") {
        paymentHelp.textContent =
          "Cash is recorded manually after Front Desk confirms the full accommodation balance was received.";
      } else if (method === "gcash") {
        paymentHelp.textContent =
          "GCash is staff-confirmed. A reference number may be recorded for audit, but the backend still calculates the amount.";
      } else if (method === "paymaya") {
        paymentHelp.textContent =
          "Maya / PayMaya is staff-confirmed. A reference number may be recorded for audit, but the backend still calculates the amount.";
      } else {
        paymentHelp.textContent =
          "PayPal is automated. The reservation is marked fully paid only after PayPal reports a successful capture.";
      }
    }

    if (collectButton) {
      if (
        settled ||
        overpaid
      ) {
        collectButton.disabled = true;
        collectButton.style.display = "";

        collectButton.textContent =
          settled
            ? "Accommodation Settled"
            : "Review Overpayment";
      } else if (isPayPal) {
        collectButton.disabled = true;
        collectButton.style.display =
          "none";
      } else {
        collectButton.style.display = "";
        collectButton.disabled =
          isCollecting || isPayPalBusy;

        collectButton.textContent =
          `Collect ₱${formatPeso(
            due,
          )} via ${
            method === "paymaya"
              ? "Maya"
              : method === "gcash"
                ? "GCash"
                : "Cash"
          }`;
      }
    }

    const paymentMethod =
      document.getElementById(
        "accommodationBalancePaymentMethod",
      );

    if (paymentMethod) {
      paymentMethod.disabled =
        settled ||
        overpaid ||
        isCollecting ||
        isPayPalBusy;
    }

    if (
      isPayPal &&
      !settled &&
      !overpaid
    ) {
      preparePayPalCheckout().catch(
        (error) => {
          console.error(
            "prepareAccommodationBalancePayPal error:",
            error,
          );

          setStatus(
            error.message ||
              "Unable to prepare PayPal Sandbox.",
            "error",
          );
        },
      );
    }
  }

  // ============================================================
  // MANUAL COLLECTION: CASH / GCASH / MAYA
  // ============================================================

  async function collectBalanceManually() {
    if (
      !activeReservationId ||
      !currentSummary ||
      isCollecting ||
      isPayPalBusy
    ) {
      return;
    }

    const method =
      getSelectedPaymentMethod();

    if (method === "paypal") {
      notify(
        "Use the PayPal button for automated PayPal collection.",
        "error",
      );
      return;
    }

    if (
      !["cash", "gcash", "paymaya"].includes(
        method,
      )
    ) {
      notify(
        "Please select a valid payment method.",
        "error",
      );
      return;
    }

    const due = Math.max(
      toNumber(
        currentSummary.remaining_balance,
      ),
      0,
    );

    if (due <= 0.005) {
      notify(
        "Accommodation balance is already settled.",
        "success",
      );
      return;
    }

    const methodLabel =
      method === "paymaya"
        ? "Maya / PayMaya"
        : method === "gcash"
          ? "GCash"
          : "Cash";

    const confirmed = confirm(
      `Confirm that Front Desk has received the FULL accommodation balance of ₱${formatPeso(
        due,
      )} via ${methodLabel}?\n\n` +
        "This will mark the accommodation balance as fully paid.",
    );

    if (!confirmed) {
      return;
    }

    const collectButton =
      document.getElementById(
        "collectAccommodationBalanceBtn",
      );

    isCollecting = true;
    updatePaymentMethodUi();

    try {
      if (collectButton) {
        collectButton.textContent =
          "Collecting...";
      }

      const response = await fetch(
        `${API_BASE}/admin/bookings/${activeReservationId}/accommodation-balance/collect`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            payment_method: method,
            reference_number:
              getReferenceNumber() || null,
          }),
        },
      );

      const data =
        await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to collect accommodation balance.",
        );
      }

      notify(
        data.message ||
          "Accommodation balance collected successfully.",
        "success",
      );

      await refreshAfterSuccessfulCollection();
    } catch (error) {
      console.error(
        "collectAccommodationBalance error:",
        error,
      );

      notify(
        error.message ||
          "Failed to collect accommodation balance.",
        "error",
      );

      await loadSummary();
    } finally {
      isCollecting = false;
      updatePaymentMethodUi();
    }
  }

  // ============================================================
  // PAYPAL SDK / CONFIG
  // ============================================================

  function loadPayPalSdk() {
    if (
      window.paypal?.createInstance
    ) {
      return Promise.resolve();
    }

    const existingScript =
      document.getElementById(
        PAYPAL_SDK_SCRIPT_ID,
      );

    if (existingScript) {
      return new Promise(
        (resolve, reject) => {
          if (
            window.paypal?.createInstance
          ) {
            resolve();
            return;
          }

          existingScript.addEventListener(
            "load",
            () => resolve(),
            { once: true },
          );

          existingScript.addEventListener(
            "error",
            () =>
              reject(
                new Error(
                  "Failed to load PayPal Sandbox SDK.",
                ),
              ),
            { once: true },
          );
        },
      );
    }

    return new Promise(
      (resolve, reject) => {
        const script =
          document.createElement(
            "script",
          );

        script.id =
          PAYPAL_SDK_SCRIPT_ID;
        script.src =
          PAYPAL_SDK_URL;
        script.async = true;

        script.onload = () => {
          if (
            window.paypal?.createInstance
          ) {
            resolve();
          } else {
            reject(
              new Error(
                "PayPal SDK loaded but createInstance is unavailable.",
              ),
            );
          }
        };

        script.onerror = () => {
          reject(
            new Error(
              "Failed to load PayPal Sandbox SDK.",
            ),
          );
        };

        document.head.appendChild(
          script,
        );
      },
    );
  }

  async function fetchPayPalConfig() {
    const response = await fetch(
      `${API_BASE}/paypal/config`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    const data =
      await readJsonSafely(response);

    if (
      !response.ok ||
      !data?.success ||
      !data?.clientId
    ) {
      throw new Error(
        data?.message ||
          "PayPal configuration is unavailable.",
      );
    }

    if (
      String(
        data.environment || "",
      ).toLowerCase() !== "sandbox"
    ) {
      throw new Error(
        "PayPal is not currently configured for Sandbox mode.",
      );
    }

    return data;
  }

  // ============================================================
  // PAYPAL ORDER / CAPTURE
  // ============================================================

  async function createPayPalBalanceOrder() {
    if (
      !activeReservationId ||
      !currentSummary
    ) {
      throw new Error(
        "Accommodation balance reservation is not loaded.",
      );
    }

    setStatus(
      "Creating PayPal Sandbox order for the current accommodation balance...",
      "info",
    );

    const response = await fetch(
      `${API_BASE}/admin/bookings/${activeReservationId}/accommodation-balance/paypal/order`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({}),
      },
    );

    const data =
      await readJsonSafely(response);

    if (
      !response.ok ||
      !data?.success ||
      !data?.orderId
    ) {
      throw new Error(
        data?.message ||
          "Failed to create PayPal accommodation balance order.",
      );
    }

    setStatus(
      `PayPal balance order ready: ${
        data.currency || "PHP"
      } ${
        data.amount ||
        formatPeso(
          currentSummary.remaining_balance,
        )
      }.`,
      "success",
    );

    return {
      orderId: data.orderId,
    };
  }

  async function capturePayPalBalanceOrder(
    orderId,
  ) {
    if (!activeReservationId) {
      throw new Error(
        "Reservation information is missing.",
      );
    }

    setStatus(
      "PayPal approved. Capturing remaining accommodation balance...",
      "info",
    );

    const response = await fetch(
      `${API_BASE}/admin/bookings/${activeReservationId}/accommodation-balance/paypal/capture`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      },
    );

    const data =
      await readJsonSafely(response);

    if (
      !response.ok ||
      !data?.success
    ) {
      const error =
        new Error(
          data?.message ||
            "PayPal accommodation balance capture failed.",
        );

      error.data = data;
      throw error;
    }

    return data;
  }

  async function preparePayPalCheckout() {
    ensureModal();

    if (
      paypalPaymentSession &&
      paypalSdkInstance
    ) {
      const button =
        document.getElementById(
          "accommodationBalancePayPalButton",
        );

      button?.removeAttribute(
        "hidden",
      );

      setStatus(
        "PayPal Sandbox is ready. Click the PayPal button to continue.",
        "success",
      );

      return;
    }

    if (paypalSetupPromise) {
      return paypalSetupPromise;
    }

    paypalSetupPromise = (async () => {
      setStatus(
        "Loading PayPal Sandbox...",
        "info",
      );

      const [config] =
        await Promise.all([
          fetchPayPalConfig(),
          loadPayPalSdk(),
        ]);

      paypalSdkInstance =
        await window.paypal.createInstance(
          {
            clientId:
              config.clientId,
            components: [
              "paypal-payments",
            ],
            pageType: "checkout",
          },
        );

      const paymentMethods =
        await paypalSdkInstance
          .findEligibleMethods({
            currencyCode:
              config.currency ||
              "PHP",
          });

      if (
        !paymentMethods?.isEligible?.(
          "paypal",
        )
      ) {
        throw new Error(
          "PayPal checkout is not eligible in this Sandbox session.",
        );
      }

      paypalPaymentSession =
        paypalSdkInstance
          .createPayPalOneTimePaymentSession(
            {
              async onApprove(data) {
                try {
                  isPayPalBusy = true;
                  updatePaymentMethodUi();

                  const result =
                    await capturePayPalBalanceOrder(
                      data.orderId,
                    );

                  setStatus(
                    "PayPal accommodation balance captured successfully.",
                    "success",
                  );

                  notify(
                    result.message ||
                      "PayPal accommodation balance captured successfully.",
                    "success",
                  );

                  await refreshAfterSuccessfulCollection();
                } catch (error) {
                  console.error(
                    "Accommodation balance PayPal capture error:",
                    error,
                  );

                  setStatus(
                    error.message ||
                      "PayPal approved the checkout, but the backend could not finalize the balance.",
                    "error",
                  );

                  notify(
                    error.message ||
                      "Unable to finalize PayPal accommodation balance.",
                    "error",
                  );
                } finally {
                  isPayPalBusy = false;
                  updatePaymentMethodUi();
                }
              },

              onCancel() {
                isPayPalBusy = false;

                setStatus(
                  "PayPal checkout was cancelled. You can retry the same accommodation balance checkout.",
                  "info",
                );

                updatePaymentMethodUi();
              },

              onError(error) {
                isPayPalBusy = false;

                console.error(
                  "Accommodation balance PayPal session error:",
                  error,
                );

                setStatus(
                  "PayPal encountered an error. Please try again.",
                  "error",
                );

                updatePaymentMethodUi();
              },
            },
          );

      const paypalButton =
        document.getElementById(
          "accommodationBalancePayPalButton",
        );

      if (!paypalButton) {
        throw new Error(
          "Accommodation balance PayPal button is missing.",
        );
      }

      paypalButton.removeAttribute(
        "hidden",
      );

      if (!paypalButtonBound) {
        paypalButton.addEventListener(
          "click",
          async (event) => {
            event.preventDefault();

            if (
              isPayPalBusy ||
              isCollecting
            ) {
              return;
            }

            if (
              getSelectedPaymentMethod() !==
              "paypal"
            ) {
              return;
            }

            try {
              isPayPalBusy = true;
              updatePaymentMethodUi();

              setStatus(
                "Preparing PayPal Sandbox checkout...",
                "info",
              );

              await paypalPaymentSession.start(
                {
                  presentationMode:
                    "auto",
                },
                createPayPalBalanceOrder(),
              );
            } catch (error) {
              console.error(
                "Accommodation balance PayPal start error:",
                error,
              );

              setStatus(
                error.message ||
                  "Unable to start PayPal accommodation balance checkout.",
                "error",
              );

              notify(
                error.message ||
                  "Unable to start PayPal checkout.",
                "error",
              );
            } finally {
              isPayPalBusy = false;
              updatePaymentMethodUi();
            }
          },
        );

        paypalButtonBound = true;
      }

      setStatus(
        "PayPal Sandbox is ready. Click the PayPal button to continue.",
        "success",
      );
    })();

    try {
      await paypalSetupPromise;
    } catch (error) {
      paypalSetupPromise = null;
      throw error;
    }
  }

  // ============================================================
  // POST-COLLECTION REFRESH
  // ============================================================

  async function refreshAfterSuccessfulCollection() {
    await loadSummary();

    if (
      typeof loadGuestBookings ===
      "function"
    ) {
      await loadGuestBookings();

      const filter =
        document.getElementById(
          "arrivalFilter",
        );

      if (filter) {
        filter.value = "inside";

        if (
          typeof applyGuestFilters ===
          "function"
        ) {
          applyGuestFilters();
        }
      }
    }
  }

  // ============================================================
  // EVENTS
  // ============================================================

  function bindEvents() {
    ensureModal();

    document
      .getElementById(
        "closeAccommodationBalanceBtn",
      )
      ?.addEventListener(
        "click",
        closeModal,
      );

    document
      .getElementById(
        "cancelAccommodationBalanceBtn",
      )
      ?.addEventListener(
        "click",
        closeModal,
      );

    document
      .getElementById(
        "collectAccommodationBalanceBtn",
      )
      ?.addEventListener(
        "click",
        collectBalanceManually,
      );

    document
      .getElementById(
        "accommodationBalancePaymentMethod",
      )
      ?.addEventListener(
        "change",
        updatePaymentMethodUi,
      );

    getModal()?.addEventListener(
      "click",
      (event) => {
        if (
          event.target ===
          getModal()
        ) {
          closeModal();
        }
      },
    );

    document.addEventListener(
      "click",
      (event) => {
        const button =
          event.target.closest(
            ".accommodation-balance-action-btn",
          );

        if (!button) {
          return;
        }

        openModal(
          Number(
            button.dataset.reservationId,
          ),
          button.dataset.reservationCode,
        );
      },
    );

    const guestRecords =
      document.getElementById(
        "guestRecords",
      );

    if (guestRecords) {
      new MutationObserver(
        injectButtons,
      ).observe(
        guestRecords,
        {
          childList: true,
          subtree: true,
        },
      );
    }

    injectButtons();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      bindEvents,
    );
  } else {
    bindEvents();
  }
})();
