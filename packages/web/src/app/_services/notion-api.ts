import { ExtendedRecordMap } from 'notion-types';
import { NotionAPI } from 'notion-client';
import {
  getAllPagesInSpace,
  getPageContentBlockIds,
  getPageTitle,
  parsePageId,
  getPageProperty,
} from 'notion-utils';
import { Logger } from './logger';

export interface NotionApiPage {
  id: string;
  title?: string;
  description?: string;
  extendedRecordMap: ExtendedRecordMap;
}

export interface NotionApi {
  getPage(pageId: string): Promise<NotionApiPage | undefined>;
  listPages(rootPageId: string): Promise<Omit<NotionApiPage, 'extendedRecordMap'>[]>;
}

export class NotionApiImpl implements NotionApi {
  constructor(
    private readonly logger: Logger,
    private readonly revalidateAfter: number,
    private readonly revalidationTags: string[],
    private readonly rootNotionSpaceId: string
  ) {
    this.client = new NotionAPI({ userLocale: 'en-US' });
  }

  private client: NotionAPI;

  private addSignedUrls: NotionAPI['addSignedUrls'] = async ({
    recordMap,
    contentBlockIds,
    kyOptions,
  }) => {
    recordMap.signed_urls = {};

    if (!contentBlockIds) {
      contentBlockIds = getPageContentBlockIds(recordMap);
    }

    const allFileInstances = contentBlockIds.flatMap((blockId) => {
      const block = recordMap.block[blockId]?.value;

      if (
        block &&
        (block.type === 'pdf' ||
          block.type === 'audio' ||
          (block.type === 'image' && block.file_ids?.length) ||
          block.type === 'video' ||
          block.type === 'file' ||
          block.type === 'page')
      ) {
        const source =
          block.type === 'page' ? block.format?.page_cover : block.properties?.source?.[0]?.[0];

        if (source) {
          if (source.includes('secure.notion-static.com') || source.includes('prod-files-secure')) {
            return {
              permissionRecord: {
                table: 'block',
                id: block.id,
              },
              url: source,
            };
          }
        }
      }

      return [];
    });

    if (allFileInstances.length > 0) {
      try {
        const { signedUrls } = await this.client.getSignedFileUrls(allFileInstances, kyOptions);

        if (signedUrls.length === allFileInstances.length) {
          for (const [i, file] of allFileInstances.entries()) {
            const signedUrl = signedUrls[i];
            if (!signedUrl) continue;

            const blockId = file.permissionRecord.id;
            if (!blockId) continue;

            recordMap.signed_urls[blockId] = signedUrl;
          }
        }
      } catch (err) {
        console.warn('NotionAPI getSignedfileUrls error', err);
      }
    }
  };

  private getPageDescription = (
    pageId: string,
    recordMap: ExtendedRecordMap
  ): string | undefined => {
    try {
      const pageUUID = parsePageId(pageId, { uuid: true }) ?? pageId;

      const block = recordMap.block[pageUUID]?.value;

      if (!block) return undefined;

      const description = getPageProperty('Description', block, recordMap);

      if (typeof description !== 'string') return undefined;

      return description;
    } catch (error) {
      this.logger.error(`Failed to get notion page description`, {
        pageId,
        error,
      });
      return undefined;
    }
  };

  getPage = async (rawPageId: string): Promise<NotionApiPage | undefined> => {
    try {
      const pageUUID = parsePageId(rawPageId, { uuid: true }) ?? rawPageId;
      const pageId = parsePageId(rawPageId, { uuid: false }) ?? rawPageId;

      const extendedRecordMap = await this.client.getPage(pageId, {
        signFileUrls: false,
        kyOptions: {
          next: {
            revalidate: this.revalidateAfter,
            tags: this.revalidationTags,
          },
        },
      });

      await this.addSignedUrls({
        recordMap: extendedRecordMap,
        kyOptions: {
          next: {
            revalidate: this.revalidateAfter,
            tags: this.revalidationTags,
          },
        },
      });

      if (extendedRecordMap?.block[pageUUID]?.value?.space_id !== this.rootNotionSpaceId) {
        this.logger.warn(`Page "${pageId}" does not belong to this Notion workspace`);
        return undefined;
      }

      return {
        id: pageId,
        title: getPageTitle(extendedRecordMap) || undefined,
        description: this.getPageDescription(pageId, extendedRecordMap),
        extendedRecordMap,
      };
    } catch (error) {
      this.logger.error(`Failed to get notion page`, {
        rawPageId,
        error,
      });

      return undefined;
    }
  };

  listPages = async (rootPageId: string): Promise<Omit<NotionApiPage, 'extendedRecordMap'>[]> => {
    const pageMap = await getAllPagesInSpace(rootPageId, this.rootNotionSpaceId, (pageId) =>
      this.client.getPage(pageId, {
        kyOptions: {
          next: {
            revalidate: this.revalidateAfter,
            tags: this.revalidationTags,
          },
        },
      })
    );

    return Object.entries(pageMap).map(([rawPageId, extendedRecordMap]) => {
      const pageId = parsePageId(rawPageId, { uuid: false }) ?? rawPageId;

      const recordMap: ExtendedRecordMap = {
        block: {},
        collection: {},
        collection_query: {},
        collection_view: {},
        notion_user: {},
        signed_urls: {},
        preview_images: {},
        ...extendedRecordMap,
      };

      return {
        id: pageId,
        title: getPageTitle(recordMap) || undefined,
        description: this.getPageDescription(pageId, recordMap),
      };
    });
  };
}
