const reportsLogoutBtn = document.getElementById("reportsLogoutBtn");
const reportCards = document.getElementById("reportCards");
const reportStartDate = document.getElementById("reportStartDate");
const reportEndDate = document.getElementById("reportEndDate");
const applyReportFilter = document.getElementById("applyReportFilter");
const resetReportFilter = document.getElementById("resetReportFilter");
const printReportBtn = document.getElementById("printReportBtn");
const printDateRange = document.getElementById("printDateRange");
const printGeneratedAt = document.getElementById("printGeneratedAt");

const user = JSON.parse(localStorage.getItem("user"));
const API_BASE = "http://127.0.0.1:5000/api";

if (!user) {
  alert("Please login first.");
  window.location.href = "login.html";
}

if (user && user.role !== "admin") {
  alert("Access denied. Admins only.");
  window.location.href = "index.html";
}

reportsLogoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("user");
  localStorage.removeItem("selectedRoom");
  window.location.href = "login.html";
});

let statusChartInstance = null;
let roomChartInstance = null;
let guestChartInstance = null;

function buildQueryString() {
  const params = new URLSearchParams();

  if (reportStartDate.value) params.append("startDate", reportStartDate.value);
  if (reportEndDate.value) params.append("endDate", reportEndDate.value);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function updatePrintHeader() {
  const start = reportStartDate.value;
  const end = reportEndDate.value;

  if (start && end) {
    printDateRange.textContent = `Date Range: ${formatDate(start)} to ${formatDate(end)}`;
  } else if (start) {
    printDateRange.textContent = `From: ${formatDate(start)}`;
  } else if (end) {
    printDateRange.textContent = `Up to: ${formatDate(end)}`;
  } else {
    printDateRange.textContent = "All records";
  }

  const now = new Date();
  printGeneratedAt.textContent = `Generated on: ${now.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function buildChart(chartId, label, labels, values) {
  const ctx = document.getElementById(chartId).getContext("2d");

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label,
          data: values,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
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
          display: false,
        },
      },
    },
  });
}

async function loadReportCards() {
  try {
    const queryString = buildQueryString();

    const [statsResponse, analyticsResponse] = await Promise.all([
      fetch(`${API_BASE}/bookings/stats/summary${queryString}`),
      fetch(`${API_BASE}/bookings/stats/analytics${queryString}`),
    ]);

    const stats = await statsResponse.json();
    const analytics = await analyticsResponse.json();

    if (!statsResponse.ok || !analyticsResponse.ok) {
      reportCards.innerHTML = "<p>Failed to load report cards.</p>";
      return;
    }

    const totalGuests = (analytics.roomBookingData || []).reduce(
      (sum, room) => sum + Number(room.total_guests || 0),
      0
    );

    reportCards.innerHTML = `
      <div class="stat-card">
        <h3>Total Rooms</h3>
        <p>${stats.total_rooms ?? 0}</p>
      </div>
      <div class="stat-card">
        <h3>Total Bookings</h3>
        <p>${stats.total_bookings ?? 0}</p>
      </div>
      <div class="stat-card">
        <h3>Total Guests</h3>
        <p>${totalGuests}</p>
      </div>
    `;
  } catch (error) {
    console.error("loadReportCards error:", error);
    reportCards.innerHTML = "<p>Something went wrong while loading report cards.</p>";
  }
}

async function loadAnalyticsCharts() {
  try {
    const queryString = buildQueryString();
    const response = await fetch(`${API_BASE}/bookings/stats/analytics${queryString}`);
    const analytics = await response.json();

    if (!response.ok) {
      console.error("Failed to load analytics");
      return;
    }

    const statusLabels = analytics.bookingStatusData.map((item) => item.status);
    const statusValues = analytics.bookingStatusData.map((item) => Number(item.count));

    const roomLabels = analytics.roomBookingData.map((item) => item.room_name);
    const bookingValues = analytics.roomBookingData.map((item) => Number(item.booking_count));
    const guestValues = analytics.roomBookingData.map((item) => Number(item.total_guests));

    if (statusChartInstance) statusChartInstance.destroy();
    if (roomChartInstance) roomChartInstance.destroy();
    if (guestChartInstance) guestChartInstance.destroy();

    statusChartInstance = buildChart("statusChart", "Booking Count", statusLabels, statusValues);
    roomChartInstance = buildChart("roomChart", "Bookings per Room", roomLabels, bookingValues);
    guestChartInstance = buildChart("guestChart", "Guests per Room", roomLabels, guestValues);
  } catch (error) {
    console.error("loadAnalyticsCharts error:", error);
  }
}

async function loadReports() {
  updatePrintHeader();
  await loadReportCards();
  await loadAnalyticsCharts();
}

applyReportFilter.addEventListener("click", () => {
  if (reportStartDate.value && reportEndDate.value && reportStartDate.value > reportEndDate.value) {
    alert("Start date cannot be later than end date.");
    return;
  }

  loadReports();
});

resetReportFilter.addEventListener("click", () => {
  reportStartDate.value = "";
  reportEndDate.value = "";
  loadReports();
});

printReportBtn.addEventListener("click", async () => {
  updatePrintHeader();
  await loadReports();
  setTimeout(() => {
    window.print();
  }, 300);
});

loadReports();