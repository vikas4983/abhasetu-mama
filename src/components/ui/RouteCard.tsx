import { memo, PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface RouteCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  to?: string;
}

export const RouteCard = memo(function RouteCard({
  title,
  description,
  icon: Icon,
  to,
  children,
}: PropsWithChildren<RouteCardProps>) {
  return (
    <article className="route-card">
      {Icon ? <Icon className="route-icon" aria-hidden="true" /> : null}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {children}
      {to ? (
        <Link className="card-link" to={to}>
          <span>Explore</span>
          <ArrowRight className="small-icon" aria-hidden="true" />
        </Link>
      ) : null}
    </article>
  );
});
