/** Primary canonical domain for production SEO. */
export const PRODUCTION_SITE_URL = 'https://smartlivetv.co.uk'

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '')
}

/**
 * Resolves the site base URL used for canonicals, sitemap, and schema.
 * Production always uses smartlivetv.co.uk to prevent cross-domain canonical leaks.
 */
export function resolveSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL
    ? stripTrailingSlash(process.env.NEXT_PUBLIC_APP_URL)
    : undefined

  if (process.env.VERCEL_ENV === 'production') {
    return PRODUCTION_SITE_URL
  }

  if (fromEnv?.includes('localhost') || fromEnv?.includes('127.0.0.1')) {
    return fromEnv
  }

  if (fromEnv && !fromEnv.includes('vercel.app')) {
    return fromEnv
  }

  return PRODUCTION_SITE_URL
}
