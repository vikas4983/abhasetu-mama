import React from 'react';
import type { Preview } from '@storybook/react';
import '../src/styles/globals.css';
import { StoreProvider } from '../src/providers/StoreProvider';
import { QueryProvider } from '../src/providers/QueryProvider';
import { LanguageProvider } from '../src/providers/LanguageProvider';
import { ThemeProvider } from '../src/providers/ThemeProvider';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <StoreProvider>
        <QueryProvider>
          <LanguageProvider>
            <ThemeProvider>
              <div style={{ padding: '24px', background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
                <Story />
              </div>
            </ThemeProvider>
          </LanguageProvider>
        </QueryProvider>
      </StoreProvider>
    ),
  ],
};

export default preview;
