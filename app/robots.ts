import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Hard-code the production domain.
  // DO NOT use env variables for robots.txt logic —
  // a missing env variable should NEVER block Google.
  const baseUrl = 'https://smartlivetv.co.uk'
  
  return {
    rules: [
      // AI Search/Citation Crawlers — ALLOW (these drive traffic from AI search results)
      {
        userAgent: [
          'OAI-SearchBot',
          'PerplexityBot',
          'ChatGPT-User',
        ],
        allow: '/',
      },
      // AI Training Crawlers — BLOCK (protect content IP from model training)
      {
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'Google-Extended',
          'CCBot',
          'Anthropic-ai',
        ],
        disallow: '/',
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
