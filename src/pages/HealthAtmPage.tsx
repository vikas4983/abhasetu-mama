import { MapPin, Monitor } from 'lucide-react';
import { PageHeader } from '@components/ui/PageHeader';
import { PanelCard } from '@components/ui/PanelCard';

export default function HealthAtmPage() {
  return (
    <>
      <PageHeader title="Health ATM" subtitle="Find nearby kiosks for instant screening and synced vitals." />
      <section className="route-grid two-col">
        <PanelCard panel={{ title: 'Nearest Kiosk', icon: MapPin, lines: ['ABHA SETU Health ATM - Sector 21', 'Open until 9:00 PM', 'Queue: 2 people, expected wait 6 mins'] }} />
        <PanelCard panel={{ title: 'Available Tests', icon: Monitor, lines: ['Blood pressure, SpO2, BMI', 'Glucose random check', 'ECG preview and temperature'] }} />
      </section>
      <section className="route-card wide-card"><h3>Recent Kiosk Reports</h3><ul className="clean-list"><li>May 08 - Full screening completed</li><li>Apr 24 - BP and SpO2 check</li><li>Apr 10 - Glucose screening</li></ul></section>
    </>
  );
}
