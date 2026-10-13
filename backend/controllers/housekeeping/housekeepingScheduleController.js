// Housekeeping Phase 1: private, read-only DAILY accommodation schedule.
// No guest identity/contact, payment, room status mutations or cleaning claims.
// A booking marked "completed" is NOT proof that a room was cleaned.
const db = require("../../config/db");

// Normalize the server's current date to Asia/Manila regardless of hosting timezone.
function manilaToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(item => [item.type, item.value]));
  return values.year + "-" + values.month + "-" + values.day;
}
// Validate YYYY-MM-DD exactly (e.g. reject impossible dates like February 30).
function parseISODate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  if (Number(value.slice(0, 4)) < 2000 || Number(value.slice(0, 4)) > 2099) return null;
  const date = new Date(value + "T00:00:00.000Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? date : null;
}
function safeCount(value) {
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 0 ? n : 0;
}
// Convert MySQL date values to stable ISO dates for the frontend.
function dayText(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value || "").slice(0, 10);
}
function timeText(value) {
  return String(value || "").slice(0, 5);
}

// Use the already authenticated account, never an ID supplied by the browser.
exports.getHousekeepingMe = (req, res) => res.status(200).json({
  success: true,
  user: {
    id: req.housekeepingUser.id, role: "housekeeping",
    fullname: req.housekeepingUser.fullname,
    email: req.housekeepingUser.email,
  },
});

// Read-only booking schedule; it is NOT evidence of completed cleaning.
// Query only approved/completed reservation items for the selected date.
exports.getDailyHousekeepingSchedule = async (req, res) => {
  const day = req.query.date === undefined ? manilaToday() : req.query.date;
  const chosenDate = parseISODate(day);
  const currentDate = parseISODate(manilaToday());
  if (!chosenDate ||
      Math.abs(chosenDate.getTime() - currentDate.getTime()) > 366 * 86400000) {
    return res.status(400).json({
      success: false, code: "INVALID_HOUSEKEEPING_DATE",
      message: "Select a valid schedule date within one year of today.",
    });
  }
  try {
    const [rows] = await db.promise().query(
      "SELECT ri.id AS item_id, r.reservation_code, r.reservation_status, " +
      "COALESCE(r.is_checked_in,0) AS is_checked_in, " +
      "a.id AS accommodation_id, a.name AS accommodation_name, " +
      "c.name AS category_name, ri.slot_type, " +
      "DATE_FORMAT(ri.check_in_date,'%Y-%m-%d') AS check_in_date, " +
      "TIME_FORMAT(ri.check_in_time,'%H:%i') AS check_in_time, " +
      "DATE_FORMAT(ri.check_out_date,'%Y-%m-%d') AS check_out_date, " +
      "TIME_FORMAT(ri.check_out_time,'%H:%i') AS check_out_time " +
      "FROM reservation_items ri " +
      "INNER JOIN reservations r ON r.id = ri.reservation_id " +
      "INNER JOIN accommodations a ON a.id = ri.accommodation_id " +
      "LEFT JOIN accommodation_categories c ON c.id = a.category_id " +
      "WHERE r.reservation_status IN ('approved','completed') " +
      "AND ri.check_in_date <= ? AND ri.check_out_date >= ? " +
      "ORDER BY ri.check_in_date, ri.check_in_time, a.name, ri.id LIMIT 300",
      [day, day],
    );
    // Summary metrics count reservation ITEMS, not distinct rooms or guests.
    const summary = {
      scheduled_items: 0, arriving_today: 0, departing_today: 0,
      checked_in_items: 0, completed_items: 0,
    };
    // Whitelist returned fields: no guest names, payment proofs, or contacts.
    const items = rows.map(row => {
      const checkIn = dayText(row.check_in_date);
      const checkOut = dayText(row.check_out_date);
      const arrival = checkIn === day;
      const departure = checkOut === day;
      const completed = String(row.reservation_status).toLowerCase() === "completed";
      const checkedIn = !completed && Number(row.is_checked_in) === 1;
      summary.scheduled_items++;
      if (arrival) summary.arriving_today++;
      if (departure) summary.departing_today++;
      if (checkedIn) summary.checked_in_items++;
      if (completed) summary.completed_items++;
      return {
        item_id: Number(row.item_id),
        reservation_code: String(row.reservation_code || ""),
        accommodation_id: Number(row.accommodation_id),
        accommodation: String(row.accommodation_name || ""),
        category: String(row.category_name || ""),
        stay_type: String(row.slot_type || ""),
        check_in_date: checkIn,
        check_in_time: timeText(row.check_in_time),
        check_out_date: checkOut,
        check_out_time: timeText(row.check_out_time),
        reservation_status: completed ? "completed" : "approved",
        checked_in: checkedIn,
        arriving_today: arrival,
        departing_today: departure,
      };
    });
    return res.status(200).json({
      success: true, date: day, summary, items, limit: 300,
      notes: {
        status: "Schedule is based on approved/completed reservation items. Physical cleaning and room-ready tasks are managed in a separate module.",
        occupancy: "Checked-in indicates reservation check-in flag, not verified physical presence for every accommodation.",
        privacy: "Guest identity, phone, payment and internal guest notes are never returned.",
      },
    });
  } catch (error) {
    console.error("Housekeeping daily schedule failed:", error.message);
    return res.status(500).json({
      success: false, message: "Unable to load Housekeeping daily schedule.",
    });
  }
};
