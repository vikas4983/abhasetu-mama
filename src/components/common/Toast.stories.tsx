import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Toast from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Common/Toast',
  component: Toast,
  argTypes: {
    isPreview: { control: 'boolean' },
    isError: { control: 'boolean' },
    message: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Interactive: Story = {
  args: {
    isPreview: false,
  },
};

export const SuccessPreview: Story = {
  args: {
    isPreview: true,
    isError: false,
    message: 'OTP verified successfully!',
  },
};

export const ErrorPreview: Story = {
  args: {
    isPreview: true,
    isError: true,
    message: 'Invalid OTP. Please check and try again.',
  },
};
