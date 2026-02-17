import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";
import { TOOL_SEO } from "@/lib/seo/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: Array<{
    path: string;
    priority: number;
    changefreq: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: "/", priority: 1.0, changefreq: "weekly" },
    { path: "/about", priority: 0.6, changefreq: "monthly" },
    { path: "/contact", priority: 0.5, changefreq: "monthly" },
    { path: "/privacy", priority: 0.4, changefreq: "yearly" },
    { path: "/help", priority: 0.5, changefreq: "monthly" },

    // Category landing pages
    { path: "/pdf-tools", priority: 0.8, changefreq: "weekly" },
    { path: "/csv-tools", priority: 0.8, changefreq: "weekly" },
    { path: "/diff-tools", priority: 0.7, changefreq: "weekly" },
    { path: "/diagramming", priority: 0.7, changefreq: "weekly" },

    // Hubs
    { path: "/tools/generators", priority: 0.7, changefreq: "weekly" },
    { path: "/tools/diffchecker", priority: 0.7, changefreq: "weekly" },
  ];

  const toolRoutes = Object.values(TOOL_SEO)
    .filter((t) => t.indexable !== false)
    .map((t) => ({
    path: t.path,
    priority: t.path.startsWith("/tools/pdf/") ? 0.8 : 0.7,
    changefreq: "weekly" as const,
  }));

  const all = [...staticRoutes, ...toolRoutes];
  const byPath = new Map<string, (typeof all)[number]>();
  for (const r of all) byPath.set(r.path, r);

  return Array.from(byPath.values()).map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changefreq,
    priority: r.priority,
  }));
}
