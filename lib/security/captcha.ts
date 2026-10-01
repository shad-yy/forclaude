/**
 * hCaptcha server-side verification.
 *
 * Behaviour:
 * - HCAPTCHA_SECRET unset → returns { ok: true } and logs a one-line
 *   warning. This keeps dev and CI runnable without a real secret.
 *   Production MUST set HCAPTCHA_SECRET; see memory-bank/SETUP-REQUIRED.md.
 * - Set + no/blank token → { ok: false, reason: "missing_token" }.
 * - Set + siteverify says success=false → { ok: false, reason: "verification_failed" }.
 * - Set + fetch error → { ok: false, reason: "verification_error" }.
 */

export type CaptchaResult = { ok: true } | { ok: false; reason: string };

let devModeWarningLogged = false;

export async function verifyCaptcha(token: unknown): Promise<CaptchaResult> {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) {
    if (!devModeWarningLogged) {
      console.warn("[CAPTCHA] HCAPTCHA_SECRET not set — captcha verification skipped (dev mode)");
      devModeWarningLogged = true;
    }
    return { ok: true };
  }
  if (typeof token !== "string" || token.trim().length === 0) {
    return { ok: false, reason: "missing_token" };
  }
  try {
    const res = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }).toString(),
    });
    const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
    return data?.success === true ? { ok: true } : { ok: false, reason: "verification_failed" };
  } catch (err) {
    console.error("[CAPTCHA] siteverify error:", err instanceof Error ? err.message : String(err));
    return { ok: false, reason: "verification_error" };
  }
}
