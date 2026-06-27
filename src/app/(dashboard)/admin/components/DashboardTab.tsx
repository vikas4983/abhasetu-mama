/**
 * @file        DashboardTab.tsx
 * @description Admin insights with Chart.js KPI cards and charts
 * @module      admin/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Skeleton,
} from "@mui/material";
import {
  StakeholderBarChart,
  StakeholderDoughnutChart,
} from "@/components/stakeholder/charts/StakeholderCharts";

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
    charts: {
      topStates: { state_name: string; count: number }[];
      facilitiesByRole?: { role: string; count: number }[];
      auditTrend?: { day: string; count: number }[];
    };
  } | null;
  loading: boolean;
}

export default function DashboardTab({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <Box>
        <Skeleton height={32} width={180} />
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid size={{ xs: 6, lg: 2 }} key={i}>
              <Skeleton variant="rounded" height={76} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const { kpis, charts } = data;
  const kpiCards = [
    {
      label: "Post offices",
      value: kpis.totalOffices.toLocaleString("en-IN"),
      color: "#0d9488",
    },
    { label: "Audit events", value: kpis.auditEvents, color: "#6366f1" },
    { label: "Success rate", value: `${kpis.successRate}%`, color: "#22c55e" },
    {
      label: "Revenue (₹)",
      value: kpis.revenue.toLocaleString("en-IN"),
      color: "#f59e0b",
    },
    {
      label: "Facilities",
      value: `${kpis.approvedFacilities}/${kpis.approvedFacilities + kpis.pendingFacilities}`,
      color: "#ec4899",
    },
  ];

  const facilityPie = {
    labels: (charts.facilitiesByRole || []).map((f) =>
      f.role.replace(/_/g, " "),
    ),
    values: (charts.facilitiesByRole || []).map((f) => f.count),
  };

  const auditTrend = {
    labels: (charts.auditTrend || []).map((d) => d.day),
    values: (charts.auditTrend || []).map((d) => d.count),
  };

  const topStates = charts.topStates.slice(0, 8);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>
        Platform insights
      </Typography>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {kpiCards.map((k) => (
          <Grid size={{ xs: 6, sm: 4, lg: 2 }} key={k.label}>
            <Card sx={{ borderTop: 3, borderColor: k.color }}>
              <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
                <Typography variant="caption" color="text.secondary">
                  {k.label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {k.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          {facilityPie.labels.length > 0 ? (
            <StakeholderDoughnutChart
              title="Stakeholders by role"
              series={facilityPie}
            />
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  No facilities registered yet.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          {auditTrend.labels.length > 0 ? (
            <StakeholderBarChart
              title="Audit activity (7 days)"
              series={auditTrend}
            />
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Audit trend populates as events are logged.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
        <Grid size={12}>
          {topStates.length > 0 ? (
            <StakeholderBarChart
              title="Top states — post offices"
              series={{
                labels: topStates.map((s) => s.state_name),
                values: topStates.map((s) => s.count),
              }}
              horizontal
            />
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Import pincode CSV from the Pincodes tab.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
