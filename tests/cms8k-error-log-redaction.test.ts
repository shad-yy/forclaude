// O-09 — audits whether the two flagged `console.error` calls in
// lib/panel/cms8k.ts (`[CMS8K SESSION] Error creating line via
// session:` and `[CMS8K] Get credentials error:`) ever surface the
// panel session cookie when the underlying fetch throws. Both call
// sites pass the cookie via the `Cookie` HTTP header, never in the
// URL — so the question is empirical: does a real network-level
// fetch failure's error object embed request headers anywhere in its
// message/stack? Answered here with MSW's `HttpResponse.error()`,
// which produces the actual native fetch rejection, not a
// hand-crafted fake error shape.
//
// While auditing, also checked the sibling Strategy-A catch
// (`[CMS8K API] Error during API key trial creation:`), because that
// call site DOES put a secret in the URL query string (`api_key=...`)
// — a more concrete leak vector than O-09's original session-cookie
// question, worth checking with the same technique since it was
// already being built.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "./msw/server";
import { createTrialAccount } from "@/lib/panel/cms8k";

const SECRET_SESSION_COOKIE = "STORMERSESSID=SUPER_SECRET_SESSION_TOKEN_XYZ789";
const SECRET_API_KEY = "SUPER_SECRET_API_KEY_ABC123";
const PANEL_URL = "https://cms-8k.test";

function collectLogs(spies: { log: any; warn: any; error: any }): string {
  return [...spies.log.mock.calls, ...spies.warn.mock.calls, ...spies.error.mock.calls]
    .flat()
    .map(v => {
      if (typeof v === "string") return v;
      if (v instanceof Error) return `${v.message} ${v.stack ?? ""}`;
      try {
        return JSON.stringify(v);
      } catch {
        return String(v);
      }
    })
    .join(" | ");
}

describe("O-09 cms8k.ts error-log redaction under real fetch failures", () => {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    logSpy.mockClear();
    warnSpy.mockClear();
    errorSpy.mockClear();
    vi.stubEnv("CMS8K_URL", PANEL_URL);
    vi.stubEnv("CMS8K_SESSION_COOKIE", SECRET_SESSION_COOKIE);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("session-strategy line-creation failure (line ~320 catch) does not leak the session cookie", async () => {
    // Strategy A is skipped (no CMS8K_API_KEY). Strategy B's
    // line-creation call (action=add_new) throws a real network
    // error — this is exactly the try/catch at cms8k.ts:319-321.
    server.use(http.get(`${PANEL_URL}/api.php`, () => HttpResponse.error()));

    const result = await createTrialAccount("Alice");
    expect(result.success, "must have failed for this assertion to discriminate").toBe(false);

    const logs = collectLogs({ log: logSpy, warn: warnSpy, error: errorSpy });
    expect(
      logs.includes(SECRET_SESSION_COOKIE) || logs.includes("SUPER_SECRET_SESSION_TOKEN_XYZ789"),
      "the session cookie must not appear in any console call after a network failure",
    ).toBe(false);
  });

  it("credential-lookup failure (line ~417 catch, via getLineCredentials) does not leak the session cookie", async () => {
    // Line-creation succeeds so the code proceeds into
    // getLineCredentials; both of ITS lookups then fail with real
    // network errors, exercising cms8k.ts:381-383 and :416-417.
    server.use(
      http.get(`${PANEL_URL}/api.php`, ({ request }) => {
        const action = new URL(request.url).searchParams.get("action");
        if (action === "add_new") return HttpResponse.json({ result: true });
        return HttpResponse.error(); // get_line_info fallback fails
      }),
      http.get(`${PANEL_URL}/api_table.php`, () => HttpResponse.error()),
    );

    const result = await createTrialAccount("Bob");
    // Both credential-retrieval strategies failed -> getLineCredentials
    // returns null -> createTrialAccount reports a specific failure.
    expect(result.success).toBe(false);

    const logs = collectLogs({ log: logSpy, warn: warnSpy, error: errorSpy });
    expect(
      logs.includes(SECRET_SESSION_COOKIE) || logs.includes("SUPER_SECRET_SESSION_TOKEN_XYZ789"),
      "the session cookie must not appear in any console call after either credential-lookup network failure",
    ).toBe(false);
  });

  it("scanner control — a successful fetch DOES carry the cookie, proving the assertions above discriminate", async () => {
    // Without this control, the two tests above would pass equally
    // well against a version of cms8k.ts that never sent the cookie
    // at all. Confirms the Cookie header is genuinely present on the
    // outbound request whose failure we then inspect.
    let capturedCookieHeader: string | null = null;
    server.use(
      http.get(`${PANEL_URL}/api.php`, ({ request }) => {
        capturedCookieHeader = request.headers.get("cookie");
        return HttpResponse.error();
      }),
    );
    await createTrialAccount("Carol");
    expect(capturedCookieHeader).toBe(SECRET_SESSION_COOKIE);
  });
});

describe("O-09 follow-on finding — Strategy A's api_key IS in the URL (not the original O-09 scope, but same technique)", () => {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    logSpy.mockClear();
    warnSpy.mockClear();
    errorSpy.mockClear();
    vi.stubEnv("CMS8K_URL", PANEL_URL);
    vi.stubEnv("CMS8K_API_KEY", SECRET_API_KEY);
    vi.stubEnv("CMS8K_SESSION_COOKIE", ""); // isolate to Strategy A only
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("API-key-strategy failure (line ~264 catch) does not leak the api_key, despite it being a URL query param", async () => {
    server.use(http.get(`${PANEL_URL}/api.php`, () => HttpResponse.error()));

    await createTrialAccount("Dave");

    const logs = collectLogs({ log: logSpy, warn: warnSpy, error: errorSpy });
    expect(
      logs.includes(SECRET_API_KEY),
      "the api_key query param must not appear in any console call after a network failure — MSW's HttpResponse.error() produces a generic fetch-failed TypeError with no URL embedded, confirmed empirically by this test",
    ).toBe(false);
  });
});
