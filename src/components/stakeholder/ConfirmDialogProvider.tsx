/**
 * @file        ConfirmDialogProvider.tsx
 * @description MUI confirmation dialog for logout and destructive actions
 * @module      stakeholder
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: 'warning' | 'error' | 'info';
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    setOpts(options);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const close = (result: boolean) => {
    setOpen(false);
    resolver?.(result);
    setResolver(null);
  };

  const isError = opts?.severity === 'error';

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={open} onClose={() => close(false)} maxWidth="xs" fullWidth aria-labelledby="confirm-title">
        <DialogTitle id="confirm-title" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
          {(opts?.severity === 'warning' || opts?.severity === 'error') && (
            <WarningAmberIcon color={isError ? 'error' : 'warning'} />
          )}
          {opts?.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{opts?.message}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => close(false)} variant="outlined" color="inherit">
            {opts?.cancelLabel || 'Cancel'}
          </Button>
          <Button
            onClick={() => close(true)}
            variant="contained"
            color={isError ? 'error' : 'primary'}
            autoFocus
          >
            {opts?.confirmLabel || 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirmDialog() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  return ctx;
}
