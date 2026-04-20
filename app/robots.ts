import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://smartlivetv.com"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/dev/", "/login"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
