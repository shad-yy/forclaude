import { defineConfig } from "vitest/config"
import { loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  return {
    test: {
      globals: true,
      environment: "node",
      include: ["tests/**/*.test.ts"],
      exclude: ["tests/mobile-responsiveness.test.ts", "node_modules/**"],
      env: {
        ...env,
        JWT_SECRET: env.JWT_SECRET || "9fa911726c474edb555a0b5877e510082cca38d47ddd8f19870e130a7700ddddc87586565b2c89c00dffcc231af234fbc6b352f7bcbc30f67b693f9102859a5f",
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
  }
})



