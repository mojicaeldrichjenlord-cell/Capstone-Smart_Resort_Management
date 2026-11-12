/**
 * Survey-only Vercel build for external capstone respondents.
 *
 * SECURITY: Allowlist only the static survey page, its CSS/JS, and the
 * explicitly approved resort photos. No customer/staff HTML, backend files,
 * database credentials, payment proofs, or environment files are published.
 *
 * Configure the separate Vercel SURVEY project:
 *   Root Directory: repository root (unset)
 *   Framework Preset: Other
 *   Build Command: node build-survey-preview.cjs
 *   Output Directory: survey-dist
 *
 * Do not apply these settings to the existing customer website project.
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = __dirname;
const sourceRoot = path.join(repoRoot, "frontend");
const outputRoot = path.join(repoRoot, "survey-dist");

// A deliberate, reviewed allowlist. Adding new survey assets requires a
// source-code review; never recursively copy frontend/ or backend/.
const approvedFiles = [
  "surveyHTML/preview.html",
  "surveyCSS/preview.css",
  "surveyJS/preview.js",
  "images/arvic-logo.png",
  "images/landing/pool-landing.jpg",
  "images/accommodations/Family-Room-A/family-room-a-cover.jpg",
  "images/accommodations/Double-Room/Double-Room-Cover.jpg",
  "images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-2.jpg",
  "images/accommodations/Pool-Shade/Pool-Shade-A.jpg",
  "images/accommodations/Function-Area/Beach-Pavillion.jpg",
  "images/accommodations/Single-Room-Poolside/Single-Room-Poolside-Cover.jpg"
];

fs.rmSync(outputRoot, { recursive: true, force: true });

for (const relative of approvedFiles) {
  const from = path.join(sourceRoot, relative);
  const to = path.join(outputRoot, relative);
  if (!fs.existsSync(from) || !fs.statSync(from).isFile()) {
    throw new Error(`Missing approved survey file: ${relative}`);
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

// Serve the same read-only survey page from / for an easy respondent URL.
// Relative asset paths in preview.html remain valid from both locations.
fs.copyFileSync(
  path.join(sourceRoot, "surveyHTML", "preview.html"),
  path.join(outputRoot, "index.html")
);

console.log(`Survey-only site ready: ${approvedFiles.length} approved assets + index.html`);
