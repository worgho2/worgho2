import { PageContentContainer } from '@/app/_components/page-content-container';
import { EmptyState } from './_components/empty-state';
import { LuForklift } from 'react-icons/lu';
import { Group, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { Button } from './_components/button';

export default function Home() {
  return (
    <PageContentContainer
      minH={'100vh'}
      pt={'60px'}
    >
      <EmptyState
        size='lg'
        icon={<LuForklift />}
        title='Welcome!'
        description='I am currently working on this page, but you can explore the other pages already!'
      >
        <Group>
          <Link asChild>
            <NextLink href={'/projects'}>
              <Button variant='solid'>Explore Projects</Button>
            </NextLink>
          </Link>
        </Group>
      </EmptyState>
    </PageContentContainer>
  );
}
