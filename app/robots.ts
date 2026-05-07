import type { MetadataRoute } from 'next'
import { ENV } from '@/lib/config/env'

export default function robots(): MetadataRoute.Robots {
  const isVercelPreview = ENV.BASE_URL.includes('vercel.app')
  
  if (isVercelPreview) {
    // Block all crawlers on Vercel preview URL
    // We don't want this indexed — it's not our real domain
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dev/', '/login'],
      },
    ],
    sitemap: `${ENV.BASE_URL}/sitemap.xml`,
  }
}
