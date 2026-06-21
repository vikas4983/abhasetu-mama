import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import LogoLoader from './LogoLoader';

const meta: Meta<typeof LogoLoader> = {
  title: 'Common/LogoLoader',
  component: LogoLoader,
  argTypes: {
    isLoading: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['login', 'register', 'onboard'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof LogoLoader>;

export const LoginLoader: Story = {
  args: {
    isLoading: true,
    type: 'login',
  },
};

export const RegisterLoader: Story = {
  args: {
    isLoading: true,
    type: 'register',
  },
};

export const OnboardLoader: Story = {
  args: {
    isLoading: true,
    type: 'onboard',
  },
};

export const Xyz: Story = {
  args: {
    isLoading: true,
    type: "onboard"
  }
};
