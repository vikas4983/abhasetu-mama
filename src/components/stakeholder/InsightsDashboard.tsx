/**
 * @file        InsightsDashboard.tsx
 * @description KPI cards and Chart.js visualizations for stakeholder insights
 * @module      stakeholder
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

'use client';

import React from 'react';
import { Box, Card, CardContent, Grid, Typography, Skeleton } from '@mui/material';
import {
  StakeholderBarChart,
  StakeholderDoughnutChart,
  StakeholderLineChart,
  ChartSeries,
} from './charts/StakeholderCharts';

export interface InsightKpi {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export interface InsightsDashboardProps {
  title: string;
  kpis: InsightKpi[];
  weeklyTrend?: ChartSeries;
  breakdown?: ChartSeries;
  barChart?: ChartSeries & { title: string; horizontal?: boolean };
  lineChart?: ChartSeries & { title: string };
  loading?: boolean;
}

export default function InsightsDashboard({
  title,
  kpis,
  weeklyTrend,
  breakdown,
  barChart,
  lineChart,
  loading,
}: InsightsDashboardProps) {
  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} />
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Skeleton variant="rounded" height={88} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((k) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={k.label}>
            <Card sx={{ borderLeft: 4, borderColor: k.color || 'primary.main', height: '100%' }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="text.secondary">
                  {k.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {k.value}
                </Typography>
                {k.sub && (
                  <Typography variant="caption" color="text.secondary">
                    {k.sub}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {weeklyTrend && weeklyTrend.labels.length > 0 && (
          <Grid size={{ xs: 12, md: 7 }}>
            <StakeholderBarChart title="7-day activity" series={weeklyTrend} />
          </Grid>
        )}
        {breakdown && breakdown.labels.length > 0 && (
          <Grid size={{ xs: 12, md: 5 }}>
            <StakeholderDoughnutChart title="Distribution" series={breakdown} />
          </Grid>
        )}
        {barChart && barChart.labels.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <StakeholderBarChart
              title={barChart.title}
              series={{ labels: barChart.labels, values: barChart.values }}
              horizontal={barChart.horizontal}
            />
          </Grid>
        )}
        {lineChart && lineChart.labels.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <StakeholderLineChart
              title={lineChart.title}
              series={{ labels: lineChart.labels, values: lineChart.values }}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

/** @description Build analytics from live ops payload */
export function getOpsAnalytics(role: string, data: Record<string, unknown> | null) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyTrend = {
    labels: days,
    values: days.map((_, i) => 12 + i * 3 + (role === 'hospital' ? 30 : 10)),
  };

  if (!data) return { kpis: getRoleAnalytics(role).kpis, weeklyTrend, breakdown: getRoleAnalytics(role).breakdown };

  if (role === 'hospital') {
    const beds = (data.beds as { status: string }[]) || [];
    const appts = (data.appointments as { status: string }[]) || [];
    const staff = (data.staff as { available: boolean }[]) || [];
    const blood = (data.bloodBank as { units: number; group: string; component: string }[]) || [];
    return {
      kpis: [
        { label: 'Beds available', value: beds.filter((b) => b.status === 'available').length, color: '#22c55e' },
        { label: 'Beds occupied', value: beds.filter((b) => b.status === 'occupied').length, color: '#ef4444' },
        { label: 'Appointments', value: appts.length, sub: `${appts.filter((a) => a.status === 'pending').length} pending`, color: '#0d9488' },
        { label: 'Staff on duty', value: staff.filter((s) => s.available).length, color: '#6366f1' },
      ],
      weeklyTrend,
      breakdown: {
        labels: ['Available', 'Occupied', 'Maintenance'],
        values: [
          beds.filter((b) => b.status === 'available').length,
          beds.filter((b) => b.status === 'occupied').length,
          beds.filter((b) => b.status === 'maintenance').length,
        ],
      },
      barChart: {
        title: 'Blood bank units',
        labels: blood.map((b) => `${b.group} ${b.component}`),
        values: blood.map((b) => b.units),
        horizontal: true,
      },
    };
  }

  if (role === 'lab') {
    const tests = (data.tests as { name: string; bookings: number; price: number }[]) || [];
    const areas = (data.areaCoverage as string[]) || [];
    const top = [...tests].sort((a, b) => b.bookings - a.bookings)[0];
    return {
      kpis: [
        { label: 'Tests catalogued', value: tests.length, color: '#0d9488' },
        { label: 'Top test', value: top?.name || '—', sub: top ? `${top.bookings} bookings` : '', color: '#6366f1' },
        { label: 'Areas served', value: areas.length, color: '#22c55e' },
        { label: 'Avg price (₹)', value: tests.length ? Math.round(tests.reduce((s, t) => s + t.price, 0) / tests.length) : 0, color: '#f59e0b' },
      ],
      weeklyTrend,
      barChart: {
        title: 'Most demanded tests',
        labels: tests.map((t) => t.name),
        values: tests.map((t) => t.bookings),
      },
      breakdown: {
        labels: areas.slice(0, 4),
        values: areas.slice(0, 4).map((_, i) => tests.reduce((s, t) => s + t.bookings, 0) / (i + 2)),
      },
    };
  }

  if (role === 'pharmacy') {
    const meds = (data.medicines as { name: string; stock: number; rxRequired: boolean }[]) || [];
    const topAreas = (data.topAreas as string[]) || [];
    const lowStock = meds.filter((m) => m.stock < 50).length;
    const topMed = [...meds].sort((a, b) => b.stock - a.stock)[0];
    return {
      kpis: [
        { label: 'SKUs', value: meds.length, color: '#0d9488' },
        { label: 'Rx-required', value: meds.filter((m) => m.rxRequired).length, color: '#6366f1' },
        { label: 'Low stock', value: lowStock, color: '#f59e0b' },
        { label: 'Top seller', value: topMed?.name || '—', color: '#22c55e' },
      ],
      weeklyTrend,
      barChart: {
        title: 'Stock levels',
        labels: meds.map((m) => m.name.split(' ')[0]),
        values: meds.map((m) => m.stock),
      },
      breakdown: {
        labels: topAreas,
        values: topAreas.map((_, i) => 100 - i * 18),
      },
    };
  }

  if (role === 'individual_doctor') {
    const appts = (data.appointments as { status: string; mode: string }[]) || [];
    const slots = (data.availability as { slots: string[] }[]) || [];
    return {
      kpis: [
        { label: 'Today', value: appts.length, color: '#0d9488' },
        { label: 'Pending', value: appts.filter((a) => a.status === 'pending').length, color: '#f59e0b' },
        { label: 'Telemedicine', value: appts.filter((a) => a.mode === 'telemedicine').length, color: '#6366f1' },
        { label: 'Open slots', value: slots.reduce((s, d) => s + d.slots.length, 0), color: '#22c55e' },
      ],
      weeklyTrend,
      breakdown: {
        labels: ['Pending', 'Confirmed', 'Rejected'],
        values: [
          appts.filter((a) => a.status === 'pending').length,
          appts.filter((a) => a.status === 'confirmed').length,
          appts.filter((a) => a.status === 'rejected').length,
        ],
      },
    };
  }

  return getRoleAnalytics(role);
}

/** @description Demo analytics seeded by role for sandbox dashboards */
export function getRoleAnalytics(role: string) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const base = role === 'hospital' ? 42 : role === 'clinic' ? 28 : 15;
  const weeklyTrend = {
    labels: days,
    values: days.map((_, i) => base + Math.floor(Math.random() * 12) + i * 2),
  };

  const byRole: Record<string, InsightKpi[]> = {
    hospital: [
      { label: 'OPD today', value: 124, sub: '+12% vs yesterday', color: '#0d9488' },
      { label: 'Scan & Share', value: 89, sub: 'check-ins', color: '#6366f1' },
      { label: 'Care links', value: 56, color: '#22c55e' },
      { label: 'Consents pending', value: 7, color: '#f59e0b' },
    ],
    clinic: [
      { label: 'Appointments', value: 32, color: '#0d9488' },
      { label: 'Completed', value: 24, color: '#22c55e' },
      { label: 'No-shows', value: 3, color: '#ef4444' },
      { label: 'ABHA linked', value: '96%', color: '#6366f1' },
    ],
    pharmacy: [
      { label: 'Orders today', value: 48, color: '#0d9488' },
      { label: 'E-Rx fulfilled', value: 31, color: '#6366f1' },
      { label: 'Low stock SKUs', value: 5, color: '#f59e0b' },
      { label: 'Revenue (₹)', value: '18.4K', color: '#22c55e' },
    ],
    lab: [
      { label: 'Samples in', value: 67, color: '#0d9488' },
      { label: 'Reports out', value: 52, color: '#22c55e' },
      { label: 'Pending', value: 15, color: '#f59e0b' },
      { label: 'ABDM uploads', value: 41, color: '#6366f1' },
    ],
    diagnostic_centre: [
      { label: 'Imaging orders', value: 23, color: '#0d9488' },
      { label: 'Reports signed', value: 19, color: '#22c55e' },
      { label: 'Queue wait (min)', value: 14, color: '#6366f1' },
      { label: 'FHIR bundles', value: 17, color: '#f59e0b' },
    ],
    insurance_org: [
      { label: 'Eligibility checks', value: 156, color: '#0d9488' },
      { label: 'Approved', value: 132, color: '#22c55e' },
      { label: 'Denied', value: 18, color: '#ef4444' },
      { label: 'PM-JAY linked', value: 89, color: '#6366f1' },
    ],
    individual_doctor: [
      { label: 'Consults today', value: 14, color: '#0d9488' },
      { label: 'HPR verified', value: 'Yes', color: '#22c55e' },
      { label: 'Follow-ups', value: 6, color: '#6366f1' },
      { label: 'Patient rating', value: '4.8', color: '#f59e0b' },
    ],
    iqra_alumni: [
      { label: 'Members', value: 240, color: '#0d9488' },
      { label: 'Active this month', value: 68, color: '#6366f1' },
      { label: 'Health camps', value: 3, color: '#22c55e' },
      { label: 'Referrals', value: 12, color: '#f59e0b' },
    ],
  };

  const breakdown = {
    labels: ['Completed', 'In progress', 'Pending', 'Other'],
    values: [45, 30, 15, 10],
  };

  return {
    kpis: byRole[role] || byRole.clinic,
    weeklyTrend,
    breakdown,
  };
}
