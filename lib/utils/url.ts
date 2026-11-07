export function getApiBaseUrl(): string {
  const host =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    process.env.URL || // Netlify sets URL to the site's primary URL
    "http://localhost:3000"

  return host.startsWith("http") ? host : `https://${host}`
}

