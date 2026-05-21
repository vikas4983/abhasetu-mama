import { Navigate, useParams } from 'react-router-dom';
import { MetricCard } from '@components/ui/MetricCard';
import { PageHeader } from '@components/ui/PageHeader';
import { PanelCard } from '@components/ui/PanelCard';
import { ServiceRequestForm } from '@components/forms/ServiceRequestForm';
import { serviceDetails } from '@/constants/data';

export default function ServicePage() {
  const { serviceId } = useParams();
  const service = serviceId ? serviceDetails[serviceId] : undefined;

  if (!service) return <Navigate to="/404" replace />;

  return (
    <>
      <PageHeader title={service.title} subtitle={service.subtitle} />
      <section className="route-grid metrics-grid">
        {service.stats.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </section>
      <section className="route-grid two-col">
        {service.panels.map((panel) => <PanelCard key={panel.title} panel={panel} />)}
      </section>
      <section className="route-card wide-card">
        <h3>{service.listTitle}</h3>
        <ul className="clean-list">{service.list.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <ServiceRequestForm title={service.title} />
    </>
  );
}
