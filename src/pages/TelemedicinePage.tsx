import { useEffect, useRef, useState } from 'react';
import { Download, FileBadge, ShieldCheck, Users, Video, X } from 'lucide-react';
import { PageHeader } from '@components/ui/PageHeader';
import { PanelCard } from '@components/ui/PanelCard';
import { Seo } from '@components/seo/Seo';
import { doctorProfiles, type DoctorProfile } from '@/constants/enterpriseData';

export default function TelemedicinePage() {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selectedDoctor) return undefined;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedDoctor(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedDoctor]);

  return (
    <>
      <Seo title="Telemedicine" description="ABHA SETU telemedicine with ABDM approved doctor profiles and certificate previews." />
      <PageHeader title="Telemedicine" subtitle="Certificate-backed video, audio, waiting-room, and multi-doctor consultation workflows." />
      <section className="route-grid two-col">
        <PanelCard panel={{ title: 'Live Waiting Room', icon: Video, lines: ['3 patients ahead', 'Estimated wait: 8 minutes', 'Consultation mode: Video'] }} />
        <PanelCard panel={{ title: 'Care Team', icon: Users, lines: ['ABDM approved doctor profiles', 'Certificate preview enabled', 'Prescription will sync to locker'] }} />
      </section>
      <section className="doctor-profile-grid">
        {doctorProfiles.map((doctor) => (
          <article className="doctor-profile-card motion-card" key={doctor.id}>
            <img src={doctor.photoUrl} alt={`${doctor.name} portrait`} loading="lazy" />
            <div className="doctor-profile-body">
              <div className="doctor-profile-title">
                <div>
                  <h3>{doctor.name}</h3>
                  <p>{doctor.degree}</p>
                </div>
                <span className="approved-badge"><ShieldCheck className="small-icon" /> ABDM Approved</span>
              </div>
              <div className="pill-row">
                <span>{doctor.speciality}</span>
                <span>{doctor.experience}</span>
              </div>
              <p>{doctor.description}</p>
              <div className="doctor-actions">
                <button className="back-link" type="button" onClick={() => setSelectedDoctor(doctor)}>
                  <FileBadge className="small-icon" /> Certificate Preview
                </button>
                <a className="primary-action" href="/telemedicine-room">Consult Now</a>
              </div>
            </div>
          </article>
        ))}
      </section>
      {selectedDoctor ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedDoctor(null)}>
          <section className="certificate-modal" role="dialog" aria-modal="true" aria-labelledby="certificate-title" onClick={(event) => event.stopPropagation()}>
            <button className="icon-button modal-close" type="button" ref={closeButtonRef} onClick={() => setSelectedDoctor(null)} aria-label="Close certificate preview">
              <X className="small-icon" />
            </button>
            <img src={selectedDoctor.photoUrl} alt={`${selectedDoctor.name} attached photograph`} />
            <div>
              <p className="eyebrow">Certificate Preview</p>
              <h3 id="certificate-title">{selectedDoctor.certificateLabel}</h3>
              <object data={selectedDoctor.certificateUrl} type="image/svg+xml" aria-label={selectedDoctor.certificateLabel} />
              <a className="primary-action" href={selectedDoctor.certificateUrl} download>
                <Download className="small-icon" /> Download Certificate
              </a>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
