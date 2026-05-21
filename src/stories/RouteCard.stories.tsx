import type { Meta, StoryObj } from '@storybook/react';
import { Pill } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';
import { RouteCard } from '@components/ui/RouteCard';

const meta = {
  title: 'UI/RouteCard',
  component: RouteCard,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  tags: ['autodocs'],
} satisfies Meta<typeof RouteCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Medicine Delivery',
    description: 'Upload prescription and track verified delivery.',
    icon: Pill,
    to: '/services/medicine-delivery',
  },
};
