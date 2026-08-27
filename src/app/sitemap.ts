import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { CATEGORIES, TOOLS } from "@/lib/tools";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  const now = new Date();

  return [
    {
      url: site,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...Object.values(CATEGORIES).map((category) => ({
      url: `${site}${category.href}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...TOOLS.map((tool) => ({
      url: `${site}${tool.href}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
