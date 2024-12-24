import { PageContentContainer } from '@/app/_components/page-content-container';
import { ProjectCardSection } from './_components/project-card-section';
import { Metadata } from 'next';
import { baseMetadata } from '../_helpers/seo';

export const metadata: Metadata = {
  title: 'Projects',
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'Projects',
  },
};

export default function Projects() {
  return (
    <PageContentContainer pt={'60px'}>
      <ProjectCardSection
        name='Sudoku Solver'
        description={
          <>
            A sudoku solver that supports multiple board patterns.
            <br />
            <br />
            The <b>Solver</b> is based on a <b>Rust lib compiled to WebAssembly</b> that implements
            a <b>(Dsatur Graph Coloring + Backtracking)</b> algorithm.
          </>
        }
        link={{
          href: '/sudoku-solver',
        }}
        backgroundColor={'white'}
        paddingTop={{ base: 6, md: 16 }}
      />

      <ProjectCardSection
        name='Url Shortener'
        description={
          <>
            A serverless service that allows the creation of temporary short urls defining a custom
            slug.
            <br />
            <br />
            The service is based on a <b>Java Micronault</b> implementation, using{' '}
            <b>AWS DynamoDB</b> as the database and <b>AWS Lambda</b> as the serverless function.
          </>
        }
        link={{
          href: '/url-shortener',
        }}
        backgroundColor={'white'}
        paddingTop={{ base: 6, md: 16 }}
        animationDelay={'0.1s'}
      />

      <ProjectCardSection
        name='Notion Blog'
        description={
          <>
            A dynamic and free-form blog that allows the management of content in <b>Notion</b>.
            <br />
            <br />
            The service is based on a <b>Next.js</b> implementation, using the <b>react-notion-x</b>{' '}
            library to fetch and render the content from Notion.
          </>
        }
        link={{
          href: '/blog',
        }}
        backgroundColor={'white'}
        paddingY={{ base: 6, md: 16 }}
        animationDelay={'0.2s'}
      />
    </PageContentContainer>
  );
}
