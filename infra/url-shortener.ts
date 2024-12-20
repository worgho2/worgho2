import { execSync } from 'node:child_process';
import { env } from './env';

const api = new sst.aws.ApiGatewayV2('UrlShortenerApi', {
  cors: true,
});

const dynamoDbShortUrlTable = new sst.aws.Dynamo('UrlShortenerDynamoDb', {
  fields: {
    slug: 'string',
  },
  primaryIndex: {
    hashKey: 'slug',
  },
  ttl: 'expiresAt',
  deletionProtection: false,
  transform: {
    table(args) {
      args.pointInTimeRecovery = {
        enabled: false,
      };

      args.onDemandThroughput = {
        maxReadRequestUnits: 1000,
        maxWriteRequestUnits: 20,
      };
    },
  },
});

const build = (target: string): string => {
  execSync(`
    cd ${target}
    ./gradlew buildNativeLambda
    unzip -o ./build/libs/*.zip -d ./build/lambda
  `);

  return `${target}/build/lambda`;
};

/**
 * @todo Improve the way this service is initialized in dev environment.
 * Currently it triggers a full build of the application, which can take more than 1 minute due the
 * GraalVM native image compilation. Needs further investigation, maybe using something like
 * awslambdaric
 */
const applicationFunction = new sst.aws.Function('UrlShortenerFunction', {
  runtime: 'provided.al2023',
  architecture: 'x86_64',
  dev: false,
  bundle: build('packages/url-shortener'),
  handler: 'bootstrap',
  link: [dynamoDbShortUrlTable],
  environment: {
    DYNAMODB_SHORT_URL_TABLE_NAME: dynamoDbShortUrlTable.name,
    CLOUDFLARE_TURNSTILE_SECRET_KEY: env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
  },
});

api.route('ANY /{proxy+}', applicationFunction.arn);

export { api };
