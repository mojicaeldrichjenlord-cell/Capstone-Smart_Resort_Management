// Stage Reports-20: visual-only chart empty states and printer-friendly tables.
// The dashboard still owns all Chart.js instances and financial calculations;
// this module reads the charts' computed labels/data, and never fetches/writes data.
"use strict";
(function reportPresentationModule() {
  const chartSlots = [
    ["bookingStatusChart", "Reservation Outcomes", "count"],
    ["bookingSourceChart", "Booking Channels", "count"],
    ["popularRoomsChart", "Most Booked Accommodations", "count"],
    ["salesByCategoryChart", "Estimated Collections by Category", "money"],
    ["guestsPerRoomChart", "Estimated Guests per Accommodation", "count"],
    ["slotUsageChart", "Time Slot Usage", "count"],
    ["peakReservationDaysChart", "Peak Reservation Days", "count"],
    ["guestVolumeTrendChart", "Estimated Guest Trend", "count"],
    ["monthlyCancellationChart", "Cancellation Outcomes", "count"],
  ];

  const safeNumber = value => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };
  const formatValue = (number, format) => format === "money"
    ? "₱" + safeNumber(number).toLocaleString("en-PH", {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    })
    : safeNumber(number).toLocaleString("en-PH", { maximumFractionDigits: 0 });

  function getChartRows(chart) {
    if (!chart || !chart.data) return [];
    const labels = Array.isArray(chart.data.labels) ? chart.data.labels : [];
    const datasets = Array.isArray(chart.data.datasets) ? chart.data.datasets : [];
    // Current report charts have one dataset each; avoid printing invented
    // totals from stacked/multi-series data if chart behavior changes later.
    const series = Array.isArray(datasets[0]?.data) ? datasets[0].data : [];
    return labels.map((label, i) => ({
      label: String(label == null ? "" : label).trim(),
      value: safeNumber(series[i]),
    })).filter(row => row.label && row.label.toLowerCase() !== "no data");
  }

  function setEmptyState(box, hasData) {
    box.classList.toggle("is-empty", !hasData);
    let note = box.querySelector(".chart-empty-state");
    if (!hasData && !note) {
      note = document.createElement("p");
      note.className = "chart-empty-state";
      note.textContent = "No recorded values for this chart in the selected period.";
      note.setAttribute("role", "status");
      box.appendChild(note);
    }
    if (note) note.hidden = hasData;
  }

  function appendText(parent, tagName, content, className = "") {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = content; // Database-derived names are never interpreted as HTML.
    parent.appendChild(element);
    return element;
  }

  function createPrintSection(title, rows, format) {
    const section = document.createElement("section");
    section.className = "print-data-section";
    appendText(section, "h3", title);

    const meaningful = rows.filter(row => safeNumber(row.value) !== 0);
    if (!meaningful.length) {
      appendText(section, "p", "No recorded values for this period.", "print-empty-value");
      return section;
    }

    const table = document.createElement("table");
    table.className = "print-data-table";
    const thead = document.createElement("thead");
    const heading = document.createElement("tr");
    appendText(heading, "th", "Category / Period");
    appendText(heading, "th", format === "money" ? "Estimated amount" : "Count");
    thead.appendChild(heading);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    // Keep each section concise; charts retain full details on screen.
    for (const row of meaningful.slice(0, 8)) {
      const tr = document.createElement("tr");
      appendText(tr, "td", row.label);
      appendText(tr, "td", formatValue(row.value, format));
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    section.appendChild(table);

    if (meaningful.length > 8) {
      appendText(section, "p",
        "+" + (meaningful.length - 8) +
        " additional categories/periods available in the on-screen chart.",
        "print-truncated-note");
    }
    return section;
  }

  function update(bookings, chartInstances) {
    const grid = document.querySelector(".chart-grid");
    const print = document.getElementById("reportPrintDetails");
    const emptyOverall = document.getElementById("reportEmptyOverview");
    if (!grid || !print || !emptyOverall) return;

    const anyReservations = Array.isArray(bookings) && bookings.length > 0;
    grid.classList.toggle("has-no-bookings", !anyReservations);
    emptyOverall.hidden = anyReservations;
    emptyOverall.textContent = anyReservations ? "" :
      "No reservations found for the selected date range. " +
      "Try another date range to view booking trends.";

    // Print tables are generated from exactly the Chart.js data just plotted.
    const fragment = document.createDocumentFragment();
    appendText(fragment, "h2", "Activity details", "print-details-title");
    if (!anyReservations) {
      appendText(fragment, "p",
        "No reservation trends were recorded for this selected date range. " +
        "See the key figures and reconciliation notes above.",
        "print-empty-value");
    } else {
      const groups = document.createElement("div");
      groups.className = "print-data-grid";
      for (const [id, title, format] of chartSlots) {
        const chart = chartInstances?.[id];
        const rows = getChartRows(chart);
        const meaningful = rows.some(row => row.value > 0);
        const box = document.getElementById(id)?.closest(".chart-box");
        if (box) {
          const wasEmpty = box.classList.contains("is-empty");
          setEmptyState(box, meaningful);
          // Chart.js is created while the canvas might be hidden from the
          // previous filter. Re-measure after the card becomes visible.
          if (wasEmpty && meaningful && typeof chart?.resize === "function") {
            requestAnimationFrame(() => chart.resize());
          }
        }
        groups.appendChild(createPrintSection(title, rows, format));
      }
      fragment.appendChild(groups);
    }

    if (!anyReservations) {
      for (const [id] of chartSlots) {
        const box = document.getElementById(id)?.closest(".chart-box");
        if (box) setEmptyState(box, false);
      }
    }
    print.replaceChildren(fragment);
  }

  // Refresh print only from the last rendered snapshot; a filter request
  // still pending in the background must not pretend it has new data.
  let lastSnapshot = null;
  // UI-81: each grouped panel retains its two independent Chart.js datasets.
  const metricGroups = [
    ["reportAccommodationMetric", ["popularRoomsChart", "guestsPerRoomChart"]],
    ["reportActivityMetric", ["peakReservationDaysChart", "guestVolumeTrendChart"]],
  ];

  function syncMetricGroup(selectId, ids) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const selected = ids.includes(select.value) ? select.value : ids[0];
    for (const id of ids) {
      const view = document.getElementById(id + "View");
      if (view) view.hidden = id !== selected;
    }
    const chart = lastSnapshot?.chartInstances?.[selected];
    if (typeof chart?.resize === "function") {
      requestAnimationFrame(() => {
        // A rapid selector change must not resize a newly hidden chart.
        if (select.value === selected && lastSnapshot?.chartInstances?.[selected] === chart) chart.resize();
      });
    }
  }

  function syncSourceBar() {
    const online = Math.max(0, safeNumber(document.getElementById("onlineBookingsCount")?.textContent));
    const manual = Math.max(0, safeNumber(document.getElementById("manualBookingsCount")?.textContent));
    const total = online + manual;
    const onlineBar = document.getElementById("reportOnlineBar");
    const manualBar = document.getElementById("reportManualBar");
    if (onlineBar && manualBar) {
      onlineBar.style.width = total ? (online / total * 100) + "%" : "0%";
      manualBar.style.width = total ? (manual / total * 100) + "%" : "0%";
    }
  }

  for (const [selectId, ids] of metricGroups) {
    document.getElementById(selectId)?.addEventListener("change", () => syncMetricGroup(selectId, ids));
  }

  function updateWithSnapshot(bookings, chartInstances) {
    lastSnapshot = { bookings, chartInstances };
    update(bookings, chartInstances);
    syncSourceBar();
    for (const [selectId, ids] of metricGroups) syncMetricGroup(selectId, ids);
  }
  function preparePrint() {
    if (lastSnapshot) update(lastSnapshot.bookings, lastSnapshot.chartInstances);
  }

  window.ArvicReportPresentation = {
    update: updateWithSnapshot,
    preparePrint,
  };
})();
