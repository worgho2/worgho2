import { getPublicEnv } from './env';

export const isProd = () => {
  return getPublicEnv('NEXT_PUBLIC_STAGE') === 'production';
};
