// Read-only operational Manager Reports. All financial statements, paid
// charges and revenue data are Admin-only. No guest PII is returned.
const db = require("../../config/db");

const MAX_DAYS = 366;

// Accept only a valid YYYY-MM-DD report date, independent of DB timezone.
function parseDay(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  if (Number(value.slice(0, 4)) < 2000 || Number(value.slice(0, 4)) > 2099) return null;
  const d = new Date(value + "T00:00:00.000Z");
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== value) return null;
  return d;
}
function dayText(d) {
  return d.toISOString().slice(0, 10);
}
function addDay(d, amount) {
  return new Date(d.getTime() + amount * 86400000);
}
// Date defaults align with the resort's Asia/Manila operating calendar.
function phpToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return values.year + "-" + values.month + "-" + values.day;
}
function count(value) {
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 0 ? n : 0;
}

// Aggregates only: one inclusive creation-date range for operational counts.
// Read-only MySQL expressions must match their GROUP BY under ONLY_FULL_GROUP_BY.
// Limit requested dates and exclude financial and personal guest data.
exports.getManagerReports = async (req, res) => {
  const today = parseDay(phpToday());
  const requestedTo = req.query.to === undefined ? dayText(today) : req.query.to;
  const to = parseDay(requestedTo);
  const requestedFrom = req.query.from === undefined
    ? dayText(addDay(today, -29)) : req.query.from;
  const from = parseDay(requestedFrom);
  if (!from || !to || from > to) {
    return res.status(400).json({
      success: false, code: "INVALID_REPORT_DATES",
      message: "Provide valid From and To dates (YYYY-MM-DD) in chronological order.",
    });
  }
  const days = Math.round((to - from) / 86400000) + 1;
  if (days > MAX_DAYS) {
    return res.status(400).json({
      success: false, code: "REPORT_RANGE_TOO_LARGE",
      message: "Manager report range must be 366 days or less.",
    });
  }
  const toExclusive = dayText(addDay(to, 1));
  const dates = [dayText(from), toExclusive];
  try {
    const [summaries] = await db.promise().query(
      "SELECT COUNT(*) AS total_reservations, " +
      "COALESCE(SUM(CASE WHEN reservation_status = 'pending' THEN 1 ELSE 0 END),0) AS pending, " +
      "COALESCE(SUM(CASE WHEN reservation_status = 'approved' THEN 1 ELSE 0 END),0) AS approved, " +
      "COALESCE(SUM(CASE WHEN reservation_status = 'completed' THEN 1 ELSE 0 END),0) AS completed, " +
      "COALESCE(SUM(CASE WHEN reservation_status = 'cancelled' THEN 1 ELSE 0 END),0) AS cancelled, " +
      "COALESCE(SUM(CASE WHEN reservation_status = 'rejected' THEN 1 ELSE 0 END),0) AS rejected, " +
      "COALESCE(SUM(CASE WHEN LOWER(booking_source) = 'online' THEN 1 ELSE 0 END),0) AS online, " +
      "COALESCE(SUM(CASE WHEN LOWER(booking_source) = 'manual' THEN 1 ELSE 0 END),0) AS manual_reservations, " +
      "COALESCE(SUM(COALESCE(guest_count,0)),0) AS booked_guests " +
      "FROM reservations WHERE created_at >= ? AND created_at < ?",
      dates,
    );
    const [trendRows] = await db.promise().query(
      "SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS date, COUNT(*) AS reservations, " +
      "COALESCE(SUM(COALESCE(guest_count,0)),0) AS booked_guests " +
      "FROM reservations WHERE created_at >= ? AND created_at < ? " +
      "GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') " +
      "ORDER BY DATE_FORMAT(created_at, '%Y-%m-%d') ASC",
      dates,
    );
    const [accommodationRows] = await db.promise().query(
      "SELECT a.id AS accommodation_id, a.name AS accommodation_name, " +
      "c.name AS category_name, COUNT(ri.id) AS booked_items, " +
      "COUNT(DISTINCT r.id) AS reservations " +
      "FROM reservations r " +
      "INNER JOIN reservation_items ri ON ri.reservation_id = r.id " +
      "INNER JOIN accommodations a ON a.id = ri.accommodation_id " +
      "INNER JOIN accommodation_categories c ON c.id = a.category_id " +
      "WHERE r.created_at >= ? AND r.created_at < ? " +
      "AND r.reservation_status NOT IN ('cancelled','rejected') " +
      "GROUP BY a.id, a.name, c.name " +
      "ORDER BY booked_items DESC, accommodation_name ASC LIMIT 12",
      dates,
    );
    const s = summaries[0] || {};
    return res.status(200).json({
      success: true,
      period: { from: dayText(from), to: dayText(to), days },
      summary: {
        total_reservations: count(s.total_reservations),
        pending: count(s.pending), approved: count(s.approved),
        completed: count(s.completed), cancelled: count(s.cancelled),
        rejected: count(s.rejected), online: count(s.online),
        manual: count(s.manual_reservations), booked_guests: count(s.booked_guests),
      },
      trends: trendRows.map(row => ({
        date: row.date instanceof Date ? dayText(row.date) : String(row.date).slice(0,10),
        reservations: count(row.reservations),
        booked_guests: count(row.booked_guests),
      })),
      accommodations: accommodationRows.map(row => ({
        id: Number(row.accommodation_id),
        name: String(row.accommodation_name || ""),
        category: String(row.category_name || ""),
        booked_items: count(row.booked_items),
        reservations: count(row.reservations),
      })),
      definitions: {
        reservation_period: "Reservations created during selected dates, not stays occurring during dates.",
        accommodation_performance: "Reservation-item counts for non-cancelled/non-rejected bookings created in range. Counts are not nights, actual occupancy or unique guests.",
      },
    });
  } catch (error) {
    console.error("Manager report failed:", error.message);
    return res.status(500).json({
      success: false, message: "Unable to load Manager reports.",
    });
  }
};
