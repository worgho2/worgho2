import { Metadata } from 'next';
import { isProd } from './is-prod';
import { getAppUrl } from './get-app-url';

export const baseMetadata: Metadata = {
  title: {
    template: '%s | Otávio Baziewicz Filho',
    default: 'Otávio Baziewicz Filho',
  },
  description: '',
  keywords: [
    'otávio baziewicz filho',
    'portfólio otávio baziewicz',
    'otavio baziewicz',
    'worgho2',
    'worgho2 portfolio',
  ],
  icons: {
    icon: getAppUrl('favicon.ico'),
    apple: getAppUrl('images/favicons/apple-touch-icon.png'),
    shortcut: getAppUrl('images/favicons/favicon-32x32.png'),
  },
  robots: { index: isProd(), follow: isProd() },
  openGraph: {
    title: {
      template: '%s | Otávio Baziewicz Filho',
      default: 'Otávio Baziewicz Filho',
    },
    type: 'website',
    images: [getAppUrl('images/favicons/android-chrome-512x512.png')],
  },
};
