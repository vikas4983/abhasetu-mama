/**
 * @file        StakeholderCharts.tsx
 * @description Bar, doughnut, and line charts via Chart.js
 * @module      stakeholder/charts
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

'use client';

/** Must run before react-chartjs-2 so ArcElement, CategoryScale, etc. are registered */
import './registerCharts';

import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useChartReady } from './chartSetup';

export interface ChartSeries {
  labels: string[];
  values: number[];
}

const palette = [
  '#0d9488',
  '#6366f1',
  '#f59e0b',
  '#ef4444',
  '#22c55e',
  '#ec4899',
  '#14b8a6',
  '#8b5cf6',
];

function chartColors(n: number) {
  return Array.from({ length: n }, (_, i) => palette[i % palette.length]);
}

function ChartPlaceholder({ title, height = 220 }: { title: string; height?: number }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Skeleton variant="rounded" height={height} />
      </CardContent>
    </Card>
  );
}

export function StakeholderBarChart({
  title,
  series,
  horizontal,
}: {
  title: string;
  series: ChartSeries;
  horizontal?: boolean;
}) {
  const ready = useChartReady();
  const data = {
    labels: series.labels,
    datasets: [
      {
        label: title,
        data: series.values,
        backgroundColor: chartColors(series.values.length),
        borderRadius: 6,
      },
    ],
  };

  if (!ready) return <ChartPlaceholder title={title} />;

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Box sx={{ height: 220 }}>
          <Bar
            data={data}
            options={{
              indexAxis: horizontal ? 'y' : 'x',
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

export function StakeholderDoughnutChart({
  title,
  series,
}: {
  title: string;
  series: ChartSeries;
}) {
  const ready = useChartReady();
  const data = {
    labels: series.labels,
    datasets: [
      {
        data: series.values,
        backgroundColor: chartColors(series.values.length),
        borderWidth: 0,
      },
    ],
  };

  if (!ready) return <ChartPlaceholder title={title} />;

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Box sx={{ height: 220, display: 'flex', justifyContent: 'center' }}>
          <Doughnut
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '62%',
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { boxWidth: 10, font: { size: 11 } },
                },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

export function StakeholderLineChart({
  title,
  series,
}: {
  title: string;
  series: ChartSeries;
}) {
  const ready = useChartReady();
  const data = {
    labels: series.labels,
    datasets: [
      {
        label: title,
        data: series.values,
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13,148,136,0.12)',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  if (!ready) return <ChartPlaceholder title={title} />;

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Box sx={{ height: 220 }}>
          <Line
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
