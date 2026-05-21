import { memo } from 'react';
import type { Panel } from '@/types/domain';

interface PanelCardProps {
  panel: Panel;
}

export const PanelCard = memo(function PanelCard({ panel }: PanelCardProps) {
  const Icon = panel.icon;

  return (
    <article className="route-card">
      <div className="card-title-row">
        <Icon className="route-icon" aria-hidden="true" />
        <h3>{panel.title}</h3>
      </div>
      <ul>
        {panel.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </article>
  );
});
