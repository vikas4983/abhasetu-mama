import { Users, Video } from 'lucide-react';
import { PageHeader } from '@components/ui/PageHeader';
import { PanelCard } from '@components/ui/PanelCard';
import { doctors } from '@/constants/data';

export default function TelemedicinePage() {
  return (
    <>
      <PageHeader title="Telemedicine" subtitle="Video, audio, waiting-room, and multi-doctor consultation workflows." />
      <section className="route-grid two-col">
        <PanelCard panel={{ title: 'Live Waiting Room', icon: Video, lines: ['3 patients ahead', 'Estimated wait: 8 minutes', 'Consultation mode: Video'] }} />
        <PanelCard panel={{ title: 'Care Team', icon: Users, lines: ['General Physician assigned', 'Cardiologist available on request', 'Prescription will sync to locker'] }} />
      </section>
      <section className="route-grid doctor-grid">
        {doctors.map((doctor) => <article className="route-card" key={doctor.id}><h3>{doctor.name}</h3><p>{doctor.role}</p><div className="pill-row"><span>{doctor.time}</span><span>{doctor.fee}</span></div></article>)}
      </section>
    </>
  );
}
