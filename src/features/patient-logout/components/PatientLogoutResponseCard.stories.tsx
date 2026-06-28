/**
 * @file        PatientLogoutResponseCard.stories.tsx
 * @description Storybook — patient logout API response card
 * @module      patient-logout
 * @layer       story
 * @author      Platform Team
 * @created     2026-06-26
 */

import type { Meta, StoryObj } from '@storybook/react';
import PatientLogoutResponseCard from './PatientLogoutResponseCard';

const meta: Meta<typeof PatientLogoutResponseCard> = {
  title: 'Patient/LogoutResponseCard',
  component: PatientLogoutResponseCard,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PatientLogoutResponseCard>;

export const Success: Story = {
  args: {
    response: {
      status: 'success',
      message: 'You have been logged out',
      timestamp: '2024-05-10 19:43:22',
      gatewayResponse: {
        message: 'You have been logged out',
        timestamp: '2024-05-10 19:43:22',
      },
    },
  },
};

export const InvalidCredentials: Story = {
  args: {
    response: {
      status: 'error',
      code: '900901',
      message: 'Invalid Credentials',
      description:
        'Invalid Credentials. Make sure you have provided the correct security credentials',
      gatewayResponse: {
        code: '900901',
        message: 'Invalid Credentials',
        description:
          'Invalid Credentials. Make sure you have provided the correct security credentials',
      },
    },
  },
};
