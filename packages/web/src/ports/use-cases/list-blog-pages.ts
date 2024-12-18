import { Logger } from '../logger';
import { NotionGateway, NotionGatewayPage } from '../notion-gateway';
import { z } from 'zod';

export const listBlogPagesInputSchema = z.object({
  rootPageId: z.string(),
});

export type ListBlogPagesInput = z.infer<typeof listBlogPagesInputSchema>;

export type ListBlogPagesOutput = Omit<NotionGatewayPage, 'extendedRecordMap'>[];

export class ListBlogPages {
  constructor(
    private readonly logger: Logger,
    private readonly notionGateway: NotionGateway
  ) {}

  execute = async (input: ListBlogPagesInput): Promise<ListBlogPagesOutput> => {
    this.logger.debug('ListBlogPages.execute', { input });

    const pages = await this.notionGateway.listPages(input.rootPageId);
    return pages;
  };
}
