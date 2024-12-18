import { ExtendedRecordMap } from 'notion-types';

export interface NotionGatewayPage {
  id: string;
  title?: string;
  description?: string;
  extendedRecordMap: ExtendedRecordMap;
}

export interface NotionGateway {
  getPage(pageId: string): Promise<NotionGatewayPage | undefined>;
  listPages(rootPageId: string): Promise<Omit<NotionGatewayPage, 'extendedRecordMap'>[]>;
}
