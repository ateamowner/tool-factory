import type { MetadataRoute } from "next";
import { toPublicUrl } from "@/lib/site";
import { CATEGORIES, TOOLS } from "@/lib/tools";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: toPublicUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...Object.values(CATEGORIES).map((category) => ({
      url: toPublicUrl(category.href),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...TOOLS.map((tool) => ({
      url: toPublicUrl(tool.href),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
