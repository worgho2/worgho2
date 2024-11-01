import { z } from 'zod';

const envValidation = z
  .object({
    CLOUDFLARE_DOMAIN_NAME: z.string().min(1),
    CLOUDFLARE_API_TOKEN: z.string().min(1),
    CLOUDFLARE_DEFAULT_ACCOUNT_ID: z.string().min(1),
  })
  .safeParse(process.env);

if (!envValidation.success) {
  throw new Error(`Environment validation error: ${JSON.stringify(envValidation.error, null, 2)}`);
}

export const env = envValidation.data;
