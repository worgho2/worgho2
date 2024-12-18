import { PageContentContainer } from '@/app/_components/page-content-container';
import { ProjectCardSection } from './_components/project-card-section';

export default function Projects() {
  return (
    <PageContentContainer pt={'60px'}>
      <ProjectCardSection
        name='Url Shortener'
        description={
          <>
            A serverless service that allows the creation of temporary short urls defining a custom
            slug.
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
      />

      <ProjectCardSection
        name='Notion Blog'
        description={
          <>
            A dynamic and free-form blog that allows the management of content in <b>Notion</b>.
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
        animationDelay={'0.1s'}
      />
    </PageContentContainer>
  );
}
