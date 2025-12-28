import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://jhatpat.com'
  
  // List all your main tool routes here
  const routes = [
    '',
    '/tools/pdf/pdf-to-word',
    '/tools/pdf/merge',
    '/tools/diffchecker',
    '/tools/diffchecker/text',
    '/tools/generators/slug',
    '/tools/generators/tinyurl',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return routes
}