/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
/* deno-fmt-ignore-file */
import "sst"
export {}
declare module "sst" {
  export interface Resource {
    "UrlShortenerApi": {
      "type": "sst.aws.ApiGatewayV2"
      "url": string
    }
    "UrlShortenerDynamoDb": {
      "name": string
      "type": "sst.aws.Dynamo"
    }
    "UrlShortenerFunction": {
      "name": string
      "type": "sst.aws.Function"
    }
    "WebNextjsApp": {
      "type": "sst.aws.Nextjs"
      "url": string
    }
  }
}
