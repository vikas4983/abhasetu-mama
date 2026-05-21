import { Database, FolderLock, RefreshCw, Share2 } from 'lucide-react';
import { MetricCard } from '@components/ui/MetricCard';
import { PageHeader } from '@components/ui/PageHeader';
import { RecordTable } from '@components/common/RecordTable';

const lockerMetrics = [
  { label: 'Documents', value: '28', unit: 'Files', trend: '4 added this month', icon: FolderLock },
  { label: 'Shared With', value: '3', unit: 'Doctors', trend: 'Consent active', icon: Share2 },
  { label: 'Storage', value: '1.8', unit: 'GB', trend: 'Encrypted', icon: Database },
  { label: 'ABHA Sync', value: 'On', unit: 'Live', trend: 'Last synced 9 mins ago', icon: RefreshCw },
];

export default function DigitalLockerPage() {
  return (
    <>
      <PageHeader title="Digital Locker" subtitle="Securely organize health files, consent forms, prescriptions, and ABHA-linked records." />
      <section className="route-grid metrics-grid">{lockerMetrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</section>
      <RecordTable />
    </>
  );
}
