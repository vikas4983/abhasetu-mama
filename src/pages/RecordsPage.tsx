import { PageHeader } from '@components/ui/PageHeader';
import { RecordTable } from '@components/common/RecordTable';

export default function RecordsPage() {
  return (
    <>
      <PageHeader title="Records" subtitle="A realistic digital locker view for reports, prescriptions, vitals, and policy files." />
      <RecordTable />
    </>
  );
}
