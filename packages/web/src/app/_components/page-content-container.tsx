'use client';

import { Box, BoxProps } from '@chakra-ui/react';
import React from 'react';

export const PageContentContainer = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ children, ...boxProps }, ref) => {
    return (
      <main>
        <Box
          ref={ref}
          width='100%'
          maxWidth='100%'
          {...boxProps}
        >
          {children}
        </Box>
      </main>
    );
  }
);
