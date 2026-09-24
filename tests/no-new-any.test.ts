// Enforces: the number of explicit `any` annotations in app code can go
// down but never up.
//
// CLAUDE.md bans `any`. The codebase still carries old ones (107 on
// Version-3 at 16b8d6a); this branch removed some. Clearing the rest is
// tracked in OPEN-WORK (O-18). Until then this ratchet stops new ones
// landing — when you remove more, lower CEILING to the new count.

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const CEILING = 91;
const ROOTS = ["lib", "app", "components"];
const ANY = /:\s*any\b|\bas any\b|<any>|any\[\]/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

describe("explicit `any` ratchet", () => {
  it(`app code has at most ${CEILING} lines with an explicit any`, () => {
    const hits = [...ROOTS.flatMap(sourceFiles), "middleware.ts"].flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, i) => (ANY.test(line) ? [`${file}:${i + 1}`] : [])),
    );
    expect(
      hits.length,
      `explicit any went up (CLAUDE.md bans it). Type the new code instead. Lines:\n${hits.join("\n")}`,
    ).toBeLessThanOrEqual(CEILING);
  });
});
