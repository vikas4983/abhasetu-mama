/**
 * @file        page.tsx
 * @description Stakeholder dashboard redirect (fixes staff-login target)
 * @module      dashboard
 * @layer       page
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { getStakeholderHomePath } from '../../../constants/stakeholder.constants';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.role) {
      router.replace(getStakeholderHomePath(currentUser.role));
    } else {
      router.replace('/staff-login');
    }
  }, [currentUser, router]);

  return null;
}
