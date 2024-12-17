import { createSystem, defaultConfig } from '@chakra-ui/react';

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'var(--font-poppins)' },
        body: { value: 'var(--font-poppins)' },
        text: { value: 'var(--font-poppins)' },
      },
    },
  },
});

export default system;
