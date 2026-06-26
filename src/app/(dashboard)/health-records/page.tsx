/**
 * @file        page.tsx
 * @description Decrypted health records viewer (M3 HIU)
 * @module      health-records
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

'use client';

import React, { useEffect, useState } from 'react';
import { abhaService } from '../../../lib/api/services/abha.service';

interface HealthRecord {
  id: string;
  hi_type: string;
  fhir_bundle: Record<string, unknown>;
  created_at: string;
}

export default function HealthRecordsPage() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    abhaService.fetchHealthRecords()
      .then((res) => {
        const data = res.data as { records?: HealthRecord[] };
        setRecords(data.records || []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: '24px', maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>Health Records</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        FHIR records received from HIPs after consent approval.
      </p>
      {loading && <p>Loading records...</p>}
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      {!loading && records.length === 0 && <p>No records yet.</p>}
      {records.map((rec) => (
        <article key={rec.id} style={{ marginBottom: '16px', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700 }}>{rec.hi_type}</h2>
          <time style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{rec.created_at}</time>
          <pre style={{ marginTop: '8px', fontSize: '11px', overflow: 'auto', maxHeight: '200px' }}>
            {JSON.stringify(rec.fhir_bundle, null, 2)}
          </pre>
        </article>
      ))}
    </main>
  );
}
