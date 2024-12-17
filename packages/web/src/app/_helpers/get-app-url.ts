import { getPublicEnv } from './env';

export const getAppUrl = (path?: string) => {
  const appUrl = `${getPublicEnv('NEXT_PUBLIC_APP_URL').replace(/\/$/, '')}/`;
  return path ? new URL(path.replace(/^\//, ''), appUrl) : new URL(appUrl);
};
