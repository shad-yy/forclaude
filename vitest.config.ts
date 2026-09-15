import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/mobile-responsiveness.test.ts", "node_modules/**"],
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



