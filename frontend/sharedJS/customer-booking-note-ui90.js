/* UI-90: render only the isolated server field, never the composite note. */
(() => {
  "use strict";
  const label = "Customer Note / Concern";
  function create(booking) {
    const note = typeof booking?.customer_note === "string"
      ? booking.customer_note.trim() : "";
    if (!note) return null;
    const section = document.createElement("div");
    section.className = "customer-booking-note";
    const title = document.createElement("div");
    title.className = "customer-booking-note-label";
    title.textContent = label;
    const body = document.createElement("div");
    body.className = "customer-booking-note-text";
    body.textContent = note;
    section.append(title, body);
    return section;
  }
  window.CustomerBookingNote = Object.freeze({
    create,
    render(booking) { return create(booking)?.outerHTML || ""; },
  });
})();
