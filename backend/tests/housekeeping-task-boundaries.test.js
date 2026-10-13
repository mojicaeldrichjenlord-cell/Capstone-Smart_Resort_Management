// Housekeeping Phase 2 task lifecycle / RBAC tests.
// All operations are mocked. NO live Aiven/PayPal/booking modifications.
const assert = require("node:assert/strict");
const { test, before, beforeEach, after } = require("node:test");
const { randomBytes } = require("node:crypto");
const Module = require("node:module");
const express = require("express");

process.env.FRONTDESK_TOKEN_SECRET = randomBytes(48).toString("base64url");
let accounts, task, queries, missingTable, occupied, completed, reservationItem;
const currentDay = (() => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const p = Object.fromEntries(parts.map(x => [x.type,x.value]));
  return p.year + "-" + p.month + "-" + p.day;
})();
const fakeDb = {
  promise() {
    return {
      async query(text, params = []) {
        const sql = String(text).replace(/\s+/g, " ").trim();
        queries.push({ sql, params });
        const isTask = /housekeeping_tasks/i.test(sql);
        if (isTask && missingTable) {
          const e = new Error("Table housekeeping_tasks doesn't exist");
          e.code = "ER_NO_SUCH_TABLE"; e.errno = 1146; throw e;
        }
        if (/FROM users WHERE id = \? LIMIT 1/i.test(sql)) {
          const account = accounts.get(Number(params[0]));
          return [account ? [{ ...account }] : []];
        }
        if (/SELECT id, fullname FROM users WHERE LOWER\(role\)/i.test(sql)) {
          return [[...accounts.values()].filter(a =>
            a.role === "housekeeping" && a.account_status === "active" &&
            a.is_verified === 1).map(a => ({ id: a.id, fullname: a.fullname }))];
        }
        if (/LEFT JOIN housekeeping_tasks ht ON ht.reservation_item_id/i.test(sql)) {
          return [[...(completed && !task ? [{
            reservation_item_id: reservationItem,
            accommodation: "Test Room A",
            reservation_code: "TEST-HK-001", task_date: currentDay,
          }] : [])]];
        }
        if (/INSERT INTO housekeeping_tasks/i.test(sql)) {
          const [managerId, staffId, itemId] = params;
          const person = accounts.get(staffId);
          if (task) {
            const e = new Error("Duplicate turnover");
            e.code = "ER_DUP_ENTRY"; e.errno = 1062; throw e;
          }
          if (!completed || itemId !== reservationItem ||
              !person || person.role !== "housekeeping" ||
              person.account_status !== "active" || person.is_verified !== 1) {
            return [{ affectedRows: 0 }];
          }
          task = {
            id: 45, reservation_item_id: itemId, accommodation_id: 66,
            accommodation_name: "Test Room A", reservation_code: "TEST-HK-001",
            task_date: currentDay, status: "needs_cleaning", version: 0,
            assigned_to: staffId, assigned_name: person.fullname,
            verified_by: null, started_at: null, cleaned_at: null, verified_at: null,
          };
          assert.equal(managerId, 1);
          return [{ affectedRows: 1, insertId: 45 }];
        }
        if (/SELECT ht.id, ht.reservation_item_id/i.test(sql)) {
          if (!task) return [[]];
          if (/ht.assigned_to = \?/i.test(sql) && Number(params[0]) !== task.assigned_to) {
            return [[]];
          }
          if (/ht.task_date = \?/i.test(sql) && params.at(-1) !== currentDay) {
            return [[]];
          }
          return [[{ ...task }]];
        }
        if (/UPDATE housekeeping_tasks ht JOIN users u/i.test(sql)) {
          const [staffId, id, version] = params;
          const person = accounts.get(staffId);
          if (task && task.id === id && task.version === version &&
              task.status === "needs_cleaning" && person &&
              person.role === "housekeeping" && person.account_status === "active" &&
              person.is_verified === 1) {
            task.assigned_to = staffId;
            task.assigned_name = person.fullname;
            task.version++;
            return [{ affectedRows: 1 }];
          }
          return [{ affectedRows: 0 }];
        }
        if (/UPDATE housekeeping_tasks SET status = 'in_progress'/i.test(sql)) {
          const [id, staffId, version] = params;
          if (task && task.id === id && task.assigned_to === staffId &&
              task.version === version && task.status === "needs_cleaning") {
            task.status = "in_progress"; task.version++; return [{ affectedRows: 1 }];
          }
          return [{ affectedRows: 0 }];
        }
        if (/UPDATE housekeeping_tasks SET status = 'cleaned'/i.test(sql)) {
          const [id, staffId, version] = params;
          if (task && task.id === id && task.assigned_to === staffId &&
              task.version === version && task.status === "in_progress") {
            task.status = "cleaned"; task.version++; return [{ affectedRows: 1 }];
          }
          return [{ affectedRows: 0 }];
        }
        if (/UPDATE housekeeping_tasks ht SET ht.status = 'verified_ready'/i.test(sql)) {
          const [managerId, id, version] = params;
          assert.match(sql, /NOT EXISTS \(SELECT 1 FROM reservation_items ri/);
          if (task && task.id === id && task.version === version &&
              task.status === "cleaned" && !occupied) {
            task.status = "verified_ready"; task.verified_by = managerId;
            task.version++; return [{ affectedRows: 1 }];
          }
          return [{ affectedRows: 0 }];
        }
        throw new Error("Unexpected mocked SQL: " + sql);
      },
    };
  }
};
function mock(path, value) {
  const filename = require.resolve(path);
  const m = new Module(filename); m.filename = filename;
  m.loaded = true; m.exports = value; require.cache[filename] = m;
}
mock("../config/db", fakeDb);
const { issueManagerToken } = require("../middleware/managerAuth");
const { issueHousekeepingToken } = require("../middleware/housekeepingAuth");
const { issueAdminToken } = require("../middleware/adminAuth");
const { issueCustomerToken } = require("../middleware/customerAuth");
const { issueFrontDeskToken } = require("../middleware/frontDeskAuth");
const managerToken = issueManagerToken(1);
const staffToken = issueHousekeepingToken(2);
const otherToken = issueHousekeepingToken(3);
const unrelated = [issueAdminToken(1), issueFrontDeskToken(1), issueCustomerToken(1)];
const noop = (_req, res) => res.json({ success: true });
mock("../controllers/manager/managerOverviewController", { getManagerMe: noop, getManagerOverview: noop });
mock("../controllers/manager/managerReservationsController", { listManagerReservations: noop, reviewManagerReservation: noop });
mock("../controllers/manager/managerAccommodationsController", {
  listManagerAccommodations: noop, updateManagerAccommodationOperations: noop,
});
mock("../controllers/manager/managerReportsController", { getManagerReports: noop });
mock("../controllers/housekeeping/housekeepingScheduleController", {
  getHousekeepingMe: noop, getDailyHousekeepingSchedule: noop,
});
const app = express();
app.use(express.json());
app.use("/api/manager", require("../routes/managerRoutes"));
app.use("/api/housekeeping", require("../routes/housekeepingRoutes"));
let server, base;
before(async () => {
  server = await new Promise(resolve => {
    const listener = app.listen(0,"127.0.0.1",() => resolve(listener));
  });
  base = "http://127.0.0.1:" + server.address().port;
});
after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
beforeEach(() => {
  accounts = new Map([
    [1, { id:1, fullname:"Manager", role:"manager", account_status:"active", is_verified:1 }],
    [2, { id:2, fullname:"House Keeper", role:"housekeeping", account_status:"active", is_verified:1 }],
    [3, { id:3, fullname:"Other Housekeeper", role:"housekeeping", account_status:"active", is_verified:1 }],
  ]);
  task = null; queries = []; missingTable = false; occupied = false;
  completed = true; reservationItem = 41;
});
async function call(route, { token = managerToken, method = "GET", body } = {}) {
  const response = await fetch(base + route, {
    method,
    headers: {
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(5000),
  });
  return { code: response.status, data: await response.json() };
}
const mgr = "/api/manager/housekeeping", hk = "/api/housekeeping";
const create = (body = { reservation_item_id: 41, assigned_to: 2 }) =>
  call(mgr + "/tasks", { method: "POST", body });
const createAndCheck = async () => {
  const result = await create();
  assert.equal(result.code, 201);
  return result;
};
const start = (version = 0, token = staffToken) =>
  call(hk + "/tasks/45/start", { token, method: "PUT", body: { version } });
const cleaned = (version = 1, token = staffToken) =>
  call(hk + "/tasks/45/cleaned", { token, method: "PUT", body: { version } });
const verify = (version = 2, token = managerToken) =>
  call(mgr + "/tasks/45/verify", { token, method: "PUT", body: { version } });
const taskWrites = () => queries.filter(x => /^(INSERT INTO|UPDATE) housekeeping_tasks/i.test(x.sql));

test("Manager sees verified housekeeping staff without exposing contact details", async () => {
  const r = await call(mgr + "/staff");
  assert.equal(r.code,200);
  assert.equal(r.data.staff.length,2);
  assert.equal(r.data.staff[0].fullname,"House Keeper");
  assert.equal(r.data.staff[0].email,undefined);
});
test("Only completed reservation items without tasks appear in Manager candidate list", async () => {
  const r = await call(mgr + "/eligible-items?date=" + currentDay);
  assert.equal(r.code,200);
  assert.equal(r.data.items[0].reservation_item_id,41);
  assert.equal(r.data.items[0].first_name,undefined);
  assert.equal(taskWrites().length,0);
});
test("Manager creates a task for a completed reservation item", async () => {
  const r = await createAndCheck();
  assert.equal(r.data.id,45);
  assert.equal(task.status,"needs_cleaning");
  assert.equal(task.assigned_to,2);
  assert.equal(taskWrites().length,1);
  assert.match(taskWrites()[0].sql,/r.reservation_status = 'completed'/);
  assert.match(taskWrites()[0].sql,/u.is_verified = 1/);
  assert.doesNotMatch(taskWrites()[0].sql,/UPDATE reservations|UPDATE accommodations|UPDATE payment/i);
});
test("Uncompleted reservation cannot create a cleaning task", async () => {
  completed = false;
  const r = await create();
  assert.equal(r.code,409);
  assert.equal(task,null);
});
test("Duplicate cleaning task for same reservation item is rejected", async () => {
  await createAndCheck();
  const r = await create();
  assert.equal(r.code,409);
  assert.equal(r.data.code,"TASK_ALREADY_EXISTS");
});
test("Unknown or disabled staff cannot be assigned a new task", async () => {
  accounts.get(2).account_status = "disabled";
  const r = await create();
  assert.equal(r.code,409);
  assert.equal(task,null);
});
for(const body of [
  { reservation_item_id: "foo", assigned_to: 2 },
  { reservation_item_id: 41, assigned_to: 0 },
  { reservation_item_id: 41, assigned_to: 2, created_by: 3 },
]) {
  test("Invalid task creation request is blocked", async () => {
    assert.equal((await create(body)).code,400);
    assert.equal(taskWrites().length,0);
  });
}
test("Housekeeping sees only their own assigned tasks", async () => {
  await createAndCheck();
  const own = await call(hk + "/tasks?date=" + currentDay,{token:staffToken});
  const other = await call(hk + "/tasks?date=" + currentDay,{token:otherToken});
  assert.equal(own.code,200);
  assert.equal(own.data.tasks.length,1);
  assert.equal(other.data.tasks.length,0);
  assert.equal(own.data.tasks[0].reservation_code,"TEST-HK-001");
  assert.equal(own.data.tasks[0].guest_phone,undefined);
});
test("Only assigned Housekeeping can start and mark cleaned", async () => {
  await createAndCheck();
  assert.equal((await start(0,otherToken)).code,409);
  assert.equal((await start(0)).code,200);
  assert.equal(task.status,"in_progress");
  assert.equal((await cleaned(1,otherToken)).code,409);
  assert.equal((await cleaned(1)).code,200);
  assert.equal(task.status,"cleaned");
  assert.equal(task.version,2);
});
test("Cannot mark task cleaned without starting", async () => {
  await createAndCheck();
  assert.equal((await cleaned(0)).code,409);
  assert.equal(task.status,"needs_cleaning");
});
test("Stale version blocks simultaneous task update", async () => {
  await createAndCheck();
  assert.equal((await start(0)).code,200);
  assert.equal((await start(0)).code,409);
  assert.equal((await cleaned(0)).code,409);
  assert.equal(task.version,1);
});
test("Manager may reassign task before cleaning starts only", async () => {
  await createAndCheck();
  const response = await call(mgr + "/tasks/45/assign",{
    method:"PUT",body:{assigned_to:3,version:0},
  });
  assert.equal(response.code,200);
  assert.equal(task.assigned_to,3);
  assert.equal((await start(1,staffToken)).code,409);
  assert.equal((await start(1,otherToken)).code,200);
});
test("Manager cannot reassign after cleaning has started", async () => {
  await createAndCheck();
  await start();
  const r = await call(mgr + "/tasks/45/assign",{
    method:"PUT",body:{assigned_to:3,version:1},
  });
  assert.equal(r.code,409);
  assert.equal(task.assigned_to,2);
});
test("Manager verification is blocked before cleaning", async () => {
  await createAndCheck();
  assert.equal((await verify(0)).code,409);
  assert.equal(task.status,"needs_cleaning");
});
test("Manager cannot verify as ready while the accommodation has checked-in guest", async () => {
  await createAndCheck(); await start(); await cleaned();
  occupied = true;
  const r = await verify();
  assert.equal(r.code,409);
  assert.equal(r.data.code,"TASK_CHANGED_OR_OCCUPIED");
  assert.equal(task.status,"cleaned");
});
test("Manager verifies cleaned task without altering booking availability", async () => {
  await createAndCheck(); await start(); await cleaned();
  assert.equal((await verify()).code,200);
  assert.equal(task.status,"verified_ready");
  assert.equal(task.verified_by,1);
  assert.equal((await verify(2)).code,409);
  assert.equal(queries.some(x =>
    /^(UPDATE|DELETE|INSERT).*?\b(reservations|accommodations|payment_transactions)\b/i.test(x.sql)),false);
});
test("Housekeeping token cannot perform Manager verification", async () => {
  await createAndCheck(); await start(); await cleaned();
  const r = await verify(2,staffToken);
  assert.equal(r.code,401);
  assert.equal(task.status,"cleaned");
});
test("Manager token cannot start Housekeeping task", async () => {
  await createAndCheck();
  const r = await start(0,managerToken);
  assert.equal(r.code,401);
  assert.equal(task.status,"needs_cleaning");
});
for(const token of unrelated) {
  test("Other signed roles cannot read Manager Housekeeping tasks", async () => {
    const r = await call(mgr + "/tasks?date=" + currentDay,{token});
    assert.equal(r.code,401);
    assert.equal(queries.length,0);
  });
}
test("Missing and forged tokens reach no database queries", async () => {
  assert.equal((await call(hk + "/tasks",{token:null})).code,401);
  assert.equal((await call(hk + "/tasks",{token:"hk1.fake.invalid"})).code,401);
  assert.equal(queries.length,0);
});
test("Disabled Housekeeping staff loses access to all assigned tasks", async () => {
  accounts.get(2).account_status = "disabled";
  assert.equal((await call(hk + "/tasks",{token:staffToken})).code,403);
  assert.equal((await start(0)).code,403);
  assert.equal(taskWrites().length,0);
});
test("Invalid task date rejected before querying tasks", async () => {
  const r = await call(hk + "/tasks?date=2026-02-30",{token:staffToken});
  assert.equal(r.code,400);
  assert.equal(queries.filter(x=>/FROM housekeeping_tasks ht/i.test(x.sql)).length,0);
});
test("Missing migration responds with clear 503 activation guidance", async () => {
  missingTable = true;
  const r = await call(mgr + "/tasks?date=" + currentDay);
  assert.equal(r.code,503);
  assert.equal(r.data.code,"HOUSEKEEPING_MIGRATION_REQUIRED");
});
test("Housekeeping task endpoints never mutate existing booking/payment tables", async () => {
  await createAndCheck(); await start(); await cleaned(); await verify();
  for(const record of queries) {
    const sql = record.sql;
    if (/^(INSERT|UPDATE|DELETE)/i.test(sql)) {
      assert.match(sql,/housekeeping_tasks/i);
      assert.doesNotMatch(sql,/UPDATE reservations|UPDATE accommodations|UPDATE payment_transactions/i);
    }
  }
});
test("Housekeeping frontend never trusts localStorage roles or injects task text as markup", () => {
  const fs = require("node:fs"); const path = require("node:path");
  const hkScript = fs.readFileSync(path.resolve(
    __dirname,"../../frontend/housekeepingJS/housekeepingTasks.js"),"utf8");
  const mgrScript = fs.readFileSync(path.resolve(
    __dirname,"../../frontend/managerJS/managerHousekeeping.js"),"utf8");
  assert.match(hkScript,/sessionStorage\.getItem\("housekeepingToken"\)/);
  assert.match(mgrScript,/sessionStorage\.getItem\("managerToken"\)/);
  assert.doesNotMatch(hkScript + mgrScript,/innerHTML|localStorage\.getItem\("user"\)/);
  assert.match(hkScript,/window\.confirm/);
  assert.match(mgrScript,/window\.confirm/);
});
test("Schema creates isolated task table with unique reservation item and guarded statuses", () => {
  const fs = require("node:fs"); const path = require("node:path");
  const sql = fs.readFileSync(path.resolve(
    __dirname,"../../database/migrations/2026-10-13_create_housekeeping_tasks.sql"),"utf8");
  assert.match(sql,/CREATE TABLE IF NOT EXISTS housekeeping_tasks/);
  assert.match(sql,/UNIQUE KEY uq_housekeeping_item \(reservation_item_id\)/);
  assert.match(sql,/needs_cleaning','in_progress','cleaned','verified_ready/);
  assert.doesNotMatch(sql,/\bALTER TABLE\s+(?:reservations|accommodations)/i);
});


test("Manager may review tasks without receiving private guest or payment records", async () => {
  await createAndCheck();
  const result = await call(mgr + "/tasks?date=" + currentDay);
  assert.equal(result.code, 200);
  assert.equal(result.data.tasks.length, 1);
  assert.equal(result.data.tasks[0].assigned_to, 2);
  assert.equal(result.data.tasks[0].accommodation, "Test Room A");
  assert.equal(result.data.tasks[0].email, undefined);
  assert.equal(result.data.tasks[0].paid_amount, undefined);
});
test("Forged Manager token cannot read Housekeeping task roster", async () => {
  const result = await call(mgr + "/tasks", { token: "mgr1.invalid.fake" });
  assert.equal(result.code, 401);
  assert.equal(queries.length, 0);
});
test("Manager cannot bypass staff transitions using task verify endpoint", async () => {
  await createAndCheck();
  const response = await verify(0);
  assert.equal(response.code, 409);
  assert.equal(task.status, "needs_cleaning");
  assert.equal(task.version, 0);
});
test("Invalid or missing optimistic versions cannot mutate cleaning task state", async () => {
  await createAndCheck();
  const missing = await call(hk + "/tasks/45/start", {
    token: staffToken, method: "PUT", body: { unexpected: 0 },
  });
  const nullVersion = await call(hk + "/tasks/45/start", {
    token: staffToken, method: "PUT", body: { version: null },
  });
  assert.equal(missing.code, 400);
  assert.equal(nullVersion.code, 400);
  assert.equal(task.status, "needs_cleaning");
  assert.equal(task.version, 0);
});
