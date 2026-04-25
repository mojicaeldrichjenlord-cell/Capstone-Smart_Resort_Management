const API_BASE = "http://127.0.0.1:5000/api";

let allBookings = [];
let bookingStatusChart = null;
let bookingSourceChart = null;
let popularRoomsChart = null;
let paymentMethodChart = null;
let guestsPerRoomChart = null;
let slotUsageChart = null;

const CHART_COLORS = [
  "#14b8a6",
  "#2563eb",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#22c55e",
  "#06b6d4",
  "#e11d48",
  "#84cc16",
  "#f97316",
  "#6366f1",
  "#0ea5e9"
];

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
    return;
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
    showReportError("Something went wrong while loading the report dashboard.");
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
      const created = new Date(booking.created_at || booking.reserved_at);
      return !Number.isNaN(created.getTime()) && created >= start;
    });
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    filtered = filtered.filter((booking) => {
      const created = new Date(booking.created_at || booking.reserved_at);
      return !Number.isNaN(created.getTime()) && created <= end;
    });
  }

  renderReports(filtered);
}

function renderReports(bookings) {
  updateStats(bookings);
  renderBookingStatusChart(bookings);
  renderBookingSourceChart(bookings);
  renderPopularRoomsChart(bookings);
  renderPaymentMethodChart(bookings);
  renderGuestsPerRoomChart(bookings);
  renderSlotUsageChart(bookings);
}

function updateStats(bookings) {
  const totalBookings = bookings.length;

  const onlineBookings = bookings.filter(
    (booking) => String(booking.booking_source || "").toLowerCase() === "online"
  ).length;

  const manualBookings = bookings.filter(
    (booking) => String(booking.booking_source || "").toLowerCase() === "manual"
  ).length;

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
      return sum + Number(booking.accommodation_total || 0);
    }
    return sum;
  }, 0);

  setText("totalBookingsCount", totalBookings);
  setText("onlineBookingsCount", onlineBookings);
  setText("manualBookingsCount", manualBookings);
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
          label: "Reservations",
          data: [
            counts.pending,
            counts.approved,
            counts.rejected,
            counts.cancelled,
            counts.completed,
          ],
          backgroundColor: [
            CHART_COLORS[2],
            CHART_COLORS[5],
            CHART_COLORS[4],
            CHART_COLORS[7],
            CHART_COLORS[1],
          ],
          borderRadius: 10,
          maxBarThickness: 46,
        },
      ],
    },
    options: getCommonChartOptions("Reservation count by status."),
  });
}

function renderBookingSourceChart(bookings) {
  const sourceCounts = {
    Online: 0,
    Manual: 0,
  };

  bookings.forEach((booking) => {
    const source = String(booking.booking_source || "online").toLowerCase();
    if (source === "manual") {
      sourceCounts.Manual += 1;
    } else {
      sourceCounts.Online += 1;
    }
  });

  const canvas = document.getElementById("bookingSourceChart");
  if (!canvas) return;

  if (bookingSourceChart) {
    bookingSourceChart.destroy();
  }

  bookingSourceChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Online", "Manual"],
      datasets: [
        {
          data: [sourceCounts.Online, sourceCounts.Manual],
          backgroundColor: [CHART_COLORS[1], CHART_COLORS[0]],
        },
      ],
    },
    options: getPieChartOptions("Online vs manual reservation distribution."),
  });
}

function renderPopularRoomsChart(bookings) {
  const itemCounts = {};

  bookings.forEach((booking) => {
    const roomName = booking.room_name || "Unknown Accommodation";
    itemCounts[roomName] = (itemCounts[roomName] || 0) + 1;
  });

  const sortedItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const canvas = document.getElementById("popularRoomsChart");
  if (!canvas) return;

  if (popularRoomsChart) {
    popularRoomsChart.destroy();
  }

  const labels = sortedItems.length ? sortedItems.map((item) => item[0]) : ["No data"];
  const values = sortedItems.length ? sortedItems.map((item) => item[1]) : [0];

  popularRoomsChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Reservations",
          data: values,
          backgroundColor: labels.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]),
          borderRadius: 10,
          maxBarThickness: 34,
        },
      ],
    },
    options: {
      ...getCommonChartOptions("Most booked accommodations."),
      indexAxis: "y",
    },
  });
}

function renderPaymentMethodChart(bookings) {
  const paymentCounts = {};

  bookings.forEach((booking) => {
    const method = formatPaymentMethodLabel(booking.payment_method || "unknown");
    paymentCounts[method] = (paymentCounts[method] || 0) + 1;
  });

  const labels = Object.keys(paymentCounts);
  const values = Object.values(paymentCounts);

  const canvas = document.getElementById("paymentMethodChart");
  if (!canvas) return;

  if (paymentMethodChart) {
    paymentMethodChart.destroy();
  }

  paymentMethodChart = new Chart(canvas, {
    type: "pie",
    data: {
      labels: labels.length ? labels : ["No data"],
      datasets: [
        {
          label: "Payment Methods",
          data: values.length ? values : [1],
          backgroundColor: (labels.length ? labels : ["No data"]).map(
            (_, index) => CHART_COLORS[index % CHART_COLORS.length]
          ),
        },
      ],
    },
    options: getPieChartOptions("Payment method distribution."),
  });
}

function renderGuestsPerRoomChart(bookings) {
  const guestTotals = {};

  bookings.forEach((booking) => {
    const roomName = booking.room_name || "Unknown Accommodation";
    guestTotals[roomName] = (guestTotals[roomName] || 0) + Number(booking.guests || 0);
  });

  const entries = Object.entries(guestTotals).slice(0, 10);

  const canvas = document.getElementById("guestsPerRoomChart");
  if (!canvas) return;

  if (guestsPerRoomChart) {
    guestsPerRoomChart.destroy();
  }

  const labels = entries.length ? entries.map((item) => item[0]) : ["No data"];
  const values = entries.length ? entries.map((item) => item[1]) : [0];

  guestsPerRoomChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Guests",
          data: values,
          backgroundColor: labels.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]),
          borderRadius: 10,
          maxBarThickness: 40,
        },
      ],
    },
    options: getCommonChartOptions("Total guests grouped by accommodation."),
  });
}

function renderSlotUsageChart(bookings) {
  const slotCounts = {
    "Day Tour": 0,
    "Overnight": 0,
    "22/23 Hours": 0,
  };

  bookings.forEach((booking) => {
    const label = String(booking.slot_label || "").toLowerCase();

    if (label.includes("day")) {
      slotCounts["Day Tour"] += 1;
    } else if (label.includes("overnight")) {
      slotCounts["Overnight"] += 1;
    } else if (label.includes("22") || label.includes("23")) {
      slotCounts["22/23 Hours"] += 1;
    }
  });

  const canvas = document.getElementById("slotUsageChart");
  if (!canvas) return;

  if (slotUsageChart) {
    slotUsageChart.destroy();
  }

  slotUsageChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: Object.keys(slotCounts),
      datasets: [
        {
          label: "Slot Usage",
          data: Object.values(slotCounts),
          backgroundColor: [CHART_COLORS[0], CHART_COLORS[3], CHART_COLORS[9]],
          borderRadius: 10,
          maxBarThickness: 50,
        },
      ],
    },
    options: getCommonChartOptions("Reservation slot usage summary."),
  });
}

function getCommonChartOptions(titleText) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      title: {
        display: true,
        text: titleText,
        padding: {
          top: 6,
          bottom: 14,
        },
        font: {
          size: 13,
          weight: "bold",
        },
      },
    },
  };
}

function getPieChartOptions(titleText) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: titleText,
        padding: {
          top: 6,
          bottom: 14,
        },
        font: {
          size: 13,
          weight: "bold",
        },
      },
    },
  };
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

function formatPaymentMethodLabel(method) {
  const value = String(method || "").toLowerCase();

  if (value === "gcash") return "GCash";
  if (value === "paymaya") return "PayMaya";
  if (value === "cash") return "Cash";
  if (value === "other") return "Other";
  if (value === "unknown") return "Unknown";
  return capitalize(value);
}

function capitalize(text) {
  if (!text) return "";
  const value = String(text);
  return value.charAt(0).toUpperCase() + value.slice(1);
}