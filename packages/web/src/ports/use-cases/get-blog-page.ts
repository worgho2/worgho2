import { Logger } from '../logger';
import { NotionGateway, NotionGatewayPage } from '../notion-gateway';
import { z } from 'zod';

export const getBlogPageInputSchema = z.object({
  pageId: z.string(),
});

export type GetBlogPageInput = z.infer<typeof getBlogPageInputSchema>;

export type GetBlogPageOutput = NotionGatewayPage | undefined;

export class GetBlogPage {
  constructor(
    private readonly logger: Logger,
    private readonly notionGateway: NotionGateway
  ) {}

  execute = async (input: GetBlogPageInput): Promise<GetBlogPageOutput> => {
    this.logger.debug('GetBlogPage.execute', { input });

    const blogPage = await this.notionGateway.getPage(input.pageId);
    return blogPage;
  };
}
