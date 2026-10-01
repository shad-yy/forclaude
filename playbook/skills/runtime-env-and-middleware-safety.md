---
name: runtime-env-and-middleware-safety
description: Middleware runs on every matched request and has no per-route fallback — if it throws, the entire site returns 500. Never assert on env vars in middleware. Understand which vars are read at build vs runtime; a runtime-read var deleted in the dashboard breaks the running deployment with no push. Also covers nonce-based CSP as the pattern to prefer over unsafe-inline.
---

# Nothing throws in middleware

Middleware is the one hot path with no fallback. A route handler crashes → 500 on that route; a server component crashes → 500 on that page; middleware crashes → 500 on **every route**, no exceptions, no cached copies.

## The incident (T-ENV-20)

`middleware.ts` opened with:

```ts
if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be set in production")
}
```

`JWT_SECRET` was correctly identified as unused (no auth surfaces, no `jose` import, no `getJwtSecret()` caller) and deleted from Vercel to reduce secret surface. The guard remained.

`JWT_SECRET` has no `NEXT_PUBLIC_` prefix, so it is read from the **live** environment on every request. Deleting it in the dashboard broke the **already running** deployment with no redeploy.

Result: `500 MIDDLEWARE_INVOCATION_FAILED` on every route. **368 errors, 226 unique users, ~18 hours.** Nothing alerted. Discovered when a person opened the site.

## Rules

1. **Middleware must never throw.** If a check fails, return a `NextResponse` explaining why. A throw here has no fallback.
2. **Assertions belong at the point of consumption**, not at module import.
3. **Env-var read-time semantics matter**:
   - `NEXT_PUBLIC_*` → inlined at **build time**. Deleting in the dashboard does nothing until rebuild. Never carries a runtime secret; the value is in the bundle.
   - Everything else → read at **runtime** via `process.env`. Deleting in the dashboard breaks the running deployment immediately.
4. **Before deleting any variable**, grep for `<NAME>` across all file types (`.ts`, `.tsx`, `.js`, `.mjs`, `.md`, `.yml`, `.env*`), and look for guards, `throw`s, assertions, and `require`-time reads — not only consumers. "Nothing reads it" and "nothing breaks without it" are different questions.
5. **CSP: nonce-based, not `unsafe-inline`**. `unsafe-inline` in `script-src` disables the XSS mitigation CSP exists for. Set a per-request nonce in middleware; every `<script>`, including JSON-LD blocks, references it.
6. **Roll CSP changes out with `Content-Security-Policy-Report-Only` first.** A wrong CSP is invisible until it isn't.
7. **Scope loopback CSP**: local development often needs relaxed sources; production must never inherit them. Gate by `NODE_ENV` or a build-time constant, not a runtime env var.
8. **Runtime monitoring is the only defence against dashboard-delete class failures.** Alert on 5xx rate. Tests catch code paths; only monitoring catches out-of-band config changes.

## Implementation

```ts
// middleware.ts — no throws, ever
export function middleware(req: NextRequest) {
  try {
    const nonce = crypto.randomUUID().replace(/-/g, "")
    const res = NextResponse.next({
      request: { headers: withHeader(req.headers, "x-nonce", nonce) },
    })
    res.headers.set("Content-Security-Policy", buildCsp(nonce))
    return res
  } catch {
    return NextResponse.next()
  }
}
```

```ts
// Secret consumers assert at consumption, not at import
export function getJwtSecret(): string {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error("JWT_SECRET required for this operation")
  return s
}
```

## Verification

- **Middleware survives an empty environment**. Test strips every non-`NEXT_PUBLIC_` var, calls middleware for a page route, an API route, a guide. Assert every response has status < 500 and carries a CSP nonce. This test failing means the site is one dashboard-click from a full outage.
- **CSP includes the nonce**. Assert `Content-Security-Policy` header contains `'nonce-...'`.
- **Every inline script carries the nonce**. Structural test: render each page, walk the DOM, refuse `<script>` without a `nonce=` attribute (JSON-LD included).
- **No `throw` at module top level**. Structural scan of `middleware.ts` — no top-level `throw`, no unguarded `process.env.*` reads.

## Anti-patterns

- `throw new Error("X_SECRET must be set")` at import time in `middleware.ts`.
- Deleting a variable because "nothing reads it".
- Assuming `NEXT_PUBLIC_` inlining rules for a non-prefixed var.
- `script-src 'unsafe-inline' 'unsafe-eval'` — this is not a CSP.
- Reading a runtime env var in `generateStaticParams()` and relying on it at request time.

## Related

- `honest-health-status` — a probe that alerts on 5xx is the only defence.
- `ci-runs-without-secrets` — build and tests must survive a stripped env.
