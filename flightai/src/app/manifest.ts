import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AERVYN - Aviation Intelligence',
    short_name: 'AERVYN',
    description: 'Global flight tracking, deep aircraft telemetry, and AI-powered aviation insights.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0a0a0c',
    theme_color: '#00F0FF',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      // Note: In a production environment, you should also include standard 192x192 and 512x512 PNG icons here.
    ],
  };
}
