import { MetadataRoute } from 'next';
import { isProd } from './_helpers/is-prod';
import { getAppUrl } from './_helpers/get-app-url';

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
    },
    sitemap: getAppUrl('sitemap.xml').href,
  };
}
