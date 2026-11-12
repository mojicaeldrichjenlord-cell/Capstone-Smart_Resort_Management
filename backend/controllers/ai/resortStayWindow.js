// Stage 85-C: strict, timezone-independent booking-window validation.
// Date strings are resort-local calendar dates (Asia/Manila). Do not allow
// JavaScript's permissive Date parsing to roll invalid days into next month.
// Preliminary validation ONLY; the actual Customer booking endpoint remains
// the final authority over slots, schedule policies, and payments.
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{2}):(\d{2}):(\d{2})$/;

function validDate(text) {
  const match = DATE_RE.exec(String(text || ""));
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 2000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}

function validTime(text) {
  const match = TIME_RE.exec(String(text || ""));
  if (!match) return false;
  return Number(match[1]) < 24 && Number(match[2]) < 60 &&
    Number(match[3]) < 60;
}

function validateAiStayWindow(context, todayInManila) {
  const checkIn = String(context?.check_in || "");
  const checkOut = String(context?.check_out || "");
  const checkInTime = String(context?.check_in_time || "");
  const checkOutTime = String(context?.check_out_time || "");

  if (!validDate(checkIn) || !validDate(checkOut) ||
      !validTime(checkInTime) || !validTime(checkOutTime)) {
    return { valid: false, reason: "INVALID_DATE_TIME" };
  }
  if (!validDate(todayInManila)) {
    // Fail closed when the system cannot establish a reliable resort date.
    return { valid: false, reason: "RESORT_DATE_UNAVAILABLE" };
  }
  if (checkIn < todayInManila || checkOut < todayInManila) {
    return { valid: false, reason: "PAST_DATE" };
  }
  if (checkOut < checkIn ||
      (checkOut === checkIn && checkOutTime <= checkInTime)) {
    return { valid: false, reason: "INVALID_ORDER" };
  }
  return { valid: true, reason: null };
}

// The day distance must use calendar days rather than the hosting machine's
// timezone or daylight-saving rules. Same-day stays count as one stay day.
function calendarDayDifference(checkIn, checkOut) {
  if (!validDate(checkIn) || !validDate(checkOut)) return NaN;
  const millis = date => Date.UTC(
    Number(date.slice(0,4)),
    Number(date.slice(5,7)) - 1,
    Number(date.slice(8,10)),
  );
  return Math.round((millis(checkOut) - millis(checkIn)) / 86400000);
}

function addCalendarDays(date, days) {
  if (!validDate(date) || !Number.isSafeInteger(days)) return null;
  const day = new Date(Date.UTC(
    Number(date.slice(0,4)), Number(date.slice(5,7)) - 1,
    Number(date.slice(8,10)) + days,
  ));
  // Avoid silently returning an invalid date outside 2000–9999.
  const result = day.toISOString().slice(0, 10);
  return validDate(result) ? result : null;
}

module.exports = {
  validDate, validTime, validateAiStayWindow,
  calendarDayDifference, addCalendarDays,
};
