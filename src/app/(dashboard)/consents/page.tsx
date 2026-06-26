/**
 * @file        page.tsx
 * @description Patient consent inbox — approve, deny, and view consent requests (M3 HIU)
 * @module      consents
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

'use client';

import React, { useState } from 'react';
import { abhaService } from '../../../lib/api/services/abha.service';
import { showToast } from '../../../utils/toast';
import { useAuth } from '../../../providers/AuthProvider';

export default function ConsentsPage() {
  const { currentUser } = useAuth();
  const [abhaAddress, setAbhaAddress] = useState(
    currentUser?.abhaProfile?.preferredAbhaAddress || '',
  );
  const [loading, setLoading] = useState(false);
  const [consentResult, setConsentResult] = useState<Record<string, unknown> | null>(null);

  const handleRequestConsent = async () => {
    if (!abhaAddress) {
      showToast('ABHA address is required', true);
      return;
    }
    setLoading(true);
    try {
      const res = await abhaService.requestConsent({
        action: 'request-consent',
        abhaAddress,
        purpose: 'Care Management',
        hiTypes: ['Prescription', 'DiagnosticReport'],
      });
      setConsentResult(res.data as Record<string, unknown>);
      showToast('Consent request initiated');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '24px', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>Consent Management</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Request patient consent to access health records from linked HIPs (M3 HIU).
      </p>
      <label htmlFor="abha-address" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
        Patient ABHA Address
      </label>
      <input
        id="abha-address"
        value={abhaAddress}
        onChange={(e) => setAbhaAddress(e.target.value)}
        placeholder="username@sbx"
        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}
      />
      <button
        type="button"
        onClick={handleRequestConsent}
        disabled={loading}
        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
      >
        {loading ? 'Requesting...' : 'Request Consent'}
      </button>
      {consentResult && (
        <pre style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(consentResult, null, 2)}
        </pre>
      )}
    </main>
  );
}
