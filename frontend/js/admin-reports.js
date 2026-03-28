const API_BASE = "http://127.0.0.1:5000/api";

let allBookings = [];
let bookingStatusChart = null;
let popularRoomsChart = null;
let paymentMethodChart = null;
let guestsPerRoomChart = null;

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess();
  setupLogout();
  setupReportEvents();
  loadReports();
});

function checkAdminAccess() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  if (user.role !== "admin") {
    alert("Access denied. Admin only.");
    window.location.href = "index.html";
  }
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("user");

    if (typeof showToast === "function") {
      showToast("Logged out successfully.", "success");
    } else {
      alert("Logged out successfully.");
    }

    setTimeout(() => {
      window.location.href = "login.html";
    }, 700);
  });
}

function setupReportEvents() {
  const applyBtn = document.getElementById("applyReportFilterBtn");
  const clearBtn = document.getElementById("clearReportFilterBtn");
  const printBtn = document.getElementById("printReportBtn");

  if (applyBtn) {
    applyBtn.addEventListener("click", applyReportFilters);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      document.getElementById("reportStartDate").value = "";
      document.getElementById("reportEndDate").value = "";
      renderReports(allBookings);
    });
  }

  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }
}

async function loadReports() {
  try {
    hideReportError();

    const response = await fetch(`${API_BASE}/bookings`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load reports.");
    }

    allBookings = Array.isArray(data) ? data : data.bookings || [];
    renderReports(allBookings);
  } catch (error) {
    console.error("loadReports error:", error);
    showReportError("Something went wrong while loading report cards.");
    renderReports([]);
  }
}

function applyReportFilters() {
  const startDate = document.getElementById("reportStartDate").value;
  const endDate = document.getElementById("reportEndDate").value;

  let filtered = [...allBookings];

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    filtered = filtered.filter((booking) => {
      const created = new Date(booking.created_at);
      return !Number.isNaN(created.getTime()) && created >= start;
    });
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    filtered = filtered.filter((booking) => {
      const created = new Date(booking.created_at);
      return !Number.isNaN(created.getTime()) && created <= end;
    });
  }

  renderReports(filtered);
}

function renderReports(bookings) {
  updateStats(bookings);
  renderBookingStatusChart(bookings);
  renderPopularRoomsChart(bookings);
  renderPaymentMethodChart(bookings);
  renderGuestsPerRoomChart(bookings);
}

function updateStats(bookings) {
  const totalBookings = bookings.length;

  const approvedBookings = bookings.filter((booking) => {
    const status = String(booking.status || "").toLowerCase();
    return status === "approved";
  }).length;

  const pendingBookings = bookings.filter((booking) => {
    const status = String(booking.status || "").toLowerCase();
    return status === "pending";
  }).length;

  const totalRevenue = bookings.reduce((sum, booking) => {
    const status = String(booking.status || "").toLowerCase();
    if (status === "approved" || status === "completed") {
      return sum + Number(booking.price || 0);
    }
    return sum;
  }, 0);

  setText("totalBookingsCount", totalBookings);
  setText("approvedBookingsCount", approvedBookings);
  setText("pendingBookingsCount", pendingBookings);
  setText("totalRevenueAmount", `₱${formatMoney(totalRevenue)}`);
}

function renderBookingStatusChart(bookings) {
  const counts = {
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0,
  };

  bookings.forEach((booking) => {
    const status = String(booking.status || "").toLowerCase();
    if (counts.hasOwnProperty(status)) {
      counts[status]++;
    }
  });

  const canvas = document.getElementById("bookingStatusChart");
  if (!canvas) return;

  if (bookingStatusChart) {
    bookingStatusChart.destroy();
  }

  bookingStatusChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Pending", "Approved", "Rejected", "Cancelled", "Completed"],
      datasets: [
        {
          label: "Bookings",
          data: [
            counts.pending,
            counts.approved,
            counts.rejected,
            counts.cancelled,
            counts.completed,
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function renderPopularRoomsChart(bookings) {
  const roomCounts = {};

  bookings.forEach((booking) => {
    const roomName = booking.room_name || "Unknown Room";
    roomCounts[roomName] = (roomCounts[roomName] || 0) + 1;
  });

  const sortedRooms = Object.entries(roomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const canvas = document.getElementById("popularRoomsChart");
  if (!canvas) return;

  if (popularRoomsChart) {
    popularRoomsChart.destroy();
  }

  popularRoomsChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: sortedRooms.map((item) => item[0]),
      datasets: [
        {
          label: "Bookings",
          data: sortedRooms.map((item) => item[1]),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
    },
  });
}

function renderPaymentMethodChart(bookings) {
  const paymentCounts = {};

  bookings.forEach((booking) => {
    const method = capitalize(booking.payment_method || "unknown");
    paymentCounts[method] = (paymentCounts[method] || 0) + 1;
  });

  const canvas = document.getElementById("paymentMethodChart");
  if (!canvas) return;

  if (paymentMethodChart) {
    paymentMethodChart.destroy();
  }

  paymentMethodChart = new Chart(canvas, {
    type: "pie",
    data: {
      labels: Object.keys(paymentCounts),
      datasets: [
        {
          data: Object.values(paymentCounts),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function renderGuestsPerRoomChart(bookings) {
  const guestTotals = {};

  bookings.forEach((booking) => {
    const roomName = booking.room_name || "Unknown Room";
    guestTotals[roomName] = (guestTotals[roomName] || 0) + Number(booking.guests || 0);
  });

  const canvas = document.getElementById("guestsPerRoomChart");
  if (!canvas) return;

  if (guestsPerRoomChart) {
    guestsPerRoomChart.destroy();
  }

  guestsPerRoomChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: Object.keys(guestTotals),
      datasets: [
        {
          label: "Guests",
          data: Object.values(guestTotals),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function showReportError(message) {
  const errorEl = document.getElementById("reportErrorMessage");
  if (!errorEl) return;

  errorEl.textContent = message;
  errorEl.style.display = "block";
}

function hideReportError() {
  const errorEl = document.getElementById("reportErrorMessage");
  if (!errorEl) return;

  errorEl.textContent = "";
  errorEl.style.display = "none";
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value;
  }
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function capitalize(text) {
  if (!text) return "";
  const value = String(text);
  return value.charAt(0).toUpperCase() + value.slice(1);
}