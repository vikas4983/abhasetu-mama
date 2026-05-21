import { Mic, PhoneOff, Video } from 'lucide-react';
import { PageHeader } from '@components/ui/PageHeader';

export default function TelemedicineRoomPage() {
  return (
    <>
      <PageHeader title="Consultation Room" subtitle="A dummy pre-call screen for the selected doctor." />
      <section className="call-room">
        <div className="video-tile"><span>Dr. Priya Sharma</span><Video className="call-icon" /></div>
        <div className="call-actions">
          <button type="button"><Mic className="small-icon" /> Mic</button>
          <button type="button"><Video className="small-icon" /> Camera</button>
          <button type="button"><PhoneOff className="small-icon" /> End</button>
        </div>
      </section>
    </>
  );
}
