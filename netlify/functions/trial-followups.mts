// Scheduled function — the Netlify replacement for the Vercel cron in
// vercel.json ("/api/cron/trial-followups", "0 12 * * *"). Vercel crons do
// not run on Netlify, so this calls the same route handler on a schedule,
// reusing all of its logic. The schedule is kept identical to the Vercel
// one; the pre-existing daily-vs-15-minute mismatch (AUTOMATION.md A10) is
// left unchanged here so the migration does not also change behaviour.
//
// No npm dependency: Netlify reads the `config.schedule` export and uses
// the default export as the handler.

export default async () => {
  const base = process.env.URL || process.env.NEXT_PUBLIC_APP_URL
  const secret = process.env.CRON_SECRET

  if (!base || !secret) {
    console.error("[trial-followups] missing URL or CRON_SECRET; not calling the endpoint")
    return new Response("not configured", { status: 500 })
  }

  const res = await fetch(`${base}/api/cron/trial-followups`, {
    headers: { authorization: `Bearer ${secret}` },
  })

  const body = await res.text()
  console.log(`[trial-followups] endpoint responded ${res.status}: ${body.slice(0, 200)}`)
  return new Response(`cron ${res.status}`, { status: res.ok ? 200 : 502 })
}

export const config = { schedule: "0 12 * * *" }
