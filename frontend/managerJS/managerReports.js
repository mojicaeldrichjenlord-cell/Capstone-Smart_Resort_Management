// Manager Reports is read-only. The backend validates signed mgr1 credentials
// and report date ranges; neither the UI nor localStorage grants permissions.
document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("managerToken");
  const status = document.getElementById("managerReportStatus");
  const form = document.getElementById("managerReportFilters");
  const fromInput = document.getElementById("reportFrom");
  const toInput = document.getElementById("reportTo");
  const trend = document.getElementById("managerTrend");
  const table = document.getElementById("managerAccommodationReport");
  let loading = false;

  function signOut() {
    sessionStorage.removeItem("managerToken");
    localStorage.removeItem("user");
    window.location.replace("../authHTML/login.html");
  }
  document.getElementById("logoutBtn")?.addEventListener("click", signOut);
  if (!token || !/^mgr1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
    signOut();
    return;
  }
  function manilaDate() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila", day: "2-digit", month: "2-digit", year: "numeric",
    }).formatToParts(new Date());
    const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
    return p.year + "-" + p.month + "-" + p.day;
  }
  const currentDate = manilaDate();
  const start = new Date(currentDate + "T00:00:00Z");
  start.setUTCDate(start.getUTCDate() - 29);
  toInput.value = currentDate;
  fromInput.value = start.toISOString().slice(0, 10);

  async function request(path) {
    const response = await fetch(API_BASE + "/manager/" + path, {
      headers: { Authorization: "Bearer " + token }, cache: "no-store",
    });
    if (response.status === 401 || response.status === 403) {
      signOut();
      throw new Error("Manager access was denied.");
    }
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load report.");
    }
    return data;
  }
  const count = n => Number(n || 0).toLocaleString("en-PH", { maximumFractionDigits: 0 });
  const currency = n => "₱" + Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  function set(id, content) {
    const el = document.getElementById(id);
    if (el) el.textContent = content;
  }
  function cell(row, text) {
    const td = document.createElement("td");
    td.textContent = String(text ?? "—");
    row.appendChild(td);
    return td;
  }
  function renderSummary(data) {
    const s = data.summary || {};
    set("reportTotal", count(s.total_reservations));
    set("reportPendingApproved", count(s.pending) + " / " + count(s.approved));
    set("reportCompleted", count(s.completed));
    set("reportClosed", count(s.cancelled) + " / " + count(s.rejected));
    set("reportGuests", count(s.booked_guests));
    set("reportSources", count(s.online) + " / " + count(s.manual));
    set("reportBookedValue", currency(s.active_booked_accommodation_value));
    set("reportPayments", currency(s.recorded_accommodation_payments));
    set("reportCharges", currency(s.recorded_paid_charges));
  }
  function renderTrend(data) {
    trend.replaceChildren();
    const rows = Array.isArray(data.trends) ? data.trends : [];
    if (!rows.length) {
      trend.textContent = "No reservations created in this period.";
      return;
    }
    // Long ranges are grouped into consecutive 7-day blocks for readability.
    const weekly = data.period?.days > 45;
    const buckets = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (weekly) {
        const day = Date.parse(row.date + "T00:00:00Z");
        const origin = Date.parse(data.period.from + "T00:00:00Z");
        const group = Math.floor((day - origin) / (7 * 86400000));
        const existing = buckets.find(x => x.group === group);
        if (existing) {
          existing.total += Number(row.reservations || 0);
          existing.end = row.date;
        } else {
          buckets.push({ group, start: row.date, end: row.date, total: Number(row.reservations || 0) });
        }
      } else {
        buckets.push({ start: row.date, end: row.date, total: Number(row.reservations || 0) });
      }
    }
    const max = Math.max(1, ...buckets.map(x => x.total));
    for (const item of buckets) {
      const line = document.createElement("div");
      line.className = "manager-trend-row";
      const label = document.createElement("span");
      label.className = "manager-trend-label";
      label.textContent = item.start === item.end ? item.start
        : item.start + " → " + item.end;
      const track = document.createElement("div");
      track.className = "manager-trend-track";
      const bar = document.createElement("span");
      bar.className = "manager-trend-fill";
      bar.style.width = (item.total / max * 100) + "%";
      track.appendChild(bar);
      const total = document.createElement("strong");
      total.textContent = count(item.total);
      line.append(label, track, total);
      trend.appendChild(line);
    }
  }
  function renderAccommodations(data) {
    table.replaceChildren();
    const rooms = Array.isArray(data.accommodations) ? data.accommodations : [];
    if (!rooms.length) {
      const row = document.createElement("tr");
      cell(row, "No accommodation bookings recorded in this period.").colSpan = 4;
      table.appendChild(row);
    }
    for (const room of rooms) {
      const row = document.createElement("tr");
      cell(row, room.name);
      cell(row, room.category);
      cell(row, count(room.booked_items));
      cell(row, count(room.reservations));
      table.appendChild(row);
    }
  }
  async function loadReports() {
    if (loading) return;
    const from = fromInput.value, to = toInput.value;
    const first = new Date(from + "T00:00:00Z");
    const last = new Date(to + "T00:00:00Z");
    const days = (last - first) / 86400000 + 1;
    if (!from || !to || !Number.isFinite(days) || days < 1 || days > 366) {
      status.textContent = "Select a valid date range of 366 days or fewer.";
      return;
    }
    loading = true;
    status.textContent = "Loading read-only reservation report…";
    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    try {
      const query = new URLSearchParams({ from, to });
      const data = await request("reports?" + query.toString());
      renderSummary(data);
      renderTrend(data);
      renderAccommodations(data);
      status.textContent = "Report loaded for " + data.period.from +
        " to " + data.period.to + " (" + data.period.days + " day(s)).";
    } catch (error) {
      status.textContent = error.message || "Unable to load report.";
    } finally {
      loading = false;
      if (button) button.disabled = false;
    }
  }
  form.addEventListener("submit", e => {
    e.preventDefault();
    loadReports();
  });
  (async () => {
    try {
      await request("me");
      await loadReports();
    } catch (error) {
      status.textContent = error.message || "Unable to verify Manager session.";
    }
  })();
});