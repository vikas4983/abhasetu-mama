import type { Preview } from '@storybook/react';
import { AppProviders } from '../src/app/providers/AppProviders';
import '../src/assets/styles/design-system.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <AppProviders>
        <div className="app" style={{ paddingTop: 24 }}>
          <Story />
        </div>
      </AppProviders>
    ),
  ],
  parameters: {
    controls: { expanded: true },
    backgrounds: {
      default: 'ABHA dark',
      values: [{ name: 'ABHA dark', value: '#071521' }],
    },
  },
};

export default preview;
