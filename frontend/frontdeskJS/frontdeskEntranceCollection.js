/* ============================================================
   FRONT DESK ENTRANCE PRICING + COLLECTION COMPANION
   File: frontend/frontdeskJS/frontdeskEntranceCollection.js

   STEP 3F-B3 PRICING CORRECTION

   Purpose:
   - Keep the existing Front Desk Guests page compatible while
     correcting the entrance calculation to the resort's official
     fixed pricing.
   - Apply room free-entrance inclusions first.
   - Use Adult rate for ordinary chargeable guests.
   - Use the fixed Kid/Senior/PWD special rate for qualified
     chargeable guests.
   - The legacy input/database key "kid_free" is kept internally
     for compatibility, but it means Kid SPECIAL RATE now.
   - Do NOT automate the ₱100 subsequent-day fee in this phase.
   - Collect only the backend-calculated remaining entrance fee.
   - Prevent duplicate entrance collection.

   Official entrance rates:
   Pool & Beach
     Adult: Day ₱250 / Overnight ₱300
     Kid/Senior/PWD: Day ₱200 / Overnight ₱250

   Beach Only
     Adult: Day ₱150 / Overnight ₱200
     Kid/Senior/PWD: Day ₱100 / Overnight ₱150

   Existing endpoint reused:
   GET /api/bookings/:id/discounts
   PUT /api/bookings/:id/discounts
   Body for collection: { action: "collect_entrance_fee" }
============================================================ */

(() => {
  let activeReservationId = null;
  let latestEntranceMeta = null;
  let adjustmentFormDirty = false;
  let isCollectingEntrance = false;

  const MONEY_EPSILON = 0.005;

  // ==========================================================
  // HELPERS
  // ==========================================================

  function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function toWholeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isInteger(number) ? number : fallback;
  }

  function formatPeso(value) {
    return toNumber(value, 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function getCollectButton() {
    return document.getElementById("collectEntranceFeeBtn");
  }

  function getPolicyNote() {
    return document.getElementById("entranceAdjustmentPolicyNote");
  }

  function setPolicyMessage(message, invalid = false) {
    const note = getPolicyNote();

    if (!note) {
      return;
    }

    note.textContent = message;
    note.classList.toggle("invalid", Boolean(invalid));
  }

  function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = String(value);
    }
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

  function showEntranceMessage(message, type = "success") {
    if (typeof showMessage === "function") {
      showMessage(message, type);
      return;
    }

    alert(message);
  }

  function getBookingIdFromActionButton(button) {
    if (!button) {
      return null;
    }

    const onclickText = String(
      button.getAttribute("onclick") || "",
    );

    const match = onclickText.match(
      /openEntranceAdjustmentModal\s*\(\s*(\d+)\s*\)/i,
    );

    if (!match?.[1]) {
      return null;
    }

    const bookingId = Number(match[1]);

    return Number.isInteger(bookingId) && bookingId > 0
      ? bookingId
      : null;
  }

  function getPaxValues() {
    return {
      senior: Math.max(
        0,
        toWholeNumber(
          document.getElementById("entranceSeniorPaxInput")?.value,
          0,
        ),
      ),
      pwd: Math.max(
        0,
        toWholeNumber(
          document.getElementById("entrancePwdPaxInput")?.value,
          0,
        ),
      ),
      kid: Math.max(
        0,
        toWholeNumber(
          document.getElementById("entranceKidFreePaxInput")?.value,
          0,
        ),
      ),
    };
  }

  // ==========================================================
  // OFFICIAL FIXED-RATE PREVIEW
  // ==========================================================

  function renderOfficialPricingPreview(meta = latestEntranceMeta) {
    if (!meta) {
      return;
    }

    const adultRate = Math.max(
      0,
      toNumber(
        meta.adult_entrance_rate_per_pax ??
          meta.entrance_rate_per_pax,
        0,
      ),
    );

    const specialRate = Math.max(
      0,
      toNumber(
        meta.special_entrance_rate_per_pax,
        Math.max(adultRate - 50, 0),
      ),
    );

    const adjustmentPerPax = Math.max(
      0,
      toNumber(
        meta.special_rate_adjustment_per_pax,
        adultRate - specialRate,
      ),
    );

    const chargeableGuests = Math.max(
      0,
      toWholeNumber(meta.chargeable_entrance_guests, 0),
    );

    const grossEntranceFee = Math.max(
      0,
      toNumber(
        meta.gross_entrance_fee,
        adultRate * chargeableGuests,
      ),
    );

    const alreadyCollected = Math.max(
      0,
      toNumber(meta.entrance_fee_collected, 0),
    );

    const pax = getPaxValues();
    const totalSpecialPax = pax.senior + pax.pwd + pax.kid;

    const seniorAdjustment = adjustmentPerPax * pax.senior;
    const pwdAdjustment = adjustmentPerPax * pax.pwd;
    const kidAdjustment = adjustmentPerPax * pax.kid;
    const totalAdjustment =
      seniorAdjustment + pwdAdjustment + kidAdjustment;

    const finalEntranceFee = Math.max(
      grossEntranceFee - totalAdjustment,
      0,
    );

    const remainingEntranceFee = Math.max(
      finalEntranceFee - alreadyCollected,
      0,
    );

    const overpaid = Math.max(
      alreadyCollected - finalEntranceFee,
      0,
    );

    setText("entranceRateText", `₱${formatPeso(adultRate)}`);
    setText(
      "entranceSpecialRateText",
      `₱${formatPeso(specialRate)}`,
    );

    setText(
      "entranceSeniorDiscountText",
      `-₱${formatPeso(seniorAdjustment)}`,
    );
    setText(
      "entrancePwdDiscountText",
      `-₱${formatPeso(pwdAdjustment)}`,
    );
    setText(
      "entranceKidDiscountText",
      `-₱${formatPeso(kidAdjustment)}`,
    );
    setText(
      "entranceTotalDeductionText",
      `-₱${formatPeso(totalAdjustment)}`,
    );
    setText(
      "finalEntranceFeeText",
      `₱${formatPeso(finalEntranceFee)}`,
    );
    setText(
      "remainingEntranceFeeText",
      `₱${formatPeso(remainingEntranceFee)}`,
    );
    setText(
      "entranceOverpaidText",
      `₱${formatPeso(overpaid)}`,
    );

    const overpaidRow = document.getElementById("entranceOverpaidRow");
    overpaidRow?.classList.toggle(
      "show",
      overpaid > MONEY_EPSILON,
    );

    if (totalSpecialPax > chargeableGuests) {
      setPolicyMessage(
        `Special-rate pax (${totalSpecialPax}) cannot exceed the ${chargeableGuests} chargeable entrance guest(s) after room free-entrance inclusions.`,
        true,
      );
    } else if (adjustmentFormDirty) {
      setPolicyMessage(
        "You changed a special-rate field. Apply the adjustment first so the backend saves and recalculates the final entrance fee before collection.",
        true,
      );
    }
  }

  // ==========================================================
  // PATCH LEGACY DISPLAY LABELS WITHOUT CHANGING THE OLD B2 FILE
  // ==========================================================

  function patchSavedAdjustmentLabels() {
    const box = document.getElementById("currentEntranceAdjustmentBox");

    if (!box) {
      return;
    }

    const walker = document.createTreeWalker(
      box,
      NodeFilter.SHOW_TEXT,
    );

    const nodes = [];
    let node = walker.nextNode();

    while (node) {
      nodes.push(node);
      node = walker.nextNode();
    }

    nodes.forEach((textNode) => {
      const originalValue = textNode.nodeValue || "";

      const updatedValue = originalValue
        .replace(/Senior Citizen 20%/g, "Senior Citizen Special Rate")
        .replace(/PWD 20%/g, "PWD Special Rate")
        .replace(/Qualified Kid Free/g, "Kid Special Rate")
        .replace(
          /Total Saved Deduction/g,
          "Total Saved Special-Rate Adjustment",
        );

      // Important: only write back when the text actually changed.
      // The saved-adjustment MutationObserver watches characterData.
      // Reassigning the exact same nodeValue repeatedly would retrigger
      // the observer forever and freeze the Entrance Adjustment modal.
      if (updatedValue !== originalValue) {
        textNode.nodeValue = updatedValue;
      }
    });
  }

  // ==========================================================
  // COLLECTION BUTTON STATE
  // ==========================================================

  function updateCollectionButton(meta = latestEntranceMeta) {
    const button = getCollectButton();

    if (!button) {
      return;
    }

    if (isCollectingEntrance) {
      button.disabled = true;
      button.textContent = "Recording Entrance Payment...";
      return;
    }

    if (!activeReservationId || !meta) {
      button.disabled = true;
      button.textContent = "Loading Entrance Balance...";
      return;
    }

    const verifiedActualGuests = Boolean(
      meta.has_verified_actual_guest_count,
    );

    const finalEntranceFee = Math.max(
      0,
      toNumber(meta.final_entrance_fee, 0),
    );

    const alreadyCollected = Math.max(
      0,
      toNumber(meta.entrance_fee_collected, 0),
    );

    const remaining = Math.max(
      0,
      toNumber(meta.entrance_fee_remaining, 0),
    );

    const overpaid = Math.max(
      0,
      toNumber(meta.entrance_fee_overpaid, 0),
    );

    const paidFlag = Number(meta.entrance_fee_paid || 0) === 1;

    if (!verifiedActualGuests) {
      button.disabled = true;
      button.textContent = "Complete Guest Adjustment First";

      setPolicyMessage(
        "Complete Guest Adjustment first so the actual onsite guest count is verified before collecting the entrance fee.",
        true,
      );
      return;
    }

    if (adjustmentFormDirty) {
      button.disabled = true;
      button.textContent = "Apply Adjustment Before Collecting";

      setPolicyMessage(
        "You changed a special-rate field. Apply the adjustment first so the backend saves and recalculates the final entrance fee before collection.",
        true,
      );
      return;
    }

    if (overpaid > MONEY_EPSILON) {
      button.disabled = true;
      button.textContent = "Entrance Overpayment - Review";

      setPolicyMessage(
        `Already collected entrance money is ₱${formatPeso(
          overpaid,
        )} above the current recalculated final fee. Review the guest/special-rate adjustment before another collection.`,
        true,
      );
      return;
    }

    if (remaining > MONEY_EPSILON) {
      button.disabled = false;
      button.textContent =
        `Collect ₱${formatPeso(remaining)} Entrance Fee`;

      setPolicyMessage(
        "Room free-entrance inclusions and the official Kid/Senior/PWD fixed rates have been applied by the backend. Confirm collection only after Front Desk has actually received the full remaining entrance fee.",
        false,
      );
      return;
    }

    if (remaining <= MONEY_EPSILON && !paidFlag) {
      button.disabled = false;
      button.textContent =
        finalEntranceFee <= MONEY_EPSILON
          ? "Mark Entrance Fee Settled (₱0.00)"
          : "Confirm Entrance Fee Settled";

      setPolicyMessage(
        finalEntranceFee <= MONEY_EPSILON
          ? "The backend-calculated final entrance fee is ₱0.00 after room inclusions and special rates. Confirm settlement without recording money."
          : "The recalculated fee is already fully covered by previously collected entrance money. Confirm settlement without collecting duplicate money.",
        false,
      );
      return;
    }

    if (alreadyCollected + MONEY_EPSILON >= finalEntranceFee) {
      button.disabled = true;
      button.textContent = "Entrance Fee Settled";

      setPolicyMessage(
        "The recalculated entrance fee is already fully covered. Duplicate entrance collection is disabled.",
        false,
      );
      return;
    }

    button.disabled = true;
    button.textContent = "Review Entrance Balance";
  }

  // ==========================================================
  // LOAD CURRENT SAVED BACKEND META
  // ==========================================================

  async function refreshEntranceCollectionState() {
    if (!activeReservationId) {
      latestEntranceMeta = null;
      updateCollectionButton();
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/bookings/${activeReservationId}/discounts`,
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
          data.message ||
            "Failed to load the current entrance balance.",
        );
      }

      latestEntranceMeta = data.meta || null;

      patchSavedAdjustmentLabels();
      renderOfficialPricingPreview();
      updateCollectionButton();
    } catch (error) {
      console.error(
        "refreshEntranceCollectionState error:",
        error,
      );

      latestEntranceMeta = null;
      updateCollectionButton();

      setPolicyMessage(
        error.message ||
          "Failed to load the current entrance balance.",
        true,
      );
    }
  }

  // ==========================================================
  // COLLECT FINAL / REMAINING ENTRANCE FEE
  // ==========================================================

  async function collectFinalEntranceFee() {
    if (!activeReservationId || isCollectingEntrance) {
      return;
    }

    await refreshEntranceCollectionState();

    const meta = latestEntranceMeta;

    if (!meta) {
      showEntranceMessage(
        "Unable to load the current entrance balance.",
        "error",
      );
      return;
    }

    if (!meta.has_verified_actual_guest_count) {
      showEntranceMessage(
        "Complete Guest Adjustment first before collecting the entrance fee.",
        "error",
      );
      return;
    }

    if (adjustmentFormDirty) {
      showEntranceMessage(
        "Apply the edited special-rate adjustment first before collecting the entrance fee.",
        "error",
      );
      return;
    }

    const grossEntranceFee = Math.max(
      0,
      toNumber(meta.gross_entrance_fee, 0),
    );

    const totalAdjustment = Math.max(
      0,
      toNumber(meta.total_entrance_deduction, 0),
    );

    const finalEntranceFee = Math.max(
      0,
      toNumber(meta.final_entrance_fee, 0),
    );

    const alreadyCollected = Math.max(
      0,
      toNumber(meta.entrance_fee_collected, 0),
    );

    const remaining = Math.max(
      0,
      toNumber(meta.entrance_fee_remaining, 0),
    );

    const overpaid = Math.max(
      0,
      toNumber(meta.entrance_fee_overpaid, 0),
    );

    if (overpaid > MONEY_EPSILON) {
      showEntranceMessage(
        `Entrance payment is over the current recalculated fee by ₱${formatPeso(
          overpaid,
        )}. Review the special-rate adjustment before collecting again.`,
        "error",
      );
      return;
    }

    const confirmationLines = [
      "Confirm final entrance fee collection?",
      "",
      `Gross entrance fee at Adult rate: ₱${formatPeso(
        grossEntranceFee,
      )}`,
      `Saved Kid/Senior/PWD rate adjustments: -₱${formatPeso(
        totalAdjustment,
      )}`,
      `Final entrance fee: ₱${formatPeso(finalEntranceFee)}`,
      `Already collected: ₱${formatPeso(alreadyCollected)}`,
      `Amount to collect now: ₱${formatPeso(remaining)}`,
      "",
      "The backend recalculates room free-entrance inclusions and official fixed rates again before saving.",
      "No amount from this browser is trusted as the source of truth.",
      "",
      remaining > MONEY_EPSILON
        ? "Continue only after Front Desk has received the full amount shown above."
        : "No money remains due. This action will only synchronize the entrance fee as settled.",
    ];

    const confirmed = confirm(confirmationLines.join("\n"));

    if (!confirmed) {
      return;
    }

    const button = getCollectButton();

    try {
      isCollectingEntrance = true;
      updateCollectionButton();

      const response = await fetch(
        `${API_BASE}/bookings/${activeReservationId}/discounts`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            action: "collect_entrance_fee",
          }),
        },
      );

      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to record entrance fee collection.",
        );
      }

      latestEntranceMeta = data.meta || null;

      showEntranceMessage(
        data.message ||
          "Entrance fee collection recorded successfully.",
        "success",
      );

      if (typeof loadEntranceAdjustment === "function") {
        await loadEntranceAdjustment();
      }

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

      await refreshEntranceCollectionState();
    } catch (error) {
      console.error("collectFinalEntranceFee error:", error);

      showEntranceMessage(
        error.message ||
          "Failed to record entrance fee collection.",
        "error",
      );

      await refreshEntranceCollectionState();
    } finally {
      isCollectingEntrance = false;
      updateCollectionButton();

      if (button) {
        button.blur();
      }
    }
  }

  // ==========================================================
  // EVENT / OBSERVER WIRING
  // ==========================================================

  function setupEntrancePricingAndCollection() {
    const collectButton = getCollectButton();

    collectButton?.addEventListener(
      "click",
      collectFinalEntranceFee,
    );

    document.addEventListener(
      "click",
      (event) => {
        const actionButton = event.target.closest?.(
          ".entrance-adjustment-action-btn",
        );

        if (!actionButton) {
          return;
        }

        const bookingId = getBookingIdFromActionButton(actionButton);

        if (!bookingId) {
          return;
        }

        activeReservationId = bookingId;
        latestEntranceMeta = null;
        adjustmentFormDirty = false;
        updateCollectionButton();

        // Run more than once to stay correct even if the existing
        // B2 modal's own GET finishes before or after this companion.
        setTimeout(refreshEntranceCollectionState, 0);
        setTimeout(refreshEntranceCollectionState, 180);
      },
      true,
    );

    [
      "entranceSeniorPaxInput",
      "entrancePwdPaxInput",
      "entranceKidFreePaxInput",
    ].forEach((id) => {
      document.getElementById(id)?.addEventListener("input", () => {
        if (!activeReservationId) {
          return;
        }

        adjustmentFormDirty = true;

        // Existing B2 listener runs first; then this corrected
        // preview replaces the legacy percentage/free calculation.
        setTimeout(() => {
          renderOfficialPricingPreview();
          updateCollectionButton();
        }, 0);
      });
    });

    document
      .getElementById("entranceAdjustmentNoteInput")
      ?.addEventListener("input", () => {
        if (!activeReservationId) {
          return;
        }

        adjustmentFormDirty = true;
        updateCollectionButton();
      });

    [
      "closeEntranceAdjustmentBtn",
      "cancelEntranceAdjustmentBtn",
    ].forEach((id) => {
      document.getElementById(id)?.addEventListener("click", () => {
        activeReservationId = null;
        latestEntranceMeta = null;
        adjustmentFormDirty = false;
        updateCollectionButton();
      });
    });

    const currentBox = document.getElementById(
      "currentEntranceAdjustmentBox",
    );

    if (currentBox) {
      const savedAdjustmentObserver = new MutationObserver(() => {
        patchSavedAdjustmentLabels();

        // Programmatic input values are populated by the old B2
        // loader before this box is rendered, so this is a reliable
        // point to redraw the official fixed-rate preview.
        setTimeout(() => {
          renderOfficialPricingPreview();
        }, 0);
      });

      savedAdjustmentObserver.observe(currentBox, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    const modal = document.getElementById("entranceAdjustmentModal");

    if (modal) {
      const modalObserver = new MutationObserver(() => {
        if (!modal.classList.contains("show")) {
          return;
        }

        setTimeout(refreshEntranceCollectionState, 80);
      });

      modalObserver.observe(modal, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  }

  document.addEventListener(
    "DOMContentLoaded",
    setupEntrancePricingAndCollection,
  );
})();
