// Enforces: no credential-shaped hex string (60+ chars, pure [0-9a-f])
// appears in checked-in config or test files. This is a structural
// tripwire — the exact class of leak recorded in QA-LOG standing
// correction O-01 (a 128-char hex JWT_SECRET fallback duplicated in
// vitest.config.ts:10 and tests/admin-metrics.test.ts:4).
//
// Red-first: this file failed before A-11 because both files carried
// the same 128-char hex.

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const CREDENTIAL_HEX = /\b[0-9a-f]{60,}\b/;

// Directory entries carry their own type, so no file is stat-checked and
// then read (the check-then-use race CodeQL flags as js/file-system-race).
function walkText(dir: string): { file: string; content: string }[] {
  const out: { file: string; content: string }[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walkText(full));
    else if (/\.(ts|tsx|js|mjs|cjs|json)$/.test(e.name)) {
      out.push({ file: full, content: readFileSync(full, "utf8") });
    }
  }
  return out;
}

const scanned = () => [
  { file: "vitest.config.ts", content: readFileSync("vitest.config.ts", "utf8") },
  ...walkText("tests"),
];

describe("A-11 no credential-shaped hex strings in tests/ or vitest.config.ts", () => {
  it("scanner finds files (control against vacuous walk)", () => {
    const files = scanned();
    expect(files.length, "walker found no files — path is wrong").toBeGreaterThan(5);
  });

  it("no file carries a 60+ char pure-hex token (looks-like-a-secret)", () => {
    const offenders: string[] = [];
    for (const { file, content } of scanned()) {
      // Strip fenced ```code``` and inline `code` from prose files; but
      // for .ts we treat everything as executable (a hex literal in a
      // string is exactly what we're catching).
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        const hit = line.match(CREDENTIAL_HEX);
        if (hit) offenders.push(`${file}:${i + 1}: ${hit[0].slice(0, 12)}...`);
      });
    }
    expect(
      offenders,
      "these lines contain long hex strings that look like credentials — rotate the fallback and add an obviously-fake test-only value",
    ).toEqual([]);
  });
});
