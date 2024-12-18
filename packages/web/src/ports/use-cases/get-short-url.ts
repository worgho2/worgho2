import { Logger } from '../logger';
import { z } from 'zod';
import { ShortUrlApi, ShortUrlData } from '../short-url-api';

export const getShortUrlInputSchema = z.object({
  slug: z.string(),
});

export type GetShortUrlInput = z.infer<typeof getShortUrlInputSchema>;

export type GetShortUrlOutput = ShortUrlData | undefined;

export class GetShortUrl {
  constructor(
    private readonly logger: Logger,
    private readonly shortUrlApi: ShortUrlApi
  ) {}

  execute = async (input: GetShortUrlInput): Promise<GetShortUrlOutput> => {
    this.logger.debug('GetShortUrl.execute', { input });

    const shortUrlData = await this.shortUrlApi.getBySlug(input.slug);

    return shortUrlData;
  };
}
