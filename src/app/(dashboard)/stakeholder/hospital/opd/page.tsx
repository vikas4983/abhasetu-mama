'use client';
import FeatureTablePage from '../../../../../components/stakeholder/FeatureTablePage';
export default function HospitalOpdPage() {
  return (
    <FeatureTablePage
      title="OPD Queue"
      description="Live outpatient queue from Scan & Share and walk-in registrations. Tokens sync with ABDM HIP patient share."
      columns={['Token', 'Patient', 'ABHA address']}
      actionLabel="Refresh queue"
      rows={[
        { id: '1', col1: 'SETU-OPD-1042', col2: 'Aarav S.', col3: 'aarav.91@sbx', status: 'Waiting' },
        { id: '2', col1: 'SETU-OPD-1043', col2: 'Priya M.', col3: 'priya.m@sbx', status: 'In consult' },
        { id: '3', col1: 'SETU-OPD-1044', col2: 'Rahul K.', col3: 'rahul.k@sbx', status: 'Active' },
      ]}
    />
  );
}
