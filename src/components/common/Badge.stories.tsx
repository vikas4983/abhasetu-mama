import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Badge from './Badge';
import { CheckCircle2, AlertTriangle, XCircle, Info as InfoIcon, Activity } from 'lucide-react';

const meta: Meta<typeof Badge> = {
  title: 'Common/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'danger', 'info', 'active'],
    },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'VERIFIED',
    variant: 'primary',
  },
};

export const Success: Story = {
  args: {
    children: 'ACTIVE',
    variant: 'success',
    icon: <CheckCircle2 style={{ width: '10px', height: '10px' }} />,
  },
};

export const Warning: Story = {
  args: {
    children: 'PENDING',
    variant: 'warning',
    icon: <AlertTriangle style={{ width: '10px', height: '10px' }} />,
  },
};

export const Danger: Story = {
  args: {
    children: 'INACTIVE',
    variant: 'danger',
    icon: <XCircle style={{ width: '10px', height: '10px' }} />,
  },
};

export const Info: Story = {
  args: {
    children: 'ABHA ID',
    variant: 'info',
    icon: <InfoIcon style={{ width: '10px', height: '10px' }} />,
  },
};

export const ActiveSession: Story = {
  args: {
    children: 'ACTIVE SESSION',
    variant: 'active',
    icon: <Activity style={{ width: '10px', height: '10px' }} />,
  },
};
