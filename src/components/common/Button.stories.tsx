import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import { Smartphone, LogIn, ChevronRight } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'Common/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'back'],
    },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Send OTP',
    variant: 'primary',
    icon: <Smartphone style={{ width: '14px', height: '14px' }} />,
  },
};

export const Secondary: Story = {
  args: {
    children: 'Log In',
    variant: 'secondary',
    icon: <LogIn style={{ width: '14px', height: '14px' }} />,
  },
};

export const Outline: Story = {
  args: {
    children: 'Select Facility',
    variant: 'outline',
    icon: <ChevronRight style={{ width: '14px', height: '14px' }} />,
    iconPosition: 'right',
  },
};

export const Back: Story = {
  args: {
    children: 'Back',
    variant: 'back',
  },
};

export const LoadingState: Story = {
  args: {
    children: 'Send OTP',
    variant: 'primary',
    isLoading: true,
  },
};

export const DisabledState: Story = {
  args: {
    children: 'Send OTP',
    variant: 'primary',
    disabled: true,
  },
};

// Illustrate the exact side-by-side layout requested by the user
export const ButtonRowLayout: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '400px' }}>
      <Button variant="back" style={{ flex: 1 }}>
        Back
      </Button>
      <Button variant="primary" style={{ flex: 1 }}>
        Send OTP
      </Button>
    </div>
  ),
};
