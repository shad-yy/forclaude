/**
 * Log-safe summarisation of upstream response bodies that may carry
 * customer PII (passwords, credentials, panel session tokens).
 *
 * Used by lib/panel/cms8k.ts and any other module that logs a raw
 * provider response. Never returns the field values themselves — only
 * a shape summary a maintainer can debug from without leaking secrets.
 */

const SENSITIVE_KEYS = new Set([
  "password", "pass", "secret", "token", "api_key",
  "auth", "session", "cookie", "authorization",
]);

/**
 * Reduce a JSON-shaped response body to a safe summary:
 *   result=<value> keys=<sorted keys> hasPassword=<bool>
 * Non-JSON becomes a length report. Only the outer object's shape is
 * inspected; nested structures are reported as their type only.
 */
export function summarizeResponse(text: string | null | undefined): string {
  if (text == null) return "[empty]";
  if (typeof text !== "string") return `[non-string:${typeof text}]`;
  const trimmed = text.trim();
  if (trimmed.length === 0) return "[empty]";

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return `[non-JSON, ${trimmed.length} chars]`;
  }
  if (parsed === null || typeof parsed !== "object") {
    return `[JSON ${typeof parsed}]`;
  }

  const obj = parsed as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const result = String(obj.result ?? obj.status ?? obj.msg ?? "unknown");
  const hasPassword = SENSITIVE_KEYS.has("password")
    && typeof obj.password === "string"
    && (obj.password as string).length > 0;
  return `result=${result} keys=${keys.join(",")} hasPassword=${hasPassword}`;
}

/**
 * Redact sensitive fields from an object before logging it. Returns a
 * shallow copy with sensitive keys replaced by "[REDACTED]".
 */
export function redactObject<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = SENSITIVE_KEYS.has(k.toLowerCase()) ? "[REDACTED]" : v;
  }
  return out;
}
