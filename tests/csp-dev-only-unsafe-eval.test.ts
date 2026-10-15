// Enforces: 'unsafe-eval' appears in the Content-Security-Policy only in
// development, never in production.
//
// 842f490 removed 'unsafe-eval' from script-src to harden production.
// `next dev` builds use eval-based source maps, so with no exception the
// dev server could not run any client JavaScript (O-28: Chromium logged
// "Refused to evaluate a string as JavaScript because 'unsafe-eval' is
// not an allowed source of script"). Production builds do not use eval.
//
// Red-first: the development case failed before next.config.mjs added
// the dev-only exception.

import { describe, it, expect, afterEach, vi } from "vitest";

async function scriptSrc(nodeEnv: string): Promise<string> {
  vi.stubEnv("NODE_ENV", nodeEnv);
  vi.resetModules();
  const { default: config } = await import("../next.config.mjs");
  const rules: Array<{ source: string; headers: Array<{ key: string; value: string }> }> = await config.headers();
  const csp = rules.flatMap((r) => r.headers).find((h) => h.key === "Content-Security-Policy");
  const directive = csp?.value.split(";").map((d) => d.trim()).find((d) => d.startsWith("script-src"));
  if (!directive) throw new Error("no script-src directive in the CSP");
  return directive;
}

describe("CSP 'unsafe-eval' is development-only", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("production script-src does not allow 'unsafe-eval'", async () => {
    expect(await scriptSrc("production")).not.toContain("'unsafe-eval'");
  });

  it("test-env script-src does not allow 'unsafe-eval'", async () => {
    expect(await scriptSrc("test")).not.toContain("'unsafe-eval'");
  });

  it("development script-src allows 'unsafe-eval' so `next dev` can run client JS", async () => {
    expect(await scriptSrc("development")).toContain("'unsafe-eval'");
  });
});
