/* ============================================================
   STEP 3F-C: FRONT DESK EXTRA BED
   File: frontend/frontdeskJS/frontdeskExtraBed.js

   Official resort rule:
   - Extra Bed = ₱200 per bed

   Backend endpoints:
   GET /api/admin/bookings/:id/extra-bed
   PUT /api/admin/bookings/:id/extra-bed
   PUT /api/admin/bookings/:id/extra-bed-paid

   Important:
   - The browser never sends a payment amount.
   - The backend recalculates the target and remaining balance.
   - Paid historical Extra Bed Charge rows are preserved.
============================================================ */

(() => {
  const EXTRA_BED_RATE = 200;
  const MONEY_EPSILON = 0.005;

  let activeReservationId = null;
  let currentSummary = null;
  let quantityDirty = false;
  let isSaving = false;
  let isCollecting = false;

  function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number)
      ? number
      : fallback;
  }

  function toWholeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isInteger(number)
      ? number
      : fallback;
  }

  function formatPeso(value) {
    return toNumber(value, 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function showExtraBedMessage(
    message,
    type = "success",
  ) {
    if (
      typeof showMessage ===
      "function"
    ) {
      showMessage(
        message,
        type,
      );
      return;
    }

    alert(message);
  }

  async function readJsonSafely(
    response,
  ) {
    try {
      return await response.json();
    } catch (error) {
      return {
        message:
          "The server returned an invalid response.",
      };
    }
  }

  function getModal() {
    return document.getElementById(
      "extraBedModal",
    );
  }

  function getQuantityInput() {
    return document.getElementById(
      "extraBedCountInput",
    );
  }

  function setText(
    id,
    value,
  ) {
    const element =
      document.getElementById(id);

    if (element) {
      element.textContent =
        String(value);
    }
  }

  function setStatus(
    message,
    invalid = false,
  ) {
    const box =
      document.getElementById(
        "extraBedStatusNote",
      );

    if (!box) {
      return;
    }

    box.textContent = message;
    box.classList.toggle(
      "invalid",
      Boolean(invalid),
    );
  }

  function getCardReservationId(
    card,
  ) {
    const idText =
      card
        ?.querySelector(
          ".reservation-id",
        )
        ?.textContent || "";

    const match =
      idText.match(/#\s*(\d+)/);

    const id =
      Number(match?.[1]);

    return Number.isInteger(id) &&
      id > 0
      ? id
      : null;
  }

  function getCardCode(
    card,
  ) {
    return String(
      card
        ?.querySelector(
          ".reservation-code",
        )
        ?.textContent ||
        "",
    ).trim();
  }

  // ==========================================================
  // BUTTON INJECTION
  // Keeps the large existing frontdeskGuests.js untouched.
  // ==========================================================

  function injectExtraBedButtons() {
    document
      .querySelectorAll(
        ".guest-record-card.state-inside",
      )
      .forEach((card) => {
        const actions =
          card.querySelector(
            ".guest-actions",
          );

        if (
          !actions ||
          actions.querySelector(
            ".extra-bed-action-btn",
          )
        ) {
          return;
        }

        const reservationId =
          getCardReservationId(
            card,
          );

        if (!reservationId) {
          return;
        }

        const button =
          document.createElement(
            "button",
          );

        button.type = "button";
        button.className =
          "extra-bed-action-btn";
        button.dataset.reservationId =
          String(
            reservationId,
          );
        button.dataset.reservationCode =
          getCardCode(card);
        button.textContent =
          "Extra Bed";

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
          actions.appendChild(
            button,
          );
        }
      });
  }

  // ==========================================================
  // MODAL
  // ==========================================================

  function openModal(
    reservationId,
    reservationCode,
  ) {
    activeReservationId =
      reservationId;
    currentSummary = null;
    quantityDirty = false;

    const modal = getModal();

    if (!modal) {
      return;
    }

    setText(
      "extraBedReservationText",
      reservationCode
        ? `Reservation ${reservationCode}`
        : `Reservation #${reservationId}`,
    );

    getQuantityInput().value =
      "0";

    setText(
      "extraBedRateText",
      `₱${formatPeso(
        EXTRA_BED_RATE,
      )}`,
    );

    setText(
      "extraBedTargetTotalText",
      "₱0.00",
    );
    setText(
      "extraBedPaidTotalText",
      "₱0.00",
    );
    setText(
      "extraBedRemainingText",
      "₱0.00",
    );
    setText(
      "extraBedOverpaidText",
      "₱0.00",
    );

    document
      .getElementById(
        "extraBedOverpaidRow",
      )
      ?.classList.remove(
        "show",
      );

    setStatus(
      "Loading current Extra Bed summary...",
      false,
    );

    updateButtons();

    modal.classList.add(
      "show",
    );
    document.body.classList.add(
      "guest-modal-open",
    );

    loadSummary();
  }

  function closeModal() {
    activeReservationId = null;
    currentSummary = null;
    quantityDirty = false;
    isSaving = false;
    isCollecting = false;

    getModal()?.classList.remove(
      "show",
    );

    document.body.classList.remove(
      "guest-modal-open",
    );
  }

  // ==========================================================
  // SUMMARY + PREVIEW
  // ==========================================================

  function renderSummary(
    summary,
  ) {
    currentSummary =
      summary || null;

    if (!summary) {
      updateButtons();
      return;
    }

    const input =
      getQuantityInput();

    if (
      input &&
      !quantityDirty
    ) {
      input.value =
        String(
          Math.max(
            0,
            toWholeNumber(
              summary.extra_bed_count,
              0,
            ),
          ),
        );
    }

    setText(
      "extraBedRateText",
      `₱${formatPeso(
        summary.extra_bed_rate ??
          EXTRA_BED_RATE,
      )}`,
    );

    setText(
      "extraBedPaidTotalText",
      `₱${formatPeso(
        summary.paid_extra_bed_total,
      )}`,
    );

    renderPreview();
    updateButtons();
  }

  function renderPreview() {
    const count =
      Math.max(
        0,
        toWholeNumber(
          getQuantityInput()?.value,
          0,
        ),
      );

    const rate =
      Math.max(
        0,
        toNumber(
          currentSummary
            ?.extra_bed_rate ??
            EXTRA_BED_RATE,
          EXTRA_BED_RATE,
        ),
      );

    const target =
      count * rate;

    const paid =
      Math.max(
        0,
        toNumber(
          currentSummary
            ?.paid_extra_bed_total,
          0,
        ),
      );

    const remaining =
      Math.max(
        target - paid,
        0,
      );

    const overpaid =
      Math.max(
        paid - target,
        0,
      );

    setText(
      "extraBedTargetTotalText",
      `₱${formatPeso(target)}`,
    );

    setText(
      "extraBedRemainingText",
      `₱${formatPeso(
        remaining,
      )}`,
    );

    setText(
      "extraBedOverpaidText",
      `₱${formatPeso(
        overpaid,
      )}`,
    );

    document
      .getElementById(
        "extraBedOverpaidRow",
      )
      ?.classList.toggle(
        "show",
        overpaid >
          MONEY_EPSILON,
      );

    if (quantityDirty) {
      setStatus(
        "Quantity changed. Apply the Extra Bed quantity first so the backend recalculates the exact unpaid difference before collection.",
        true,
      );
    } else if (
      overpaid >
      MONEY_EPSILON
    ) {
      setStatus(
        `Previously paid Extra Bed Charges are ₱${formatPeso(
          overpaid,
        )} above the current target. Do not collect more; review any refund/correction manually.`,
        true,
      );
    } else if (
      remaining >
      MONEY_EPSILON
    ) {
      setStatus(
        `Current Extra Bed amount due: ₱${formatPeso(
          remaining,
        )}. Confirm collection only after Front Desk receives this amount.`,
        false,
      );
    } else if (
      target >
      MONEY_EPSILON
    ) {
      setStatus(
        "The current Extra Bed total is fully covered. Duplicate collection is disabled.",
        false,
      );
    } else {
      setStatus(
        "No Extra Bed fee is currently required.",
        false,
      );
    }

    updateButtons();
  }

  function updateButtons() {
    const saveButton =
      document.getElementById(
        "saveExtraBedBtn",
      );

    const collectButton =
      document.getElementById(
        "collectExtraBedBtn",
      );

    if (saveButton) {
      saveButton.disabled =
        isSaving ||
        isCollecting ||
        !activeReservationId;

      saveButton.textContent =
        isSaving
          ? "Applying..."
          : "Apply Extra Bed Quantity";
    }

    if (!collectButton) {
      return;
    }

    if (
      isSaving ||
      isCollecting
    ) {
      collectButton.disabled =
        true;
      collectButton.textContent =
        isCollecting
          ? "Recording Payment..."
          : "Wait...";
      return;
    }

    if (
      !activeReservationId ||
      !currentSummary
    ) {
      collectButton.disabled =
        true;
      collectButton.textContent =
        "Loading Extra Bed Balance...";
      return;
    }

    if (quantityDirty) {
      collectButton.disabled =
        true;
      collectButton.textContent =
        "Apply Quantity Before Collecting";
      return;
    }

    const remaining =
      Math.max(
        0,
        toNumber(
          currentSummary
            .remaining_extra_bed_due,
          0,
        ),
      );

    const overpaid =
      Math.max(
        0,
        toNumber(
          currentSummary
            .extra_bed_overpaid,
          0,
        ),
      );

    const target =
      Math.max(
        0,
        toNumber(
          currentSummary
            .target_extra_bed_total,
          0,
        ),
      );

    if (
      overpaid >
      MONEY_EPSILON
    ) {
      collectButton.disabled =
        true;
      collectButton.textContent =
        "Overpayment - Review";
      return;
    }

    if (
      remaining >
      MONEY_EPSILON
    ) {
      collectButton.disabled =
        false;
      collectButton.textContent =
        `Collect ₱${formatPeso(
          remaining,
        )} Extra Bed Fee`;
      return;
    }

    collectButton.disabled =
      true;
    collectButton.textContent =
      target >
      MONEY_EPSILON
        ? "Extra Bed Fee Settled"
        : "No Extra Bed Fee";
  }

  async function loadSummary() {
    if (!activeReservationId) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_BASE}/admin/bookings/${activeReservationId}/extra-bed`,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
            cache:
              "no-store",
          },
        );

      const data =
        await readJsonSafely(
          response,
        );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load Extra Bed summary.",
        );
      }

      quantityDirty = false;
      renderSummary(data);
    } catch (error) {
      console.error(
        "loadExtraBedSummary error:",
        error,
      );

      currentSummary = null;
      updateButtons();

      setStatus(
        error.message ||
          "Failed to load Extra Bed summary.",
        true,
      );
    }
  }

  // ==========================================================
  // APPLY QUANTITY
  // ==========================================================

  async function saveQuantity() {
    if (
      !activeReservationId ||
      isSaving ||
      isCollecting
    ) {
      return;
    }

    const count =
      toWholeNumber(
        getQuantityInput()?.value,
        -1,
      );

    if (count < 0) {
      showExtraBedMessage(
        "Extra Bed quantity must be a whole number and cannot be negative.",
        "error",
      );
      return;
    }

    try {
      isSaving = true;
      updateButtons();

      const response =
        await fetch(
          `${API_BASE}/admin/bookings/${activeReservationId}/extra-bed`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            body:
              JSON.stringify({
                extra_bed_count:
                  count,
              }),
          },
        );

      const data =
        await readJsonSafely(
          response,
        );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update Extra Bed quantity.",
        );
      }

      quantityDirty = false;

      showExtraBedMessage(
        data.message ||
          "Extra Bed quantity updated successfully.",
        "success",
      );

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
          filter.value =
            "inside";

          if (
            typeof applyGuestFilters ===
            "function"
          ) {
            applyGuestFilters();
          }
        }
      }
    } catch (error) {
      console.error(
        "saveExtraBedQuantity error:",
        error,
      );

      showExtraBedMessage(
        error.message ||
          "Failed to update Extra Bed quantity.",
        "error",
      );
    } finally {
      isSaving = false;
      updateButtons();
    }
  }

  // ==========================================================
  // COLLECT CURRENT REMAINING EXTRA BED FEE
  // ==========================================================

  async function collectFee() {
    if (
      !activeReservationId ||
      !currentSummary ||
      quantityDirty ||
      isSaving ||
      isCollecting
    ) {
      return;
    }

    // Refresh first so confirmation uses current backend truth.
    await loadSummary();

    if (!currentSummary) {
      return;
    }

    const remaining =
      Math.max(
        0,
        toNumber(
          currentSummary
            .remaining_extra_bed_due,
          0,
        ),
      );

    const paid =
      Math.max(
        0,
        toNumber(
          currentSummary
            .paid_extra_bed_total,
          0,
        ),
      );

    const target =
      Math.max(
        0,
        toNumber(
          currentSummary
            .target_extra_bed_total,
          0,
        ),
      );

    const overpaid =
      Math.max(
        0,
        toNumber(
          currentSummary
            .extra_bed_overpaid,
          0,
        ),
      );

    if (
      overpaid >
      MONEY_EPSILON
    ) {
      showExtraBedMessage(
        "Extra Bed has an overpayment condition. Review it before any additional collection.",
        "error",
      );
      return;
    }

    if (
      remaining <=
      MONEY_EPSILON
    ) {
      showExtraBedMessage(
        "Extra Bed fee is already settled. No duplicate payment is needed.",
        "success",
      );
      return;
    }

    const confirmed =
      confirm(
        [
          "Confirm Extra Bed fee collection?",
          "",
          `Extra Bed quantity: ${currentSummary.extra_bed_count}`,
          `Rate per bed: ₱${formatPeso(
            currentSummary.extra_bed_rate,
          )}`,
          `Target Extra Bed total: ₱${formatPeso(
            target,
          )}`,
          `Previously paid: ₱${formatPeso(
            paid,
          )}`,
          `Amount to collect now: ₱${formatPeso(
            remaining,
          )}`,
          "",
          "Continue only after Front Desk has received the full amount shown above.",
          "The backend recalculates the remaining amount before saving.",
        ].join("\n"),
      );

    if (!confirmed) {
      return;
    }

    try {
      isCollecting = true;
      updateButtons();

      const response =
        await fetch(
          `${API_BASE}/admin/bookings/${activeReservationId}/extra-bed-paid`,
          {
            method: "PUT",
            headers: {
              Accept:
                "application/json",
            },
          },
        );

      const data =
        await readJsonSafely(
          response,
        );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to record Extra Bed payment.",
        );
      }

      showExtraBedMessage(
        data.message ||
          "Extra Bed payment recorded successfully.",
        "success",
      );

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
          filter.value =
            "inside";

          if (
            typeof applyGuestFilters ===
            "function"
          ) {
            applyGuestFilters();
          }
        }
      }
    } catch (error) {
      console.error(
        "collectExtraBedFee error:",
        error,
      );

      showExtraBedMessage(
        error.message ||
          "Failed to record Extra Bed payment.",
        "error",
      );

      await loadSummary();
    } finally {
      isCollecting = false;
      updateButtons();
    }
  }

  // ==========================================================
  // SETUP
  // ==========================================================

  function setup() {
    injectExtraBedButtons();

    document.addEventListener(
      "click",
      (event) => {
        const button =
          event.target.closest?.(
            ".extra-bed-action-btn",
          );

        if (!button) {
          return;
        }

        const reservationId =
          Number(
            button.dataset
              .reservationId,
          );

        if (
          !Number.isInteger(
            reservationId,
          ) ||
          reservationId <= 0
        ) {
          return;
        }

        openModal(
          reservationId,
          button.dataset
            .reservationCode || "",
        );
      },
    );

    getQuantityInput()?.addEventListener(
      "input",
      () => {
        quantityDirty = true;
        renderPreview();
      },
    );

    document
      .getElementById(
        "saveExtraBedBtn",
      )
      ?.addEventListener(
        "click",
        saveQuantity,
      );

    document
      .getElementById(
        "collectExtraBedBtn",
      )
      ?.addEventListener(
        "click",
        collectFee,
      );

    [
      "closeExtraBedBtn",
      "cancelExtraBedBtn",
    ].forEach((id) => {
      document
        .getElementById(id)
        ?.addEventListener(
          "click",
          closeModal,
        );
    });

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

    const guestRecords =
      document.getElementById(
        "guestRecords",
      );

    if (guestRecords) {
      const observer =
        new MutationObserver(
          () => {
            injectExtraBedButtons();
          },
        );

      observer.observe(
        guestRecords,
        {
          childList: true,
          subtree: true,
        },
      );
    }
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      setup,
    );
  } else {
    setup();
  }
})();
