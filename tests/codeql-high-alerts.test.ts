// PR #6 CodeQL check: the high alerts fixed here keep their behaviour.
//
// - js/log-injection + js/tainted-format-string: caller-supplied strings
//   (search terms inside cache keys and endpoints) are logged through
//   logSafe() with a constant format string, so they cannot forge lines.
// - js/insecure-randomness: the panel username suffix comes from
//   crypto.randomInt, in the same SLTV_<name>_<4 digits> format.

import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { logSafe } from "@/lib/log/redact"
import { generateUsername } from "@/lib/panel/cms8k"

describe("logSafe", () => {
  it("removes CR and LF so one value cannot become two log lines", () => {
    expect(logSafe("search_all_teams.php?t=ars\n[Cache SWR] forged\r\nline")).toBe(
      "search_all_teams.php?t=ars[Cache SWR] forgedline",
    )
  })

  it("leaves an ordinary endpoint untouched", () => {
    expect(logSafe("lookupteam.php?id=133604")).toBe("lookupteam.php?id=133604")
  })
})

describe("generateUsername", () => {
  it("keeps the SLTV_<up to 5 chars>_<4 digits> format", () => {
    for (let i = 0; i < 200; i++) {
      expect(generateUsername("Jane O'Neil-Smith")).toMatch(/^SLTV_janeo_[1-9]\d{3}$/)
    }
  })

  it("does not use Math.random for the suffix or the admin test name", () => {
    // The diagnostic route's test name becomes part of the username too.
    for (const f of ["lib/panel/cms8k.ts", "app/api/admin/provision-test-trial/route.ts"]) {
      expect(readFileSync(f, "utf8"), f).not.toMatch(/Math\.random\(/)
    }
  })
})
