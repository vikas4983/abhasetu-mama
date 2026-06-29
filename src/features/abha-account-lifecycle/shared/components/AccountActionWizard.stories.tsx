/**
 * @file        AccountActionWizard.stories.tsx
 * @description Storybook — account action modal shell (wire real API in dev only)
 * @module      abha-account-lifecycle/shared
 * @layer       story
 * @author      Platform Team
 * @created     2026-06-26
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AccountActionWizardModal from './AccountActionWizardModal';
import { ABHA_DEACTIVATE_WARNINGS } from '../constants/account-action.constants';

function ModalDemo() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open wizard
      </button>
      <AccountActionWizardModal
        open={open}
        onClose={() => setOpen(false)}
        config={{
          kind: 'deactivate',
          title: 'Deactivate ABHA (Temporarily)',
          warnings: ABHA_DEACTIVATE_WARNINGS,
          surveyTitle: 'Please let us know why you are deactivating.',
          abhaNumber: '91-7561-4088-8857',
          requestOtp: async () => ({
            status: 'error',
            message: 'Connect to sandbox backend — no mock OTP in Storybook',
          }),
          verifyOtp: async () => ({
            status: 'error',
            message: 'Use /profile with live session for real API',
          }),
          verifyPassword: async () => ({
            status: 'error',
            message: 'Use /profile with live session for real API',
          }),
        }}
      />
    </>
  );
}

const meta: Meta<typeof AccountActionWizardModal> = {
  title: 'Patient/AccountActionWizard',
  component: AccountActionWizardModal,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AccountActionWizardModal>;

export const WarningsModal: Story = {
  render: () => <ModalDemo />,
};
