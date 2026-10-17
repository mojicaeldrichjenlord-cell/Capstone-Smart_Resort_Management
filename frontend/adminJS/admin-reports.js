// ============================================================
// SMARTRESORT ADMIN REPORTS SCRIPT
// Purpose:
// - Check admin/staff access
// - Load today-only reports by default
// - Load filtered reports only when admin/staff selects date range
// - Render monthly meeting-friendly cards and charts using Chart.js
// - Print reports
// - Works from frontend/adminHTML/admin-reports.html
// ============================================================

let allBookings = [];
// Paid charge aggregates are read independently of reservation creation dates.
let paidChargeRows = [];
let paidChargesLoaded = false;
let bookingStatusChart = null;
let bookingSourceChart = null;
let popularRoomsChart = null;
let salesByCategoryChart = null;
let guestsPerRoomChart = null;
let slotUsageChart = null;
let peakReservationDaysChart = null;
let guestVolumeTrendChart = null;
let monthlyCancellationChart = null;

let activeReportMode = "today";
let activeStartDate = "";
let activeEndDate = "";

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
// Checks access, sets events, and loads today report.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAdminAccess()) return;
  setupLogout();
  setupReportEvents();
  setDateInputsToToday();
  loadTodayReports();
});

// ============================================================
// SECTION 4: Admin/staff access checker
// Allows admin and staff users.
// ============================================================

function checkAdminAccess() {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    console.error("Invalid stored account data:", error);
  }

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return false;
  }

  const role = String(user.role || "").trim().toLowerCase();
  if (role !== "admin") {
    const destinations = {
      customer: "../customerHTML/index.html",
      frontdesk: "../frontdeskHTML/frontdeskDashboard.html",
      staff: "../frontdeskHTML/frontdeskDashboard.html",
      manager: "../managerHTML/managerDashboard.html",
      housekeeping: "../housekeepingHTML/housekeepingDashboard.html",
    };
    alert("Access denied. Administrator account required.");
    window.location.href = destinations[role] || "../authHTML/login.html";
    return false;
  }

  return true;
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
      setDateInputsToToday();
      loadTodayReports();
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
// SECTION 7: Load reports from backend
// Default reads current date only. Filters read selected date range.
// ============================================================

// Display report data for the currently selected today-only view.
async function loadTodayReports() {
  activeReportMode = "today";
  activeStartDate = getTodayDateString();
  activeEndDate = getTodayDateString();

  await fetchReports(`${API_BASE}/bookings?scope=today`);
}

// Build a custom date-range query and request matching reservation data.
async function loadFilteredReports(startDate, endDate) {
  activeReportMode = "custom";
  activeStartDate = startDate;
  activeEndDate = endDate;

  const query = new URLSearchParams({
    startDate,
    endDate,
  });

  await fetchReports(`${API_BASE}/bookings?${query.toString()}`);
}

// Fetch reporting inputs using the signed Admin token, then refresh all report components.
// A failed request displays an error rather than outdated report figures.
async function fetchReports(url) {
  try {
    hideReportError();

    const adminToken = sessionStorage.getItem("adminToken");
    if (!adminToken) throw new Error("Admin session expired. Please log in again.");
    const response = await fetch(url, {
      headers: { Authorization: "Bearer " + adminToken },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load reports.");
    }

    allBookings = Array.isArray(data) ? data : data.bookings || [];
    paidChargeRows = [];
    paidChargesLoaded = false;
    try {
      const chargeQuery = new URLSearchParams({ from: activeStartDate, to: activeEndDate });
      const chargeResponse = await fetch(
        `${API_BASE}/bookings/admin-report/paid-charges?${chargeQuery}`,
        { headers: { Authorization: "Bearer " + adminToken } },
      );
      const chargeData = await chargeResponse.json();
      if (!chargeResponse.ok || !Array.isArray(chargeData.charges)) {
        throw new Error(chargeData.message || "Paid charges could not be verified.");
      }
      paidChargeRows = chargeData.charges;
      paidChargesLoaded = true;
    } catch (chargeError) {
      // Missing charge records must never turn into a fabricated 0 total.
      showReportError("Reservation statistics loaded, but paid charges are unavailable: " +
        chargeError.message);
    }
    renderReports(allBookings);
    updatePrintReportMeta();
  } catch (error) {
    console.error("fetchReports error:", error);

    showReportError(error.message || "Something went wrong while loading reports.");
    allBookings = [];
    paidChargeRows = [];
    paidChargesLoaded = false;
    renderReports([]);
    updatePrintReportMeta();
  }
}

// ============================================================
// SECTION 8: Apply report filters
// Uses backend date filtering instead of loading all records.
// ============================================================

// Normalize the start/end dates and stop requests with an invalid backwards date range.
function applyReportFilters() {
  let startDate = document.getElementById("reportStartDate")?.value || "";
  let endDate = document.getElementById("reportEndDate")?.value || "";

  if (!startDate && !endDate) {
    setDateInputsToToday();
    loadTodayReports();
    return;
  }

  if (startDate && !endDate) {
    endDate = startDate;
    const endInput = document.getElementById("reportEndDate");
    if (endInput) endInput.value = endDate;
  }

  if (!startDate && endDate) {
    startDate = endDate;
    const startInput = document.getElementById("reportStartDate");
    if (startInput) startInput.value = startDate;
  }

  if (startDate > endDate) {
    showReportError("Start date cannot be later than end date.");
    return;
  }

  loadFilteredReports(startDate, endDate);
}

// ============================================================
// SECTION 9: Render all report sections
// Updates cards and charts.
// ============================================================

// Refresh the summary cards and each report chart using the same filtered booking list.
function renderReports(bookings) {
  updateStats(bookings);
  renderBookingStatusChart(bookings);
  renderBookingSourceChart(bookings);
  renderPopularRoomsChart(bookings);
  renderSalesByCategoryChart(bookings);
  renderGuestsPerRoomChart(bookings);
  renderSlotUsageChart(bookings);
  renderPeakReservationDaysChart(bookings);
  renderGuestVolumeTrendChart(bookings);
  renderMonthlyCancellationChart(bookings);
}

// ============================================================
// SECTION 10: Update stat cards
// Counts reservations, guests, source, status, and collected money.
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

  const completedBookings = bookings.filter((booking) => {
    const status = String(booking.status || "").toLowerCase();
    return status === "completed";
  }).length;

  const moneyCollected = bookings.reduce((sum, booking) => {
    return sum + calculateCollectedRevenueForReport(booking);
  }, 0);

  setText("totalBookingsCount", totalBookings);
  setText("totalGuestsCount", totalGuests);
  setText("onlineBookingsCount", onlineBookings);
  setText("manualBookingsCount", manualBookings);
  setText("approvedBookingsCount", approvedBookings);
  setText("completedBookingsCount", completedBookings);
  setText("totalRevenueAmount", `₱${formatMoney(moneyCollected)}`);

  if (paidChargesLoaded) {
    const summary = summarizePaidAdditionalCharges(bookings, paidChargeRows);
    setText("paidBookingChargesAmount", `₱${formatMoney(summary.totalPaid)}`);
    setText("paidBedOverlapAmount", `₱${formatMoney(summary.alreadyCountedBed)}`);
    setText("adjustedCollectionsEstimate",
      `₱${formatMoney(moneyCollected + summary.totalPaid - summary.alreadyCountedBed)}`);
  } else {
    // Do not display a combined estimate without the verified charge read.
    setText("paidBookingChargesAmount", "Unavailable");
    setText("paidBedOverlapAmount", "Unavailable");
    setText("adjustedCollectionsEstimate", "Unavailable");
  }
}

// ============================================================
// SECTION 11: Chart - Reservations by status
// ============================================================

function renderBookingStatusChart(bookings) {
  const counts = {
    approved: 0,
    completed: 0,
    cancelled: 0,
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
      labels: ["Approved", "Completed", "Cancelled"],
      datasets: [
        {
          label: "Reservations",
          data: [counts.approved, counts.completed, counts.cancelled],
          backgroundColor: [
            STATUS_COLORS.approved,
            STATUS_COLORS.completed,
            STATUS_COLORS.cancelled,
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
    const roomName = getAccommodationName(booking);
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
            (_, index) => MINIMAL_PALETTE[index % MINIMAL_PALETTE.length],
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
// SECTION 14: Chart - Monthly sales by accommodation category
// Replaces the old Payment Method Summary.
// ============================================================

// Group the report's calculated collection estimates by accommodation category.
// This chart is not a substitute for a transaction-ledger reconciliation.
function renderSalesByCategoryChart(bookings) {
  const categorySales = {
    Rooms: 0,
    Cottages: 0,
    "Function Areas": 0,
    Others: 0,
  };

  bookings.forEach((booking) => {
    const category = getAccommodationCategory(booking);
    const amount = calculateCollectedRevenueForReport(booking);

    categorySales[category] = (categorySales[category] || 0) + amount;
  });

  const labels = Object.keys(categorySales).filter((label) => {
    return Number(categorySales[label] || 0) > 0;
  });

  const finalLabels = labels.length ? labels : ["No data"];
  const values = labels.length ? labels.map((label) => categorySales[label]) : [0];

  const canvas = document.getElementById("salesByCategoryChart");
  if (!canvas) return;

  if (salesByCategoryChart) {
    salesByCategoryChart.destroy();
  }

  salesByCategoryChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: finalLabels,
      datasets: [
        {
          label: "Sales Value",
          data: values,
          backgroundColor: [
            REPORT_COLORS.blue,
            REPORT_COLORS.tealSoft,
            REPORT_COLORS.purple,
            REPORT_COLORS.gray,
          ],
          borderRadius: 12,
          borderSkipped: false,
          maxBarThickness: 42,
        },
      ],
    },
    options: getMoneyBarChartOptions(),
  });
}

// ============================================================
// SECTION 15: Chart - Guests per accommodation
// ============================================================

function renderGuestsPerRoomChart(bookings) {
  const guestTotals = {};

  bookings.forEach((booking) => {
    const roomName = getAccommodationName(booking);

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
    Other: 0,
  };

  bookings.forEach((booking) => {
    const label = String(
      booking.slot_label || booking.slot_type || "",
    ).toLowerCase();

    if (label.includes("day")) {
      slotCounts["Day Tour"] += 1;
    } else if (label.includes("overnight") || label.includes("night")) {
      slotCounts.Overnight += 1;
    } else if (
      label.includes("22") ||
      label.includes("23") ||
      label.includes("extended") ||
      label.includes("hour")
    ) {
      slotCounts["22/23 Hours"] += 1;
    } else {
      slotCounts.Other += 1;
    }
  });

  const labels = Object.keys(slotCounts).filter((label) => slotCounts[label] > 0);
  const finalLabels = labels.length ? labels : ["No data"];
  const values = labels.length ? labels.map((label) => slotCounts[label]) : [0];

  const canvas = document.getElementById("slotUsageChart");
  if (!canvas) return;

  if (slotUsageChart) {
    slotUsageChart.destroy();
  }

  slotUsageChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: finalLabels,
      datasets: [
        {
          label: "Slot Usage",
          data: values,
          backgroundColor: finalLabels.map(
            (_, index) => MINIMAL_PALETTE[index % MINIMAL_PALETTE.length],
          ),
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
// SECTION 17: Chart - Peak reservation days
// Useful for staffing and promotion planning.
// ============================================================

function renderPeakReservationDaysChart(bookings) {
  const dayCounts = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  };

  bookings.forEach((booking) => {
    const date = getBookingActivityDate(booking);
    if (!date) return;

    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
  });

  const labels = Object.keys(dayCounts);
  const values = labels.map((label) => dayCounts[label]);

  const canvas = document.getElementById("peakReservationDaysChart");
  if (!canvas) return;

  if (peakReservationDaysChart) {
    peakReservationDaysChart.destroy();
  }

  peakReservationDaysChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Reservations",
          data: values,
          backgroundColor: REPORT_COLORS.blueSoft,
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
// SECTION 18: Chart - Guest volume trend
// Daily for short ranges, weekly for longer ranges.
// ============================================================

function renderGuestVolumeTrendChart(bookings) {
  const trendTotals = {};

  bookings.forEach((booking) => {
    const date = getBookingActivityDate(booking);
    if (!date) return;

    const key = getTrendLabel(date);
    trendTotals[key] =
      (trendTotals[key] || 0) + Number(booking.guests || booking.guest_count || 0);
  });

  const entries = Object.entries(trendTotals).sort((a, b) => {
    return a[0].localeCompare(b[0]);
  });

  const labels = entries.length ? entries.map((entry) => entry[0]) : ["No data"];
  const values = entries.length ? entries.map((entry) => entry[1]) : [0];

  const canvas = document.getElementById("guestVolumeTrendChart");
  if (!canvas) return;

  if (guestVolumeTrendChart) {
    guestVolumeTrendChart.destroy();
  }

  guestVolumeTrendChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Guests",
          data: values,
          borderColor: REPORT_COLORS.teal,
          backgroundColor: "rgba(20, 184, 166, 0.14)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: getLineChartOptions(),
  });
}

// ============================================================
// SECTION 19: Chart - Monthly cancellation summary
// Focuses on meeting-level success vs cancellation data.
// ============================================================

function renderMonthlyCancellationChart(bookings) {
  const counts = {
    Successful: 0,
    Cancelled: 0,
  };

  bookings.forEach((booking) => {
    const status = String(booking.status || "").toLowerCase();

    if (status === "approved" || status === "completed") {
      counts.Successful += 1;
    } else if (status === "cancelled") {
      counts.Cancelled += 1;
    }
  });

  const labels = Object.keys(counts).filter((label) => counts[label] > 0);
  const finalLabels = labels.length ? labels : ["No data"];
  const values = labels.length ? labels.map((label) => counts[label]) : [0];

  const canvas = document.getElementById("monthlyCancellationChart");
  if (!canvas) return;

  if (monthlyCancellationChart) {
    monthlyCancellationChart.destroy();
  }

  monthlyCancellationChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: finalLabels,
      datasets: [
        {
          data: values,
          backgroundColor: finalLabels.map((label) => {
            if (label === "Successful") return REPORT_COLORS.green;
            if (label === "Cancelled") return REPORT_COLORS.gray;
            return REPORT_COLORS.blue;
          }),
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
// SECTION 20: Chart option helpers
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

function getMoneyBarChartOptions() {
  return {
    ...getBarChartOptions(),
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
          callback: (value) => `₱${formatMoney(value)}`,
        },
      },
    },
    plugins: {
      ...getBarChartOptions().plugins,
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label || "Amount"}: ₱${formatMoney(
              context.parsed.y ?? context.raw,
            )}`;
          },
        },
      },
    },
  };
}

function getLineChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 450,
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
            return `Guests: ${context.parsed.y ?? context.raw}`;
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
// SECTION 21: Print report meta
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

  let rangeText = "Date Range: Today";

  if (activeReportMode === "custom" && activeStartDate && activeEndDate) {
    rangeText = `Date Range: ${formatReadableDate(
      activeStartDate,
    )} to ${formatReadableDate(activeEndDate)}`;
  } else if (activeStartDate && activeEndDate && activeStartDate === activeEndDate) {
    rangeText = `Date Range: ${formatReadableDate(activeStartDate)}`;
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

  const date = new Date(`${value}T00:00:00`);

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
// SECTION 22: Report date helpers
// ============================================================

function getTodayDateString() {
  const now = new Date();
  const philippinesTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Manila" }),
  );

  const year = philippinesTime.getFullYear();
  const month = String(philippinesTime.getMonth() + 1).padStart(2, "0");
  const day = String(philippinesTime.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function setDateInputsToToday() {
  const today = getTodayDateString();
  const startInput = document.getElementById("reportStartDate");
  const endInput = document.getElementById("reportEndDate");

  if (startInput) startInput.value = today;
  if (endInput) endInput.value = today;
}

function getBookingActivityDate(booking) {
  const value =
    booking.check_in ||
    booking.check_in_date ||
    booking.reserved_at ||
    booking.created_at;

  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function getTrendLabel(date) {
  if (!date) return "No date";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ============================================================
// SECTION 23: Accommodation helpers
// ============================================================

function getAccommodationName(booking) {
  return (
    booking.room_name ||
    booking.accommodation_name ||
    booking.accommodation_list ||
    "Unknown Accommodation"
  );
}

function getAccommodationCategory(booking) {
  const rawCategory = String(
    booking.category ||
      booking.accommodation_category ||
      booking.room_category ||
      booking.type ||
      booking.accommodation_type ||
      "",
  ).toLowerCase();

  const name = String(getAccommodationName(booking)).toLowerCase();
  const combined = `${rawCategory} ${name}`;

  if (
    combined.includes("function") ||
    combined.includes("hall") ||
    combined.includes("pavilion") ||
    combined.includes("event")
  ) {
    return "Function Areas";
  }

  if (
    combined.includes("cottage") ||
    combined.includes("shade") ||
    combined.includes("kubo") ||
    combined.includes("hut") ||
    combined.includes("umbrella")
  ) {
    return "Cottages";
  }

  if (
    combined.includes("room") ||
    combined.includes("villa") ||
    combined.includes("suite") ||
    combined.includes("aircon") ||
    combined.includes("non-aircon")
  ) {
    return "Rooms";
  }

  return "Others";
}


// ============================================================
// SECTION 24: Revenue helpers
// Counts collected money only:
// - Downpayment/full payment on created date
// - Remaining balance + entrance fee on check-in date
// - Extra bed fee only after Mark Extra Bed Paid
// ============================================================

function isDateWithinActiveRange(value) {
  if (!value || !activeStartDate || !activeEndDate) return false;

  const dateText = String(value).slice(0, 10);
  return dateText >= activeStartDate && dateText <= activeEndDate;
}

function isExtraBedPaid(booking) {
  return (
    Number(booking.extra_bed_paid || 0) === 1 ||
    String(booking.extra_bed_paid || "").toLowerCase() === "true"
  );
}

// Estimate revenue contribution for the active report range using stored booking snapshots and payment dates.
// Treat this UI-derived estimate separately from audited net payment reports.
function calculateCollectedRevenueForReport(booking) {
  const createdInRange = isDateWithinActiveRange(booking.created_at);
  const checkedInInRange = isDateWithinActiveRange(booking.checked_in_at);
  const extraBedPaidInRange = isDateWithinActiveRange(booking.extra_bed_paid_at);

  let amount = 0;

  if (checkedInInRange) {
    // Only use an amount explicitly recorded as paid. Booking price is not cash.
    amount += Number(booking.paid_amount || 0);
    amount += Number(booking.entrance_fee_collected || 0);
  } else if (createdInRange) {
    // Required downpayment is an obligation, NOT proof of payment.
    amount += Number(booking.paid_amount || 0);
  }

  if (isExtraBedPaid(booking) && extraBedPaidInRange) {
    amount += Number(booking.extra_bed_fee || 0);
  }

  return amount;
}


// Compare paid additional charges with the legacy extra-bed field.
// Deduct an overlap ONLY for the same booking and the same report period.
function summarizePaidAdditionalCharges(bookings, rows) {
  const byId = new Map(bookings.map(booking => [Number(booking.id), booking]));
  const bedsById = new Map();
  let totalPaid = 0;
  for (const row of rows) {
    const amount = Number(row.amount);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    totalPaid += amount;
    const type = String(row.charge_name || "").trim().toLowerCase();
    if (type === "extra bed charge" || type === "extra bed") {
      const id = Number(row.booking_id);
      bedsById.set(id, (bedsById.get(id) || 0) + amount);
    }
  }
  let alreadyCountedBed = 0;
  for (const [id, amount] of bedsById) {
    const booking = byId.get(id);
    if (!booking || !isExtraBedPaid(booking) ||
        !isDateWithinActiveRange(booking.extra_bed_paid_at)) continue;
    alreadyCountedBed += Math.min(amount, Math.max(0, Number(booking.extra_bed_fee || 0)));
  }
  return { totalPaid, alreadyCountedBed };
}

// ============================================================
// SECTION 25: UI helpers
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
