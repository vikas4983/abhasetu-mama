/**
 * @file        ConfigTab.tsx
 * @description ABDM gateway configuration for admin console
 * @module      admin/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Key, Save } from 'lucide-react';
import { showToast } from '../../../../utils/toast';
import * as api from '../admin.api';

interface Props {
  token: string;
}

export default function ConfigTab({ token }: Props) {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.fetchConfig(token).then((d) => {
      if (d.config) setConfig(d.config);
    });
  }, [token]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.saveConfig(token, config);
      showToast(res.message || 'Configuration saved', res.status !== 'success');
    } finally {
      setSaving(false);
    }
  };

  const syncKey = async () => {
    const res = await api.syncPublicKey(token);
    showToast(res.message || 'Public key synced', res.status !== 'success');
  };

  const refreshSession = async () => {
    const res = await api.generateSession(token);
    showToast(res.message || 'Session refreshed', res.status !== 'success');
  };

  const fields = ['ABDM_CLIENT_ID', 'ABDM_CLIENT_SECRET', 'ABDM_GATEWAY_URL', 'ABDM_CM_ID', 'ABDM_HIP_ID', 'ABDM_HIU_ID'];

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>ABDM configuration</h2>
      <div style={{ display: 'grid', gap: '12px', maxWidth: '640px' }}>
        {fields.map((key) => (
          <label key={key}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>{key}</span>
            <input
              type={key.includes('SECRET') ? 'password' : 'text'}
              value={config[key] || ''}
              onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
              autoComplete="off"
              style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
        <button type="button" onClick={save} disabled={saving} style={primaryBtn}>
          <Save size={16} aria-hidden /> {saving ? 'Saving…' : 'Save config'}
        </button>
        <button type="button" onClick={syncKey} style={secondaryBtn}>
          <Key size={16} aria-hidden /> Sync public key
        </button>
        <button type="button" onClick={refreshSession} style={secondaryBtn}>Refresh gateway session</button>
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '8px',
  border: 'none', background: 'var(--accent-teal)', color: '#fff', fontWeight: 700, cursor: 'pointer',
};
const secondaryBtn: React.CSSProperties = {
  ...primaryBtn, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)',
};
