/**
 * Boundary error classes for provider clients.
 *
 * Introduced in B-01 to encode the hybrid `api-fault-vs-absence` rule
 * (see memory-bank/PATTERNS.md §Error Handling and QA-LOG A-13).
 *
 * `UpstreamFaultError` — provider misbehaviour that must not be
 * collapsed into an empty state. Thrown from provider clients on 5xx,
 * timeouts, network failures, malformed bodies. Callers (resolvers)
 * that opt into the hybrid rule bubble it up; the error boundary or
 * SEO-safe fallback renders "we could not check just now" rather than
 * an empty page or a 404.
 *
 * See `playbook/skills/api-fault-vs-absence.md` for the full rule.
 */
export class UpstreamFaultError extends Error {
  readonly endpoint: string;
  readonly status: number;
  readonly detail?: string;

  constructor(endpoint: string, status: number, detail?: string) {
    super(`UpstreamFaultError: ${endpoint} → ${status}${detail ? ` (${detail})` : ""}`);
    this.name = "UpstreamFaultError";
    this.endpoint = endpoint;
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Type guard so callers can distinguish upstream fault from any other
 * thrown error without relying on `instanceof` across module boundaries
 * (edge/server split can break `instanceof` chains in Next.js).
 */
export function isUpstreamFault(err: unknown): err is UpstreamFaultError {
  if (err instanceof UpstreamFaultError) return true;
  return typeof err === "object" && err !== null && (err as { name?: string }).name === "UpstreamFaultError";
}
