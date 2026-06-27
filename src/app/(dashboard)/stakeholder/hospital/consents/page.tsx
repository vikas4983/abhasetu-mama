'use client';
import FeatureTablePage from '../../../../../components/stakeholder/FeatureTablePage';
export default function HospitalConsentsPage() {
  return (
    <FeatureTablePage
      title="Consent requests"
      description="Patient consent artefacts for health information transfer (HIECM / CM)."
      columns={['Request ID', 'Purpose', 'HIU']}
      rows={[
        { id: '1', col1: 'CR-9a2f…', col2: 'Care Management', col3: 'Demo HIU', status: 'Granted' },
        { id: '2', col1: 'CR-7b1c…', col2: 'BTG', col3: 'Research HIU', status: 'Requested' },
      ]}
    />
  );
}
