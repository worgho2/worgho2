import { execSync } from 'node:child_process';

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
});

const build = (target: string): string => {
  execSync(`
    cd ${target}
    ./gradlew buildNativeLambda
    unzip -o ./build/libs/*.zip -d ./build/lambda
  `);

  return `${target}/build/lambda`;
};

const applicationFunction = new sst.aws.Function('UrlShortenerFunction', {
  runtime: 'provided.al2023',
  architecture: 'x86_64',
  dev: false,
  bundle: build('packages/url-shortener'),
  handler: 'io.micronaut.function.aws.proxy.payload2.ApiGatewayProxyRequestEventFunction',
  link: [dynamoDbShortUrlTable],
  environment: {
    DYNAMODB_SHORT_URL_TABLE_NAME: dynamoDbShortUrlTable.name,
  },
});

api.route('ANY /{proxy+}', applicationFunction.arn);

export { api };
