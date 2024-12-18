/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: 'worgho2',
      removal: 'remove',
      home: 'aws',
      providers: {
        cloudflare: '5.45.0',
      },
    };
  },
  async run() {
    await import('./infra/env');
    const web = await import('./infra/web');

    return {
      webNextJsAppUrl: web.nextJsApp.url,
    };
  },
});
