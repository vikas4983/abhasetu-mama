import { Link } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { PageHeader } from '@components/ui/PageHeader';
import { ServiceRequestForm } from '@components/forms/ServiceRequestForm';
import { appointments } from '@/constants/data';

export default function AppointmentsPage() {
  return (
    <>
      <PageHeader title="Appointments" subtitle="Review upcoming consultations, lab visits, and follow-up tasks.">
        <Link to="/book-consultation" className="primary-action"><Plus className="small-icon" /> Book Appointment</Link>
      </PageHeader>
      <section className="route-grid list-grid">
        {appointments.map((appointment) => (
          <article className="route-card" key={appointment.id}>
            <h3>{appointment.title}</h3>
            <p>{appointment.doctor}</p>
            <div className="pill-row"><span>{appointment.meta}</span><span>{appointment.status}</span></div>
            <Link className="card-link" to="/appointments">
              View details
              <ChevronRight className="small-icon" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </section>
      <ServiceRequestForm title="Quick Appointment" />
    </>
  );
}
