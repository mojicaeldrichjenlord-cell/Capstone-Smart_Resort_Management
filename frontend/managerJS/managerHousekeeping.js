// Manager-operated housekeeping task assignment and verification.
// All requests use mgr1 signed token; no Admin, reservation or payment writes.
document.addEventListener("DOMContentLoaded", () => {
  // Only an authenticated Manager can assign, reassign, or verify tasks.
  const token = sessionStorage.getItem("managerToken");
  const message = document.getElementById("hkManagerMessage");
  const dayInput = document.getElementById("hkManagerDate");
  const eligible = document.getElementById("hkEligibleItem");
  const staffSelect = document.getElementById("hkAssignee");
  const tbody = document.getElementById("hkManagerRows");
  const filter = document.getElementById("hkManagerFilter");
  const createForm = document.getElementById("hkCreateForm");
  let staff = [];
  let busy = false;

  // Invalid role/session: stop accessing this Manager-only screen.
  function signOut() {
    sessionStorage.removeItem("managerToken");
    localStorage.removeItem("user");
    window.location.replace("../authHTML/login.html");
  }
  document.getElementById("logoutBtn")?.addEventListener("click", signOut);
  if (!token || !/^mgr1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
    signOut(); return;
  }
  // Align date filters with the Aiven server's Asia/Manila calendar day.
  function manilaToday() {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date()).map(x => [x.type, x.value]));
    return p.year + "-" + p.month + "-" + p.day;
  }
  const today = manilaToday();
  dayInput.value = today;
  const current = new Date(today + "T00:00:00Z");
  const from = new Date(current), through = new Date(current);
  from.setUTCDate(from.getUTCDate() - 366);
  through.setUTCDate(through.getUTCDate() + 366);
  dayInput.min = from.toISOString().slice(0,10);
  dayInput.max = through.toISOString().slice(0,10);

  // Shared Manager task API helper with signed authorization and error handling.
  async function request(path, options = {}) {
    const response = await fetch(API_BASE + "/manager/housekeeping/" + path, {
      ...options,
      cache: "no-store",
      headers: {
        Authorization: "Bearer " + token,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (response.status === 401 || response.status === 403) {
      signOut();
      throw new Error("Manager access is no longer authorized.");
    }
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Housekeeping operation failed.");
    }
    return result;
  }
  // Always use textContent for names and reservation codes to avoid XSS.
  function td(tr, value) {
    const cell = document.createElement("td");
    cell.textContent = String(value ?? "—");
    tr.appendChild(cell);
    return cell;
  }
  // Dropdown options come from the authenticated API, not browser role flags.
  function option(text, value) {
    const el = document.createElement("option");
    el.textContent = text; el.value = String(value);
    return el;
  }
  // Reassignment is allowed only while the task is Needs Cleaning.
  function staffDropdown(selected) {
    const dropdown = document.createElement("select");
    dropdown.setAttribute("aria-label", "Assigned Housekeeping staff");
    for (const person of staff) {
      dropdown.appendChild(option(person.fullname, person.id));
    }
    dropdown.value = String(selected);
    return dropdown;
  }
  // Different statuses show different actions: Reassign, Verify, or read-only.
  function drawTasks(rows) {
    tbody.replaceChildren();
    if (!rows.length) {
      const tr = document.createElement("tr");
      td(tr, "No cleaning tasks for this checkout date.").colSpan = 6;
      tbody.appendChild(tr);
    }
    for (const task of rows) {
      const tr = document.createElement("tr");
      td(tr, task.accommodation);
      td(tr, task.reservation_code);
      td(tr, task.task_date);
      const assigned = td(tr, task.assigned_name);
      const status = td(tr, "");
      const badge = document.createElement("span");
      badge.className = "manager-status-pill";
      badge.dataset.status = task.status;
      badge.textContent = String(task.status || "").replace(/_/g, " ");
      status.appendChild(badge);
      const actions = td(tr, "");
      const controls = document.createElement("div");
      controls.className = "manager-row-actions";
      if (task.status === "needs_cleaning") {
        assigned.replaceChildren();
        const select = staffDropdown(task.assigned_to);
        assigned.appendChild(select);
        const assign = document.createElement("button");
        assign.type = "button"; assign.className = "manager-inventory-edit";
        assign.textContent = "Reassign";
        assign.setAttribute("aria-label", "Reassign " + task.accommodation);
        assign.addEventListener("click", () => perform(
          "tasks/" + task.id + "/assign",
          { assigned_to: Number(select.value), version: task.version },
          "Reassign cleaning task for " + task.accommodation + "?"));
        controls.appendChild(assign);
      } else if (task.status === "cleaned") {
        const verify = document.createElement("button");
        verify.type = "button"; verify.className = "manager-approve";
        verify.textContent = "Verify Ready";
        verify.setAttribute("aria-label", "Verify cleaned " + task.accommodation);
        verify.addEventListener("click", () => perform(
          "tasks/" + task.id + "/verify", { version: task.version },
          "Confirm physical cleaning inspection for " + task.accommodation +
          "? This does NOT change online booking availability."));
        controls.appendChild(verify);
      } else {
        controls.textContent = task.status === "verified_ready" ?
          "Verified" : "Awaiting staff";
      }
      actions.appendChild(controls);
      tbody.appendChild(tr);
    }
  }
  // Fetch staff, eligible completed checkouts, and existing tasks together.
  // Always rebuild dropdowns from fresh DB results after an update.
  async function refresh(feedback = "") {
    if (busy) return;
    busy = true;
    message.textContent = "Loading Housekeeping tasks…";
    try {
      const date = dayInput.value;
      const response = await Promise.all([
        request("staff"),
        request("eligible-items?date=" + encodeURIComponent(date)),
        request("tasks?date=" + encodeURIComponent(date)),
      ]);
      staff = response[0].staff || [];
      staffSelect.replaceChildren(option("Select an active staff member", ""));
      for (const person of staff) staffSelect.appendChild(option(person.fullname, person.id));
      eligible.replaceChildren(option("Select a completed checkout", ""));
      for (const item of response[1].items || []) {
        eligible.appendChild(option(
          item.reservation_code + " — " + item.accommodation, item.reservation_item_id));
      }
      const tasks = response[2].tasks || [];
      drawTasks(tasks);
      message.textContent = (feedback ? feedback + " " : "") +
        "Showing " + tasks.length + " task(s) on " + date +
        ". Eligible completed checkout items: " + (response[1].items || []).length + ".";
    } catch (error) {
      message.textContent = (feedback ? feedback + " " : "") +
        error.message + " If migration is pending, the cleaning task module is not active yet.";
    } finally {
      busy = false;
    }
  }
  // Version check stops one Manager action overwriting another's update.
  async function perform(path, body, confirmation) {
    if (busy || !window.confirm(confirmation)) return;
    busy = true;
    message.textContent = "Saving Housekeeping task…";
    let feedback = "";
    try {
      const result = await request(path, { method: "PUT", body: JSON.stringify(body) });
      feedback = result.message;
    } catch (error) {
      feedback = error.message;
    } finally {
      busy = false;
      await refresh(feedback);
    }
  }
  filter.addEventListener("submit", event => {
    event.preventDefault(); refresh();
  });
  // Task creation never edits the reservation or accommodation booking status.
  createForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy || !createForm.reportValidity()) return;
    if (!window.confirm("Assign cleaning for this completed checkout? Booking availability will not change.")) return;
    busy = true;
    message.textContent = "Creating turnover task…";
    let feedback = "";
    try {
      const result = await request("tasks", {
        method: "POST",
        body: JSON.stringify({
          reservation_item_id: Number(eligible.value),
          assigned_to: Number(staffSelect.value),
        }),
      });
      feedback = result.message;
    } catch (error) {
      feedback = error.message;
    } finally {
      busy = false;
      await refresh(feedback);
    }
  });
  // Check Manager identity first; the backend also enforces this on every route.
  (async () => {
    try {
      // Shared Manager session validation before task discovery.
      const response = await fetch(API_BASE + "/manager/me", {
        cache: "no-store",
        headers: { Authorization: "Bearer " + token },
      });
      if (response.status === 401 || response.status === 403) {
        signOut(); return;
      }
      if (!response.ok || !(await response.json()).success) {
        message.textContent = "Could not verify Manager account."; return;
      }
      await refresh();
    } catch (error) {
      message.textContent = error.message || "Could not load Housekeeping tasks.";
    }
  })();
});