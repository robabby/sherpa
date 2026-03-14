import type { MetadataRoute } from "next"
import { posts } from "#content"

const BASE_URL = "https://sherpa.solar"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE_URL}/framework`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${BASE_URL}/framework/docs`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/consulting`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${BASE_URL}/consulting/approach`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/work`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/learn`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE_URL}/about`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE_URL}/contact`, priority: 0.6, changeFrequency: "monthly" },
  ]

  const blogEntries: MetadataRoute.Sitemap = posts
    .filter((p) => p.published)
    .map((p) => ({
      url: `${BASE_URL}${p.permalink}`,
      lastModified: p.updated ?? p.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))

  return [...staticPages, ...blogEntries]
}
