// ============================================================
// SMARTRESORT ADMIN REPORTS SCRIPT
// Purpose:
// - Check admin access
// - Load booking data
// - Render report summary cards
// - Render charts using Chart.js
// - Filter and print reports
// - Works from frontend/adminHTML/admin-reports.html
// ============================================================

const API_BASE = "http://127.0.0.1:5000/api";

let allBookings = [];
let bookingStatusChart = null;
let bookingSourceChart = null;
let popularRoomsChart = null;
let paymentMethodChart = null;
let guestsPerRoomChart = null;
let slotUsageChart = null;

// ============================================================
// SECTION 1: Chart colors
// Keeps report colors clean and readable.
// ============================================================

const REPORT_COLORS = {
  navy: "#0F172A",
  text: "#334155",
  muted: "#64748B",
  grid: "#E5EDF3",
  teal: "#0F766E",
  tealSoft: "#14B8A6",
  blue: "#2563EB",
  blueSoft: "#60A5FA",
  green: "#22C55E",
  greenSoft: "#86EFAC",
  amber: "#F59E0B",
  amberSoft: "#FCD34D",
  red: "#EF4444",
  redSoft: "#FCA5A5",
  gray: "#94A3B8",
  graySoft: "#CBD5E1",
  purple: "#8B5CF6",
  cyan: "#06B6D4",
};

const STATUS_COLORS = {
  pending: REPORT_COLORS.amber,
  approved: REPORT_COLORS.green,
  rejected: REPORT_COLORS.red,
  cancelled: REPORT_COLORS.gray,
  completed: REPORT_COLORS.blue,
};

const MINIMAL_PALETTE = [
  REPORT_COLORS.tealSoft,
  REPORT_COLORS.blue,
  REPORT_COLORS.amber,
  REPORT_COLORS.green,
  REPORT_COLORS.purple,
  REPORT_COLORS.cyan,
  REPORT_COLORS.red,
  REPORT_COLORS.gray,
  "#0EA5E9",
  "#84CC16",
];

// ============================================================
// SECTION 2: Chart.js default styling
// Makes charts consistent across reports.
// ============================================================

Chart.defaults.font.family = "Arial, sans-serif";
Chart.defaults.color = REPORT_COLORS.text;
Chart.defaults.plugins.tooltip.backgroundColor = "#0F172A";
Chart.defaults.plugins.tooltip.titleColor = "#FFFFFF";
Chart.defaults.plugins.tooltip.bodyColor = "#E2E8F0";
Chart.defaults.plugins.tooltip.borderColor = "rgba(255,255,255,0.12)";
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 10;

// ============================================================
// SECTION 3: Page startup
// Checks admin access, sets events, and loads reports.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess();
  setupLogout();
  setupReportEvents();
  loadReports();
});

// ============================================================
// SECTION 4: Admin access checker
// Allows admin users only.
// ============================================================

function checkAdminAccess() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return;
  }

  if (user.role !== "admin") {
    alert("Access denied. Admin only.");
    window.location.href = "../index.html";
  }
}

// ============================================================
// SECTION 5: Logout
// Clears user and returns to login page.
// ============================================================

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
      window.location.href = "../authHTML/login.html";
    }, 700);
  });
}

// ============================================================
// SECTION 6: Report button events
// Connects filter, reset, and print buttons.
// ============================================================

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
      updatePrintReportMeta();
      document.body.classList.add("printing-report");

      setTimeout(() => {
        window.print();

        setTimeout(() => {
          document.body.classList.remove("printing-report");
        }, 500);
      }, 250);
    });
  }
}

// ============================================================
// SECTION 7: Load reports
// Gets bookings data from backend.
// ============================================================

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

// ============================================================
// SECTION 8: Apply report filters
// Filters bookings by created/reserved date.
// ============================================================

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

// ============================================================
// SECTION 9: Render all report sections
// Updates cards and charts.
// ============================================================

function renderReports(bookings) {
  updateStats(bookings);
  renderBookingStatusChart(bookings);
  renderBookingSourceChart(bookings);
  renderPopularRoomsChart(bookings);
  renderPaymentMethodChart(bookings);
  renderGuestsPerRoomChart(bookings);
  renderSlotUsageChart(bookings);
}

// ============================================================
// SECTION 10: Update stat cards
// Counts reservations, guests, source, status, and money.
// ============================================================

function updateStats(bookings) {
  const totalBookings = bookings.length;

  const totalGuests = bookings.reduce((sum, booking) => {
    return sum + Number(booking.guests || booking.guest_count || 0);
  }, 0);

  const onlineBookings = bookings.filter((booking) => {
    return String(booking.booking_source || "online").toLowerCase() === "online";
  }).length;

  const manualBookings = bookings.filter((booking) => {
    return String(booking.booking_source || "").toLowerCase() === "manual";
  }).length;

  const approvedBookings = bookings.filter((booking) => {
    const status = String(booking.status || "").toLowerCase();
    return status === "approved";
  }).length;

  const pendingBookings = bookings.filter((booking) => {
    const status = String(booking.status || "").toLowerCase();
    return status === "pending";
  }).length;

  const moneyCollected = bookings.reduce((sum, booking) => {
    return sum + Number(booking.paid_amount || 0);
  }, 0);

  setText("totalBookingsCount", totalBookings);
  setText("totalGuestsCount", totalGuests);
  setText("onlineBookingsCount", onlineBookings);
  setText("manualBookingsCount", manualBookings);
  setText("approvedBookingsCount", approvedBookings);
  setText("pendingBookingsCount", pendingBookings);
  setText("totalRevenueAmount", `₱${formatMoney(moneyCollected)}`);
}

// ============================================================
// SECTION 11: Chart - Reservations by status
// ============================================================

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

    if (Object.prototype.hasOwnProperty.call(counts, status)) {
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
            STATUS_COLORS.pending,
            STATUS_COLORS.approved,
            STATUS_COLORS.rejected,
            STATUS_COLORS.cancelled,
            STATUS_COLORS.completed,
          ],
          borderRadius: 12,
          borderSkipped: false,
          maxBarThickness: 38,
        },
      ],
    },
    options: getBarChartOptions(),
  });
}

// ============================================================
// SECTION 12: Chart - Online vs walk-in/manual
// ============================================================

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
      labels: ["Online", "Walk-in / Manual"],
      datasets: [
        {
          data: [sourceCounts.Online, sourceCounts.Manual],
          backgroundColor: [REPORT_COLORS.blue, REPORT_COLORS.tealSoft],
          borderColor: "#FFFFFF",
          borderWidth: 4,
          hoverOffset: 8,
        },
      ],
    },
    options: getDoughnutChartOptions(),
  });
}

// ============================================================
// SECTION 13: Chart - Most booked accommodations
// ============================================================

function renderPopularRoomsChart(bookings) {
  const itemCounts = {};

  bookings.forEach((booking) => {
    const roomName =
      booking.room_name ||
      booking.accommodation_name ||
      "Unknown Accommodation";

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

  const labels = sortedItems.length
    ? sortedItems.map((item) => item[0])
    : ["No data"];

  const values = sortedItems.length ? sortedItems.map((item) => item[1]) : [0];

  popularRoomsChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Reservations",
          data: values,
          backgroundColor: labels.map(
            (_, index) => MINIMAL_PALETTE[index % MINIMAL_PALETTE.length]
          ),
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 28,
        },
      ],
    },
    options: {
      ...getBarChartOptions(),
      indexAxis: "y",
      scales: {
        x: {
          beginAtZero: true,
          grid: getGridStyle(),
          ticks: getTickStyle(),
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            color: REPORT_COLORS.text,
            font: {
              size: 11,
              weight: "600",
            },
          },
        },
      },
    },
  });
}

// ============================================================
// SECTION 14: Chart - Payment method summary
// ============================================================

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
    type: "doughnut",
    data: {
      labels: labels.length ? labels : ["No data"],
      datasets: [
        {
          label: "Payment Methods",
          data: values.length ? values : [1],
          backgroundColor: (labels.length ? labels : ["No data"]).map(
            (_, index) => MINIMAL_PALETTE[index % MINIMAL_PALETTE.length]
          ),
          borderColor: "#FFFFFF",
          borderWidth: 4,
          hoverOffset: 8,
        },
      ],
    },
    options: getDoughnutChartOptions(),
  });
}

// ============================================================
// SECTION 15: Chart - Guests per accommodation
// ============================================================

function renderGuestsPerRoomChart(bookings) {
  const guestTotals = {};

  bookings.forEach((booking) => {
    const roomName =
      booking.room_name ||
      booking.accommodation_name ||
      "Unknown Accommodation";

    guestTotals[roomName] =
      (guestTotals[roomName] || 0) +
      Number(booking.guests || booking.guest_count || 0);
  });

  const entries = Object.entries(guestTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

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
          backgroundColor: REPORT_COLORS.tealSoft,
          borderRadius: 12,
          borderSkipped: false,
          maxBarThickness: 36,
        },
      ],
    },
    options: getBarChartOptions(),
  });
}

// ============================================================
// SECTION 16: Chart - Slot usage
// ============================================================

function renderSlotUsageChart(bookings) {
  const slotCounts = {
    "Day Tour": 0,
    Overnight: 0,
    "22/23 Hours": 0,
  };

  bookings.forEach((booking) => {
    const label = String(
      booking.slot_label || booking.slot_type || ""
    ).toLowerCase();

    if (label.includes("day")) {
      slotCounts["Day Tour"] += 1;
    } else if (label.includes("overnight")) {
      slotCounts.Overnight += 1;
    } else if (
      label.includes("22") ||
      label.includes("23") ||
      label.includes("extended")
    ) {
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
          backgroundColor: [
            REPORT_COLORS.tealSoft,
            REPORT_COLORS.blue,
            REPORT_COLORS.amber,
          ],
          borderRadius: 12,
          borderSkipped: false,
          maxBarThickness: 42,
        },
      ],
    },
    options: getBarChartOptions(),
  });
}

// ============================================================
// SECTION 17: Chart option helpers
// Shared chart configurations.
// ============================================================

function getBarChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 450,
    },
    layout: {
      padding: {
        top: 6,
        right: 8,
        bottom: 4,
        left: 4,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: getTickStyle(),
      },
      y: {
        beginAtZero: true,
        grid: getGridStyle(),
        ticks: {
          ...getTickStyle(),
          precision: 0,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: getLegendStyle(),
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "Value";
            return `${label}: ${
              context.parsed.y ?? context.parsed.x ?? context.raw
            }`;
          },
        },
      },
    },
  };
}

function getDoughnutChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    animation: {
      duration: 450,
    },
    layout: {
      padding: 8,
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: getLegendStyle(),
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((sum, value) => {
              return sum + Number(value || 0);
            }, 0);

            const value = Number(context.raw || 0);
            const percent = total ? ((value / total) * 100).toFixed(1) : "0.0";

            return `${context.label}: ${value} (${percent}%)`;
          },
        },
      },
    },
  };
}

function getLegendStyle() {
  return {
    usePointStyle: true,
    pointStyle: "circle",
    boxWidth: 8,
    boxHeight: 8,
    padding: 14,
    color: REPORT_COLORS.text,
    font: {
      size: 11,
      weight: "700",
    },
  };
}

function getTickStyle() {
  return {
    color: REPORT_COLORS.muted,
    font: {
      size: 11,
      weight: "600",
    },
  };
}

function getGridStyle() {
  return {
    color: REPORT_COLORS.grid,
    drawBorder: false,
    lineWidth: 1,
  };
}

// ============================================================
// SECTION 18: Print report meta
// Updates generated date and selected date range before printing.
// ============================================================

function updatePrintReportMeta() {
  const generatedEl = document.getElementById("printReportDate");
  const rangeEl = document.getElementById("printReportRange");

  const now = new Date();

  const generatedText = now.toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const startDate = document.getElementById("reportStartDate")?.value;
  const endDate = document.getElementById("reportEndDate")?.value;

  let rangeText = "Date Range: All Records";

  if (startDate && endDate) {
    rangeText = `Date Range: ${formatReadableDate(
      startDate
    )} to ${formatReadableDate(endDate)}`;
  } else if (startDate) {
    rangeText = `Date Range: From ${formatReadableDate(startDate)}`;
  } else if (endDate) {
    rangeText = `Date Range: Until ${formatReadableDate(endDate)}`;
  }

  if (generatedEl) {
    generatedEl.textContent = `Generated: ${generatedText}`;
  }

  if (rangeEl) {
    rangeEl.textContent = rangeText;
  }
}

function formatReadableDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ============================================================
// SECTION 19: UI helpers
// Handles error text and common formatting.
// ============================================================

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
  if (value === "maya") return "Maya";
  if (value === "cash") return "Cash";
  if (value === "bank_transfer") return "Bank Transfer";
  if (value === "paypal") return "PayPal";
  if (value === "other") return "Other";
  if (value === "unknown") return "Unknown";

  return capitalize(value.replaceAll("_", " "));
}

function capitalize(text) {
  if (!text) return "";

  return String(text)
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}