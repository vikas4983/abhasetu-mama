import { RouteCard } from '@components/ui/RouteCard';
import { PageHeader } from '@components/ui/PageHeader';
import { complianceServices, insightServices, marketplaceServices, quickAccessServices } from '@/constants/data';
import type { ServiceSummary } from '@/types/domain';

const directories: Record<string, { title: string; subtitle: string; items: ServiceSummary[] }> = {
  quick: { title: 'Quick Access', subtitle: 'Open the most frequently used healthcare services.', items: quickAccessServices },
  marketplace: { title: 'Marketplace', subtitle: 'Medicine, labs, equipment, ambulance, and sample collection services.', items: marketplaceServices },
  compliance: { title: 'Medicolegal & Compliance', subtitle: 'Consent, prescriptions, legal vault, and audit-ready workflows.', items: complianceServices },
  insights: { title: 'Health Insights & Education', subtitle: 'Tips, reminders, prevention plans, and AI assistance.', items: insightServices },
  more: { title: 'More', subtitle: 'Explore every ABHA SETU service and support workflow.', items: [...quickAccessServices, ...marketplaceServices, ...complianceServices, ...insightServices] },
};

export default function DirectoryPage({ type }: { type: keyof typeof directories }) {
  const directory = directories[type];

  return (
    <>
      <PageHeader title={directory.title} subtitle={directory.subtitle} />
      <section className="route-grid service-grid">
        {directory.items.map((item) => (
          <RouteCard key={item.route} title={item.title} description={item.desc} icon={item.icon} to={item.route} />
        ))}
      </section>
    </>
  );
}
