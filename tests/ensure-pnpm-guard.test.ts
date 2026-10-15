// O-15 — pins the pnpm-only preinstall guard's behaviour. Spawns the
// real script as a child process (not a real package-manager install
// — that would touch node_modules and the network) with a spoofed
// npm_config_user_agent, which is exactly the signal every package
// manager sets and the only thing the guard reads.

import { describe, it, expect } from "vitest"
import { execFileSync } from "node:child_process"

function runGuard(userAgent: string): { status: number; stderr: string } {
  try {
    execFileSync("node", ["scripts/ensure-pnpm.js"], {
      env: { ...process.env, npm_config_user_agent: userAgent },
      encoding: "utf8",
    })
    return { status: 0, stderr: "" }
  } catch (err: any) {
    return { status: err.status ?? 1, stderr: String(err.stderr ?? "") }
  }
}

describe("O-15 ensure-pnpm preinstall guard", () => {
  it("exits 0 when invoked under pnpm", () => {
    const result = runGuard("pnpm/10.33.0 npm/? node/v20.11.0 linux x64")
    expect(result.status).toBe(0)
  })

  it("exits non-zero when invoked under npm", () => {
    const result = runGuard("npm/10.2.4 node/v20.11.0 linux x64")
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain("pnpm only")
  })

  it("exits non-zero when invoked under yarn", () => {
    const result = runGuard("yarn/1.22.19 npm/? node/v20.11.0 linux x64")
    expect(result.status).not.toBe(0)
  })

  it("exits non-zero when the user agent is unset (defensive default)", () => {
    const result = runGuard("")
    expect(result.status).not.toBe(0)
  })
})
