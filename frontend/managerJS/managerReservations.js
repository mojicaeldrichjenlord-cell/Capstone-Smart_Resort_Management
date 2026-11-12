// Manager reservation controls. The signed mgr1 token (not localStorage role)
// is verified on every backend request; UI actions are only a convenience.
document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("managerToken");
  const status = document.getElementById("managerReservationStatus");
  const tbody = document.getElementById("managerReservationsBody");
  const form = document.getElementById("reservationFilters");
  const search = document.getElementById("managerSearch");
  const filter = document.getElementById("managerStatusFilter");

  // Signed Manager session is distinct from Admin and Housekeeping sessions.
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
  // Attach mgr1 bearer token and show useful errors from the API.
  async function request(path, options = {}) {
    const response = await fetch(API_BASE + "/manager/" + path, {
      ...options,
      cache: "no-store",
      headers: {
        Authorization: "Bearer " + token,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (response.status === 401 || response.status === 403) {
      signOut();
      throw new Error("Manager access was denied.");
    }
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "The operation could not be completed.");
    }
    return data;
  }

  // Render all names and codes as plain text to avoid HTML injection.
  function cell(tr, text) {
    const td = document.createElement("td");
    td.textContent = String(text ?? "—");
    tr.appendChild(td);
    return td;
  }
  // Display stable Philippine booking dates in a human-readable format.
  function datePart(value) {
    if (!value) return "—";
    const text = String(value);
    const iso = /^\d{4}-\d{2}-\d{2}/.exec(text);
    const parsed = iso ? new Date(iso[0] + "T12:00:00Z") : new Date(value);
    return Number.isNaN(parsed.getTime()) ? "—" :
      new Intl.DateTimeFormat("en-US", {
        month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
      }).format(parsed);
  }
  // Color-coded pills retain a readable status label for accessibility.
  function statusCell(tr, value) {
    const td = document.createElement("td");
    const badge = document.createElement("span");
    const state = String(value || "unknown").trim().toLowerCase();
    badge.className = "manager-status-pill";
    badge.dataset.status = state;
    badge.textContent = state.replace(/_/g, " ");
    td.appendChild(badge);
    tr.appendChild(td);
    return td;
  }
  function timePart(value) {
    return value ? String(value).slice(0, 5) : "";
  }

  let busy = false;
  // Re-fetch up to the server-defined limit using selected search/status filters.
  async function loadReservations() {
    if (busy) return;
    busy = true;
    if (status) status.textContent = "Loading Manager reservations…";
    try {
      const params = new URLSearchParams({
        status: filter?.value || "all",
        search: (search?.value || "").trim(),
      });
      const data = await request("reservations?" + params);
      tbody.replaceChildren();
      const rows = Array.isArray(data.reservations) ? data.reservations : [];
      if (!rows.length) {
        const tr = document.createElement("tr");
        const td = cell(tr, "No matching reservations.");
        td.colSpan = 9;
        tbody.appendChild(tr);
      }
      for (const reservation of rows) {
        const tr = document.createElement("tr");
        cell(tr, reservation.reservation_code || "#" + reservation.id);
        cell(tr, reservation.guest_name || "—");
        cell(tr, reservation.accommodation || "—");
        cell(tr,
          datePart(reservation.check_in_date) + " " + timePart(reservation.check_in_time) +
          " → " + datePart(reservation.check_out_date) + " " +
          timePart(reservation.check_out_time));
        cell(tr, reservation.guests);
        cell(tr, reservation.booking_source || "—");
        statusCell(tr, reservation.payment_status);
        statusCell(tr, reservation.status);

        const action = document.createElement("td");
        const buttons = document.createElement("div");
        buttons.className = "manager-row-actions";
        action.appendChild(buttons);
        const pending = String(reservation.status).toLowerCase() === "pending" &&
          reservation.is_checked_in === false;
        if (pending) {
          for (const [label, nextStatus] of [
            ["Approve", "approved"], ["Reject", "rejected"],
          ]) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = nextStatus === "approved"
              ? "manager-approve" : "manager-reject";
            button.textContent = label;
            button.setAttribute("aria-label", label + " reservation " +
              (reservation.reservation_code || reservation.id));
            button.addEventListener("click", () =>
              reviewReservation(reservation, nextStatus));
            buttons.appendChild(button);
          }
        } else {
          buttons.textContent = "View only";
        }
        tr.appendChild(action);
        tbody.appendChild(tr);
      }
      if (status) status.textContent = rows.length +
        " reservation(s) shown. Results are refreshed from the database.";
    } catch (error) {
      if (status) status.textContent = error.message || "Unable to load reservations.";
    } finally {
      busy = false;
    }
  }

  // Confirm irreversible review action; backend enforces pending-only state.
  // Keep success/conflict feedback visible after the list refresh.
  async function reviewReservation(reservation, nextStatus) {
    if (busy) return;
    const actionName = nextStatus === "approved" ? "APPROVE" : "REJECT";
    const confirmation = "Are you sure you want to " + actionName +
      " reservation " + reservation.reservation_code + "?";
    if (!window.confirm(confirmation)) return;
    busy = true;
    let reviewFeedback = "";
    if (status) status.textContent = "Submitting " + nextStatus + " status…";
    try {
      await request("reservations/" + Number(reservation.id) + "/status", {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
      reviewFeedback = "Reservation " + (reservation.reservation_code || reservation.id) +
        " " + nextStatus + " successfully.";
    } catch (error) {
      reviewFeedback = error.message || "Unable to update reservation.";
    } finally {
      busy = false;
      await loadReservations();
      // Keep the review outcome visible even after the list refresh.
      if (status && reviewFeedback) {
        status.textContent = reviewFeedback + " " + status.textContent;
      }
    }
  }

  form?.addEventListener("submit", event => {
    event.preventDefault();
    loadReservations();
  });
  filter?.addEventListener("change", loadReservations);
  (async () => {
    try {
      await request("me");
      await loadReservations();
    } catch (error) {
      if (status) status.textContent = error.message || "Could not verify Manager access.";
    }
  })();
});
