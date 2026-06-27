/**
 * @file        stakeholder-ops.api.ts
 * @description API helpers for facility operations data
 * @module      stakeholder
 * @layer       api
 * @author      Platform Team
 * @created     2026-06-26
 */

const API = "/api/abdm";

function headers(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchStakeholderOps(token: string) {
  const res = await fetch(`${API}/stakeholder-ops`, {
    headers: headers(token),
  });
  return res.json();
}

export async function saveStakeholderOps(
  token: string,
  data: Record<string, unknown>,
) {
  const res = await fetch(`${API}/stakeholder-ops`, {
    method: "PUT",
    headers: headers(token),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchFacilityInsights(token: string, facilityId: number) {
  const res = await fetch(`${API}/admin/facilities/${facilityId}/insights`, {
    headers: headers(token),
  });
  return res.json();
}

export async function blockFacility(token: string, facilityId: number) {
  const res = await fetch(`${API}/admin/facilities/block?id=${facilityId}`, {
    method: "POST",
    headers: headers(token),
  });
  return res.json();
}
