import { Metadata, ResolvingMetadata } from 'next';
import { ConsoleLogger } from '@/infrastructure/logger/console-logger';
import { XNotionGateway } from '@/infrastructure/notion-gateway/x-notion-gateway';
import { GetBlogPage } from '@/ports/use-cases/get-blog-page';
import { notFound } from 'next/navigation';
import { PageContentContainer } from '@/app/_components/page-content-container';
import { NotionPage } from '../../_components/notion-page';
import { ListBlogPages } from '@/ports/use-cases/list-blog-pages';
import { isProd } from '@/app/_helpers/is-prod';
import { baseMetadata } from '@/app/_helpers/seo';

interface BlogPageProps {
  params: {
    pageId?: string[];
  };
}

export const revalidate = 60;
export const dynamicParams = true;

const rootPageId = '160f39914acb80678fc5f1e90b4ab072';
const rootNotionSpaceId = '88eab0a2-d9fd-4864-9d31-e1463240050a';
const logger = new ConsoleLogger();
const notionGateway = new XNotionGateway(logger, revalidate, ['blog'], rootNotionSpaceId);
const listBlogPages = new ListBlogPages(logger, notionGateway);
const getBlogPage = new GetBlogPage(logger, notionGateway);

export async function generateStaticParams(): Promise<BlogPageProps['params'][]> {
  if (!isProd()) return [];
  const pages = await listBlogPages.execute({ rootPageId });
  return [{}, ...pages.map((page) => ({ pageId: [page.id] }))];
}

export async function generateMetadata(
  props: BlogPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const pageId = props.params.pageId?.[0] ?? rootPageId;
  const blogPage = await getBlogPage.execute({ pageId });

  const title = pageId === rootPageId ? 'Blog' : (blogPage?.title ?? 'Blog');

  const metadata: Metadata = {
    title,
    openGraph: {
      ...baseMetadata.openGraph,
      title,
    },
  };

  if (blogPage?.description) {
    metadata.description = blogPage.description;
  }

  return metadata;
}

export default async function BlogPage(props: BlogPageProps) {
  const pageId = props.params.pageId?.[0] ?? rootPageId;
  const blogPage = await getBlogPage.execute({ pageId });

  if (!blogPage) {
    notFound();
  }

  return (
    <PageContentContainer paddingTop={'60px'}>
      <NotionPage
        recordMap={blogPage.extendedRecordMap}
        previewImages={false}
        rootPath='/blog/'
        rootPageId={rootPageId}
      />
    </PageContentContainer>
  );
}
