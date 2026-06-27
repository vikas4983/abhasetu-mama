'use client';
import FeatureTablePage from '../../../../../components/stakeholder/FeatureTablePage';
export default function HospitalScanSharePage() {
  return (
    <FeatureTablePage
      title="Scan & Share"
      description="HFR QR check-ins via POST /api/abdm/scan-share — demographic handoff and OPD token generation."
      columns={['Time', 'Facility', 'ABHA']}
      actionLabel="Open scanner"
      rows={[
        { id: '1', col1: '10:24 AM', col2: 'OPD Block A', col3: 'patient.01@sbx', status: 'Done' },
        { id: '2', col1: '10:31 AM', col2: 'Emergency', col3: 'patient.02@sbx', status: 'Done' },
      ]}
    />
  );
}
