"use strict";
// Stage Reports-20: read-only regression checks for compact charts and print.
// No database, backend, payment, network or printing side effects.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../../frontend");
const html = fs.readFileSync(path.join(root, "adminHTML/admin-reports.html"), "utf8");
const css = fs.readFileSync(path.join(root, "adminCSS/admin-reports-minimal.css"), "utf8");
const chartsJs = fs.readFileSync(path.join(root, "adminJS/admin-reports.js"), "utf8");
const presenterJs = fs.readFileSync(
  path.join(root, "adminJS/admin-reports-presentation.js"), "utf8");

function makeDom() {
  class Element {
    constructor(tag) {
      this.tag = tag;
      this.children = [];
      this.className = "";
      this.textContent = "";
      this.hidden = false;
      this.classes = new Set();
      this.classList = {
        toggle: (name, enabled) => {
          if (enabled) this.classes.add(name);
          else this.classes.delete(name);
        },
        contains: name => this.classes.has(name),
      };
    }
    appendChild(child) { this.children.push(child); return child; }
    replaceChildren(...children) { this.children = children; }
    setAttribute(name, value) { this[name] = value; }
    querySelector(selector) {
      if (selector === ".chart-empty-state") {
        return this.children.find(child => child.className === "chart-empty-state") || null;
      }
      return null;
    }
    closest() { return this; }
  }
  const grid = new Element("section");
  const print = new Element("section");
  const emptyOverview = new Element("p");
  const box = new Element("div");
  const canvas = { closest() { return box; } };
  const document = {
    querySelector(selector) { return selector === ".chart-grid" ? grid : null; },
    getElementById(id) {
      if (id === "reportPrintDetails") return print;
      if (id === "reportEmptyOverview") return emptyOverview;
      if (id === "bookingStatusChart") return canvas;
      return null;
    },
    createElement(tag) { return new Element(tag); },
    createDocumentFragment() { return new Element("fragment"); },
  };
  const win = {};
  const presenter = new Function("document", "window", "requestAnimationFrame",
    presenterJs + ";return window.ArvicReportPresentation;")(
    document, win, callback => callback()
  );
  return { presenter, grid, print, emptyOverview, box };
}

test("all nine chart IDs and report financial fields remain wired exactly once", () => {
  for (const id of [
    "bookingStatusChart", "bookingSourceChart", "popularRoomsChart",
    "salesByCategoryChart", "guestsPerRoomChart", "slotUsageChart",
    "peakReservationDaysChart", "guestVolumeTrendChart", "monthlyCancellationChart",
    "totalBookingsCount", "totalGuestsCount", "totalRevenueAmount",
    "paidBookingChargesAmount", "paidBedOverlapAmount", "entranceRefundAmount",
    "entranceCorrectionAmount", "adjustedCollectionsEstimate",
  ]) {
    assert.equal(html.split('id="' + id + '"').length - 1, 1, id);
  }
  assert.match(html, /class="revenue-report-disclaimer"/);
  assert.match(html, /id="printReportRange"/);
  assert.match(html, /id="printReportDate"/);
  assert.match(html, /report-print-details/);
});

test("report page loads scoped compact stylesheet and presentation module", () => {
  assert.match(html, /class="has-fixed-navbar reports-minimal-page"/);
  assert.ok(html.indexOf("admin-reports-minimal.css") >
    html.indexOf("admin-reports.css"));
  assert.ok(html.indexOf("admin-reports-presentation.js") >
    html.indexOf("admin-reports.js"));
  assert.match(chartsJs, /ArvicReportPresentation\?\.update\(bookings/);
  assert.match(chartsJs, /ArvicReportPresentation\?\.preparePrint\(\)/);
  assert.match(css, /\.reports-minimal-page \.chart-box\.is-empty/);
  assert.match(css, /\.reports-minimal-page \.report-empty-overview\[hidden\]/);
  assert.match(css, /height:\s*220px/);
});

test("no-reservation report shows a concise empty state instead of nine blank graphs", () => {
  const { presenter, grid, emptyOverview, print } = makeDom();
  presenter.update([], {});
  assert.equal(grid.classList.contains("has-no-bookings"), true);
  assert.equal(emptyOverview.hidden, false);
  assert.match(emptyOverview.textContent, /No reservations found/);
  assert.equal(print.children.length, 1, "print summary fragment still populated");
  presenter.preparePrint();
  assert.equal(print.children.length, 1, "print refresh stays stable");
});

test("chart print rows use actual chart values and plain text, not HTML", () => {
  const { presenter, print, box, grid, emptyOverview } = makeDom();
  const name = "<img src=x onerror=alert(1)>";
  let resized = 0;
  const chart = {
    data: { labels: ["Approved", name, "Cancelled"],
      datasets: [{ data: [3, 2, 0] }] },
    resize() { resized++; }
  };
  presenter.update([{ id: 1 }], { bookingStatusChart: chart });
  assert.equal(grid.classList.contains("has-no-bookings"), false);
  assert.equal(emptyOverview.hidden, true);
  assert.equal(box.classList.contains("is-empty"), false);
  const fragment = print.children[0];
  const groups = fragment.children[1];
  assert.equal(groups.children.length, 9, "nine chart summaries generated");
  const first = groups.children[0];
  const table = first.children[1];
  const tbody = table.children[1];
  assert.equal(tbody.children.length, 2, "zero-value category omitted");
  assert.equal(tbody.children[0].children[1].textContent, "3");
  assert.equal(tbody.children[1].children[0].textContent, name,
    "accommodation/user data is kept as plain text");
  assert.equal(resized, 0);
});

test("empty-chart change to nonempty refreshes chart dimensions safely", () => {
  const { presenter, box } = makeDom();
  const zero = { data: { labels: ["No data"], datasets: [{ data: [0] }] } };
  presenter.update([{ id: 1 }], { bookingStatusChart: zero });
  assert.equal(box.classList.contains("is-empty"), true);
  assert.equal(box.querySelector(".chart-empty-state").hidden, false);
  let resized = 0;
  const live = { data: { labels: ["Approved"], datasets: [{ data: [1] }] },
    resize() { resized++; } };
  presenter.update([{ id: 1 }], { bookingStatusChart: live });
  assert.equal(box.classList.contains("is-empty"), false);
  assert.equal(box.querySelector(".chart-empty-state").hidden, true);
  assert.equal(resized, 1);
});

test("print layout uses text tables, not large charts; financial caveat stays visible", () => {
  assert.match(css, /@page\s*\{\s*size:\s*A4 portrait/);
  assert.match(css, /\.reports-minimal-page \.chart-grid,/);
  assert.match(css, /\.reports-minimal-page \.report-print-details\s*\{\s*display:\s*block !important/);
  assert.match(css, /\.reports-minimal-page \.print-data-table/);
  assert.match(css, /\.reports-minimal-page \.revenue-report-disclaimer/);
  assert.match(presenterJs, /getChartRows\(chart\)/);
  assert.match(presenterJs, /createPrintSection\(title, rows, format\)/);
  assert.match(chartsJs, /calculateCollectedRevenueForReport/);
  assert.match(chartsJs, /summarizePaidAdditionalCharges/);
});

test("report filters, print button and signed Admin auth are still hooked", () => {
  for (const id of [
    "reportStartDate", "reportEndDate",
    "applyReportFilterBtn", "clearReportFilterBtn", "printReportBtn",
  ]) assert.equal(html.split('id="' + id + '"').length - 1, 1, id);
  assert.match(chartsJs, /checkAdminAccess\(\)/);
  assert.match(chartsJs, /function loadTodayReports\(\)/);
  assert.match(chartsJs, /function loadFilteredReports\(startDate, endDate\)/);
  assert.match(chartsJs, /window\.print\(\)/);
});
