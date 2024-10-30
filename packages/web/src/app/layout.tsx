import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Personal Portfolio',
  description: "A place where i'm free to overengineer anything that i've found interesting",
};

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <html lang='en'>
      <body style={{ height: '500vh' }}>{children}</body>
    </html>
  );
};

export default RootLayout;
