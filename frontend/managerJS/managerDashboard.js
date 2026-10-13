// Manager role and dashboard data must come from signed backend verification.
// localStorage "user" is NOT an authorization mechanism.
document.addEventListener("DOMContentLoaded", () => {
  const signedToken = sessionStorage.getItem("managerToken");
  const status = document.getElementById("managerStatus");
  const accountName = document.getElementById("accountName");
  const accountEmail = document.getElementById("accountEmail");
  const refresh = document.getElementById("refreshBtn");

  const signOut = () => {
    sessionStorage.removeItem("managerToken");
    localStorage.removeItem("user");
    window.location.replace("../authHTML/login.html");
  };
  document.getElementById("logoutBtn")?.addEventListener("click", signOut);

  if (!signedToken || !/^mgr1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(signedToken)) {
    signOut();
    return;
  }
  const request = async endpoint => {
    const result = await fetch(API_BASE + "/manager/" + endpoint, {
      headers: { Authorization: "Bearer " + signedToken },
      cache: "no-store",
    });
    if (result.status === 401 || result.status === 403) {
      signOut();
      throw new Error("Manager access was denied.");
    }
    const json = await result.json();
    if (!result.ok || !json.success) {
      throw new Error(json.message || "Manager information unavailable.");
    }
    return json;
  };
  const formatNumber = value =>
    Number.isFinite(Number(value)) ? Number(value).toLocaleString("en-PH") : "—";
  const counts = {
    totalReservations: "total_reservations",
    pendingReservations: "pending_reservations",
    approvedReservations: "approved_reservations",
    guestsInside: "guests_inside",
    completedReservations: "completed_reservations",
    accommodationCount: "total_accommodations",
  };

  async function loadOverview() {
    if (refresh) refresh.disabled = true;
    if (status) status.textContent = "Loading current resort overview…";
    try {
      const data = await request("overview");
      for (const [elementId, key] of Object.entries(counts)) {
        const element = document.getElementById(elementId);
        if (element) element.textContent = formatNumber(data.summary?.[key]);
      }
      document.getElementById("availableListings").textContent =
        "Listed as available: " + formatNumber(data.summary?.listed_available);
      const recorded = Number(data.summary?.recorded_reservation_payments);
      document.getElementById("recordedPayments").textContent =
        Number.isFinite(recorded)
          ? "₱" + recorded.toLocaleString("en-PH", {
              minimumFractionDigits: 2, maximumFractionDigits: 2,
            })
          : "—";

      const tbody = document.getElementById("recentActivity");
      if (tbody) {
        tbody.replaceChildren();
        if (!data.recent_activity?.length) {
          const tr = document.createElement("tr");
          const td = document.createElement("td");
          td.colSpan = 4;
          td.textContent = "No reservations yet.";
          tr.appendChild(td);
          tbody.appendChild(tr);
        } else {
          for (const item of data.recent_activity) {
            const tr = document.createElement("tr");
            const cells = [
              item.reservation_code || "—",
              item.status || "—",
              item.booking_source || "—",
              item.created_at ? new Date(item.created_at).toLocaleDateString("en-PH") : "—",
            ];
            for (const [index, value] of cells.entries()) {
              const td = document.createElement("td");
              if (index === 1) {
                const badge = document.createElement("span");
                badge.className = "manager-status-pill";
                badge.dataset.status = String(value).toLowerCase();
                badge.textContent = String(value).replace(/_/g, " ");
                td.appendChild(badge);
              } else {
                td.textContent = String(value);
              }
              tr.appendChild(td);
            }
            tbody.appendChild(tr);
          }
        }
      }
      if (status) status.textContent =
        "Latest resort overview loaded at " + new Date().toLocaleTimeString("en-PH", {
          hour: "numeric", minute: "2-digit",
        }) + ". Refresh for current information.";
    } catch (error) {
      if (status) status.textContent = error.message || "Unable to load overview.";
    } finally {
      if (refresh) refresh.disabled = false;
    }
  }

  async function initManager() {
    try {
      const data = await request("me");
      if (accountName) accountName.textContent = data.user?.fullname || "Resort Manager";
      if (accountEmail) accountEmail.textContent = data.user?.email || "—";
      await loadOverview();
    } catch (error) {
      if (status) status.textContent = error.message || "Unable to verify Manager session.";
    }
  }

  refresh?.addEventListener("click", loadOverview);
  initManager();
});
