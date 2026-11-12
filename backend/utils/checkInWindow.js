// Stage 95-I: pure Manila-time helpers for Front Desk check-in eligibility.
// Using Asia/Manila explicitly avoids depending on the Render server's timezone.
// Do not change payments or arrival records in these helpers.
"use strict";

// A fixed-width Manila date+time allows safe chronological comparison without
// interpreting SQL DATE/TIME strings as UTC or using the host machine timezone.
function getManilaDateTimeKey(now = new Date()) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Manila",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const fields = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${fields.year}-${fields.month}-${fields.day} ${fields.hour}:${fields.minute}:${fields.second}`;
}

// The Front Desk can admit a guest only within the booked accommodation's
// scheduled window: start inclusive, checkout exclusive. Date-only checks are
// insufficient for same-day stays that have already expired.
function checkCheckInWindow(start, end, nowKey = getManilaDateTimeKey()) {
  const valid = /^\d{4}-\d{2}-\d{2} (?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
  if (![start, end, nowKey].every((value) => typeof value === "string" && valid.test(value))) {
    return "invalid";
  }
  if (end <= start) return "invalid";
  if (nowKey < start) return "not_started";
  if (nowKey >= end) return "expired";
  return "open";
}

module.exports = { getManilaDateTimeKey, checkCheckInWindow };
