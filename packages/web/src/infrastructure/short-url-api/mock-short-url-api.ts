import {
  ShortUrlApi,
  ShortUrlApiCreateInput,
  ShortUrlApiCreateOutput,
  ShortUrlData,
} from '@/ports/short-url-api';

export class MockShortUrlApi implements ShortUrlApi {
  create = async (input: ShortUrlApiCreateInput): Promise<ShortUrlApiCreateOutput> => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // return {
    //   error: 'SLUG_IS_ALREADY_TAKEN',
    // };

    return Promise.resolve({
      id: '1',
      createdAt: new Date(),
      originalUrl: input.originalUrl,
      slug: input.slug,
      error: undefined,
    });
  };

  getBySlug = async (slug: string): Promise<ShortUrlData | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return Promise.resolve({
      id: '1',
      createdAt: new Date(),
      originalUrl: 'https://github.com/worgho2',
      slug,
      error: undefined,
    });
  };
}
