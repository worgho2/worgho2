import { PageContentContainer } from '@/app/_components/page-content-container';
import { CreateShortUrlForm } from './_components/create-short-url-form';

export default function UrlShortener() {
  return (
    <PageContentContainer pt={'60px'}>
      <CreateShortUrlForm paddingY={{ base: 6, md: 16 }} />
    </PageContentContainer>
  );
}
