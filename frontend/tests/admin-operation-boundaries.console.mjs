// Import from the LOCAL Admin page's browser console after pulling the patch.
// Uses ID 0 and deliberately spaced COMPLETED. The prior 1bc7e47 handlers
// reject these probes before financial writes as well, so stale code fails
// the test without selecting a real reservation. Never calls PayPal.
export default async function runAdminOperationBoundaryChecks() {
  if (!["127.0.0.1", "localhost"].includes(location.hostname)) {
    throw new Error("Run this batch on your LOCAL Live Server Admin page only.");
  }
  const adminToken = sessionStorage.getItem("adminToken");
  if (!adminToken) throw new Error("Log in again as Admin, then rerun the batch.");

  const base = "http://127.0.0.1:5000/api";
  const endpoints = [
    { path: "/bookings/0/status", body: { status: " COMPLETED " }, status: 403, code: "FRONT_DESK_CHECKOUT_REQUIRED" },
    { path: "/admin/bookings/0/status", body: { status: " COMPLETED " }, status: 403, code: "FRONT_DESK_CHECKOUT_REQUIRED" },
    { path: "/admin/payments/0/mark-paid", body: {}, status: 410, code: "LEGACY_ADMIN_PAYMENT_ENDPOINT_RETIRED" },
    { path: "/admin/payments/0", body: { payment_status: "paid" }, status: 410, code: "LEGACY_ADMIN_PAYMENT_ENDPOINT_RETIRED" },
  ];
  const sessions = [
    { name: "No token", token: null },
    { name: "Fake token", token: "adm1.invalid.signature" },
    { name: "Valid Admin", token: adminToken },
  ];
  const results = [];
  for (const endpoint of endpoints) {
    for (const session of sessions) {
      const expected = session.name === "Valid Admin" ? endpoint.status : 401;
      try {
        const response = await fetch(base + endpoint.path, {
          method: "PUT",
          credentials: "omit",
          redirect: "error",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            ...(session.token ? { Authorization: `Bearer ${session.token}` } : {}),
          },
          body: JSON.stringify(endpoint.body),
          signal: AbortSignal.timeout(8000),
        });
        const data = await response.json();
        const passed = response.status === expected &&
          (session.name !== "Valid Admin" || data.code === endpoint.code);
        results.push({ endpoint: endpoint.path, session: session.name, expected,
          actual: response.status, result: passed ? "PASSED" : "FAILED",
          message: data.message || "" });
      } catch (error) {
        results.push({ endpoint: endpoint.path, session: session.name, expected,
          actual: "request error", result: "FAILED", message: error.message });
      }
    }
  }
  console.table(results);
  const passed = results.filter((row) => row.result === "PASSED").length;
  console.log(`ADMIN OPERATION BOUNDARIES: ${passed}/${results.length} PASSED`);
  console.log("Probe ID: 0. No real reservation selected; no PayPal calls. Expected 401/403/410 responses may appear red in DevTools.");
  if (passed !== results.length) console.warn("Send this results table for review. Functional regression testing is still separate.");
  return { passed, total: results.length, results };
}
