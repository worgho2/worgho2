'use client';

import 'react-notion-x/src/styles.css';

import { ExtendedRecordMap } from 'notion-types';
import React from 'react';
import { ComponentOverrideFn, NotionComponents, NotionRenderer } from 'react-notion-x';
import NextLink from 'next/link';
import NextImage from 'next/image';
import dynamic from 'next/dynamic';
import { getAppUrl } from '@/helpers';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(utc);
dayjs.extend(localizedFormat);

interface NotionPageProps {
  recordMap: ExtendedRecordMap;
  rootPageId: string;
  previewImages: boolean;
  rootPath: `/${string}/` | '/';
}

export const NotionPage: React.FC<NotionPageProps> = (props) => {
  const rootDomain = getAppUrl().host;

  const components = React.useMemo<Partial<NotionComponents>>(
    () => ({
      nextImage: NextImage,
      nextLink: NextLink,
      Collection,
      Pdf,
      Modal,
      Equation,
      propertyLastEditedTimeValue,
    }),
    []
  );

  return (
    <NotionRenderer
      recordMap={props.recordMap}
      fullPage={true}
      darkMode={false}
      disableHeader
      rootDomain={rootDomain}
      rootPageId={props.rootPageId}
      previewImages={props.previewImages}
      showTableOfContents={false}
      showCollectionViewDropdown
      mapPageUrl={(rawPageId) => {
        const pageId = (rawPageId || '').replace(/-/g, '');
        const idPath = pageId === props.rootPageId ? '' : pageId;
        return `${props.rootPath}${idPath}`.replace(/\/$/, '');
      }}
      components={components}
    />
  );
};

const Collection = dynamic(
  () => import('react-notion-x/build/third-party/collection').then((m) => m.Collection),
  { ssr: false }
);

const Pdf = dynamic(() => import('./notion-page-pdf').then((m) => m.Pdf), {
  ssr: false,
});

const Modal = dynamic(() => import('react-notion-x/build/third-party/modal').then((m) => m.Modal), {
  ssr: false,
});

const Equation = dynamic(
  () => import('react-notion-x/build/third-party/equation').then((m) => m.Equation),
  { ssr: false }
);

const propertyLastEditedTimeValue: ComponentOverrideFn = (
  { block, pageHeader },
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && block?.last_edited_time) {
    return `Last Updated at ${dayjs(block?.last_edited_time).format('DD/MM/YYYY')}`;
  }

  return defaultFn();
};
