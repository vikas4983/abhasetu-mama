'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import Footer from '../../components/layout/Footer';
import ActiveTokenBanner from '../../components/layout/ActiveTokenBanner';

/** Routes that use compact stakeholder/admin MUI shell — no patient bottom nav */
const STAKEHOLDER_SHELL_PREFIXES = ['/admin', '/stakeholder', '/dashboard'];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const compactShell = STAKEHOLDER_SHELL_PREFIXES.some(
    (p) => pathname === p || pathname?.startsWith(`${p}/`),
  );

  if (compactShell) {
    return <>{children}</>;
  }

  const mainClass = pathname === '/' ? 'home-shell' : 'route-shell';

  return (
    <>
      <Header />
      <div className="app">
        <ActiveTokenBanner />
        <main id="app-content" className={mainClass} style={{ minHeight: '60vh' }}>
          {children}
        </main>
        <BottomNav />
        <Footer />
      </div>
    </>
  );
}
