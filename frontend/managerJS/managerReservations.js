// Manager reservation controls. The signed mgr1 token (not localStorage role)
// is verified on every backend request; UI actions are only a convenience.
document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("managerToken");
  const status = document.getElementById("managerReservationStatus");
  const tbody = document.getElementById("managerReservationsBody");
  const form = document.getElementById("reservationFilters");
  const search = document.getElementById("managerSearch");
  const filter = document.getElementById("managerStatusFilter");

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

  function cell(tr, text) {
    const td = document.createElement("td");
    td.textContent = String(text ?? "—");
    tr.appendChild(td);
    return td;
  }
  function datePart(value) {
    if (!value) return "—";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.slice(0, 10);
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString("en-PH");
  }
  function timePart(value) {
    return value ? String(value).slice(0, 5) : "";
  }

  let busy = false;
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
        cell(tr, reservation.payment_status || "—");
        cell(tr, reservation.status || "—");

        const action = document.createElement("td");
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
            button.addEventListener("click", () =>
              reviewReservation(reservation, nextStatus));
            action.appendChild(button);
          }
        } else {
          action.textContent = "View only";
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

  async function reviewReservation(reservation, nextStatus) {
    if (busy) return;
    const actionName = nextStatus === "approved" ? "APPROVE" : "REJECT";
    const confirmation = "Are you sure you want to " + actionName +
      " reservation " + reservation.reservation_code + "?";
    if (!window.confirm(confirmation)) return;
    busy = true;
    if (status) status.textContent = "Submitting " + nextStatus + " status…";
    try {
      await request("reservations/" + Number(reservation.id) + "/status", {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
      if (status) status.textContent = "Reservation " + nextStatus + ". Refreshing…";
    } catch (error) {
      if (status) status.textContent = error.message || "Unable to update reservation.";
    } finally {
      busy = false;
      await loadReservations();
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
