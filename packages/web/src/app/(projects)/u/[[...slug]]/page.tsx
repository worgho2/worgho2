import { Button } from '@/app/_components/button';
import { EmptyState } from '@/app/_components/empty-state';
import { PageContentContainer } from '@/app/_components/page-content-container';
import { baseMetadata } from '@/app/_helpers/seo';
import { ConsoleLogger } from '@/infrastructure/logger/console-logger';
import { MockShortUrlApi } from '@/infrastructure/short-url-api/mock-short-url-api';
import { GetShortUrl } from '@/ports/use-cases/get-short-url';
import { Center, Container, Group, Link, Text } from '@chakra-ui/react';
import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { LuBinoculars, LuLink } from 'react-icons/lu';
import NextLink from 'next/link';
import { ToggleTip } from '@/app/_components/toggle-tip';

interface ShortUrlPageProps {
  params: {
    slug?: string[];
  };
}

export const revalidate = 10;
export const dynamicParams = true;

const logger = new ConsoleLogger();
const shortUrlApi = new MockShortUrlApi();
const getShortUrl = new GetShortUrl(logger, shortUrlApi);

export const metadata: Metadata = {
  title: 'Short Url',
  robots: { index: false, follow: false },
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'Short Url',
  },
};

export default async function ShortUrlPage(props: ShortUrlPageProps) {
  const slug = props.params.slug?.[0];

  if (!slug) {
    redirect('/url-shortener', RedirectType.replace);
  }

  const shortUrlData = await getShortUrl.execute({ slug });

  if (!shortUrlData) {
    return (
      <PageContentContainer
        h={'75vh'}
        pt={'60px'}
      >
        <Container
          maxW={'8xl'}
          h={'100%'}
        >
          <Center h={'100%'}>
            <EmptyState
              size='lg'
              icon={<LuBinoculars />}
              title='Short url not found'
              description='The short url you are looking for does not exist or has expired.'
            >
              <Group>
                <Link asChild>
                  <NextLink href={'/url-shortener'}>
                    <Button variant='solid'>Create a new one</Button>
                  </NextLink>
                </Link>

                <Link asChild>
                  <NextLink href={'/'}>
                    <Button variant='outline'>Back to home</Button>
                  </NextLink>
                </Link>
              </Group>
            </EmptyState>
          </Center>
        </Container>
      </PageContentContainer>
    );
  }

  return (
    <PageContentContainer
      h={'75vh'}
      pt={'60px'}
    >
      <Container
        maxW={'8xl'}
        h={'100%'}
      >
        <Center h={'100%'}>
          <EmptyState
            size='lg'
            icon={<LuLink />}
            title='This link will take you to a new page'
            description='Be careful, this link will take you to a page that may or may not exist, 
              and may or may not be secure.'
          >
            <ToggleTip
              content={
                <Text
                  wordBreak={'break-all'}
                  whiteSpace={'pre-wrap'}
                  maxW={{
                    base: 'xs',
                    md: 'md',
                    lg: 'lg',
                    xl: 'xl',
                    '2xl': '2xl',
                  }}
                >
                  {shortUrlData.originalUrl}
                </Text>
              }
            >
              <Button variant='outline'>Show url</Button>
            </ToggleTip>

            <Link asChild>
              <NextLink href={shortUrlData.originalUrl}>
                <Button variant='solid'>I trust the sender, take me there</Button>
              </NextLink>
            </Link>
          </EmptyState>
        </Center>
      </Container>
    </PageContentContainer>
  );
}
