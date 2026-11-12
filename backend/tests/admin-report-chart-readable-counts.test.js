// Browser-free Chart.js presentation regressions. No DB or external services.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const code = fs.readFileSync(
  path.resolve(__dirname, "../../frontend/adminJS/admin-reports.js"), "utf8"
);

// Extract only a chart function, because the page normally runs in the browser.
function extract(startMarker, endMarker) {
  const start = code.indexOf(startMarker);
  const end = code.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0 && end > start, "Expected chart function must exist");
  return code.slice(start, end);
}

test("Bar charts hide the misleading single-swatch legend", () => {
  const context = {
    getTickStyle: () => ({}),
    getGridStyle: () => ({}),
    getLegendStyle: () => ({}),
  };
  vm.runInNewContext(
    extract("function getBarChartOptions() {", "function getMoneyBarChartOptions() {") +
      "\nthis.options = getBarChartOptions;",
    context
  );
  assert.equal(context.options().plugins.legend.display, false);
  assert.equal(context.options().scales.y.ticks.precision, 0);
});

test("Most-booked accommodation displays whole-number count ticks", () => {
  let captured = null;
  const context = {
    document: { getElementById: () => ({}) },
    popularRoomsChart: null,
    Chart: class {
      constructor(canvas, config) { captured = config; }
      destroy() {}
    },
    MINIMAL_PALETTE: ["#00a"],
    REPORT_COLORS: { text: "#000" },
    getAccommodationName: booking => booking.room_name,
    getBarChartOptions: () => ({ plugins: { legend: { display: false } } }),
    getGridStyle: () => ({}),
    getTickStyle: () => ({}),
  };
  vm.runInNewContext(
    extract("function renderPopularRoomsChart(bookings) {", "// SECTION 14:") +
      "\nthis.render = renderPopularRoomsChart;",
    context
  );
  context.render([{ room_name: "Family Room A" }]);
  assert.equal(captured.data.datasets[0].data[0], 1);
  assert.equal(captured.options.scales.x.ticks.precision, 0);
  assert.equal(captured.options.scales.x.ticks.stepSize, 1);
  assert.equal(captured.options.scales.x.ticks.maxTicksLimit, 8);
});
