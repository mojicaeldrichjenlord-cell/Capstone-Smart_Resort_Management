// Stage 95-J: reject two overlapping items for the SAME accommodation
// inside one reservation request. The SQL checker handles other bookings;
// it cannot detect two new (not yet inserted) items in the same draft.
"use strict";

function findOverlappingDraftItems(items) {
  if (!Array.isArray(items)) return null;
  const byAccommodation = new Map();

  for (const item of items) {
    const id = Number(item?.accommodation_id);
    if (!Number.isSafeInteger(id) || id <= 0) continue;
    const start = `${item.check_in_date} ${item.check_in_time}`;
    const end = `${item.check_out_date} ${item.check_out_time}`;
    if (!byAccommodation.has(id)) byAccommodation.set(id, []);
    for (const existing of byAccommodation.get(id)) {
      // Adjacent windows (checkout exactly at next check-in) do not overlap.
      if (existing.start < end && start < existing.end) {
        return { accommodation_id: id };
      }
    }
    byAccommodation.get(id).push({ start, end });
  }
  return null;
}

module.exports = { findOverlappingDraftItems };
