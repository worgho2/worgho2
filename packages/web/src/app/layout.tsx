import type { Metadata } from 'next';
import React from 'react';
import { baseMetadata } from './_helpers/seo';
import { fonts } from './_styles/fonts';
import { Provider } from './_components/provider';
import { Navbar } from './_components/navbar';
import { Footer } from './_components/footer';

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
            height='80px'
            logoImageSrc=''
          />

          {children}

          <Footer
            githubUrl='https://github.com/worgho2'
            linkedinUrl='https://www.linkedin.com/in/otaviobf'
          />
        </Provider>
      </body>
    </html>
  );
}
