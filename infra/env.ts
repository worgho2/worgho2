import { z } from 'zod';

const envValidation = z
  .object({
    CLOUDFLARE_DOMAIN_NAME: z.string().optional(),
    CLOUDFLARE_API_TOKEN: z.string(),
    CLOUDFLARE_DEFAULT_ACCOUNT_ID: z.string(),
    CLOUDFLARE_TURNSTILE_SITE_KEY: z.string().default('1x00000000000000000000AA'),
    CLOUDFLARE_TURNSTILE_SECRET_KEY: z.string().default('1x0000000000000000000000000000000AA'),
  })
  .safeParse(process.env);

if (!envValidation.success) {
  throw new Error(`Environment validation error: ${JSON.stringify(envValidation.error, null, 2)}`);
}

export const env = envValidation.data;
