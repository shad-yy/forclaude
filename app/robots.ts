import { MetadataRoute } from "next"
import { ENV } from "@/lib/config/env"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = ENV.BASE_URL

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/dev/", "/login"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
