import { BrainCircuit, ChevronRight, Lock, Monitor, Smartphone, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FacilitiesSection } from '@components/sections/FacilitiesSection';
import { StatsSection } from '@components/sections/StatsSection';
import { Seo } from '@components/seo/Seo';
import { appointments, complianceServices, insightServices, marketplaceServices, quickAccessServices, vitals } from '@/constants/data';

function SectionHeader({ title, to }: { title: string; to: string }) {
  return (
    <div className="section-header">
      <h3>{title}</h3>
      <Link className="view-all" to={to}>
        View All <ChevronRight className="view-icon" aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Seo title="Digital Health Bridge" description="ABHA SETU premium ABDM-ready healthcare SaaS for identity, telemedicine, records, insights, and QR care workflows." />
      <section className="hero">
        <div className="hero-content">
          <h2>
            Your Digital
            <br />
            <span className="gradient-text">Healthcare Ecosystem</span>
          </h2>
          <div className="hero-ecg" aria-hidden="true">
            <svg viewBox="0 0 300 60" className="ecg-line">
              <path d="M0,30 L40,30 L50,30 L55,15 L60,45 L65,10 L70,50 L75,30 L80,30 L120,30 L125,25 L130,35 L135,20 L140,40 L145,30 L150,30 L190,30 L195,20 L200,40 L205,15 L210,45 L215,30 L220,30 L260,30 L265,25 L270,35 L275,20 L280,40 L285,30 L300,30" fill="none" stroke="#00d4aa" strokeWidth="1.5" />
            </svg>
            <div className="ecg-grid" />
          </div>
        </div>
        <div className="hero-actions">
          <Link className="hero-btn" to="/book-consultation"><Users className="btn-icon" /> <span>Book Consultation</span></Link>
          <Link className="hero-btn" to="/health-atm"><Monitor className="btn-icon" /> <span>Health ATM</span></Link>
          <Link className="hero-btn" to="/digital-locker"><Lock className="btn-icon" /> <span>Digital Locker</span></Link>
        </div>
      </section>

      <StatsSection />

      <section className="section">
        <SectionHeader title="Quick Access" to="/quick-access" />
        <div className="quick-grid">
          {quickAccessServices.map((service) => {
            const Icon = service.icon;
            return (
              <Link className="quick-item" key={service.route} to={service.route}>
                <div className="quick-icon"><Icon /></div>
                <span>{service.title}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="section-title">
            <h3>Live Health Dashboard</h3>
            <span className="live-badge"><span className="live-dot" /> Live</span>
          </div>
          <Link className="view-all" to="/live-dashboard">View All <ChevronRight className="view-icon" /></Link>
        </div>
        <div className="health-grid">
          {vitals.map((vital) => (
            <Link className="health-card" key={vital.label} to="/live-dashboard">
              <span className="health-label">{vital.label}</span>
              <span className="health-value">{vital.value}</span>
              <span className="health-unit">{vital.unit}</span>
              <svg viewBox="0 0 100 30" className="health-chart" aria-hidden="true"><path d="M0,20 Q10,15 20,18 T40,12 T60,20 T80,10 T100,18" fill="none" stroke="#00d4aa" strokeWidth="1.5" /></svg>
            </Link>
          ))}
        </div>
        <div className="health-status">
          <Link className="status-card" to="/notifications">
            <div className="status-icon"><BrainCircuit /></div>
            <div className="status-info"><span className="status-title">AI Alerts</span><span className="status-value">2 New</span></div>
          </Link>
          <Link className="status-card" to="/health">
            <div className="status-icon"><Smartphone /></div>
            <div className="status-info"><span className="status-title">Device Sync</span><span className="status-value">4/4 Connected</span></div>
          </Link>
        </div>
      </section>

      <section className="section">
        <SectionHeader title="Telemedicine" to="/telemedicine" />
        <div className="tele-grid">
          <Link className="tele-card tele-main" to="/telemedicine-room">
            <div className="tele-info">
              <span className="tele-title">Video / Audio Consultation</span>
              <span className="tele-subtitle">Connect with doctors instantly</span>
              <div className="tele-doctor"><img src="https://csspicker.dev/api/image/?q=female+doctor&image_type=photo" alt="" /><div><span className="doctor-name">{appointments[0].doctor}</span><span className="doctor-role">General Physician</span></div></div>
              <span className="join-btn">Join Now</span>
            </div>
            <img src="https://csspicker.dev/api/image/?q=female+doctor+smiling&image_type=photo" alt="" className="tele-img" />
          </Link>
          <Link className="tele-card" to="/telemedicine"><span className="tele-title">Waiting Room</span><span className="tele-count">3 <span className="tele-count-label">Patients Ahead</span></span><span className="tele-wait">Est. 8 mins wait</span><div className="wait-bar"><div className="wait-progress" /></div></Link>
          <Link className="tele-card tele-conference" to="/telemedicine"><span className="tele-title">Multi-Doctor<br />Conference</span><span className="tele-subtitle">Connect with specialists</span><div className="conference-avatars"><div className="c-avatar" /><div className="c-avatar" /><div className="c-avatar" /><div className="c-avatar c-avatar-more">+</div></div></Link>
        </div>
      </section>

      <section className="section">
        <SectionHeader title="Marketplace" to="/marketplace" />
        <div className="market-scroll">
          {marketplaceServices.map((service) => {
            const Icon = service.icon;
            return <Link className="market-item" key={service.route} to={service.route}><div className="market-icon"><Icon /></div><span>{service.title}</span>{service.title === 'Drone Delivery' ? <span className="soon-badge">Coming Soon</span> : null}</Link>;
          })}
        </div>
      </section>

      <section className="section">
        <SectionHeader title="Medicolegal & Compliance" to="/compliance" />
        <div className="legal-grid">
          {complianceServices.map((service) => {
            const Icon = service.icon;
            return <Link className="legal-item" key={service.route} to={service.route}><div className="legal-icon"><Icon /></div><span>{service.title}</span></Link>;
          })}
        </div>
      </section>

      <FacilitiesSection />

      <section className="section section-last">
        <SectionHeader title="Health Insights & Education" to="/insights" />
        <div className="insights-scroll">
          {insightServices.map((service) => <Link className="insight-card" key={service.route} to={service.route}><img src={`https://csspicker.dev/api/image/?q=${encodeURIComponent(service.title)}&image_type=photo`} alt="" /><span className="insight-title">{service.title}</span><span className="insight-desc">{service.desc}</span></Link>)}
        </div>
      </section>
    </>
  );
}
