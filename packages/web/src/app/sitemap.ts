import dayjs from 'dayjs';
import { MetadataRoute } from 'next';
import utc from 'dayjs/plugin/utc';
import { getAppUrl, isProd } from '@/helpers';

dayjs.extend(utc);

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isProd()) return [];

  const lastModified = dayjs().utc().toDate();

  return [
    {
      url: getAppUrl().href,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: getAppUrl('blog').href,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];
}
