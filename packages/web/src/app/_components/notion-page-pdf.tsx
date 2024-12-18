'use client';

import 'core-js/proposals/promise-with-resolvers';

import React from 'react';
import { Document, Page, pdfjs, Outline } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export function Pdf({ file, ...rest }: { file: string }) {
  const [numPages, setNumPages] = React.useState<number>(0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <Document
      file={file}
      onLoadSuccess={onDocumentLoadSuccess}
      loading={'Loading File...'}
      error={'Ops, the file has expired, refresh this page to trigger an update'}
      {...rest}
    >
      <Outline />
      {Array.from(Array.from({ length: numPages }), (_, index) => (
        <Page
          key={`page_${index + 1}`}
          pageNumber={index + 1}
        />
      ))}
    </Document>
  );
}
