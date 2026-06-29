/**
 * @file        PatientLogoutDialog.stories.tsx
 * @description Storybook — patient logout confirmation dialog (mock API)
 * @module      patient-logout
 * @layer       story
 * @author      Platform Team
 * @created     2026-06-26
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import PatientLogoutDialog from './PatientLogoutDialog';

function DialogDemo() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open logout dialog
      </button>
      <PatientLogoutDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const meta: Meta<typeof PatientLogoutDialog> = {
  title: 'Patient/LogoutDialog',
  component: PatientLogoutDialog,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PatientLogoutDialog>;

export const ConfirmStep: Story = {
  render: () => <DialogDemo />,
};
