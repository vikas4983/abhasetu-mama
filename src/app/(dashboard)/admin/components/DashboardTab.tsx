/**
 * @file        DashboardTab.tsx
 * @description Admin overview with KPI cards and animated charts
 * @module      admin/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, Building2, MapPin, IndianRupee, Shield } from "lucide-react";

interface Props {
  data: {
    kpis: {
      totalOffices: number;
      auditEvents: number;
      successRate: number;
      transactions: number;
      revenue: number;
      pendingFacilities: number;
      approvedFacilities: number;
    };
    charts: { topStates: { state_name: string; count: number }[] };
  } | null;
  loading: boolean;
}

const card = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }),
};

export default function DashboardTab({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <p role="status" aria-live="polite">
        Loading dashboard insights…
      </p>
    );
  }

  const { kpis, charts } = data;
  const maxState = Math.max(...charts.topStates.map((s) => s.count), 1);

  const kpisList = [
    {
      label: "Post offices",
      value: kpis.totalOffices.toLocaleString("en-IN"),
      icon: MapPin,
      color: "#17a2b8",
    },
    {
      label: "Audit events",
      value: kpis.auditEvents,
      icon: Activity,
      color: "#6366f1",
    },
    {
      label: "Success rate",
      value: `${kpis.successRate}%`,
      icon: Shield,
      color: "#22c55e",
    },
    {
      label: "Revenue (₹)",
      value: kpis.revenue.toLocaleString("en-IN"),
      icon: IndianRupee,
      color: "#f59e0b",
    },
    {
      label: "Facilities",
      value: `${kpis.approvedFacilities} / ${kpis.approvedFacilities + kpis.pendingFacilities}`,
      icon: Building2,
      color: "#ec4899",
    },
  ];

  return (
    <div>
      <h2
        style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "16px" }}
      >
        Platform insights
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        {kpisList.map((k, i) => (
          <motion.article
            key={k.label}
            custom={i}
            variants={card}
            initial="hidden"
            animate="show"
            style={{
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-card)",
            }}
          >
            <k.icon size={20} color={k.color} aria-hidden />
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
                margin: "8px 0 4px",
              }}
            >
              {k.label}
            </p>
            <p style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0 }}>
              {k.value}
            </p>
          </motion.article>
        ))}
      </div>

      <section aria-labelledby="state-chart-title">
        <h3
          id="state-chart-title"
          style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}
        >
          Top states by post offices
        </h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {charts.topStates.map((s, i) => (
            <motion.li
              key={s.state_name}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              style={{ marginBottom: "10px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
              >
                <span>{s.state_name}</span>
                <span>{s.count.toLocaleString("en-IN")}</span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "var(--bg-secondary)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
                role="presentation"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.count / maxState) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  style={{
                    height: "100%",
                    background:
                      "linear-gradient(90deg, var(--accent-teal), #6366f1)",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </motion.li>
          ))}
        </ul>
        {charts.topStates.length === 0 && (
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
            Import pincode CSV from the Pincode Directory tab to populate
            charts.
          </p>
        )}
      </section>
    </div>
  );
}
