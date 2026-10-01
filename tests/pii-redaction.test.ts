// Enforces: no code path in lib/panel/* logs raw panel response bodies,
// which carry customer passwords, to console. Red-first proof: this test
// fails against the current tree at tests/pii-redaction.test.ts:56 with
// "the panel password leaked to console.log: expected 'HUNTER2ABC123' to
// not appear in any log call" — see memory-bank/QA-LOG.md A-02.
//
// Applies rule from playbook/skills/documentation-discipline.md (log
// hygiene) and the layered-testing-strategy pattern: module-level fetch
// stub with a spy on console.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createTrialAccount } from "@/lib/panel/cms8k";

const SECRET_PASSWORD = "HUNTER2ABC123"; // gitleaks:allow — made-up marker, not a credential
const SECRET_SNIPPETS = [SECRET_PASSWORD, "secret@example.com"];

function makePanelResponse(): Response {
  const body = JSON.stringify({
    result: "success",
    username: "SLTV_alice_4821",
    password: SECRET_PASSWORD,
    server: "http://pro.business-cloud-8.ru",
    expire: Date.now() + 86_400_000,
  });
  return new Response(body, { status: 200, headers: { "Content-Type": "application/json" } });
}

describe("PII redaction — lib/panel/cms8k.ts", () => {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const fetchStub = vi.fn(async (_url: RequestInfo | URL) => makePanelResponse());

  beforeEach(() => {
    logSpy.mockClear();
    warnSpy.mockClear();
    errorSpy.mockClear();
    fetchStub.mockClear();
    vi.stubGlobal("fetch", fetchStub);
    // API-key strategy path — deterministic, does not hit the session flow
    vi.stubEnv("CMS8K_API_KEY", "test-api-key");
    vi.stubEnv("CMS8K_URL", "https://cms-8k.test");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("createTrialAccount never logs the panel password", async () => {
    const result = await createTrialAccount("Alice");
    // Precondition: the fetch stub actually returned the shape we set up,
    // so the code under test had a chance to log the password.
    expect(result.success, "trial creation must have completed for this assertion to discriminate").toBe(true);

    const allCalls = [
      ...logSpy.mock.calls,
      ...warnSpy.mock.calls,
      ...errorSpy.mock.calls,
    ]
      .flat()
      .map(v => (typeof v === "string" ? v : JSON.stringify(v)))
      .join(" | ");

    for (const snippet of SECRET_SNIPPETS) {
      expect(
        allCalls.includes(snippet),
        `the panel password leaked to console: expected "${snippet}" to not appear in any log call`,
      ).toBe(false);
    }
  });

  it("scanner control — the fixture actually contains the secret", () => {
    // Guards against a test that would silently pass on a broken fixture.
    // per layered-testing-strategy: every positive assertion needs a control
    // that would fail a trivially wrong implementation.
    const body = makePanelResponse();
    return body.text().then(text => {
      expect(text).toContain(SECRET_PASSWORD);
    });
  });
});
