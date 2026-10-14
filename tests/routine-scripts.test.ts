// The daily growth routine's data scripts cannot reach Search Console or
// PageSpeed Insights from CI (no credentials, and that is correct). So these
// tests prove the parts that can be proven offline:
//
//  - the service-account JWT is a valid RS256 token Google's token endpoint
//    would accept (signed with a throwaway key, verified with its public key)
//  - the GSC date window is a real 28 days ending 3 days back, where data is final
//  - the "striking distance" and "low CTR" filters pick exactly the rows they say
//  - the PageSpeed summary reads field data first, falls back to origin, and
//    labels "no data" rather than inventing a pass
//  - both scripts exit 2 with an explicit message when unconfigured, which is
//    how the routine knows to report "unavailable" instead of making numbers up

import { describe, it, expect } from "vitest"
import { generateKeyPairSync, createVerify } from "node:crypto"
import { execFileSync } from "node:child_process"
import {
  buildJwt,
  parseServiceAccount,
  window28,
  strikingDistance,
  lowCtrOnPageOne,
  SCOPE,
  TOKEN_URL,
} from "../scripts/routine/gsc.mjs"
import { summarise, GOOD } from "../scripts/routine/pagespeed.mjs"

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 })
const KEY = {
  client_email: "routine@example.iam.gserviceaccount.com",
  private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
}

const decode = (part: string) => JSON.parse(Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString())

describe("gsc.mjs", () => {
  it("builds an RS256 JWT with the claims Google requires, verifiable with the public key", () => {
    const jwt = buildJwt(KEY, 1_800_000_000)
    const [h, c, s] = jwt.split(".")
    expect(decode(h)).toEqual({ alg: "RS256", typ: "JWT" })
    expect(decode(c)).toEqual({ iss: KEY.client_email, scope: SCOPE, aud: TOKEN_URL, iat: 1_800_000_000, exp: 1_800_003_600 })
    const v = createVerify("RSA-SHA256")
    v.update(`${h}.${c}`)
    expect(v.verify(publicKey, Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64"))).toBe(true)
  })

  it("accepts the key as raw JSON or base64, and rejects one without a private key", () => {
    expect(parseServiceAccount(JSON.stringify(KEY))?.client_email).toBe(KEY.client_email)
    expect(parseServiceAccount(Buffer.from(JSON.stringify(KEY)).toString("base64"))?.client_email).toBe(KEY.client_email)
    expect(parseServiceAccount("")).toBeNull()
    expect(() => parseServiceAccount(JSON.stringify({ client_email: "x" }))).toThrow(/private_key/)
  })

  it("uses a 28-day window ending 3 days back, with the previous 28 days before it", () => {
    expect(window28(new Date("2026-10-14T06:00:00Z"))).toEqual({
      start: "2026-09-14",
      end: "2026-10-11",
      prevStart: "2026-08-17",
      prevEnd: "2026-09-13",
    })
  })

  it("striking distance is positions 8-20 with real impressions, biggest first", () => {
    const rows = [
      { key: "a", position: 7.9, impressions: 500, clicks: 1, ctr: 0 },
      { key: "b", position: 12, impressions: 40, clicks: 0, ctr: 0 },
      { key: "c", position: 19, impressions: 90, clicks: 1, ctr: 0 },
      { key: "d", position: 15, impressions: 5, clicks: 0, ctr: 0 },
      { key: "e", position: 21, impressions: 900, clicks: 0, ctr: 0 },
    ]
    expect(strikingDistance(rows).map((r: { key: string }) => r.key)).toEqual(["c", "b"])
  })

  it("low CTR on page one needs position <=10, CTR under 2%, and enough impressions", () => {
    const rows = [
      { key: "a", position: 4, impressions: 300, clicks: 3, ctr: 0.01 },
      { key: "b", position: 4, impressions: 300, clicks: 9, ctr: 0.03 },
      { key: "c", position: 11, impressions: 300, clicks: 1, ctr: 0.003 },
      { key: "d", position: 2, impressions: 20, clicks: 0, ctr: 0 },
    ]
    expect(lowCtrOnPageOne(rows).map((r: { key: string }) => r.key)).toEqual(["a"])
  })

  it("exits 2 with an explicit message when unconfigured — never estimates", () => {
    let code = 0
    let stderr = ""
    try {
      execFileSync("node", ["scripts/routine/gsc.mjs"], { env: { ...process.env, GSC_SERVICE_ACCOUNT_JSON: "" }, stdio: "pipe" })
    } catch (e) {
      const err = e as { status: number; stderr: Buffer }
      code = err.status
      stderr = err.stderr.toString()
    }
    expect(code).toBe(2)
    expect(stderr).toMatch(/GSC_SERVICE_ACCOUNT_JSON/)
    expect(stderr).toMatch(/do not estimate/)
  })
})

describe("pagespeed.mjs summarise", () => {
  const lab = {
    lighthouseResult: {
      categories: { performance: { score: 0.62 }, seo: { score: 1 }, accessibility: { score: 0.9 }, "best-practices": { score: 0.96 } },
      audits: { "largest-contentful-paint": { numericValue: 4100 }, "total-blocking-time": { numericValue: 380 }, "cumulative-layout-shift": { numericValue: 0.04 } },
    },
  }

  it("prefers URL-level field data and judges it against Google's thresholds", () => {
    const r = summarise("/", {
      ...lab,
      loadingExperience: {
        metrics: {
          LARGEST_CONTENTFUL_PAINT_MS: { percentile: 2300 },
          INTERACTION_TO_NEXT_PAINT: { percentile: 150 },
          CUMULATIVE_LAYOUT_SHIFT_SCORE: { percentile: 5 },
        },
      },
    })
    expect(r.field).toEqual({ source: "url", lcpMs: 2300, inpMs: 150, cls: 0.05, passes: true })
    expect(r.lab.performance).toBe(62)
  })

  it("fails a field metric over the threshold", () => {
    const r = summarise("/", {
      ...lab,
      loadingExperience: { metrics: { LARGEST_CONTENTFUL_PAINT_MS: { percentile: GOOD.lcpMs + 1 }, INTERACTION_TO_NEXT_PAINT: { percentile: 100 }, CUMULATIVE_LAYOUT_SHIFT_SCORE: { percentile: 1 } } },
    })
    expect(r.field.passes).toBe(false)
  })

  it("falls back to origin data, and says 'no data' rather than passing when there is none", () => {
    const origin = summarise("/buy", { ...lab, originLoadingExperience: { metrics: { LARGEST_CONTENTFUL_PAINT_MS: { percentile: 2000 }, INTERACTION_TO_NEXT_PAINT: { percentile: 100 }, CUMULATIVE_LAYOUT_SHIFT_SCORE: { percentile: 2 } } } })
    expect(origin.field.source).toBe("origin")
    const none = summarise("/buy", lab)
    expect(none.field).toMatchObject({ source: "none", passes: null })
  })
})

import { classify } from "../scripts/routine/tier.mjs"

describe("tier.mjs — what may ship without the owner", () => {
  it("a post plus everything generate-posts regenerates, and the run log, is Tier A", () => {
    // scripts/generate-posts.js rewrites lib/blog/posts.ts AND public/llms-full.txt
    // from the posts. Leaving llms-full.txt out of Tier A would have forced every
    // content PR to owner review — caught on 2026-10-14 by running the generator.
    expect(classify(["content/blog/premier-league-matchweek-7-tv-guide.mdx", "lib/blog/posts.ts", "public/llms-full.txt", "memory-bank/ROUTINE-LOG.md"]).tier).toBe("A")
  })

  it("the hand-maintained public/llms.txt is not content and stays Tier B", () => {
    expect(classify(["public/llms.txt"]).tier).toBe("B")
  })

  it("any code, config, dependency or workflow file forces Tier B", () => {
    for (const f of ["app/page.tsx", "components/homepage/EventCountdown.tsx", "lib/cache.ts", "package.json", "pnpm-lock.yaml", "next.config.mjs", "middleware.ts", ".github/workflows/ci.yml", "memory-bank/PROGRESS.md", "app/robots.ts"]) {
      const r = classify(["content/blog/a-post.mdx", f])
      expect(r.tier, f).toBe("B")
      expect(r.blocking).toEqual([f])
    }
  })

  it("an empty diff is not shippable", () => {
    expect(classify([]).tier).toBe("B")
  })

  it("rejects path tricks that only look like content", () => {
    expect(classify(["content/blog/../../app/page.mdx"]).tier).toBe("B")
    expect(classify(["content/blog/Post With Spaces.mdx"]).tier).toBe("B")
    expect(classify(["content/blog/nested/post.mdx"]).tier).toBe("B")
  })
})
