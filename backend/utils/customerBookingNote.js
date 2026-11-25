"use strict";

// Legacy reservation notes are a sequence of " | "-delimited entries.
// Only the original explicitly labelled customer entry may be displayed.
// Never expose the complete composite note to a new UI or Manager response.
function extractCustomerNote(value) {
  if (typeof value !== "string") return null;
  const prefix = "Customer Note:";
  const entry = value.split(" | ").find(part => part.startsWith(prefix));
  return entry ? entry.slice(prefix.length).trim() || null : null;
}

module.exports = { extractCustomerNote };
