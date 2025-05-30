import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { NotionPage, PageContentContainer } from '@/components';
import { isProd, baseMetadata } from '@/helpers';
import { LoggerImpl, NotionApiImpl } from '@/services';

interface BlogPageProps {
  params: {
    pageId?: string[];
  };
}

export const revalidate = 60;
export const dynamicParams = true;

const rootPageId = '160f39914acb80678fc5f1e90b4ab072';
const rootNotionSpaceId = '88eab0a2-d9fd-4864-9d31-e1463240050a';
const logger = new LoggerImpl();
const notionApi = new NotionApiImpl(logger, revalidate, ['blog'], rootNotionSpaceId);

export async function generateStaticParams(): Promise<BlogPageProps['params'][]> {
  if (!isProd()) return [];
  const pages = await notionApi.listPages(rootPageId);
  return [{}, ...pages.map((page) => ({ pageId: [page.id] }))];
}

export async function generateMetadata(
  props: BlogPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const pageId = props.params.pageId?.[0] ?? rootPageId;
  const blogPage = await notionApi.getPage(pageId);

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
  const blogPage = await notionApi.getPage(pageId);

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
