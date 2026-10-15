#!/usr/bin/env node
/**
 * Dependency audit gate — used by .github/workflows/dependency-audit.yml (C-01).
 *
 * Reads `audit.json` (produced by `pnpm audit --prod --json`), writes a
 * severity summary to the GITHUB_STEP_SUMMARY, and exits non-zero if
 * the prod tree carries any CRITICAL advisory. High/moderate/low are
 * reported as warnings but do not fail the job — per the skill's rule
 * "a gate red every morning gets disabled inside a fortnight, taking
 * the credibility of every other check with it".
 *
 * Unreadable JSON is a failure: "a tool that failed to produce a
 * report has told you nothing".
 *
 * See playbook/skills/daily-dependency-audit.md for the full rule.
 */

import { readFileSync, existsSync, appendFileSync } from "node:fs";

const path = process.argv[2] ?? "audit.json";
const summary = process.env.GITHUB_STEP_SUMMARY;
const write = (s) => {
  console.log(s);
  if (summary) appendFileSync(summary, s + "\n");
};

if (!existsSync(path)) {
  console.error("::error::audit.json missing. pnpm audit produced no report.");
  process.exit(1);
}

let report;
try {
  report = JSON.parse(readFileSync(path, "utf8"));
} catch (e) {
  console.error(
    `::error::audit.json is unparseable (${e.message}). Treating unreadable as failure — a tool that produced no report told us nothing.`,
  );
  process.exit(1);
}

const counts = report.metadata?.vulnerabilities ?? {};
write("## Production dependency audit\n");
write("| Severity | Count |");
write("| :-- | --: |");
for (const level of ["critical", "high", "moderate", "low", "info"]) {
  write(`| ${level} | ${counts[level] ?? 0} |`);
}

// Detail the critical advisories inline — a maintainer reading the
// failing run should not have to click through to see what broke.
const advisories = report.advisories ?? {};
const criticals = Object.values(advisories).filter((a) => a.severity === "critical");
if (criticals.length > 0) {
  write("\n### Critical advisories in prod tree\n");
  for (const a of criticals) {
    write(`- **${a.module_name}** \`${a.vulnerable_versions}\` — ${a.title} (${a.github_advisory_id})`);
  }
}

const critical = counts.critical ?? 0;
const high = counts.high ?? 0;

if (critical > 0) {
  console.error(
    `::error::${critical} critical advisory/-ies in production tree. These ship to visitors.`,
  );
  process.exit(1);
}
if (high > 0) {
  console.log(
    `::warning::${high} high-severity advisory/-ies in production tree. Raise the threshold deliberately if this is normal.`,
  );
}
process.exit(0);
