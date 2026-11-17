// Front Desk manual reservation: shared Manila-time schedule guard.
// Used by both the accommodation-selection page and payment confirmation.
// Validates the FIXED slot checkout, not its start: late arrivals are allowed
// while the schedule window remains open. The backend remains authoritative.
(function (root) {
  "use strict";

  const MANILA_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;
  const DAY_MS = 24 * 60 * 60 * 1000;

  function readTimeSeconds(value) {
    const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(String(value || ""));
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = Number(match[3] || 0);
    if (hours > 23 || minutes > 59 || seconds > 59) return null;

    return hours * 3600 + minutes * 60 + seconds;
  }

  function checkoutTimeInManila(item, slot) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      String(item?.check_in_date || ""),
    );
    const startSeconds = readTimeSeconds(slot?.start);
    const endSeconds = readTimeSeconds(slot?.end);
    if (!match || startSeconds === null || endSeconds === null) return null;

    const startDayUTC = Date.UTC(
      Number(match[1]), Number(match[2]) - 1, Number(match[3]),
    );
    if (
      !Number.isFinite(startDayUTC) ||
      new Date(startDayUTC).toISOString().slice(0, 10) !== item.check_in_date
    ) return null;

    const slotType = String(item.slot_type || "");
    const isExtended = slotType === "day_extended" || slotType === "night_extended";
    const rawDuration = Number(item.stay_duration || 1);
    const duration = isExtended && Number.isFinite(rawDuration)
      ? Math.max(1, Math.min(5, Math.floor(rawDuration)))
      : 1;

    // Matches the existing checkout-date rule on both Front Desk pages and
    // in bookingController: multi-day extended stays add full calendar days;
    // overnight single slots roll over to the following date.
    const extraDays = duration > 1 ? duration : endSeconds <= startSeconds ? 1 : 0;
    return startDayUTC + extraDays * DAY_MS +
      endSeconds * 1000 - MANILA_UTC_OFFSET_MS;
  }

  function validateItems(items, accommodations, getSlotOptions, nowMs = Date.now()) {
    const list = Array.isArray(items) ? items : [];
    const rooms = Array.isArray(accommodations) ? accommodations : [];

    for (let index = 0; index < list.length; index += 1) {
      const item = list[index];
      const accommodation = rooms.find(
        (room) => Number(room.id) === Number(item.accommodation_id),
      );
      const slot = accommodation && getSlotOptions(accommodation).find(
        (option) => option.value === item.slot_type,
      );

      if (!accommodation || !slot) {
        return {
          valid: false,
          itemIndex: index,
          message: "Unable to verify the selected accommodation schedule. Please reload and choose the accommodation and slot again.",
        };
      }

      const checkoutMs = checkoutTimeInManila(item, slot);
      if (checkoutMs === null) {
        return {
          valid: false,
          itemIndex: index,
          message: "Invalid reservation schedule. Please review the selected date and slot.",
        };
      }

      if (checkoutMs <= nowMs) {
        return {
          valid: false,
          itemIndex: index,
          message: `${accommodation.name} — ${slot.label} on ${item.check_in_date} has already ended. Please choose a schedule that has not ended yet.`,
        };
      }
    }

    return { valid: true, itemIndex: -1, message: "" };
  }

  root.ManualScheduleGuard = Object.freeze({
    validateItems,
    checkoutTimeInManila,
  });

  // Enable deterministic Node.js unit tests without loading a browser.
  if (typeof module === "object" && module.exports) {
    module.exports = root.ManualScheduleGuard;
  }
})(typeof window !== "undefined" ? window : globalThis);
