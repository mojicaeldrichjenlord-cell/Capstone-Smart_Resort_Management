// STAGE 85-A: Gemini request cost guard (single Node process).
// IMPORTANT: This is a conservative session allowance, NOT a billing cap.
// It resets on process restart and does not coordinate multiple instances.
// Google AI Studio billing is authoritative; no guest text or keys are stored.
const DEFAULT_CAP_USD = 1.50; // Protect part of the $5 demo credit.
const DEFAULT_RESERVE_USD = 0.03; // Conservative allowance per API attempt.
const INPUT_USD_PER_MILLION = 0.30; // Gemini 2.5 Flash standard text pricing.
const OUTPUT_USD_PER_MILLION = 2.50; // Includes thinking tokens.

function configuredNumber(name, fallback, { min = 0, max = 100 } = {}) {
  const raw = process.env[name];
  if (raw === undefined || String(raw).trim() === "") return fallback;
  const value = Number(raw);
  // Fail closed on invalid configs (do not silently disable the guard).
  return Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function approximateResponseCost(response) {
  const meta = response?.usageMetadata;
  if (!meta || typeof meta !== "object") return null;
  const usable = v => Number.isSafeInteger(Number(v)) && Number(v) >= 0
    ? Number(v) : 0;
  const input = usable(meta.promptTokenCount);
  const output = usable(meta.candidatesTokenCount);
  const thoughts = usable(meta.thoughtsTokenCount);
  return (input * INPUT_USD_PER_MILLION +
    (output + thoughts) * OUTPUT_USD_PER_MILLION) / 1000000;
}

function budgetError() {
  const error = new Error("Local Gemini session allowance exhausted.");
  error.status = 429;
  error.code = "AI_LOCAL_BUDGET";
  return error;
}

function createGeminiBudgetGuard(capUsd, reserveUsd) {
  if (!Number.isFinite(capUsd) || capUsd <= 0 ||
      !Number.isFinite(reserveUsd) || reserveUsd <= 0) {
    throw new Error("Invalid Gemini budget guard configuration");
  }
  let allocatedUsd = 0, estimatedSpendUsd = 0, inFlightUsd = 0;
  let blockedCalls = 0, callsWithoutMetadata = 0;
  function acquire() {
    // JS executes this synchronously; concurrent requests cannot both
    // reserve the same remaining local budget before an await.
    if (allocatedUsd + inFlightUsd + reserveUsd > capUsd + 1e-10) {
      blockedCalls++;
      throw budgetError();
    }
    inFlightUsd += reserveUsd;
    let completed = false;
    return (response = null) => {
      if (completed) return;
      completed = true;
      inFlightUsd -= reserveUsd;
      const known = approximateResponseCost(response);
      if (known === null) callsWithoutMetadata++;
      // Conservative usage for failed or unmetered attempts: reserve amount.
      // Amounts are estimates only, not authoritative billed charges.
      estimatedSpendUsd += known === null ? reserveUsd : known;
      allocatedUsd += Math.max(reserveUsd, known ?? 0);
    };
  }
  function snapshot() {
    return {
      capUsd, reservedPerAttemptUsd: reserveUsd, allocatedUsd,
      estimatedSpendUsd, inFlightUsd, blockedCalls, callsWithoutMetadata,
      approximate: true, resetsOnRestart: true, distributed: false,
    };
  }
  return { acquire, snapshot };
}

const capUsd = configuredNumber("AI_GEMINI_SESSION_CAP_USD", DEFAULT_CAP_USD);
const reserveUsd = configuredNumber("AI_GEMINI_RESERVE_USD", DEFAULT_RESERVE_USD,
  { min: 0.000001, max: 5 });
const configuredGuard = capUsd === null || reserveUsd === null
  ? null : createGeminiBudgetGuard(capUsd, reserveUsd);
const localGuard = configuredGuard || {
  acquire() { throw budgetError(); },
  snapshot() { return { blocked: true, configurationError: true }; },
};

module.exports = {
  localGuard, createGeminiBudgetGuard, approximateResponseCost,
  budgetError,
};
