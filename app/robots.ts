import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Optional: block API routes from being indexed
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://jhatpat.com/sitemap.xml",
    host: "https://jhatpat.com",
  };
}
