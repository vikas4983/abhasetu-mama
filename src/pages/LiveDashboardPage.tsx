import { PageHeader } from '@components/ui/PageHeader';
import { MetricCard } from '@components/ui/MetricCard';
import { vitals } from '@/constants/data';

export default function LiveDashboardPage() {
  return (
    <>
      <PageHeader title="Live Health Dashboard" subtitle="Streaming vitals with realistic dummy telemetry, trends, and connected-device status." />
      <section className="route-grid metrics-grid">{vitals.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</section>
      <section className="chart-panel">
        <div className="section-header"><h3>Today Trend</h3><span className="live-badge"><span className="live-dot" /> Live</span></div>
        <div className="bar-chart" aria-label="Today trend chart"><span style={{ height: '44%' }} /><span style={{ height: '64%' }} /><span style={{ height: '52%' }} /><span style={{ height: '76%' }} /><span style={{ height: '48%' }} /><span style={{ height: '68%' }} /><span style={{ height: '58%' }} /></div>
      </section>
    </>
  );
}
