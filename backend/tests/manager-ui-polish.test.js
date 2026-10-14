// Manager UI/UX regressions: static frontend checks plus simulated DOM.
// No database, PayPal, Gemini, browser automation, or external network calls.
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const frontend = path.resolve(__dirname, "../../frontend");
const read = p => fs.readFileSync(path.join(frontend, p), "utf8");
const pages = [
  ["managerDashboard.html", "Dashboard"],
  ["managerReservations.html", "Reservations"],
  ["managerAccommodations.html", "Accommodations"],
  ["managerReports.html", "Reports"],
];
const html = filename => read("managerHTML/" + filename);
const js = filename => read("managerJS/" + filename);

test("All four Manager pages support skip-navigation and focusable main content", () => {
  for (const [page] of pages) {
    const markup = html(page);
    assert.match(markup, /class="manager-skip-link"/);
    assert.match(markup, /href="#mainContent"/);
    assert.match(markup, /id="mainContent" tabindex="-1"/);
    assert.match(markup, /<nav class="manager-nav" aria-label="Manager navigation">/);
  }
});

test("Every Manager page has all navigation tabs and one correctly marked active tab", () => {
  for (const [page, current] of pages) {
    const markup = html(page);
    const active = [...markup.matchAll(/<a href="manager(\w+)\.html" aria-current="page">([^<]+)<\/a>/g)];
    assert.equal(active.length, 1, page);
    assert.equal(active[0][2], current);
    for (const [target] of pages) assert.match(markup, new RegExp(target));
  }
});

test("Manager updates announce status changes to assistive technology", () => {
  for (const [page] of pages) {
    const markup = html(page);
    assert.match(markup, /role="status"/);
    assert.match(markup, /aria-live="polite"/);
  }
});

test("Manager tables are keyboard-scrollable instead of inaccessible horizontal overflow", () => {
  for (const page of ["managerDashboard.html", "managerReservations.html",
    "managerAccommodations.html", "managerReports.html"]) {
    const markup = html(page);
    if (!markup.includes('class="activity-scroll"')) continue;
    assert.match(markup, /class="activity-scroll"[^>]+tabindex="0"/);
    assert.match(markup, /role="region" aria-label=/);
  }
});

test("Manager shared CSS supports mobile navigation, focus-visible and readable badges", () => {
  const css = read("managerCSS/managerDashboard.css");
  assert.match(css, /\.manager-navbar\s*\{\s*position:\s*sticky/);
  assert.match(css, /\.manager-nav\s*\{\s*overflow-x:\s*auto/);
  assert.match(css, /\.manager-skip-link:focus/);
  assert.match(css, /\.manager-status-pill\[data-status="pending"\]/);
  assert.match(css, /\.manager-status-pill\[data-status="approved"\]/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
});

test("Manager frontend renders untrusted guest and accommodation text without innerHTML", () => {
  for (const file of ["managerDashboard.js", "managerReservations.js",
    "managerAccommodations.js", "managerReports.js"]) {
    const src = js(file);
    assert.doesNotMatch(src, /\.innerHTML\s*=/);
    assert.match(src, /textContent/);
    assert.match(src, /sessionStorage\.getItem\("managerToken"\)/);
    assert.doesNotMatch(src, /sessionStorage\.getItem\("adminToken"\)/);
  }
});

test("Reservation action buttons have explicit labels and statuses use chips", () => {
  const src = js("managerReservations.js");
  assert.match(src, /badge\.className = "manager-status-pill"/);
  assert.match(src, /button\.setAttribute\("aria-label",/);
  assert.match(src, /manager-row-actions/);
  assert.match(src, /timeZone:\s*"UTC"/);
});

test("Manager labels avoid calling aggregate snapshot revenue or overnight occupancy", () => {
  const dashboard = html("managerDashboard.html");
  const reports = html("managerReports.html");
  assert.match(dashboard, /recorded accommodation payments/);
  assert.match(dashboard, /checked-in reservations/);
  assert.match(reports, /Days with no bookings are omitted/);
  assert.match(reports, /Do not add them together as revenue/);
  assert.match(reports, /Refund-adjusted net collections are not calculated/);
});

test("Manager reports and reservation actions remain behind Manager authentication", () => {
  const routes = fs.readFileSync(path.resolve(
    __dirname, "../routes/managerRoutes.js"), "utf8");
  assert.match(routes, /router\.use\(requireManagerAuth\)/);
  assert.match(routes, /router\.get\("\/reports", getManagerReports\)/);
  assert.match(routes, /router\.put\("\/reservations\/:id\/status"/);
  assert.doesNotMatch(js("managerReservations.js"), /\/api\/admin\//);
  assert.doesNotMatch(js("managerAccommodations.js"), /\/api\/admin\//);
});

class FakeNode {
  constructor(tagName = "div") {
    this.tagName = tagName;
    this.children = [];
    this.events = {};
    this.dataset = {};
    this.textContent = "";
    this.value = "";
    this.disabled = false;
  }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...items) { this.children = items; }
  addEventListener(type, callback) { this.events[type] = callback; }
  setAttribute(name, value) { this[name] = value; }
}
async function flush() {
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
}
async function createReservationUI(failReview = false) {
  const nodes = new Map();
  const getNode = id => {
    if (!nodes.has(id)) nodes.set(id, new FakeNode(id));
    return nodes.get(id);
  };
  getNode("managerStatusFilter").value = "all";
  const reservations = [{
    id: 17, reservation_code: "MAN-17", guest_name: "Test Guest",
    accommodation: "Test Cottage", guests: 4,
    check_in_date: "2026-10-20", check_in_time: "07:00:00",
    check_out_date: "2026-10-20", check_out_time: "17:00:00",
    payment_status: "pending", status: "pending", is_checked_in: false,
    booking_source: "online",
  }];
  const requests = [];
  let ready;
  const document = {
    addEventListener(event, fn) {
      if (event === "DOMContentLoaded") ready = fn;
    },
    getElementById: getNode,
    createElement: tag => new FakeNode(tag),
  };
  const win = {
    confirm: () => true,
    location: { replace: () => { throw new Error("Unexpected logout"); } },
  };
  const sandbox = {
    document, window: win, API_BASE: "/api",
    localStorage: { removeItem() {} },
    sessionStorage: { getItem: () => "mgr1.fake.payload", removeItem() {} },
    URLSearchParams,
    fetch: async (url, options = {}) => {
      requests.push({ url: String(url), method: options.method || "GET" });
      if (String(url).endsWith("/manager/me"))
        return { status: 200, ok: true, json: async () => ({ success: true }) };
      if (String(url).includes("/manager/reservations?"))
        return { status: 200, ok: true, json: async () => ({ success: true, reservations }) };
      if (String(url).includes("/manager/reservations/17/status")) {
        if (failReview) {
          return { status: 409, ok: false,
            json: async () => ({ success: false, message: "Reservation changed during review." }) };
        }
        reservations[0].status = "approved";
        return { status: 200, ok: true,
          json: async () => ({ success: true, status: "approved" }) };
      }
      throw new Error("Unexpected test request " + url);
    },
  };
  vm.runInNewContext(js("managerReservations.js"), sandbox, {
    filename: "managerReservations.js", timeout: 1500,
  });
  ready();
  await flush();
  const tbody = getNode("managerReservationsBody");
  const findButton = node => {
    if (node.tagName === "button" && node.textContent === "Approve") return node;
    for (const child of node.children) {
      const matched = findButton(child);
      if (matched) return matched;
    }
    return null;
  };
  const approve = findButton(tbody);
  assert.ok(approve, "Pending reservation must show Approve");
  return { nodes, requests, approve };
}

test("Manager reservation approval keeps a visible result after list refresh", async () => {
  const ui = await createReservationUI(false);
  await ui.approve.events.click();
  assert.equal(ui.requests.filter(r => r.method === "PUT").length, 1);
  assert.match(ui.nodes.get("managerReservationStatus").textContent,
    /MAN-17 approved successfully/);
  assert.match(ui.nodes.get("managerReservationStatus").textContent,
    /reservation\(s\) shown/);
});

test("Manager reservation conflict remains visible after list refresh", async () => {
  const ui = await createReservationUI(true);
  await ui.approve.events.click();
  assert.equal(ui.requests.filter(r => r.method === "PUT").length, 1);
  assert.match(ui.nodes.get("managerReservationStatus").textContent,
    /Reservation changed during review/);
  assert.match(ui.nodes.get("managerReservationStatus").textContent,
    /reservation\(s\) shown/);
});

test("Manager and Housekeeping task screens disable actions during pending API requests", () => {
  // Static safeguards: no live browser, database, or network needed.
  const manager = js("managerHousekeeping.js");
  const housekeeping = read("housekeepingJS/housekeepingTasks.js");
  const styles = read("managerCSS/managerDashboard.css");

  assert.match(manager, /function setBusy\(next\)/);
  assert.match(manager, /control\.disabled = next/);
  assert.match(manager, /message\.setAttribute\("aria-busy", String\(next\)\)/);
  assert.match(housekeeping, /function setBusy\(next\)/);
  assert.match(housekeeping, /button\.disabled = next/);
  assert.match(housekeeping, /status\.setAttribute\("aria-busy", String\(next\)\)/);
  assert.match(styles, /\.manager-row-actions button:disabled/);
  assert.doesNotMatch(manager, /\.innerHTML\s*=/);
  assert.doesNotMatch(housekeeping, /\.innerHTML\s*=/);
});

test("Mobile Housekeeping screens explain scrollable navigation and tables", () => {
  // Regression covers mobile discoverability; no database or browser needed.
  const managerPage = html("managerHousekeeping.html");
  const staffPage = read("housekeepingHTML/housekeepingDashboard.html");
  const managerCss = read("managerCSS/managerDashboard.css");
  const staffCss = read("housekeepingCSS/housekeepingDashboard.css");

  assert.match(managerPage, /class="manager-mobile-nav-hint"/);
  assert.match(managerPage, /class="manager-mobile-table-hint"/);
  assert.match(managerCss, /\.manager-mobile-nav-hint/);
  assert.match(managerCss, /\.manager-nav\s*\{\s*overflow-x:\s*auto/);
  assert.equal((staffPage.match(/class="hk-mobile-table-hint"/g) || []).length, 2);
  assert.match(staffCss, /\.hk-mobile-table-hint/);
  assert.match(staffCss, /\.hk-table-region\s*\{\s*width:\s*100%;\s*overflow-x:\s*auto/);
  assert.match(managerPage, /class="activity-scroll"[^>]+tabindex="0"/);
  assert.match(staffPage, /class="hk-table-region"[^>]+tabindex="0"/);
});
