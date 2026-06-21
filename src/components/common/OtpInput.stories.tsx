import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import OtpInput from './OtpInput';

const meta: Meta<typeof OtpInput> = {
  title: 'Common/OtpInput',
  component: OtpInput,
  argTypes: {
    value: { control: 'text' },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    shake: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof OtpInput>;

// Interactive wrapper to manage controlled state in Storybook
const InteractiveOtp = (props: any) => {
  const [val, setVal] = useState(props.value || '');
  return <OtpInput {...props} value={val} onChange={setVal} />;
};

export const Default: Story = {
  render: (args) => <InteractiveOtp {...args} />,
  args: {
    value: '',
    error: false,
    disabled: false,
    shake: false,
  },
};

export const Filled: Story = {
  render: (args) => <InteractiveOtp {...args} />,
  args: {
    value: '123456',
    error: false,
    disabled: false,
    shake: false,
  },
};

export const ErrorState: Story = {
  render: (args) => <InteractiveOtp {...args} />,
  args: {
    value: '123',
    error: true,
    disabled: false,
    shake: true,
  },
};

export const Disabled: Story = {
  render: (args) => <InteractiveOtp {...args} />,
  args: {
    value: '',
    error: false,
    disabled: true,
    shake: false,
  },
};
