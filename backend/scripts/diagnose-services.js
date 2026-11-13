// STAGE 96-A — SAFE, READ-ONLY CONNECTION DIAGNOSTICS.
// Run from backend/: node scripts/diagnose-services.js
// No customer records read, no email sent, no Gemini model calls, no key values printed.
// Each remote request has a short timeout. Production environment variables are not changed.
"use strict";

require("dotenv").config({ quiet: true });
const mysql = require("mysql2/promise");

function present(name) {
  return typeof process.env[name] === "string" && process.env[name].trim().length > 0;
}

function output(name, value) {
  console.log(`${name}: ${value}`);
}

async function testDatabase() {
  const required = ["DB_HOST", "DB_USER", "DB_NAME"];
  if (required.some((name) => !present(name))) {
    output("MySQL", "CONFIGURATION INCOMPLETE (missing DB_HOST, DB_USER or DB_NAME)");
    return;
  }
  const host = String(process.env.DB_HOST).toLowerCase();
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(host);
  output("MySQL target", isLocal ? "LOCAL" : "REMOTE (verify this is not production Aiven)");
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 8000,
      ssl: String(process.env.DB_SSL || "").toLowerCase() === "true"
        ? { rejectUnauthorized: false } : undefined,
    });
    await connection.query("SELECT 1 AS connection_check");
    output("MySQL", "PASS (read-only connectivity)");
  } catch (error) {
    // Do not print SQL statements, credentials, hostname or customer data.
    output("MySQL", `FAIL (${String(error.code || "NETWORK_ERROR")})`);
  } finally {
    if (connection) await connection.end().catch(() => {});
  }
}

// Read-only model discovery confirms the configured key can reach Google's API.
// No prompts or generateContent calls are sent, so this does not spend generation tokens.
// A successful list response does NOT prove that generation quotas remain available.
async function checkGeminiKey() {
  if (!present("GEMINI_API_KEY")) {
    output("Gemini API connection", "SKIPPED (missing key)");
    return;
  }
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000", {
      method: "GET",
      headers: { "x-goog-api-key": process.env.GEMINI_API_KEY, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      // Only the HTTP code is displayed; never include Google's response body or the API key.
      output("Gemini API connection", `HTTP ${response.status}`);
      return;
    }
    output("Gemini API connection", "PASS (key accepted for model list)");
    const data = await response.json();
    const models = Array.isArray(data.models) ? data.models : [];
    // Match the current backend model configuration; never log any credentials.
    const configuredModel = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";
    const hasModel = models.some(item => item.name === `models/${configuredModel}`);
    output(`Gemini model ${configuredModel}`, hasModel ? "LISTED" : "NOT LISTED (check API model access)");
  } catch (error) {
    output("Gemini API connection", error.name === "TimeoutError" ? "TIMEOUT" : "NETWORK ERROR");
  }
}

async function checkBrevo() {
  output("Brevo API key", present("BREVO_API_KEY") ? "CONFIGURED" : "MISSING");
  output("Brevo sender", present("EMAIL_FROM") || present("EMAIL_USER") ? "CONFIGURED" : "MISSING");
  if (!present("BREVO_API_KEY")) return;
  try {
    const account = await fetch("https://api.brevo.com/v3/account", {
      method: "GET",
      headers: { "api-key": process.env.BREVO_API_KEY, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    output("Brevo credential check", account.ok ? "PASS" : `HTTP ${account.status}`);
    if (!account.ok || !(present("EMAIL_FROM") || present("EMAIL_USER"))) return;
    const senders = await fetch("https://api.brevo.com/v3/senders", {
      method: "GET",
      headers: { "api-key": process.env.BREVO_API_KEY, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!senders.ok) {
      output("Brevo sender lookup", `HTTP ${senders.status}`);
      return;
    }
    const sender = String(process.env.EMAIL_FROM || process.env.EMAIL_USER).trim().toLowerCase();
    const data = await senders.json();
    const matching = (Array.isArray(data.senders) ? data.senders : [])
      .filter((item) => String(item.email || "").trim().toLowerCase() === sender);
    // A verified sender is necessary but not sufficient to guarantee delivery.
    output("Brevo sender match", matching.length > 0 ? "FOUND (check domain verification and transactional logs)" : "NOT FOUND");
    if (matching.length && typeof matching[0].active === "boolean") {
      output("Brevo sender active", matching[0].active ? "YES" : "NO");
    }
  } catch (error) {
    output("Brevo credential check", `UNREACHABLE (${error.name === "TimeoutError" ? "TIMEOUT" : "NETWORK_ERROR"})`);
  }
}

async function main() {
  console.log("Smart Resort Stage 96-C diagnostics — read-only; values are never printed");
  output("Gemini API key", present("GEMINI_API_KEY") ? "CONFIGURED (quota NOT checked)" : "MISSING");
  output("Azure voice", present("AZURE_SPEECH_KEY") && present("AZURE_SPEECH_REGION") ? "CONFIGURED (availability NOT checked)" : "NOT CONFIGURED (browser voice fallback)");
  output("Front Desk token secret", present("FRONTDESK_TOKEN_SECRET") && process.env.FRONTDESK_TOKEN_SECRET.length >= 32 ? "CONFIGURED" : "MISSING OR TOO SHORT");
  await testDatabase();
  await checkGeminiKey();
  await checkBrevo();
  console.log("No AI tokens or email credits consumed. No database changes.");
}

main().catch(() => {
  console.error("Unexpected diagnostic failure (no secrets printed).");
  process.exitCode = 1;
});
