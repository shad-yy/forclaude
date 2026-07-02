import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Hard-code the production domain.
  // DO NOT use env variables for robots.txt logic —
  // a missing env variable should NEVER block Google.
  const baseUrl = 'https://smartlivetv.co.uk'
  
  return {
    rules: [
      {
        userAgent: [
          'OAI-SearchBot',
          'PerplexityBot',
          'ClaudeBot',
          'Anthropic-ai',
          'ChatGPT-User',
          'Google-Extended'
        ],
        allow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dev/',
        ],
        // Note: do NOT disallow /login — Google 
        // should be able to crawl it.
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
