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
  const statusFilter = document.getElementById("hkManagerStatusFilter");
  const proofDialog = document.getElementById("hkManagerProofDialog");
  const proofImage = document.getElementById("hkProofImage");
  const proofTitle = document.getElementById("hkProofTitle");
  const proofMessage = document.getElementById("hkProofMessage");
  const verifyProof = document.getElementById("hkProofVerifyBtn");
  let staff = [];
  let taskRows = [];
  let proofSetupRequired = false;
  let selectedTask = null;
  let proofBlobUrl = null;
  let busy = false;

  // Disable task actions while the browser waits for a response.
  // The backend remains the source of truth for task permissions.
  function setBusy(next) {
    busy = next;
    dayInput.disabled = next;
    eligible.disabled = next;
    staffSelect.disabled = next;
    for (const control of [
      filter.querySelector('button[type="submit"]'),
      createForm.querySelector('button[type="submit"]'),
      ...tbody.querySelectorAll("button, select"),
    ]) {
      if (control) control.disabled = next;
    }
    verifyProof.disabled = next || proofImage.hidden || !selectedTask;
    message.setAttribute("aria-busy", String(next));
  }

  // Invalid role/session: stop accessing this Manager-only screen.
  function signOut(event) {
    if (event?.type === "click") window.ArvicAccountSession.signOut();
    else window.ArvicAccountSession.endTab();
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
  function td(tr, value, label = "") {
    const cell = document.createElement("td");
    cell.dataset.label = label;
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
    const chosen = statusFilter.value;
    const visible = chosen === "all" ? rows : rows.filter(task => task.status === chosen);
    tbody.replaceChildren();
    if (!visible.length) {
      const tr = document.createElement("tr");
      td(tr, rows.length ? "No tasks match the selected status." :
        "No cleaning tasks for this checkout date.").colSpan = 6;
      tbody.appendChild(tr);
    }
    for (const task of visible) {
      const tr = document.createElement("tr");
      tr.dataset.status = task.status;
      td(tr, task.accommodation, "Accommodation");
      td(tr, task.reservation_code, "Reservation");
      td(tr, task.task_date, "Checkout Date");
      const assigned = td(tr, task.assigned_name, "Assigned Staff");
      const status = td(tr, "", "Cleaning Status");
      const badge = document.createElement("span");
      badge.className = "manager-status-pill";
      badge.dataset.status = task.status;
      badge.textContent = String(task.status || "").replace(/_/g, " ");
      status.appendChild(badge);
      const actions = td(tr, "", "Actions");
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
        if (task.has_proof) {
          const view = document.createElement("button");
          view.type = "button"; view.className = "hk-proof-view";
          view.textContent = "View Proof & Verify";
          view.setAttribute("aria-label", "View cleaning photo proof for " + task.accommodation);
          view.addEventListener("click", () => openProof(task));
          controls.appendChild(view);
        } else {
          const pending = document.createElement("span");
          pending.className = "hk-proof-pending";
          pending.textContent = proofSetupRequired
            ? "Photo verification pending database setup"
            : "Legacy task: photo needed";
          controls.appendChild(pending);
          const returnButton = document.createElement("button");
          returnButton.type = "button"; returnButton.className = "manager-inventory-edit";
          returnButton.disabled = proofSetupRequired;
          returnButton.textContent = "Request Photo";
          returnButton.addEventListener("click", () => perform(
            "tasks/" + task.id + "/request-proof", {version:task.version},
            "Return " + task.accommodation + " to the assigned Housekeeping staff for photo proof?"));
          controls.appendChild(returnButton);
        }
      } else {
        controls.textContent = task.status === "verified_ready" ?
          "Verified" : "Awaiting staff";
      }
      actions.appendChild(controls);
      tbody.appendChild(tr);
    }
  }
  // Proof bytes are fetched with the signed Manager token, never in an
  // unauthenticated <img src> or public accommodation-gallery link.
  function releaseProof() {
    if (proofBlobUrl) URL.revokeObjectURL(proofBlobUrl);
    proofBlobUrl = null;
    proofImage.removeAttribute("src");
    proofImage.hidden = true;
    verifyProof.disabled = true;
    selectedTask = null;
  }
  function closeProof() {
    if (proofDialog.open) proofDialog.close();
    releaseProof();
  }
  document.getElementById("hkProofClose").addEventListener("click", closeProof);
  document.getElementById("hkProofCancelBtn").addEventListener("click", closeProof);
  proofDialog.addEventListener("close", releaseProof);

  async function openProof(task) {
    if (busy || !task?.has_proof) return;
    releaseProof();
    selectedTask = task;
    proofTitle.textContent = "Cleaning Proof: " + task.accommodation;
    proofMessage.textContent = "Loading protected cleaning photo…";
    proofDialog.showModal();
    setBusy(true);
    try {
      const result = await fetch(API_BASE + "/manager/housekeeping/tasks/" +
        encodeURIComponent(task.id) + "/proof", {
        cache: "no-store", headers: {Authorization:"Bearer " + token},
      });
      if (result.status === 401 || result.status === 403) {
        signOut(); throw new Error("Manager session expired.");
      }
      if (!result.ok) {
        const error = await result.json().catch(() => ({}));
        throw new Error(error.message || "Could not load cleaning photo.");
      }
      const blob = await result.blob();
      if (selectedTask?.id !== task.id || !proofDialog.open) return;
      if (!["image/jpeg","image/png","image/webp"].includes(blob.type)) {
        throw new Error("The cleaning proof is not a supported image.");
      }
      proofBlobUrl = URL.createObjectURL(blob);
      proofImage.alt = "Housekeeping cleaning photo for " + task.accommodation;
      proofImage.onload = () => {
        if (selectedTask?.id !== task.id) return;
        proofImage.hidden = false;
        verifyProof.disabled = busy;
        proofMessage.textContent = "Inspect the entire photo, then verify only if the accommodation is clean.";
      };
      proofImage.onerror = () => {
        verifyProof.disabled = true;
        proofMessage.textContent = "The photo could not be displayed. Verification is disabled.";
      };
      proofImage.src = proofBlobUrl;
    } catch(error) {
      proofMessage.textContent = error.message;
      verifyProof.disabled = true;
    } finally { setBusy(false); }
  }

  verifyProof.addEventListener("click", async () => {
    const task = selectedTask;
    if (!task || busy || proofImage.hidden ||
        !window.confirm("Have you checked the cleaning photo for " +
          task.accommodation + "? Confirm Verify Ready only if clean. " +
          "This will NOT change booking availability.")) return;
    setBusy(true);
    verifyProof.disabled = true;
    proofMessage.textContent = "Saving your photo review and Manager verification…";
    try {
      await request("tasks/" + task.id + "/proof/review", {
        method:"POST", body:JSON.stringify({version:task.version}),
      });
      const verified = await request("tasks/" + task.id + "/verify", {
        method:"PUT", body:JSON.stringify({version:task.version}),
      });
      closeProof();
      setBusy(false);
      await refresh(verified.message);
    } catch(error) {
      proofMessage.textContent = error.message +
        " Refresh the task before retrying.";
      setBusy(false);
    }
  });

  // Fetch staff, eligible completed checkouts, and existing tasks together.
  // Always rebuild dropdowns from fresh DB results after an update.
  async function refresh(feedback = "") {
    if (busy) return;
    setBusy(true);
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
      taskRows = tasks;
      proofSetupRequired = Boolean(response[2].proof_setup_required);
      for (const [element, field] of [
        ["hkCountNeeds", "needs_cleaning"],
        ["hkCountProgress", "in_progress"],
        ["hkCountReview", "cleaned"],
        ["hkCountVerified", "verified_ready"],
      ]) {
        document.getElementById(element).textContent =
          String(tasks.filter(item => item.status === field).length);
      }
      drawTasks(tasks);
      message.textContent = (feedback ? feedback + " " : "") +
        "Showing " + tasks.length + " task(s) on " + date +
        ". Eligible completed checkout items: " + (response[1].items || []).length + "." +
        (proofSetupRequired
          ? " Photo proof review is paused until the approved cleaning-proof database migration is applied."
          : "");
    } catch (error) {
      message.textContent = (feedback ? feedback + " " : "") +
        error.message + " If migration is pending, the cleaning task module is not active yet.";
    } finally {
      setBusy(false);
    }
  }
  // Version check stops one Manager action overwriting another's update.
  async function perform(path, body, confirmation) {
    if (busy || !window.confirm(confirmation)) return;
    setBusy(true);
    message.textContent = "Saving Housekeeping task…";
    let feedback = "";
    try {
      const result = await request(path, { method: "PUT", body: JSON.stringify(body) });
      feedback = result.message;
    } catch (error) {
      feedback = error.message;
    } finally {
      setBusy(false);
      await refresh(feedback);
    }
  }
  statusFilter.addEventListener("change", () => drawTasks(taskRows));
  filter.addEventListener("submit", event => {
    event.preventDefault(); refresh();
  });
  // Task creation never edits the reservation or accommodation booking status.
  createForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy || !createForm.reportValidity()) return;
    if (!window.confirm("Assign cleaning for this completed checkout? Booking availability will not change.")) return;
    setBusy(true);
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
      setBusy(false);
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