import { Errors } from '@/domain/errors';
import { z } from 'zod';

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string(),
  NEXT_PUBLIC_STAGE: z.string(),
});

type PublicEnv = z.infer<typeof publicEnvSchema>;

const privateEnvSchema = z.object({
  DISCORD_NOTIFICATION_WEBHOOK_URL: z.string(),
});

type PrivateEnv = z.infer<typeof privateEnvSchema>;

export const getPublicEnv = <T extends keyof PublicEnv>(key: T): PublicEnv[T] => {
  /**
   * This is necessary due the fact that Next.js statically replaces process.env.[key] values during
   * build time
   */
  const publicEnv: Record<keyof PublicEnv, string | undefined> = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STAGE: process.env.NEXT_PUBLIC_STAGE,
  };

  const { success, data, error } = publicEnvSchema.shape[key].safeParse(publicEnv[key]);

  if (!success) {
    const errors = error.errors.map((e) => e.message).join(', ');
    throw Errors.validation(`Public env "${key}": [${errors}]`);
  }

  return data as PublicEnv[T];
};

export const getPrivateEnv = <T extends keyof PrivateEnv>(key: T): PrivateEnv[T] => {
  const { success, data, error } = privateEnvSchema.shape[key].safeParse(process.env[key]);

  if (!success) {
    const errors = error.errors.map((e) => e.message).join(', ');
    throw Errors.validation(`Private env "${key}": [${errors}]`);
  }

  return data as PrivateEnv[T];
};