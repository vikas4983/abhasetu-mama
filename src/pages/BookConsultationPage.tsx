import { Link } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { PageHeader } from '@components/ui/PageHeader';
import { ServiceRequestForm } from '@components/forms/ServiceRequestForm';
import { doctors } from '@/constants/data';

export default function BookConsultationPage() {
  return (
    <>
      <PageHeader title="Book Appointment" subtitle="Choose a doctor, appointment mode, and preferred slot." />
      <section className="route-grid doctor-grid">
        {doctors.map((doctor) => (
          <article className="route-card" key={doctor.id}>
            <div className="card-title-row"><UserRound className="route-icon" /><div><h3>{doctor.name}</h3><p>{doctor.role}</p></div></div>
            <div className="pill-row"><span>{doctor.time}</span><span>{doctor.fee}</span><span>{doctor.rating} rating</span></div>
            <Link to="/appointments" className="primary-action">Select Slot</Link>
          </article>
        ))}
      </section>
      <ServiceRequestForm title="Patient Details" />
    </>
  );
}
