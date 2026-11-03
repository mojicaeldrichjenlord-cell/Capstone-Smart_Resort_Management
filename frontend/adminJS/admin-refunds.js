// Admin refund queue — READ ONLY. Never approves or sends money.
document.addEventListener("DOMContentLoaded", () => {
  const rows = document.getElementById("refundRows");
  const status = document.getElementById("refundStatus");
  const refresh = document.getElementById("refreshRefunds");
  function signOut() {
    sessionStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    window.location.assign("../authHTML/login.html");
  }
  document.getElementById("logoutBtn")?.addEventListener("click", e => {
    e.preventDefault(); signOut();
  });
  function loggedInAdmin() {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      return user?.role === "admin" && Boolean(sessionStorage.getItem("adminToken"));
    } catch (_) { return false; }
  }
  if (!loggedInAdmin()) { signOut(); return; }

  // Always use textContent for untrusted customer-provided reasons.
  function cell(tr, value) {
    const td = document.createElement("td");
    td.textContent = String(value ?? "—");
    tr.appendChild(td);
    return td;
  }
  function draw(requests) {
    rows.replaceChildren();
    if (!requests.length) {
      const tr = document.createElement("tr");
      cell(tr, "No refund requests found.").colSpan = 7;
      rows.appendChild(tr); return;
    }
    for (const r of requests) {
      const tr = document.createElement("tr");
      cell(tr, r.id);
      cell(tr, r.reservation_code || r.reservation_id);
      cell(tr, r.payment_method);
      const recorded = Number(r.recorded_paid_amount);
      cell(tr, Number.isFinite(recorded) ? "PHP " + recorded.toFixed(2) : "Not verified");
      cell(tr, r.reason);
      const state = cell(tr, String(r.status || "").replace(/_/g, " "));
      state.className = "refund-status";
      cell(tr, r.created_at);
      rows.appendChild(tr);
    }
  }
  async function load() {
    refresh.disabled = true;
    status.textContent = "Loading refund review queue…";
    try {
      const token = sessionStorage.getItem("adminToken");
      const response = await fetch(API_BASE + "/refunds/admin/requests", {
        cache: "no-store", headers: { Authorization: "Bearer " + token },
      });
      if (response.status === 401 || response.status === 403) {
        signOut(); return;
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load refund requests.");
      }
      draw(Array.isArray(data.requests) ? data.requests : []);
      status.textContent = (data.requests || []).length + " refund request(s). Review only; no payment has been issued.";
    } catch (error) {
      status.textContent = error.message;
      rows.replaceChildren();
    } finally { refresh.disabled = false; }
  }
  refresh.addEventListener("click", load);
  load();
});
