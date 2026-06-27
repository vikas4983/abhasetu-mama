/**
 * @file        layout.tsx
 * @description Stakeholder route layout — compact MUI shell, no patient nav
 * @module      stakeholder
 * @layer       layout
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import StakeholderShell from '../../../components/stakeholder/StakeholderShell';
import {
  isFacilityRole,
  getStakeholderHomePath,
  roleToSlug,
} from '../../../constants/stakeholder.constants';

export default function StakeholderLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const role = currentUser?.role || '';

  useEffect(() => {
    if (!currentUser) {
      router.replace('/staff-login');
      return;
    }
    if (!isFacilityRole(role)) {
      if (role === 'admin' || role === 'master_admin') {
        router.replace('/admin');
      } else {
        router.replace('/login');
      }
      return;
    }
    const slug = roleToSlug(role);
    if (pathname && !pathname.startsWith(`/stakeholder/${slug}`)) {
      router.replace(getStakeholderHomePath(role));
    }
  }, [currentUser, role, router, pathname]);

  if (!currentUser || !isFacilityRole(role)) {
    return null;
  }

  return <StakeholderShell role={role}>{children}</StakeholderShell>;
}
