import { Logger } from '../logger';
import { z } from 'zod';
import {
  ShortUrlApi,
  shortUrlApiCreateInputSchema,
  ShortUrlApiCreateOutput,
} from '../short-url-api';

export const createShortUrlInputSchema = z.object({
  originalUrl: shortUrlApiCreateInputSchema.shape.originalUrl,
  slug: shortUrlApiCreateInputSchema.shape.slug,
  captcha: shortUrlApiCreateInputSchema.shape.captcha,
});

export type CreateShortUrlInput = z.infer<typeof createShortUrlInputSchema>;

export type CreateShortUrlOutput = ShortUrlApiCreateOutput;

export class CreateShortUrl {
  constructor(
    private readonly logger: Logger,
    private readonly shortUrlApi: ShortUrlApi
  ) {}

  execute = async (input: CreateShortUrlInput): Promise<CreateShortUrlOutput> => {
    this.logger.debug('CreateShortUrl.execute', { input });

    const output = await this.shortUrlApi.create({
      originalUrl: input.originalUrl,
      slug: input.slug,
      captcha: input.captcha,
    });

    return output;
  };
}
