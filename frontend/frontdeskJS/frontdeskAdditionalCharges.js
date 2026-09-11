/* ============================================================
   STEP 3F-D: FRONT DESK ADDITIONAL CHARGES
   File: frontend/frontdeskJS/frontdeskAdditionalCharges.js

   Categories:
   - Damage
   - Missing Item
   - Service
   - Custom

   Important:
   - New charges are UNPAID.
   - Exact duplicate unpaid submissions are blocked by backend.
   - Paid rows cannot be deleted.
   - Payment collection is intentionally deferred to
     Step 3F-E — Collect Unpaid Charges.
============================================================ */

(() => {
  let activeReservationId = null;
  let activeReservationCode = "";
  let isSaving = false;
  let isLoading = false;
  let isDeleting = false;

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
    } catch (error) {
      return {
        message: "The server returned an invalid response.",
      };
    }
  }

  function showAdditionalMessage(message, type = "success") {
    if (typeof showMessage === "function") {
      showMessage(message, type);
      return;
    }

    alert(message);
  }

  function getModal() {
    return document.getElementById("additionalChargesModal");
  }

  function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = String(value);
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

  // ==========================================================
  // BUTTON INJECTION
  // ==========================================================

  function injectButtons() {
    document
      .querySelectorAll(".guest-record-card.state-inside")
      .forEach((card) => {
        const actions = card.querySelector(".guest-actions");

        if (
          !actions ||
          actions.querySelector(".additional-charges-action-btn")
        ) {
          return;
        }

        const reservationId = getCardReservationId(card);

        if (!reservationId) {
          return;
        }

        const button = document.createElement("button");

        button.type = "button";
        button.className = "additional-charges-action-btn";
        button.dataset.reservationId = String(reservationId);
        button.dataset.reservationCode =
          getCardReservationCode(card);
        button.textContent = "Additional Charges";

        const disabledBadge = actions.querySelector(
          ".guest-action-disabled",
        );

        if (disabledBadge) {
          actions.insertBefore(button, disabledBadge);
        } else {
          actions.appendChild(button);
        }
      });
  }

  // ==========================================================
  // MODAL HELPERS
  // ==========================================================

  function resetForm() {
    const type = document.getElementById("additionalChargeType");
    const customWrap = document.getElementById(
      "additionalCustomNameWrap",
    );
    const custom = document.getElementById(
      "additionalCustomName",
    );
    const amount = document.getElementById(
      "additionalChargeAmount",
    );
    const note = document.getElementById(
      "additionalChargeNote",
    );

    if (type) {
      type.value = "damage";
    }

    if (custom) {
      custom.value = "";
    }

    if (customWrap) {
      customWrap.classList.remove("show");
    }

    if (amount) {
      amount.value = "";
    }

    if (note) {
      note.value = "";
    }
  }

  function updateCustomVisibility() {
    const type = String(
      document.getElementById("additionalChargeType")?.value || "",
    );

    document
      .getElementById("additionalCustomNameWrap")
      ?.classList.toggle("show", type === "custom");
  }

  function openModal(reservationId, reservationCode) {
    activeReservationId = reservationId;
    activeReservationCode = reservationCode || "";

    setText(
      "additionalChargesReservationText",
      activeReservationCode
        ? `Reservation ${activeReservationCode}`
        : `Reservation #${reservationId}`,
    );

    resetForm();
    renderLoading();

    getModal()?.classList.add("show");
    document.body.classList.add("guest-modal-open");

    loadCharges();
  }

  function closeModal() {
    activeReservationId = null;
    activeReservationCode = "";
    isSaving = false;
    isLoading = false;
    isDeleting = false;

    getModal()?.classList.remove("show");
    document.body.classList.remove("guest-modal-open");
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  function renderLoading() {
    const list = document.getElementById("additionalChargesList");

    if (list) {
      list.innerHTML = `
        <div class="additional-charges-empty">
          Loading Additional Charges...
        </div>
      `;
    }

    setText("additionalChargesTotalText", "₱0.00");
    setText("additionalChargesUnpaidText", "₱0.00");
  }

  function renderCharges(data) {
    const rows = Array.isArray(data?.charges)
      ? data.charges
      : [];

    setText(
      "additionalChargesTotalText",
      `₱${formatPeso(data?.total_additional_charges)}`,
    );

    setText(
      "additionalChargesUnpaidText",
      `₱${formatPeso(data?.unpaid_additional_charges)}`,
    );

    const list = document.getElementById("additionalChargesList");

    if (!list) {
      return;
    }

    if (!rows.length) {
      list.innerHTML = `
        <div class="additional-charges-empty">
          No manual Additional Charges have been recorded yet.
        </div>
      `;
      return;
    }

    list.innerHTML = rows
      .map((charge) => {
        const paid = Number(charge.is_paid || 0) === 1;

        const customLabel =
          charge.category === "custom" && charge.custom_name
            ? ` — ${escapeHtml(charge.custom_name)}`
            : "";

        return `
          <article class="additional-charge-row ${
            paid ? "paid" : "unpaid"
          }">
            <div class="additional-charge-main">
              <div class="additional-charge-title-row">
                <strong>
                  ${escapeHtml(
                    charge.category_label || charge.charge_name,
                  )}${customLabel}
                </strong>

                <span class="additional-charge-status ${
                  paid ? "paid" : "unpaid"
                }">
                  ${paid ? "Paid" : "Unpaid"}
                </span>
              </div>

              <p>
                ${escapeHtml(charge.charge_note || "No note")}
              </p>
            </div>

            <div class="additional-charge-side">
              <strong>
                ₱${formatPeso(charge.charge_amount)}
              </strong>

              ${
                paid
                  ? `
                    <small>
                      Paid charge history is preserved.
                    </small>
                  `
                  : `
                    <button
                      type="button"
                      class="delete-additional-charge-btn"
                      data-charge-id="${Number(charge.id)}"
                    >
                      Remove
                    </button>
                  `
              }
            </div>
          </article>
        `;
      })
      .join("");
  }

  // ==========================================================
  // LOAD
  // ==========================================================

  async function loadCharges() {
    if (!activeReservationId || isLoading) {
      return;
    }

    try {
      isLoading = true;
      updateButtons();

      const response = await fetch(
        `${API_BASE}/admin/bookings/${activeReservationId}/additional-charges`,
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
        throw new Error(
          data.message || "Failed to load Additional Charges.",
        );
      }

      renderCharges(data);
    } catch (error) {
      console.error("loadAdditionalCharges error:", error);

      const list = document.getElementById("additionalChargesList");

      if (list) {
        list.innerHTML = `
          <div class="additional-charges-empty error">
            ${escapeHtml(
              error.message || "Failed to load Additional Charges.",
            )}
          </div>
        `;
      }
    } finally {
      isLoading = false;
      updateButtons();
    }
  }

  // ==========================================================
  // ADD
  // ==========================================================

  function validateForm() {
    const category = String(
      document.getElementById("additionalChargeType")?.value || "",
    ).trim();

    const customName = String(
      document.getElementById("additionalCustomName")?.value || "",
    ).trim();

    const amount = Number(
      document.getElementById("additionalChargeAmount")?.value,
    );

    const note = String(
      document.getElementById("additionalChargeNote")?.value || "",
    ).trim();

    if (
      !["damage", "missing_item", "service", "custom"].includes(
        category,
      )
    ) {
      return {
        valid: false,
        message: "Select a valid Additional Charge category.",
      };
    }

    if (category === "custom" && !customName) {
      return {
        valid: false,
        message: "Enter a custom charge name.",
      };
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return {
        valid: false,
        message: "Charge amount must be greater than zero.",
      };
    }

    if (!note) {
      return {
        valid: false,
        message: "Add a verification / charge note.",
      };
    }

    return {
      valid: true,
      payload: {
        category,
        custom_name: customName,
        charge_amount: amount,
        charge_note: note,
      },
    };
  }

  async function addCharge() {
    if (!activeReservationId || isSaving) {
      return;
    }

    const validation = validateForm();

    if (!validation.valid) {
      showAdditionalMessage(validation.message, "error");
      return;
    }

    try {
      isSaving = true;
      updateButtons();

      const response = await fetch(
        `${API_BASE}/admin/bookings/${activeReservationId}/additional-charges`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(validation.payload),
        },
      );

      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add Additional Charge.",
        );
      }

      showAdditionalMessage(
        data.message || "Additional Charge added.",
        "success",
      );

      resetForm();
      await loadCharges();
    } catch (error) {
      console.error("addAdditionalCharge error:", error);

      showAdditionalMessage(
        error.message || "Failed to add Additional Charge.",
        "error",
      );
    } finally {
      isSaving = false;
      updateButtons();
    }
  }

  // ==========================================================
  // DELETE UNPAID
  // ==========================================================

  async function deleteCharge(chargeId) {
    if (
      !activeReservationId ||
      !Number.isInteger(chargeId) ||
      chargeId <= 0 ||
      isDeleting
    ) {
      return;
    }

    const confirmed = confirm(
      "Remove this unpaid Additional Charge?",
    );

    if (!confirmed) {
      return;
    }

    try {
      isDeleting = true;
      updateButtons();

      const response = await fetch(
        `${API_BASE}/admin/bookings/${activeReservationId}/additional-charges/${chargeId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to remove Additional Charge.",
        );
      }

      showAdditionalMessage(
        data.message || "Additional Charge removed.",
        "success",
      );

      await loadCharges();
    } catch (error) {
      console.error("deleteAdditionalCharge error:", error);

      showAdditionalMessage(
        error.message || "Failed to remove Additional Charge.",
        "error",
      );
    } finally {
      isDeleting = false;
      updateButtons();
    }
  }

  function updateButtons() {
    const button = document.getElementById(
      "saveAdditionalChargeBtn",
    );

    if (!button) {
      return;
    }

    button.disabled =
      isSaving || isLoading || isDeleting || !activeReservationId;

    button.textContent = isSaving
      ? "Adding Charge..."
      : "Add Unpaid Charge";
  }

  // ==========================================================
  // SETUP
  // ==========================================================

  function setup() {
    injectButtons();

    document.addEventListener("click", (event) => {
      const openButton = event.target.closest?.(
        ".additional-charges-action-btn",
      );

      if (openButton) {
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

        return;
      }

      const deleteButton = event.target.closest?.(
        ".delete-additional-charge-btn",
      );

      if (deleteButton) {
        deleteCharge(Number(deleteButton.dataset.chargeId));
      }
    });

    document
      .getElementById("additionalChargeType")
      ?.addEventListener("change", updateCustomVisibility);

    document
      .getElementById("saveAdditionalChargeBtn")
      ?.addEventListener("click", addCharge);

    [
      "closeAdditionalChargesBtn",
      "cancelAdditionalChargesBtn",
    ].forEach((id) => {
      document
        .getElementById(id)
        ?.addEventListener("click", closeModal);
    });

    getModal()?.addEventListener("click", (event) => {
      if (event.target === getModal()) {
        closeModal();
      }
    });

    const guestRecords = document.getElementById("guestRecords");

    if (guestRecords) {
      const observer = new MutationObserver(() => {
        injectButtons();
      });

      observer.observe(guestRecords, {
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
