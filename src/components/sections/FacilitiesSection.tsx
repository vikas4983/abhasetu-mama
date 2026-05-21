import { facilities } from '@/constants/enterpriseData';

export function FacilitiesSection() {
  return (
    <section className="enterprise-section">
      <div className="section-header">
        <h3>Connected Facilities</h3>
      </div>
      <div className="facility-grid">
        {facilities.map((facility) => {
          const Icon = facility.icon;
          return (
            <article className="facility-card motion-card" key={facility.title}>
              <div className="facility-icon"><Icon aria-hidden="true" /></div>
              <h4>{facility.title}</h4>
              <p>{facility.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
