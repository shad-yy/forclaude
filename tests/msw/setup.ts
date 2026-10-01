// C-02 — vitest setupFile: run MSW around every suite.
// Referenced by `vitest.config.ts::test.setupFiles`.
//
// The `onUnhandledRequest: "warn"` policy is deliberate: any test
// that makes a real network call the suite did not stub is a bug
// (either the test forgot a `server.use(...)` or the code changed
// its outbound URL). Warn — don't fail — so ancillary calls the
// test does not care about (e.g. accidentally reaching the analytics
// endpoint) don't cascade into unrelated failures. A test that WANTS
// hard-fail behaviour can pass `onUnhandledRequest: "error"` per-suite.

import { beforeAll, afterAll, afterEach } from "vitest"
import { server } from "./server"

beforeAll(() => {
  server.listen({ onUnhandledRequest: "warn" })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
