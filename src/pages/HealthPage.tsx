import { BrainCircuit, ClipboardCheck } from 'lucide-react';
import { MetricCard } from '@components/ui/MetricCard';
import { PageHeader } from '@components/ui/PageHeader';
import { PanelCard } from '@components/ui/PanelCard';
import { records, vitals } from '@/constants/data';

export default function HealthPage() {
  return (
    <>
      <PageHeader title="Health" subtitle="Monitor your vitals, connected devices, care plan, and AI wellness signals from one dashboard." />
      <section className="route-grid metrics-grid">{vitals.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</section>
      <section className="route-grid two-col">
        <PanelCard panel={{ title: 'Care Plan', icon: ClipboardCheck, lines: ['Morning medication reminder at 8:00 AM', 'Walk target: 6,000 steps, currently 4,250', 'Next preventive checkup due May 28, 2026'] }} />
        <PanelCard panel={{ title: 'AI Health Summary', icon: BrainCircuit, lines: ['Vitals are stable compared with your 14-day average.', 'Hydration looks low based on recent activity logs.', 'No high-risk alerts detected in the last 24 hours.'] }} />
      </section>
      <section className="route-card wide-card">
        <h3>Recent Health Activity</h3>
        <ul className="clean-list">{records.slice(0, 3).map((record) => <li key={record.id}>{record.name} - {record.date}</li>)}</ul>
      </section>
    </>
  );
}
