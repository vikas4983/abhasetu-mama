import { memo } from 'react';
import type { Metric } from '@/types/domain';

interface MetricCardProps {
  metric: Metric;
}

export const MetricCard = memo(function MetricCard({ metric }: MetricCardProps) {
  const Icon = metric.icon;

  return (
    <article className="metric-card">
      <Icon className="route-icon" aria-hidden="true" />
      <span>{metric.label}</span>
      <strong>{metric.value}</strong>
      <small>
        {metric.unit} - {metric.trend}
      </small>
    </article>
  );
});
