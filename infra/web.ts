import { env } from './env';
import { api } from './url-shortener';

let domain: sst.aws.NextjsArgs['domain'] = undefined;
let NEXT_PUBLIC_APP_URL: string = 'http://localhost:3030/';

if (!$dev) {
  if (!env.CLOUDFLARE_DOMAIN_NAME) {
    throw new Error('CLOUDFLARE_DOMAIN_NAME is not defined');
  }

  domain = {
    name: env.CLOUDFLARE_DOMAIN_NAME,
    dns: sst.cloudflare.dns(),
  };

  NEXT_PUBLIC_APP_URL = `https://${env.CLOUDFLARE_DOMAIN_NAME}/`;
}

export const nextJsApp = new sst.aws.Nextjs('WebNextjsApp', {
  path: 'packages/web',
  domain,
  link: [api],
  server: {
    runtime: 'nodejs20.x',
  },
  environment: {
    NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STAGE: $app.stage,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: env.CLOUDFLARE_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_URL_SHORTENER_API_URL: api.url,
  },
});
