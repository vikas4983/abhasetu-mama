import type { Meta, StoryObj } from '@storybook/react';
import { Activity } from 'lucide-react';
import { MetricCard } from '@components/ui/MetricCard';

const meta = {
  title: 'UI/MetricCard',
  component: MetricCard,
  tags: ['autodocs'],
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    metric: {
      label: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg',
      trend: 'Stable',
      icon: Activity,
    },
  },
};
