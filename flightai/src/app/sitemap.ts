import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aervyn.in';

  // Only indexable public pages
  const routes = [
    '',
    '/about',
    '/pricing',
    '/data-sources',
    '/contact',
    '/features',
    '/flight-tracking',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: route === '' ? 'daily' : 'weekly' as any,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return routes;
}
