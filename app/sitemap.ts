import { MetadataRoute } from "next"
import { BLOG_POSTS } from "@/lib/blog/posts"
import { ENV } from "@/lib/config/env"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = ENV.BASE_URL

  return [
    { url: `${baseUrl}/`, priority: 1.0, changeFrequency: 'daily', lastModified: new Date() },
    { url: `${baseUrl}/channels`, priority: 0.9, changeFrequency: 'weekly', lastModified: new Date() },
    { url: `${baseUrl}/pricing`, priority: 0.9, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${baseUrl}/buy`, priority: 0.9, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${baseUrl}/free-trial`, priority: 0.9, changeFrequency: 'weekly', lastModified: new Date() },
    { url: `${baseUrl}/watch/premier-league`, priority: 0.9, changeFrequency: 'daily', lastModified: new Date() },
    { url: `${baseUrl}/watch/la-liga`, priority: 0.9, changeFrequency: 'daily', lastModified: new Date() },
    { url: `${baseUrl}/watch/bundesliga`, priority: 0.9, changeFrequency: 'daily', lastModified: new Date() },
    { url: `${baseUrl}/watch/serie-a`, priority: 0.9, changeFrequency: 'daily', lastModified: new Date() },
    { url: `${baseUrl}/watch/ligue-1`, priority: 0.9, changeFrequency: 'daily', lastModified: new Date() },
    { url: `${baseUrl}/watch/champions-league`, priority: 0.9, changeFrequency: 'daily', lastModified: new Date() },
    { url: `${baseUrl}/watch/world-cup-2026`, priority: 0.95, changeFrequency: 'daily' as const, lastModified: new Date() },
    { url: `${baseUrl}/watch/europa-league`, priority: 0.85, changeFrequency: 'daily' as const, lastModified: new Date() },
    { url: `${baseUrl}/watch/formula-1`, priority: 0.85, changeFrequency: 'weekly' as const, lastModified: new Date() },
    { url: `${baseUrl}/ufc`, priority: 0.8, changeFrequency: 'weekly', lastModified: new Date() },
    { url: `${baseUrl}/news`, priority: 0.8, changeFrequency: 'daily', lastModified: new Date() },
    { url: `${baseUrl}/blog`, priority: 0.7, changeFrequency: 'weekly', lastModified: new Date() },
    { url: `${baseUrl}/faq`, priority: 0.8, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${baseUrl}/setup/firestick`, priority: 0.8, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${baseUrl}/setup/smart-tv`, priority: 0.8, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${baseUrl}/setup/android`, priority: 0.8, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${baseUrl}/setup/iphone`, priority: 0.8, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${baseUrl}/about`, priority: 0.5, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${baseUrl}/contact`, priority: 0.5, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${baseUrl}/privacy`, priority: 0.3, changeFrequency: 'yearly', lastModified: new Date() },
    { url: `${baseUrl}/terms`, priority: 0.3, changeFrequency: 'yearly', lastModified: new Date() },
    ...BLOG_POSTS.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
