/**
 * @file        RoleInsightPage.tsx
 * @description Stakeholder home insights — live ops data + Chart.js
 * @module      stakeholder
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

"use client";

import React, { useMemo } from "react";
import InsightsDashboard, { getOpsAnalytics } from "./InsightsDashboard";
import { STAKEHOLDER_ROLE_LABELS } from "../../constants/stakeholder.constants";
import { useStakeholderOps } from "../../hooks/useStakeholderOps";

export default function RoleInsightPage({ role }: { role: string }) {
  const { data, loading } = useStakeholderOps<Record<string, unknown>>();
  const analytics = useMemo(() => getOpsAnalytics(role, data), [role, data]);
  const label = STAKEHOLDER_ROLE_LABELS[role] || role;

  return (
    <InsightsDashboard
      title={`${label} — Insights`}
      loading={loading}
      {...analytics}
    />
  );
}
