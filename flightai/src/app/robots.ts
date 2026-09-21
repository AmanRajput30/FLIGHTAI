import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/settings',
        '/login',
        '/register',
        '/verify-email',
        '/reset-password',
        '/forgot-password',
        '/api/',
      ],
    },
    sitemap: 'https://aervyn.in/sitemap.xml',
  };
}
