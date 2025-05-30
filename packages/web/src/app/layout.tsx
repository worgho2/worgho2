import type { Metadata } from 'next';
import React from 'react';
import { fonts } from './_styles/fonts';
import { baseMetadata } from '@/helpers';
import { Footer, Navbar, Provider, Toaster } from '@/components';

export const metadata: Metadata = {
  ...baseMetadata,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const htmlClassName = React.useMemo(
    () => [fonts.poppins.variable].join(' '),
    [fonts.poppins.variable]
  );

  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={htmlClassName}
    >
      <body>
        <Provider>
          <Navbar
            height='60px'
            logoSrc='/images/favicons/android-chrome-192x192.png'
          />

          {children}

          <Footer
            githubUrl='https://github.com/worgho2'
            linkedinUrl='https://www.linkedin.com/in/otaviobf'
          />
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
