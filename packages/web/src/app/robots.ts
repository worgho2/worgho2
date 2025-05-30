import { MetadataRoute } from 'next';
import { getAppUrl, isProd } from '@/helpers';

export default function robots(): MetadataRoute.Robots {
  if (!isProd()) {
    return {
      rules: {
        disallow: ['/'],
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/u/', '/u/*/'],
    },
    sitemap: getAppUrl('sitemap.xml').href,
  };
}
