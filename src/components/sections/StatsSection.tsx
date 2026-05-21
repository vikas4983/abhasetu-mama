import { platformStats } from '@/constants/enterpriseData';
import { AnimatedCounter } from '@components/ui/AnimatedCounter';

export function StatsSection() {
  return (
    <section className="enterprise-section stats-section" aria-label="ABDM ecosystem statistics">
      {platformStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <article className="stat-card motion-card" key={stat.label}>
            <Icon className="route-icon" aria-hidden="true" />
            <strong><AnimatedCounter value={stat.value} suffix={stat.suffix} /></strong>
            <span>{stat.label}</span>
          </article>
        );
      })}
    </section>
  );
}
