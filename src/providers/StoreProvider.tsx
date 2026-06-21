/**
 * @file        StoreProvider.tsx
 * @description Client component wrapping children with the Redux store provider
 * @module      providers
 * @layer       provider
 * @author      Platform Team
 * @created     2026-06-21
 * @modified    2026-06-21
 */

'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
