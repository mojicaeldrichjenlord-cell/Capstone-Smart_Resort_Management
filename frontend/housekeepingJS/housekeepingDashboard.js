// Housekeeping Phase 1: no localStorage role authorization.
// All schedule data requires signed hk1 token and live DB role verification.
document.addEventListener("DOMContentLoaded", () => {
  // A visible browser page is not authorization: every backend request checks hk1.
  const token = sessionStorage.getItem("housekeepingToken");
  const status = document.getElementById("hkStatus");
  const date = document.getElementById("hkDate");
  const body = document.getElementById("hkScheduleBody");
  const form = document.getElementById("hkScheduleFilters");
  const accountName = document.getElementById("accountName");
  const accountEmail = document.getElementById("accountEmail");
  let loading = false;

  // Remove the signed token so the next page load must authenticate again.
  function signOut() {
    sessionStorage.removeItem("housekeepingToken");
    localStorage.removeItem("user");
    window.location.replace("../authHTML/login.html");
  }
  document.getElementById("logoutBtn")?.addEventListener("click", signOut);
  if (!token || !/^hk1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
    signOut();
    return;
  }

  // Resort dates use the Philippine timezone even if the PC timezone differs.
  function todayManila() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return values.year + "-" + values.month + "-" + values.day;
  }
  const today = todayManila();
  date.value = today;
  const start = new Date(today + "T00:00:00.000Z");
  const min = new Date(start), max = new Date(start);
  min.setUTCDate(min.getUTCDate() - 366);
  max.setUTCDate(max.getUTCDate() + 366);
  date.min = min.toISOString().slice(0, 10);
  date.max = max.toISOString().slice(0, 10);

  // Central GET helper: attach signed auth and redirect if the session expires.
  async function request(path) {
    const response = await fetch(API_BASE + "/housekeeping/" + path, {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });
    if (response.status === 401 || response.status === 403) {
      signOut();
      throw new Error("Your Housekeeping account is no longer authorized.");
    }
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load Housekeeping information.");
    }
    return data;
  }

  // Small DOM helpers use textContent to prevent HTML/script injection.
  const field = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value ?? "—");
  };
  function cell(row, value) {
    const element = document.createElement("td");
    element.textContent = String(value ?? "—");
    row.appendChild(element);
    return element;
  }
  function dateTime(dateValue, timeValue) {
    return (dateValue || "—") + " " + (timeValue || "");
  }
  function pill(row, value, className) {
    const element = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "hk-pill " + className;
    badge.textContent = value;
    element.appendChild(badge);
    row.appendChild(element);
  }
  // Checked-in/arrival/departure labels describe booking activity, NOT cleaning.
  function scheduleLabel(item) {
    if (item.checked_in) return "Checked in";
    if (item.departing_today && item.arriving_today) return "Arrival / Departure";
    if (item.departing_today) return "Departing";
    if (item.arriving_today) return "Arriving";
    return "Scheduled stay";
  }
  // Rebuild the schedule rows from fresh backend data, never from localStorage.
  function draw(data) {
    const summary = data.summary || {};
    field("hkScheduled", summary.scheduled_items ?? 0);
    field("hkArrivals", summary.arriving_today ?? 0);
    field("hkDepartures", summary.departing_today ?? 0);
    field("hkCheckedIn", summary.checked_in_items ?? 0);
    field("hkCompleted", summary.completed_items ?? 0);
    body.replaceChildren();
    const items = Array.isArray(data.items) ? data.items : [];
    if (!items.length) {
      const row = document.createElement("tr");
      cell(row, "No approved or completed bookings scheduled for this date.").colSpan = 8;
      body.appendChild(row);
    } else {
      for (const item of items) {
        const row = document.createElement("tr");
        cell(row, item.accommodation);
        cell(row, item.category);
        cell(row, item.reservation_code);
        cell(row, String(item.stay_type || "").replace(/_/g, " "));
        cell(row, dateTime(item.check_in_date, item.check_in_time));
        cell(row, dateTime(item.check_out_date, item.check_out_time));
        pill(row, scheduleLabel(item), item.checked_in ? "hk-occupied" :
          item.departing_today ? "hk-departure" : "hk-arrival");
        pill(row, item.reservation_status || "—", "hk-booking");
        body.appendChild(row);
      }
    }
    status.textContent = "Showing " + items.length + " schedule item(s) for " +
      data.date + ". Last refreshed at " +
      new Date().toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" }) + ".";
  }
  // Prevent overlapping requests when Refresh is pressed repeatedly.
  async function loadSchedule() {
    if (loading) return;
    loading = true;
    status.textContent = "Loading Housekeeping schedule…";
    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    try {
      const chosen = date.value;
      const data = await request("daily-schedule?date=" + encodeURIComponent(chosen));
      draw(data);
    } catch (error) {
      status.textContent = error.message || "Unable to load schedule.";
    } finally {
      loading = false;
      if (button) button.disabled = false;
    }
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    loadSchedule();
  });
  // Verify current staff profile before displaying their accommodation schedule.
  (async () => {
    try {
      const me = await request("me");
      accountName.textContent = me.user?.fullname || "Housekeeping Staff";
      accountEmail.textContent = me.user?.email || "—";
      await loadSchedule();
    } catch (error) {
      status.textContent = error.message || "Unable to verify Housekeeping session.";
    }
  })();
});
