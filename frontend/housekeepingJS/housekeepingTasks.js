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
  const previewUrls = new Set();
  // Disable visible actions while a request is running, avoiding repeated clicks.
  // The server still validates assignment, status and optimistic version.
  function setBusy(next) {
    busy = next;
    refreshButton.disabled = next;
    for (const control of tbody.querySelectorAll("button, input[type=file]")) control.disabled = next;
    status.setAttribute("aria-busy", String(next));
  }
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
        ...(options.body && !(options.body instanceof FormData)
          ? { "Content-Type": "application/json" } : {}),
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
  function cell(tr, text, label = "") {
    const el = document.createElement("td");
    el.dataset.label = label;
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
    td.dataset.label = "Cleaning Status";
    tr.appendChild(td);
  }
  // Large phone photos are optimized in-browser; server ALWAYS validates the
  // actual bytes again and caps uploads at 2 MB. Never store proofs on the
  // public page or Render's ephemeral filesystem.
  async function prepareProofImage(file) {
    const valid = ["image/jpeg", "image/png", "image/webp"].includes(file?.type);
    if (!valid) throw new Error("Select a JPEG, PNG or WebP cleaning photo.");
    if (file.size > 12 * 1024 * 1024) {
      throw new Error("Original photo is too large (12 MB maximum).");
    }
    if (file.size <= 2 * 1024 * 1024) return file;
    const image = await createImageBitmap(file);
    try {
      const ratio = Math.min(1, 1400 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      let blob = null;
      for (const quality of [0.8, 0.68, 0.55]) {
        blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
        if (blob && blob.size <= 2 * 1024 * 1024) break;
      }
      if (!blob || blob.size > 2 * 1024 * 1024) {
        throw new Error("Photo is still too large after resizing. Choose a smaller photo.");
      }
      return new File([blob], "cleaning-proof.jpg", { type:"image/jpeg" });
    } finally { image.close?.(); }
  }

  function proofUploadControls(task) {
    const wrap = document.createElement("div");
    wrap.className = "hk-proof-upload";
    const label = document.createElement("label");
    label.textContent = "Photo proof — " + task.accommodation;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    // Leave capture optional so phones can choose Camera OR Photo Library.
    input.setAttribute("aria-label", "Choose cleaning proof photo for " + task.accommodation);
    label.appendChild(input);
    wrap.appendChild(label);
    const guidance = document.createElement("span");
    guidance.className = "hk-proof-help";
    guidance.textContent = "Take a clear photo after cleaning. Camera images are resized automatically when needed.";
    wrap.appendChild(guidance);
    const img = document.createElement("img");
    img.className = "hk-proof-preview";
    img.hidden = true;
    img.alt = "Selected cleaning photo preview";
    wrap.appendChild(img);
    input.addEventListener("change", () => {
      if (img.dataset.url) {
        URL.revokeObjectURL(img.dataset.url);
        previewUrls.delete(img.dataset.url);
        delete img.dataset.url;
      }
      if (input.files?.length) {
        const url = URL.createObjectURL(input.files[0]);
        previewUrls.add(url);
        img.src = url; img.dataset.url = url; img.hidden = false;
      } else img.hidden = true;
    });
    const note = document.createElement("span");
    note.className = task.has_proof ? "hk-proof-submitted" : "hk-proof-help";
    note.textContent = task.has_proof ? "✓ Photo uploaded. You can replace it before Mark Cleaned."
      : "Photo required before Mark Cleaned.";
    wrap.appendChild(note);
    const uploadBtn = document.createElement("button");
    uploadBtn.type = "button"; uploadBtn.className = "hk-action";
    uploadBtn.textContent = task.has_proof ? "Replace Proof" : "Upload Proof";
    uploadBtn.addEventListener("click", async () => {
      if (busy || !input.files?.length) {
        note.textContent = "Choose a photo first."; return;
      }
      setBusy(true);
      note.textContent = "Preparing and uploading photo…";
      let feedback = "";
      try {
        const optimized = await prepareProofImage(input.files[0]);
        const data = new FormData();
        data.append("version", String(task.version));
        data.append("proof", optimized, optimized.name);
        const result = await request("tasks/" + task.id + "/proof", {
          method:"POST", body:data,
        });
        feedback = result.message;
      } catch(error) {
        feedback = error.message || "Photo upload failed.";
      } finally {
        setBusy(false);
        await refresh(feedback);
      }
    });
    wrap.appendChild(uploadBtn);
    return wrap;
  }
  // The available button depends on task status: Start, then Mark Cleaned.
  // Only the Manager may perform the later Verify Ready action.
  function draw(tasks) {
    for (const url of previewUrls) URL.revokeObjectURL(url);
    previewUrls.clear();
    tbody.replaceChildren();
    if (!tasks.length) {
      const tr = document.createElement("tr");
      cell(tr, "No assigned tasks for this date or overdue backlog.").colSpan = 5;
      tbody.appendChild(tr);
    }
    for (const task of tasks) {
      const tr = document.createElement("tr");
      cell(tr, task.accommodation, "Accommodation");
      cell(tr, task.reservation_code, "Reservation");
      cell(tr, task.task_date, "Checkout Date");
      statusBadge(tr, task.status);
      const action = cell(tr, "", "Next Action");
      action.classList.add("hk-task-action-cell");
      if (task.status === "in_progress") {
        action.appendChild(proofUploadControls(task));
      }
      let endpoint, label;
      if (task.status === "needs_cleaning") {
        endpoint = "start"; label = "Start Cleaning";
      } else if (task.status === "in_progress" && task.has_proof) {
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
          setBusy(true);
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
            setBusy(false);
            await refresh(feedback);
          }
        });
        action.appendChild(button);
      } else if (task.status === "in_progress") {
        const hint = document.createElement("span");
        hint.className = "hk-proof-error";
        hint.textContent = "Upload a photo before Mark Cleaned.";
        action.appendChild(hint);
      } else {
        action.textContent = task.status === "cleaned" ?
          "Photo submitted — awaiting Manager review" : "Manager verified";
      }
      tbody.appendChild(tr);
    }
  }
  // Refresh includes this staff member's outstanding older tasks as well.
  async function refresh(feedback = "") {
    if (busy) return;
    setBusy(true);
    status.textContent = "Loading assigned cleaning tasks…";
    try {
      const tasks = await request("tasks?date=" + encodeURIComponent(date.value));
      draw(tasks.tasks || []);
      status.textContent = (feedback ? feedback + " " : "") +
        "Showing " + (tasks.tasks || []).length + " assigned task(s), including open backlog.";
    } catch (error) {
      status.textContent = (feedback ? feedback + " " : "") + error.message;
    } finally {
      setBusy(false);
    }
  }
  refreshButton.addEventListener("click", () => refresh());
  document.getElementById("hkScheduleFilters")?.addEventListener("submit", () => refresh());
  refresh();
});