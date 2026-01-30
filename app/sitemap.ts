import type { MetadataRoute } from "next";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://jhatpat.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // ✅ Add your important indexable pages here.
  // Keep this list “public + stable”.
  const routes: Array<{ path: string; priority?: number; changefreq?: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
    { path: "/", priority: 1.0, changefreq: "weekly" },
    { path: "/about", priority: 0.6, changefreq: "monthly" },
    { path: "/contact", priority: 0.5, changefreq: "monthly" },
    { path: "/privacy", priority: 0.4, changefreq: "yearly" },

    // Tools landing pages
    { path: "/tools/generators", priority: 0.7, changefreq: "weekly" },
    { path: "/tools/diffchecker", priority: 0.7, changefreq: "weekly" },
    { path: "/tools/csv-to-json", priority: 0.7, changefreq: "weekly" },
    { path: "/tools/json-to-csv", priority: 0.7, changefreq: "weekly" },
    { path: "/tools/csv-diff", priority: 0.7, changefreq: "weekly" },

    // PDF tools
    { path: "/tools/pdf/merge", priority: 0.8, changefreq: "weekly" },
    { path: "/tools/pdf/split", priority: 0.8, changefreq: "weekly" },
    { path: "/tools/pdf/compress", priority: 0.8, changefreq: "weekly" },
    { path: "/tools/pdf/pdf-to-word", priority: 0.8, changefreq: "weekly" },
    { path: "/tools/pdf/word-to-pdf", priority: 0.8, changefreq: "weekly" },
    { path: "/tools/pdf/image-to-pdf", priority: 0.8, changefreq: "weekly" },
    { path: "/tools/pdf/pdf-to-image", priority: 0.8, changefreq: "weekly" },

    // Generators
    { path: "/tools/generators/tinyurl", priority: 0.8, changefreq: "weekly" },
    { path: "/tools/generators/dummy-data", priority: 0.8, changefreq: "weekly" },
    { path: "/tools/generators/guid", priority: 0.8, changefreq: "weekly" },
    { path: "/tools/generators/slug", priority: 0.7, changefreq: "weekly" },
    { path: "/tools/generators/box-shadow", priority: 0.7, changefreq: "weekly" },
    { path: "/tools/generators/password", priority: 0.7, changefreq: "weekly" },

    // Diagrams landing page (indexable)
    { path: "/tools/diagrams", priority: 0.6, changefreq: "weekly" },
    // ⚠️ Do NOT add /tools/diagrams/[id] pages here since they’re user-private.
  ];

  return routes.map((r) => ({
    url: `${SITE}${r.path}`,
    lastModified: now,
    changeFrequency: r.changefreq ?? "weekly",
    priority: r.priority ?? 0.6,
  }));
}
