import { env } from './env';

export const nextJsApp = new sst.aws.Nextjs('Nextjs', {
  path: 'packages/web',
  domain: {
    name: env.CLOUDFLARE_DOMAIN_NAME,
    dns: sst.cloudflare.dns(),
  },
});
