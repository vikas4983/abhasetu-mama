/**
 * @file        page.tsx
 * @description Redesigned stakeholder admin console — dashboard, ABDM config, pincode CRUD, facilities, logs
 * @module      admin
 * @layer       page
 * @author      Platform Team
 * @created     2026-06-21
 * @modified    2026-06-26
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Settings, MapPin, Building2, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../../../providers/AuthProvider';
import { showToast } from '../../../utils/toast';
import * as api from './admin.api';
import DashboardTab from './components/DashboardTab';
import ConfigTab from './components/ConfigTab';
import PincodeDirectoryTab from './components/PincodeDirectoryTab';
import FacilitiesTab from './components/FacilitiesTab';
import LogsTab from './components/LogsTab';

type TabId = 'dashboard' | 'config' | 'pincodes' | 'facilities' | 'logs';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Insights', icon: LayoutDashboard },
  { id: 'config', label: 'ABDM Config', icon: Settings },
  { id: 'pincodes', label: 'Pincode directory', icon: MapPin },
  { id: 'facilities', label: 'Facilities', icon: Building2 },
  { id: 'logs', label: 'Audit logs', icon: FileText },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [token, setToken] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('adminToken') || '';
    setToken(t);
    if (!t) {
      router.replace('/admin/login');
      return;
    }
    const role = currentUser?.role;
    if (role && role !== 'admin' && role !== 'master_admin') {
      showToast('Admin access only', true);
      router.replace('/dashboard');
    }
  }, [currentUser, router]);

  useEffect(() => {
    if (!token) return;
    setDashLoading(true);
    api.fetchDashboard(token).then((d) => {
      if (d.status === 'success') setDashboard(d);
    }).finally(() => setDashLoading(false));
  }, [token]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }} aria-label="Stakeholder admin console">
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <motion.h1 initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>
            Stakeholder control center
          </motion.h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            {currentUser?.name} · {currentUser?.role}
          </p>
        </div>
        <button type="button" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: 'pointer' }}>
          <LogOut size={16} aria-hidden /> Sign out
        </button>
      </header>

      <nav aria-label="Admin sections" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={active ? 'page' : undefined}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                background: active ? 'var(--accent-teal)' : 'var(--bg-secondary)',
                color: active ? '#fff' : 'var(--text-primary)',
              }}
            >
              <Icon size={16} aria-hidden />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.section
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', minHeight: '400px' }}
        >
          {activeTab === 'dashboard' && <DashboardTab data={dashboard} loading={dashLoading} />}
          {activeTab === 'config' && token && <ConfigTab token={token} />}
          {activeTab === 'pincodes' && token && <PincodeDirectoryTab token={token} />}
          {activeTab === 'facilities' && token && <FacilitiesTab token={token} />}
          {activeTab === 'logs' && token && <LogsTab token={token} />}
        </motion.section>
      </AnimatePresence>
    </main>
  );
}
