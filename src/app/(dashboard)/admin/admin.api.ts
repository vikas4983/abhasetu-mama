/**
 * @file        admin.api.ts
 * @description Authenticated fetch helpers for stakeholder admin console
 * @module      admin
 * @layer       api
 * @author      Platform Team
 * @created     2026-06-26
 */

const API = "/api/abdm";

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchDashboard(token: string) {
  const res = await fetch(`${API}/admin/dashboard`, {
    headers: authHeaders(token),
  });
  return res.json();
}

export async function fetchConfig(token: string) {
  const res = await fetch(`${API}/admin/config`, {
    headers: authHeaders(token),
  });
  return res.json();
}

export async function saveConfig(
  token: string,
  config: Record<string, unknown>,
) {
  const res = await fetch(`${API}/admin/config`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(config),
  });
  return res.json();
}

export async function fetchLogs(token: string) {
  const res = await fetch(`${API}/admin/logs`, { headers: authHeaders(token) });
  return res.json();
}

export async function fetchFacilities(
  token: string,
  params?: Record<string, string>,
) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API}/admin/facilities?${q}`, {
    headers: authHeaders(token),
  });
  return res.json();
}

export async function updateFacilityStatus(
  token: string,
  id: number,
  status: string,
) {
  const res = await fetch(`${API}/admin/facilities/status?id=${id}`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function fetchPincodeDirectory(
  token: string,
  params: {
    page?: number;
    limit?: number;
    search?: string;
    state?: string;
    district?: string;
    pincode?: string;
  },
) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);
  if (params.state) q.set("state", params.state);
  if (params.district) q.set("district", params.district);
  if (params.pincode) q.set("pincode", params.pincode);
  const res = await fetch(`${API}/admin/pincode-directory?${q}`, {
    headers: authHeaders(token),
  });
  return res.json();
}

export async function importPincodeCsv(token: string) {
  const res = await fetch(`${API}/admin/pincode-directory/import`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({}),
  });
  return res.json();
}

export async function createPincodeRow(
  token: string,
  row: Record<string, string>,
) {
  const res = await fetch(`${API}/admin/pincode-directory`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(row),
  });
  return res.json();
}

export async function deletePincodeRow(token: string, id: number) {
  const res = await fetch(`${API}/admin/pincode-directory/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return res.json();
}

export async function syncPublicKey(token: string) {
  const res = await fetch(`${API}/admin/fetch-public-key`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return res.json();
}

export async function generateSession(token: string) {
  const res = await fetch(`${API}/admin/session/generate`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return res.json();
}
