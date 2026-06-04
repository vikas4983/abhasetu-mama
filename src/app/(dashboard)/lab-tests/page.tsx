'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../providers/LanguageProvider';
import { useAuth } from '../../../providers/AuthProvider';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  FlaskConical,
  Activity,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  Info,
  UserCheck,
  ShieldCheck,
  X
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

interface LabPackage {
  id: string;
  name: string;
  parameters: number;
  provider: string;
  price: number;
  originalPrice: number;
  discount: number;
  reportHours: number;
  sampleType: string;
  description: string;
  image: string;
}

const LAB_PACKAGES_DATABASE: LabPackage[] = [
  {
    id: 'l1',
    name: 'ABHA Active Full Body Health Checkup',
    parameters: 54,
    provider: 'Janki Raman Diagnostic Lab, Jabalpur',
    price: 890,
    originalPrice: 1990,
    discount: 55,
    reportHours: 24,
    sampleType: 'Blood & Urine',
    description: 'Complete screening of liver, kidney, blood sugar, cholesterol, thyroid, and blood counts.',
    image: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'l2',
    name: 'Thyroid Care Profile (T3, T4, TSH)',
    parameters: 3,
    provider: 'DR AYESHAH HOMEO LAB, Bhopal',
    price: 350,
    originalPrice: 700,
    discount: 50,
    reportHours: 12,
    sampleType: 'Blood',
    description: 'Evaluates thyroid gland function and checks for hyperthyroidism or hypothyroidism.',
    image: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'l3',
    name: 'Comprehensive Diabetes Screening (HbA1c & Fasting)',
    parameters: 4,
    provider: 'Metro Diagnostics',
    price: 290,
    originalPrice: 600,
    discount: 51,
    reportHours: 8,
    sampleType: 'Blood (Fasting Required)',
    description: 'Measures average blood sugar levels over the past 3 months and active fasting levels.',
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'l4',
    name: 'Active Lipid & Cholesterol Profile',
    parameters: 7,
    provider: 'Janki Raman Diagnostic Lab, Jabalpur',
    price: 390,
    originalPrice: 800,
    discount: 51,
    reportHours: 12,
    sampleType: 'Blood',
    description: 'Helps assess risk of cardiovascular disease by measuring bad and good cholesterol ratios.',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'l5',
    name: 'Vitamin D & B12 Vitality Duo',
    parameters: 2,
    provider: 'Metro Diagnostics',
    price: 750,
    originalPrice: 1500,
    discount: 50,
    reportHours: 24,
    sampleType: 'Blood',
    description: 'Identifies bone wellness, nervous health, and metabolic energy cofactor deficiencies.',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=300'
  }
];

export default function LabTestsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { addRecord, logSecurityEvent } = useAuth();

  // Infinite scroll mock packages state
  const [packages, setPackages] = useState<LabPackage[]>(LAB_PACKAGES_DATABASE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Booking states
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [isBookingDrawerOpen, setIsBookingDrawerOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<'cart' | 'schedule' | 'patient' | 'success'>('cart');

  // Interactive Form States
  const [patient, setPatient] = useState({
    name: 'Ananya Verma',
    age: '30',
    gender: 'Female',
    abhaId: 'ananya.verma@abdm',
    address: '14, Vijay Nagar Scheme, Near Patel Chowk, Jabalpur'
  });
  
  const [schedule, setSchedule] = useState({
    date: '',
    timeSlot: 'Morning (07:00 AM - 09:00 AM)'
  });

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const threshold = 200; // pixels from bottom
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - threshold) {
          if (!isLoadingMore) {
            loadMorePackages();
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [packages, isLoadingMore]);

  const loadMorePackages = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      const nextBatch: LabPackage[] = [];
      const startIdx = packages.length + 1;
      const images = [
        'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=300'
      ];
      const titles = [
        'Executive Cardiac Screen', 'Senior Citizen Care Male', 'Senior Citizen Care Female',
        'Kidney Function Wellness', 'Liver Health Evaluation', 'Advanced Allergy Screening',
        'Hormonal Balance Profile', 'Vitamin & Calcium Duo'
      ];

      for (let i = 0; i < 4; i++) {
        const idNum = startIdx + i;
        const title = titles[idNum % titles.length];
        const basePrice = 699 + (idNum * 150) % 2000;
        const discount = (idNum * 7) % 50 + 10;
        const price = Math.round(basePrice * (1 - discount / 100));
        
        nextBatch.push({
          id: `l_gen_${idNum}`,
          name: title,
          provider: idNum % 2 === 0 ? 'Max Labs' : 'Thyrocare Services',
          price,
          originalPrice: basePrice,
          parameters: 12 + (idNum * 5) % 40,
          discount,
          reportHours: idNum % 2 === 0 ? 12 : 24,
          sampleType: idNum % 3 === 0 ? 'Blood & Urine' : 'Blood',
          description: `Comprehensive diagnostic profile evaluating ${title.toLowerCase()} factors with certified NABL reporting.`,
          image: images[idNum % images.length]
        });
      }
      
      setPackages(prev => [...prev, ...nextBatch]);
      setIsLoadingMore(false);
    }, 800);
  };

  // Today + 1 day default date setter
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSchedule(prev => ({
      ...prev,
      date: tomorrow.toISOString().split('T')[0]
    }));
  }, []);

  const handleTogglePackage = (id: string) => {
    setSelectedPackages(prev => {
      const exists = prev.includes(id);
      if (exists) {
        showToast(t('Package Removed'));
        return prev.filter(pId => pId !== id);
      } else {
        showToast(t('Package Selected'));
        return [...prev, id];
      }
    });
  };

  const handleRemovePackage = (id: string) => {
    setSelectedPackages(prev => prev.filter(pId => pId !== id));
    showToast(t('Package Removed'));
  };

  const cartTotal = selectedPackages.reduce((sum, id) => {
    const pkg = packages.find(p => p.id === id);
    return sum + (pkg ? pkg.price : 0);
  }, 0);

  const gstAmount = Math.round(cartTotal * 0.05); // 5% GST on lab test healthcare
  const totalAmount = cartTotal + gstAmount;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingStep === 'schedule') {
      setBookingStep('patient');
    } else if (bookingStep === 'patient') {
      // Complete booking log security event & link invoice record in Health Locker
      const reportName = `Pending Lab PDF - ${packages.find(p => p.id === selectedPackages[0])?.name || 'Active Panel'}.pdf`;
      addRecord({
        name: reportName,
        type: 'Lab Invoice',
        date: new Date(schedule.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        source: packages.find(p => p.id === selectedPackages[0])?.provider || 'Secure NABL Partner Lab'
      });

      logSecurityEvent('Diagnostics Booked', `Scheduled phlebotomy panel of ₹${totalAmount} on ${schedule.date} at slot ${schedule.timeSlot}`);
      
      // Clear Selected Packages & trigger success state
      setSelectedPackages([]);
      setBookingStep('success');
      showToast(t('Lab Test Booked Successfully!'));
    }
  };

  return (
    <>
      {/* Route Hero Header */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/more'); }} className="back-link">
          <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
          {t('More Services')}
        </a>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p className="eyebrow">DIAGNOSTICS & PATHOLOGY</p>
            <h2>{t('NABL Lab Test Booking')}</h2>
            <p>{t('Schedule home sample extractions from certified diagnostic labs. Sync PDF test reports inside ABDM locker.')}</p>
          </div>

          {selectedPackages.length > 0 && (
            <button
              onClick={() => {
                setBookingStep('cart');
                setIsBookingDrawerOpen(true);
              }}
              style={{
                background: 'var(--accent-teal)',
                color: '#fff',
                border: 'none',
                borderRadius: '30px',
                padding: '10px 20px',
                fontSize: '11.5px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px color-mix(in srgb, var(--accent-teal) 30%, transparent)',
                cursor: 'pointer'
              }}
            >
              <FlaskConical style={{ width: '15px', height: '15px' }} />
              <span>{selectedPackages.length} {t('Selected')}</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '10px', fontSize: '9.5px' }}>₹{totalAmount}</span>
            </button>
          )}
        </div>
      </section>

      {/* Lab Packages Roster */}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '10px 0 0' }}>
          Certified Diagnostic Packages & Profiles
        </h3>

        <div className="flipkart-grid">
          {packages.map(pkg => {
            const isSelected = selectedPackages.includes(pkg.id);
            return (
              <article
                key={pkg.id}
                className={`route-card ${isSelected ? 'selected-card' : ''}`}
                style={{
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  justifyContent: 'space-between',
                  border: isSelected ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-color)',
                  transition: 'all 0.2s',
                  height: '100%'
                }}
              >
                
                {/* Details side (with image) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="lab-image-container" style={{ width: '100%', height: '120px', borderRadius: '10px', overflow: 'hidden', background: 'var(--bg-secondary)', position: 'relative' }}>
                    <img src={pkg.image} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {pkg.discount > 0 && (
                      <span style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10, background: 'var(--danger)', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
                        {pkg.discount}% OFF
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', background: 'color-mix(in srgb, var(--accent-teal) 12%, transparent)', color: 'var(--accent-teal)', padding: '2px 6px', borderRadius: '4px' }}>
                        {pkg.parameters} Params
                      </span>
                      <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
                        {pkg.sampleType}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '13px', margin: '4px 0 0', fontWeight: 750, color: 'var(--text-primary)', lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '34px' }}>
                      {pkg.name}
                    </h4>
                    
                    <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>
                      Lab Partner: {pkg.provider}
                    </span>

                    <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.4, lineClamp: 3, WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '44px' }}>
                      {pkg.description}
                    </p>
                  </div>
                </div>

                {/* Pricing & Selection side */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <strong style={{ fontSize: '14.5px', color: 'var(--accent-teal)' }}>₹{pkg.price}</strong>
                      {pkg.discount > 0 && (
                        <span style={{ fontSize: '10px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{pkg.originalPrice}</span>
                      )}
                    </div>
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)', display: 'block' }}>Report in {pkg.reportHours}h</span>
                  </div>

                  <button
                    onClick={() => handleTogglePackage(pkg.id)}
                    className={isSelected ? "btn-solid-accent" : "btn-outline-accent"}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '30px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                  >
                    {isSelected ? t('SELECTED') : t('BOOK')}
                  </button>
                </div>

              </article>
            );
          })}
        </div>

        {/* Infinite Scroll Loader indicator */}
        {isLoadingMore && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0', gap: '8px', color: 'var(--accent-teal)' }}>
            <div className="spinner" style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent-teal)', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Loading more packages...</span>
          </div>
        )}

      </div>

      {/* ============================================================= */}
      {/* ==================== BOOKING DRAWER / OVERLAY ================= */}
      {/* ============================================================= */}
      {isBookingDrawerOpen && (
        <div className="modal-overlay" onClick={() => setIsBookingDrawerOpen(false)} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'stretch' }}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '440px', 
              width: '100%', 
              height: '100vh', 
              margin: 0, 
              borderRadius: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
              background: 'var(--bg-card)'
            }}
          >
            
            {/* Header */}
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14.5px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FlaskConical style={{ width: '16px', height: '16px', color: 'var(--accent-teal)' }} />
                Pathology Appointment Cart
              </span>
              <button className="modal-close" onClick={() => setIsBookingDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Steps Tab Indicators */}
            {bookingStep !== 'success' && (
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderBottom: bookingStep === 'cart' ? '2.5px solid var(--accent-teal)' : 'none', color: bookingStep === 'cart' ? 'var(--accent-teal)' : 'inherit' }}>1. TICKET LIST</div>
                <div style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderBottom: bookingStep === 'schedule' ? '2.5px solid var(--accent-teal)' : 'none', color: bookingStep === 'schedule' ? 'var(--accent-teal)' : 'inherit' }}>2. TIMELINE</div>
                <div style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderBottom: bookingStep === 'patient' ? '2.5px solid var(--accent-teal)' : 'none', color: bookingStep === 'patient' ? 'var(--accent-teal)' : 'inherit' }}>3. PATIENT RX</div>
              </div>
            )}

            {/* Scrollable Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              
              {/* STEP 1: CART OVERVIEW */}
              {bookingStep === 'cart' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {selectedPackages.map(id => {
                    const pkg = packages.find(p => p.id === id);
                    if (!pkg) return null;
                    return (
                      <div key={id} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <h5 style={{ fontSize: '12px', margin: 0, fontWeight: 750, color: 'var(--text-primary)' }}>{pkg.name}</h5>
                          <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>{pkg.provider}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '13.5px', color: 'var(--accent-teal)' }}>₹{pkg.price}</strong>
                          <button onClick={() => handleRemovePackage(pkg.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <Trash2 style={{ width: '13px', height: '13px' }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {selectedPackages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      No pathology profiles selected. Close drawer and select from catalog.
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '10px', borderRadius: '8px', fontSize: '10px', color: 'var(--accent-teal)', marginTop: '8px' }}>
                    <Info style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                    <span>Certified phlebotomist will arrive equipped with temperature-sealed vaccine carrier storage boxes to protect sample integrity.</span>
                  </div>
                </div>
              )}

              {/* STEP 2: TIMELINE / DATE SLOT SELECTION */}
              {bookingStep === 'schedule' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Preferred Extraction Date
                    <input type="date" required value={schedule.date} onChange={(e) => setSchedule({ ...schedule, date: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>

                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Available Time Slots</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        'Morning (07:00 AM - 09:00 AM)',
                        'Late Morning (09:30 AM - 11:30 AM)',
                        'Afternoon (02:00 PM - 04:00 PM)'
                      ].map(slot => (
                        <label key={slot} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--bg-secondary)', border: schedule.timeSlot === slot ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontSize: '11.5px' }}>
                          <input type="radio" checked={schedule.timeSlot === slot} onChange={() => setSchedule({ ...schedule, timeSlot: slot })} />
                          <span>{slot}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PATIENT REGISTRY DEMOGRAPHICS */}
              {bookingStep === 'patient' && (
                <form id="patient-form" onSubmit={handleBookingSubmit} style={{ display: 'grid', gap: '12px' }}>
                  
                  <div style={{ background: 'rgba(0,212,170,0.06)', padding: '12px', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <UserCheck style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                    <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>Demo populated from linked ABHA digital profile card successfully.</span>
                  </div>

                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Patient Full Name
                    <input type="text" required value={patient.name} onChange={(e) => setPatient({ ...patient, name: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Age
                      <input type="number" required value={patient.age} onChange={(e) => setPatient({ ...patient, age: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </label>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Gender
                      <select value={patient.gender} onChange={(e) => setPatient({ ...patient, gender: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                  </div>

                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    ABHA ID (Linked Account)
                    <input type="text" readOnly value={patient.abhaId} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontFamily: 'monospace' }} />
                  </label>

                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Extraction Location Address
                    <input type="text" required value={patient.address} onChange={(e) => setPatient({ ...patient, address: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </form>
              )}

              {/* STEP 4: SUCCESS LAYOUT */}
              {bookingStep === 'success' && (
                <div style={{ textAlign: 'center', padding: '35px 10px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'color-mix(in srgb, var(--accent-teal) 15%, transparent)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle style={{ width: '28px', height: '28px' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', margin: '0 0 6px' }}>Booking Confirmed!</h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 20px' }}>
                    Your phlebotomist queue ticket has been issued. A temporary laboratory invoice PDF was linked inside your Health Locker.
                  </p>

                  <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', marginBottom: '20px' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>PATIENT MEMBER</span>
                    <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{patient.name} ({patient.age} / {patient.gender})</strong>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '6px 0' }} />
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>EXTRACTION SCHEDULE</span>
                    <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{schedule.date}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--accent-teal)', fontWeight: 'bold' }}>{schedule.timeSlot}</span>
                  </div>

                  <button
                    onClick={() => {
                      setBookingStep('cart');
                      setIsBookingDrawerOpen(false);
                    }}
                    style={{ width: '100%', padding: '10px', background: 'var(--accent-teal)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Back to Diagnostics
                  </button>
                </div>
              )}

            </div>

            {/* Billing Summary Drawer Footer */}
            {bookingStep !== 'success' && selectedPackages.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '20px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Diagnostics Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Health Cess GST (5%)</span>
                    <span>₹{gstAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Home Sample Pick-up</span>
                    <span style={{ color: 'var(--accent-teal)', fontWeight: 'bold' }}>FREE</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '13.5px' }}>
                    <span>Total Cost</span>
                    <span style={{ color: 'var(--accent-teal)' }}>₹{totalAmount}</span>
                  </div>
                </div>

                {bookingStep === 'cart' && (
                  <button
                    onClick={() => setBookingStep('schedule')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--accent-teal)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>Schedule Date & Time Slot</span>
                    <ChevronRight style={{ width: '14px', height: '14px' }} />
                  </button>
                )}

                {bookingStep === 'schedule' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setBookingStep('cart')} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Back
                    </button>
                    <button onClick={() => setBookingStep('patient')} style={{ flex: 2, padding: '12px', background: 'var(--accent-teal)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                      <span>Patient Details</span>
                      <ChevronRight style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                )}

                {bookingStep === 'patient' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setBookingStep('schedule')} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Back
                    </button>
                    <button type="submit" form="patient-form" style={{ flex: 2, padding: '12px', background: 'var(--accent-teal)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Confirm & Schedule Appointment
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
