import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // A-13: vitest owns *.test.ts, playwright owns *.spec.ts. The old
    // mobile-responsiveness .test.ts was actually a playwright spec —
    // renamed to .spec.ts and dropped from vitest excludes.
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules/**"],
    // C-02: MSW server lifecycle (start / reset-handlers / close).
    // The setup file is not itself a test — it just installs
    // beforeAll/afterEach/afterAll hooks for every suite that runs.
    setupFiles: ["tests/msw/setup.ts"],
    env: {
      // A-11 (2026-09-15): NEVER commit a real JWT_SECRET value here. The
      // previous 128-char hex fallback (see standing correction O-01 in
      // QA-LOG.md) is treated as potentially leaked and should be rotated
      // in production Vercel env. The literal below is deliberately
      // obviously-fake for tests; enforce via
      // tests/no-credential-shaped-hex-in-repo.test.ts.
      JWT_SECRET: process.env.JWT_SECRET || "test-only-jwt-secret-do-not-use-in-prod",
    },
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@": new URL("./", import.meta.url).pathname,
    },
  },
})



