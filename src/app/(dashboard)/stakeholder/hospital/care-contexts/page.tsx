'use client';
import FeatureTablePage from '../../../../../components/stakeholder/FeatureTablePage';
export default function HospitalCareContextsPage() {
  return (
    <FeatureTablePage
      title="Care contexts"
      description="M2 HIP linking — discover, init, and confirm care contexts for ABHA addresses."
      columns={['Reference', 'HI type', 'HIP']}
      rows={[
        { id: '1', col1: 'CC-8821', col2: 'Prescription', col3: 'IN-HIP-10001', status: 'Linked' },
        { id: '2', col1: 'CC-8822', col2: 'DiagnosticReport', col3: 'IN-HIP-10001', status: 'Pending' },
      ]}
    />
  );
}
