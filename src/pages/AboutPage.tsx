import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FacilitiesSection } from '@components/sections/FacilitiesSection';
import { StatsSection } from '@components/sections/StatsSection';
import { Seo } from '@components/seo/Seo';
import { timeline } from '@/constants/enterpriseData';

export default function AboutPage() {
  return (
    <>
      <Seo title="About" description="Learn about ABHA SETU vision, mission, ABDM alignment, and healthcare innovation story." />
      <section className="premium-hero">
        <div>
          <p className="eyebrow">About ABHA SETU</p>
          <h2>Building a consent-first bridge for digital healthcare in India.</h2>
          <p>
            AbhaSetu brings identity, records, telemedicine, facilities, and healthcare education into a secure ABDM-ready user experience.
          </p>
          <Link className="primary-action" to="/abdm">Explore ABDM Workflows <ArrowRight className="small-icon" /></Link>
        </div>
        <div className="hero-trust-panel">
          <ShieldCheck aria-hidden="true" />
          <strong>Trust by design</strong>
          <span>Privacy-aware, accessible, responsive, and ready for backend-backed healthcare workflows.</span>
        </div>
      </section>
      <section className="about-grid">
        <article className="route-card">
          <h3>Vision</h3>
          <p>Make digital healthcare more trustworthy, usable, and connected for every patient and provider.</p>
        </article>
        <article className="route-card">
          <h3>Mission</h3>
          <p>Deliver ABDM-aligned health identity, record, consent, consultation, and education experiences through premium software craftsmanship.</p>
        </article>
        <article className="route-card">
          <h3>Why ABDM Matters</h3>
          <p>ABDM enables interoperable, consent-driven digital health services so patients can access care without fragmented records and repeated paperwork.</p>
        </article>
      </section>
      <StatsSection />
      <section className="timeline-section">
        <div className="section-header"><h3>Innovation Timeline</h3></div>
        {timeline.map((item) => (
          <article className="timeline-card" key={item.year}>
            <span>{item.year}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </section>
      <FacilitiesSection />
    </>
  );
}
