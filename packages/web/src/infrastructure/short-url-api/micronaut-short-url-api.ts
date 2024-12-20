import { Logger } from '@/ports/logger';
import {
  ShortUrlApi,
  ShortUrlApiCreateInput,
  ShortUrlApiCreateOutput,
  ShortUrlData,
} from '@/ports/short-url-api';
import { z } from 'zod';

export class MicronautShortUrlApi implements ShortUrlApi {
  constructor(
    private readonly logger: Logger,
    private readonly apiUrl: string
  ) {}

  private buildRoute(path: string) {
    return new URL(path.replace(/^\//, ''), this.apiUrl);
  }

  create = async (input: ShortUrlApiCreateInput): Promise<ShortUrlApiCreateOutput> => {
    const response = await fetch(this.buildRoute('/api/short-urls'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: input.slug,
        originalUrl: input.originalUrl,
        captchaToken: input.captcha,
      }),
    });

    let rawBody: unknown = {};

    try {
      rawBody = await response.json();
    } catch (error) {
      const rawResponse = await response.text();
      this.logger.error(`Failed to parse micronaut create short url api response`, { rawResponse });
    }

    if (!response.ok) {
      if (response.status === 400) {
        const errorValidation = z.object({ error: z.string() }).safeParse(rawBody);

        if (errorValidation.success && errorValidation.data.error.endsWith('already taken')) {
          return {
            error: 'SLUG_IS_ALREADY_TAKEN',
          };
        }
      }

      if (response.status === 401) {
        return {
          error: 'CAPTCHA_IS_INVALID',
        };
      }

      return {
        error: 'INTERNAL_ERROR',
      };
    }

    const bodyValidation = z
      .object({
        slug: z.string(),
        originalUrl: z.string(),
        createdAt: z.date({ coerce: true }),
        expiresAt: z.date({ coerce: true }),
      })
      .safeParse(rawBody);

    if (!bodyValidation.success) {
      this.logger.error(`Failed to validate micronaut create short url api response`, {
        errors: bodyValidation.error,
      });

      return {
        error: 'INTERNAL_ERROR',
      };
    }

    return {
      ...bodyValidation.data,
      error: undefined,
    };
  };

  getBySlug = async (slug: string): Promise<ShortUrlData | undefined> => {
    const response = await fetch(this.buildRoute(`/api/short-urls/${slug}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let rawBody: unknown = {};

    try {
      rawBody = await response.json();
    } catch (error) {
      const rawResponse = await response.text();
      this.logger.error(`Failed to parse micronaut get short url api response`, { rawResponse });

      return undefined;
    }

    const bodyValidation = z
      .object({
        slug: z.string(),
        originalUrl: z.string(),
        createdAt: z.date({ coerce: true }),
        expiresAt: z.date({ coerce: true }),
      })
      .safeParse(rawBody);

    if (!bodyValidation.success) {
      this.logger.error(`Failed to validate micronaut get short url api response`, {
        errors: bodyValidation.error,
      });

      return undefined;
    }

    return bodyValidation.data;
  };
}
