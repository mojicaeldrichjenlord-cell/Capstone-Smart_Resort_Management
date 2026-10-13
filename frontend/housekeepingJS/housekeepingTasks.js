// Assigned turnover tasks. Distinct from schedule and never changes booking status.
document.addEventListener("DOMContentLoaded", () => {
  // Task access uses the same signed hk1 token as the daily schedule.
  const token = sessionStorage.getItem("housekeepingToken");
  if (!token || !/^hk1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) return;
  const tbody = document.getElementById("hkTaskRows");
  const status = document.getElementById("hkTaskStatus");
  const date = document.getElementById("hkDate");
  const refreshButton = document.getElementById("hkRefreshTasks");
  let busy = false;
  // Revoked or expired session: clear local auth and return to the login page.
  function signOut() {
    sessionStorage.removeItem("housekeepingToken");
    localStorage.removeItem("user");
    window.location.replace("../authHTML/login.html");
  }
  // Every GET/PUT request is authorized server-side, not by this UI alone.
  async function request(path, options = {}) {
    const response = await fetch(API_BASE + "/housekeeping/" + path, {
      ...options, cache: "no-store",
      headers: {
        Authorization: "Bearer " + token,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (response.status === 401 || response.status === 403) {
      signOut();
      throw new Error("Housekeeping access expired.");
    }
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Housekeeping task unavailable.");
    }
    return data;
  }
  // Display all database values as plain text, never as executable HTML.
  function cell(tr, text) {
    const el = document.createElement("td");
    el.textContent = String(text ?? "—");
    tr.appendChild(el);
    return el;
  }
  // Color is a visual hint; text status remains available for accessibility.
  function statusBadge(tr, value) {
    const td = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "hk-pill";
    badge.textContent = String(value || "").replace(/_/g, " ");
    badge.dataset.status = value;
    td.appendChild(badge);
    tr.appendChild(td);
  }
  // The available button depends on task status: Start, then Mark Cleaned.
  // Only the Manager may perform the later Verify Ready action.
  function draw(tasks) {
    tbody.replaceChildren();
    if (!tasks.length) {
      const tr = document.createElement("tr");
      cell(tr, "No assigned tasks for this date or overdue backlog.").colSpan = 5;
      tbody.appendChild(tr);
    }
    for (const task of tasks) {
      const tr = document.createElement("tr");
      cell(tr, task.accommodation);
      cell(tr, task.reservation_code);
      cell(tr, task.task_date);
      statusBadge(tr, task.status);
      const action = cell(tr, "");
      let endpoint, label;
      if (task.status === "needs_cleaning") {
        endpoint = "start"; label = "Start Cleaning";
      } else if (task.status === "in_progress") {
        endpoint = "cleaned"; label = "Mark Cleaned";
      }
      if (endpoint) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "hk-action";
        button.textContent = label;
        button.setAttribute("aria-label", label + " " + task.accommodation);
        // Confirm, submit current version, and refresh to show conflicts or success.
        button.addEventListener("click", async () => {
          if (busy || !window.confirm(label + " for " + task.accommodation + "?")) return;
          busy = true;
          status.textContent = "Updating assigned task…";
          let feedback = "";
          try {
            const result = await request("tasks/" + task.id + "/" + endpoint, {
              method: "PUT", body: JSON.stringify({ version: task.version }),
            });
            feedback = result.message;
          } catch (error) {
            feedback = error.message;
          } finally {
            busy = false;
            await refresh(feedback);
          }
        });
        action.appendChild(button);
      } else {
        action.textContent = task.status === "cleaned" ?
          "Awaiting Manager review" : "Manager verified";
      }
      tbody.appendChild(tr);
    }
  }
  // Refresh includes this staff member's outstanding older tasks as well.
  async function refresh(feedback = "") {
    if (busy) return;
    busy = true;
    status.textContent = "Loading assigned cleaning tasks…";
    refreshButton.disabled = true;
    try {
      const tasks = await request("tasks?date=" + encodeURIComponent(date.value));
      draw(tasks.tasks || []);
      status.textContent = (feedback ? feedback + " " : "") +
        "Showing " + (tasks.tasks || []).length + " assigned task(s), including open backlog.";
    } catch (error) {
      status.textContent = (feedback ? feedback + " " : "") + error.message;
    } finally {
      busy = false;
      refreshButton.disabled = false;
    }
  }
  refreshButton.addEventListener("click", () => refresh());
  document.getElementById("hkScheduleFilters")?.addEventListener("submit", () => refresh());
  refresh();
});