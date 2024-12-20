import {
  ShortUrlApi,
  ShortUrlApiCreateInput,
  ShortUrlApiCreateOutput,
  ShortUrlData,
} from '@/ports/short-url-api';

export class MockShortUrlApi implements ShortUrlApi {
  create = async (input: ShortUrlApiCreateInput): Promise<ShortUrlApiCreateOutput> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // return {
    //   error: 'SLUG_IS_ALREADY_TAKEN',
    // };

    return Promise.resolve({
      slug: input.slug,
      originalUrl: input.originalUrl,
      createdAt: new Date(),
      expiresAt: new Date(),
      error: undefined,
    });
  };

  getBySlug = async (slug: string): Promise<ShortUrlData | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // return Promise.resolve(undefined);

    return Promise.resolve({
      slug,
      originalUrl: 'https://github.com/worgho2',
      createdAt: new Date(),
      expiresAt: new Date(),
      error: undefined,
    });
  };
}
