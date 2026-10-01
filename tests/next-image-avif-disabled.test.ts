// Enforces: AVIF is not in next.config.mjs `images.formats`.
//
// Mitigates GHSA-2xp9-vwfh-vxw4 (Next.js Image Optimization API AVIF RCE,
// fixed in next@15.5.24 / 16.1.5). The site runs next@14.2.35 and the
// full major-version upgrade (O-11) is a separate project; disabling
// AVIF closes the specific attack path in the meantime. See A-15.
//
// Red-first: this file failed 1/2 before A-15 — `formats` still
// contained `image/avif`.
//
// When the Next.js patch lands (O-11 closed), delete this file OR
// invert its assertion to allow AVIF again if that's the desired
// posture.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

describe("A-15 AVIF disabled in next.config.mjs Image Optimizer (GHSA-2xp9-vwfh-vxw4 mitigation)", () => {
  it("next.config.mjs exists and declares an images.formats list", () => {
    const cfg = readFileSync("next.config.mjs", "utf8");
    expect(cfg).toMatch(/images\s*:\s*\{[\s\S]*?formats\s*:/);
  });

  it("images.formats does NOT include 'image/avif'", () => {
    const cfg = readFileSync("next.config.mjs", "utf8");
    // Match the formats array only; ignore any comments elsewhere in the file.
    const match = cfg.match(/formats\s*:\s*\[([^\]]*)\]/);
    expect(match, "could not locate images.formats array in next.config.mjs").not.toBeNull();
    expect(
      match![1],
      "AVIF must stay disabled while next@14 is running — reintroducing it re-opens the Image Optimizer RCE path (GHSA-2xp9-vwfh-vxw4)",
    ).not.toMatch(/image\/avif/);
  });
});
