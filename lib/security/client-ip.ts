/**
 * Client IP extraction and loopback-bypass policy.
 *
 * Introduced in A-05 for the E-02 path: a loopback IP (e.g. from
 * `X-Forwarded-For: 0.0.0.0`) made checkIpLimits treat the caller as
 * "always allowed". On Vercel a client cannot reach that path — Vercel
 * overwrites X-Forwarded-For (vercel.com/docs/headers/request-headers)
 * — so this is defence-in-depth for local runs and non-Vercel hosts,
 * not an exploit fix. See QA-LOG standing corrections (2026-09-24).
 *
 * Behaviour:
 * - `getClientIp(headers)` prefers `x-real-ip` (the header Vercel's own
 *   `ipAddress()` helper reads — `@vercel/functions` IP_HEADER_NAME),
 *   then falls through XFF's leftmost non-loopback entry. Returns null
 *   when nothing usable is present.
 * - `shouldBypassIpChecks(ip)` only bypasses loopback in non-production.
 *   In production, a loopback IP reaching the fraud gate means header
 *   extraction failed and the caller should be treated as suspicious.
 */

const LOOPBACK_IPS = new Set(["0.0.0.0", "127.0.0.1", "::1"]);

export function isLoopback(ip: string): boolean {
  if (LOOPBACK_IPS.has(ip)) return true;
  if (ip.startsWith("127.")) return true;
  return false;
}

export function getClientIp(headers: Headers): string | null {
  const real = headers.get("x-real-ip")?.trim();
  if (real && !isLoopback(real)) return real;

  const xff = headers.get("x-forwarded-for");
  if (xff) {
    for (const raw of xff.split(",")) {
      const ip = raw.trim();
      if (ip && !isLoopback(ip)) return ip;
    }
  }
  return null;
}

export function shouldBypassIpChecks(ip: string): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return isLoopback(ip);
}
