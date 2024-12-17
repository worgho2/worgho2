import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    lang: 'pt-BR',
    name: 'Portfólio Otávio Baziewicz Filho',
    short_name: 'Portfólio Otávio',
    icons: [
      { src: '/images/favicons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/images/favicons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/images/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/images/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { src: '/images/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
  };
}
