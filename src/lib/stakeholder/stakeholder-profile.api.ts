/**
 * @file        stakeholder-profile.api.ts
 * @description API helpers for stakeholder profile CRUD and photo upload
 * @module      stakeholder
 * @layer       api
 * @author      Platform Team
 * @created     2026-06-26
 */

const API = '/api/abdm';

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function fetchStakeholderProfile(token: string) {
  const res = await fetch(`${API}/stakeholder/profile`, { headers: authHeaders(token) });
  return res.json();
}

export async function saveStakeholderProfile(token: string, profile: Record<string, unknown>) {
  const res = await fetch(`${API}/stakeholder/profile`, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  return res.json();
}

export async function uploadStakeholderPhoto(token: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API}/stakeholder/profile/photo`, {
    method: 'POST',
    headers: authHeaders(token),
    body: form,
  });
  return res.json();
}
