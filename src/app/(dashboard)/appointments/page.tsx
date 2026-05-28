'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, Appointment } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import { Calendar, ArrowLeft, Clock, History, Plus, X, ShieldCheck, HeartPulse, CheckCircle } from 'lucide-react';
import { showToast } from '../../../utils/toast';

interface Doctor {
  name: string;
  role: string;
  degree: string;
  time: string;
  fee: string;
  rating: string;
  experience: string;
  description: string;
  photo: string;
  badge: string;
  certificateId: string;
  hfrId: string;
}

const doctors: Doctor[] = [
  {
    name: "Dr. Ayesha Ali",
    role: "Senior Homeopathy Consultant & Telehealth Lead",
    degree: "DHMS, BSC, LLB, M.D HOMEO",
    time: "Today, 6:00 PM",
    fee: "Rs 899",
    rating: "4.9",
    experience: "35 years experience",
    description: "Former Registrar, Madhya Pradesh. Chronic care, women-led family health, and second opinions.",
    photo: "/assets/doctors/dr-ayesha-ali.jpeg",
    badge: "ABDM Ready",
    certificateId: "ABDM-REG-4207198",
    hfrId: "IN-HFR-100456"
  },
  {
    name: "Dr. Yogyata Mukhraiya",
    role: "Chronic Diseases and Female Problems Specialist",
    degree: "BHMS",
    time: "Tomorrow, 10:00 AM",
    fee: "Rs 699",
    rating: "4.8",
    experience: "12 years experience",
    description: "Focused on female health, infertility concerns, skin care, and chronic condition follow-ups.",
    photo: "/assets/doctors/dr-yogyata-mukhraiya.jpeg",
    badge: "Verified",
    certificateId: "ABDM-REG-8827341",
    hfrId: "IN-HFR-100789"
  },
  {
    name: "Amitendu Giradonia",
    role: "Homeopathy and Primary Care Specialist",
    degree: "BHMS",
    time: "May 24, 6:15 PM",
    fee: "Rs 599",
    rating: "4.7",
    experience: "18 years experience",
    description: "Family care, chronic follow-ups, preventive plans, and medication reviews.",
    photo: "/assets/doctors/Amitendu_Giradonia.jpeg",
    badge: "Telemedicine",
    certificateId: "ABDM-REG-1092837",
    hfrId: "IN-HFR-100122"
  }
];

export default function AppointmentsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { appointments, addAppointment, logSecurityEvent, addNotification } = useAuth();

  const [activeTab, setActiveTab] = useState<'roster' | 'my-tickets'>('roster');
  const [selectedDocIndex, setSelectedDocIndex] = useState<number | null>(null);
  const [showCertIndex, setShowCertIndex] = useState<number | null>(null);
  const [showBookingIndex, setShowBookingIndex] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [consultMode, setConsultMode] = useState('Video Call');

  const [recentToken, setRecentToken] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Local simulated OPD check-in token history registry
  const [tokenHistory, setTokenHistory] = useState([
    { facilityName: "Janki Raman Hospital & Critical Care Centre, Jabalpur", tokenNum: "SETU-TKN-304", date: "May 27, 2026", time: "04:15 PM" },
    { facilityName: "DR AYESHAH HOMEO HEALTH MALL, Bhopal", tokenNum: "SETU-TKN-912", date: "May 26, 2026", time: "10:30 AM" }
  ]);

  const handleOpenCert = (idx: number) => {
    setShowCertIndex(idx);
  };

  const handleOpenBooking = (idx: number) => {
    setShowBookingIndex(idx);
    setSymptoms('');
    setConsultMode('Video Call');
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showBookingIndex === null) return;

    const d = doctors[showBookingIndex];
    const tokenNum = `SETU-TKN-${Math.floor(100 + Math.random() * 900)}`;

    // Add to auth provider appts state
    addAppointment({
      title: `${consultMode} - ${symptoms}`,
      doctor: d.name,
      meta: "Scheduled for Today, 5:00 PM",
      status: "Confirmed",
      token: tokenNum
    });

    logSecurityEvent("OPD Booked", `Consultation booked with ${d.name} (Token: ${tokenNum})`);
    
    // Add token history item
    const newHist = {
      facilityName: `${d.name} Clinic`,
      tokenNum,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setTokenHistory(prev => [newHist, ...prev]);

    // Cleanup & trigger success modal
    setShowBookingIndex(null);
    setRecentToken(tokenNum);
    setShowSuccessModal(true);
  };

  return (
    <>
      {/* Route Hero Header */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }} className="back-link">
          <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
          {t('Home')}
        </a>
        <div>
          <p className="eyebrow">ABHA SETU</p>
          <h2>{t('ABHA Account & Appointments')}</h2>
          <p>{t('Manage active tickets, token registry history, and consultations.')}</p>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <button
          className={`prefill-btn ${activeTab === 'roster' ? 'selected-card' : ''}`}
          onClick={() => setActiveTab('roster')}
          style={{ padding: '8px 16px', minHeight: 'auto', background: activeTab === 'roster' ? 'var(--bg-secondary)' : 'transparent', border: activeTab === 'roster' ? '1px solid var(--border-color)' : 'none' }}
        >
          {t('Book Consultation')}
        </button>
        <button
          className={`prefill-btn ${activeTab === 'my-tickets' ? 'selected-card' : ''}`}
          onClick={() => setActiveTab('my-tickets')}
          style={{ padding: '8px 16px', minHeight: 'auto', background: activeTab === 'my-tickets' ? 'var(--bg-secondary)' : 'transparent', border: activeTab === 'my-tickets' ? '1px solid var(--border-color)' : 'none' }}
        >
          {t('My Tickets & History')}
        </button>
      </div>

      {activeTab === 'roster' ? (
        <div style={{ marginTop: '20px' }}>
          {/* Live waiting room indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '22px' }}>
            <article className="route-card">
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Clock style={{ color: 'var(--accent-teal)' }} />
                <h3 style={{ margin: 0 }}>Live Waiting Room Queues</h3>
              </div>
              <p style={{ margin: '8px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                Patients currently in digital OPD rooms: <strong>3 ahead</strong>. Estimated waiting: <strong>8 minutes</strong>.
              </p>
              <div className="wait-bar"><div className="wait-progress" style={{ width: '75%' }}></div></div>
            </article>
          </div>

          {/* Roster list */}
          <section className="route-grid doctor-grid">
            {doctors.map((d, index) => (
              <article key={index} className="route-card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', padding: '20px' }}>
                <img
                  src={d.photo}
                  alt={d.name}
                  style={{ width: '74px', height: '74px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-teal)' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150';
                  }}
                />
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <h3 style={{ fontSize: '15px', margin: 0 }}>{d.name}</h3>
                    <span className="live-badge" style={{ padding: '2px 8px', fontSize: '9px', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--accent-teal)' }}>{d.badge}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 700, margin: '2px 0' }}>{d.degree} - {d.experience}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.4' }}>{d.description}</p>
                  <div className="pill-row" style={{ display: 'flex', gap: '8px', fontSize: '10px' }}>
                    <span>Fee: {d.fee}</span>
                    <span>Rating: ★ {d.rating}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button className="join-btn" style={{ marginTop: 0, padding: '6px 12px', fontSize: '11px' }} onClick={() => handleOpenCert(index)}>View Credentials</button>
                    <button className="primary-action" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => handleOpenBooking(index)}>Book Slot</button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginTop: '20px' }}>
          {/* Active / Confirmed Appointments */}
          <section className="route-card wide-card">
            <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Calendar style={{ color: 'var(--accent-teal)' }} />
              <h3 style={{ margin: 0 }}>Upcoming Consultations & Appointments</h3>
            </div>
            <div className="route-grid list-grid" style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
              {appointments.map((item, idx) => (
                <article key={idx} className="route-card" style={{ marginBottom: '8px', minHeight: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 750 }}>{t(item.title)}</h4>
                      <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '12px' }}>{item.doctor}</p>
                    </div>
                    <span className="live-badge" style={{ background: 'rgba(0, 212, 170, 0.1)', color: 'var(--accent-teal)', border: '1px solid var(--border-color)', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>{item.status}</span>
                  </div>
                  <div className="pill-row" style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span style={{ marginRight: '12px' }}>{item.meta}</span>
                    {item.token && <span>Token: <strong>{item.token}</strong></span>}
                  </div>
                </article>
              ))}
              {appointments.length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>No upcoming appointments</p>
              )}
            </div>
          </section>

          {/* Token History Registry */}
          <section className="route-card wide-card" style={{ padding: '20px' }}>
            <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <History style={{ color: 'var(--accent-cyan)' }} />
              <h3 style={{ margin: 0 }}>ABHA OPD Token Registry & History</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px', marginTop: 0, lineHeight: 1.5 }}>
              This secure local ledger stores all generated ABDM Scan & Share OPD tokens for Janki Raman Hospital and DR AYESHAH HOMEO HEALTH MALL.
            </p>
            <div className="record-table" style={{ marginTop: '8px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
              <div className="table-row table-head" style={{ fontWeight: 700, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '10px 12px', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr 0.8fr', gap: '8px' }}>
                <span>Facility Name</span>
                <span>Token Number</span>
                <span>Date & Time</span>
                <span>Status</span>
              </div>
              {tokenHistory.map((hist, index) => (
                <div key={index} className="table-row" style={{ borderBottom: '1px solid var(--border-color)', padding: '10px 12px', fontSize: '12px', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr 0.8fr', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t(hist.facilityName)}</span>
                  <span style={{ color: 'var(--accent-teal)', fontFamily: 'monospace', fontWeight: 700 }}>{hist.tokenNum}</span>
                  <span>{hist.date} {hist.time}</span>
                  <span><span style={{ color: 'var(--success)', fontWeight: 800 }}>✔ Active</span></span>
                </div>
              ))}
              {tokenHistory.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px', fontSize: '12px' }}>No historical tokens generated yet.</div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* View Doctor Certificate Modal */}
      {showCertIndex !== null && (
        <div className="modal-overlay" id="cert-modal" onClick={() => setShowCertIndex(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Doctor Verification Certificate</h3>
              <button className="modal-close" onClick={() => setShowCertIndex(null)}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <div className="certificate-frame">
                <div className="certificate-watermark"></div>
                <div className="certificate-header">
                  <h4>National Health Authority</h4>
                  <p>Government of India - Ayushman Bharat Digital Mission</p>
                </div>
                <div className="certificate-title">Medical Practitioner Credentials License</div>
                <div className="certificate-recipient">
                  This is to verify medical registry status for
                  <strong>{doctors[showCertIndex].name}</strong>
                  Degree: <em>{doctors[showCertIndex].degree}</em>
                </div>
                <div className="certificate-body">
                  Successfully enrolled in the ABDM Healthcare Professionals Registry (HPR). Authorized to conduct interoperable telemedicine, sign e-prescriptions, and link patient health records digitally.
                </div>
                <div className="certificate-footer">
                  <div>
                    Registry ID: <strong>{doctors[showCertIndex].certificateId}</strong><br />
                    Linked Facility: <strong>{doctors[showCertIndex].hfrId}</strong>
                  </div>
                  <div className="nha-seal">NHA<br />VERIFIED</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Slot Modal */}
      {showBookingIndex !== null && (
        <div className="modal-overlay" id="booking-modal" onClick={() => setShowBookingIndex(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Consultation Booking Details</h3>
              <button className="modal-close" onClick={() => setShowBookingIndex(null)}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <form className="form-grid" onSubmit={handleBookingSubmit} style={{ display: 'grid', gap: '12px' }}>
                <label style={{ display: 'grid', gap: '4px' }}>Selected Professional
                  <input type="text" readOnly value={`${doctors[showBookingIndex].name} (${doctors[showBookingIndex].role})`} />
                </label>
                <label style={{ display: 'grid', gap: '4px' }}>Describe Active Symptoms
                  <input
                    type="text"
                    required
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Fever, mild cough, body fatigue"
                  />
                </label>
                <label style={{ display: 'grid', gap: '4px' }}>Preferred Mode
                  <select value={consultMode} onChange={(e) => setConsultMode(e.target.value)}>
                    <option value="Video Call">Video Call Consultation (OPD Virtual)</option>
                    <option value="Audio Call">Audio Call Consultation</option>
                    <option value="Clinic OPD Visit">In-Clinic OPD Appointment</option>
                  </select>
                </label>
                <label style={{ display: 'grid', gap: '4px' }}>Consultation Ticket Fee
                  <input type="text" readOnly value={doctors[showBookingIndex].fee} />
                </label>
                <button type="submit" className="join-btn" style={{ width: '100%', minHeight: '44px', marginTop: '12px' }}>
                  Confirm Booking & Generate OPD Token
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Booking Modal */}
      {showSuccessModal && recentToken && (
        <div className="modal-overlay" id="confirm-modal" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-body" style={{ padding: '30px 20px' }}>
              <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: 'rgba(0, 212, 170, 0.15)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <CheckCircle className="logo-plus" style={{ width: '28px', height: '28px' }} />
              </div>
              <h2 style={{ fontSize: '20px', margin: '0 0 8px' }}>OPD Token Confirmed!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '8px 0 20px', lineHeight: '1.5' }}>
                Your token queue ticket has been sent to the clinic desk. Present the QR code on arrival or join the telehealth link directly.
              </p>
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>OPD Queue Token</div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--accent-teal)', margin: '4px 0' }}>{recentToken}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Estimated queue time: <strong>14 mins</strong></div>
              </div>
              <button
                className="join-btn"
                style={{ width: '100%', margin: 0 }}
                onClick={() => {
                  setShowSuccessModal(false);
                  setActiveTab('my-tickets');
                }}
              >
                Go to My Tickets
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
