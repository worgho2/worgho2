import { z } from 'zod';

export const shortUrlDataSchema = z.object({
  slug: z.string(),
  originalUrl: z.string().url(),
  createdAt: z.date(),
  expiresAt: z.date(),
});

export type ShortUrlData = z.infer<typeof shortUrlDataSchema>;

export const shortUrlApiCreateInputSchema = z.object({
  slug: z.string().min(1).max(32),
  originalUrl: z.string().url().startsWith('https://'),
  captcha: z.string().min(1),
});

export type ShortUrlApiCreateInput = z.infer<typeof shortUrlApiCreateInputSchema>;

export type ShortUrlApiCreateOutput =
  | (ShortUrlData & { error: undefined })
  | { error: 'SLUG_IS_ALREADY_TAKEN' | 'CAPTCHA_IS_INVALID' | 'INTERNAL_ERROR' };

export interface ShortUrlApi {
  create(input: ShortUrlApiCreateInput): Promise<ShortUrlApiCreateOutput>;
  getBySlug(slug: string): Promise<ShortUrlData | undefined>;
}
