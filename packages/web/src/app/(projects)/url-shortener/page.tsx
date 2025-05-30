import { PageContentContainer } from '@/components';
import { CreateShortUrlForm } from './create-short-url-form';
import { Metadata } from 'next';
import { baseMetadata } from '@/helpers';

export const metadata: Metadata = {
  title: 'Url Shortener',
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'Url Shortener',
  },
};

export default function UrlShortener() {
  return (
    <PageContentContainer pt={'60px'}>
      <CreateShortUrlForm paddingY={{ base: 6, md: 16 }} />
    </PageContentContainer>
  );
}
