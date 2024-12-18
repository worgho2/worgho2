import { PageContentContainer } from '@/app/_components/page-content-container';
import { CreateShortUrlForm } from './_components/create-short-url-form';
import { Metadata } from 'next';
import { baseMetadata } from '@/app/_helpers/seo';

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
