import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '家計簿アプリ',
    short_name: '家計簿',
    description: 'シンプルなミニマル家計簿',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#f9fafb',
    icons: [
      {
        src: '/apple-icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
