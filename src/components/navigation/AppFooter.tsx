import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { abdmReferenceUrl, contactInfo } from '@/constants/enterpriseData';

const quickLinks = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'ABDM Workflows', to: '/abdm' },
  { label: 'Health Insights', to: '/insights' },
  { label: 'Telemedicine', to: '/telemedicine' },
];

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="footer-brand">
        <span className="footer-mark">+</span>
        <div>
          <h2>ABHA SETU</h2>
          <p>Premium digital healthcare experiences for ABDM-ready identity, records, and care access.</p>
        </div>
      </div>
      <div className="footer-grid">
        <div>
          <h3>Quick Links</h3>
          {quickLinks.map((link) => <Link key={link.to} to={link.to}>{link.label}</Link>)}
        </div>
        <div>
          <h3>Contact</h3>
          <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
          <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
          <p>{contactInfo.address}</p>
        </div>
        <div>
          <h3>Policies</h3>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <a href={abdmReferenceUrl} target="_blank" rel="noreferrer">ABDM Sandbox <ExternalLink className="small-icon" /></a>
        </div>
        <div>
          <h3>Social</h3>
          <a href={contactInfo.social.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={contactInfo.social.instagram} target="_blank" rel="noreferrer">Instagram</a>
          <a href={contactInfo.social.facebook} target="_blank" rel="noreferrer">Facebook</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Copyright 2026 ABHA SETU. All rights reserved.</span>
        <span>Consent-first healthcare. ABDM-ready architecture.</span>
      </div>
    </footer>
  );
}
