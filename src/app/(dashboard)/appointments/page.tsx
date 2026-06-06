'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import { 
  Calendar, ArrowLeft, Clock, History, X, ShieldCheck, HeartPulse, 
  CheckCircle, Loader2, Stethoscope, ChevronRight, MapPin, CreditCard, 
  Ticket, Video, Send, FileText, Award, Star, ArrowRight, Sparkles, User, Info, Home, Smartphone, Check
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

interface SpecialtiesMatrixItem {
  medicalSystem: string;
  category: string;
  specialistRole: string;
}

interface Doctor {
  id: number;
  name: string;
  medicalSystem: string;
  speciality: string;
  specialistRole: string;
  degree: string;
  experience: string;
  fee: string | number;
  rating: string | number;
  description: string;
  photo: string;
  hospitalName: string;
  hfrId: string;
  certificateId: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { appointments, addAppointment, logSecurityEvent, currentUser } = useAuth();

  // Booking Flow Steps in order:
  // 'landing' -> 'system' -> 'speciality' -> 'doctor' -> 'hospital' -> 'slot' -> 'payment' -> 'token' -> 'abha' -> 'consultation'
  const [bookingStep, setBookingStep] = useState<'landing' | 'system' | 'speciality' | 'doctor' | 'hospital' | 'slot' | 'payment' | 'token' | 'abha' | 'consultation'>('landing');
  const [highestStepReached, setHighestStepReached] = useState<number>(1);

  // Loaded database registries
  const [specialtiesMatrix, setSpecialtiesMatrix] = useState<SpecialtiesMatrixItem[]>([]);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(true);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Flow Selections
  const [selectedSystem, setSelectedSystem] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // Slot & Symtoms State
  const [selectedDate, setSelectedDate] = useState<string>('Today');
  const [selectedTime, setSelectedTime] = useState<string>('06:00 PM');
  const [symptoms, setSymptoms] = useState<string>('');
  const [consultMode, setConsultMode] = useState<string>('Video Call');
  
  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<string>('upi');

  // ABHA Linking States
  const [abhaAddress, setAbhaAddress] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [isLinking, setIsLinking] = useState<boolean>(false);
  const [linkingLogs, setLinkingLogs] = useState<string[]>([]);
  const [linkingTxnId, setLinkingTxnId] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [linkOtp, setLinkOtp] = useState<string>('');
  const [linkingSuccess, setLinkingSuccess] = useState<boolean>(false);
  const [linkedReference, setLinkedReference] = useState<string>('');

  // Booking confirmations
  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [tokenHistory, setTokenHistory] = useState([
    { doctorName: "Dr. Ayesha Ali", facilityName: "Dr. Ayesha Homeo Health Mall", tokenNum: "SETU-TKN-408", date: "Today", time: "06:00 PM", status: "Active" },
    { doctorName: "Dr. Yogyata Mukhraiya", facilityName: "Dr. Ayesha Homeo Health Mall", tokenNum: "SETU-TKN-912", date: "Yesterday", time: "10:30 AM", status: "Completed" }
  ]);

  // Video Consultation Simulator states
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatLogs, setChatLogs] = useState<{ sender: 'patient' | 'doctor'; text: string; time: string }[]>([
    { sender: 'doctor', text: 'Hello! I am reviewing your symptoms. Please feel free to describe them in detail.', time: 'Just now' }
  ]);
  const [showPrescription, setShowPrescription] = useState<boolean>(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Doctor[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Direct Doctor Search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/abdm/doctor-consultation/doctors?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.status === 'success') {
          setSearchResults(data.doctors);
        }
      } catch (err) {
        console.error('Failed to search doctors:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-fill defaults from currentUser if present
  useEffect(() => {
    if (currentUser) {
      setPatientName(currentUser.name || '');
      setAbhaAddress(currentUser.abhaId || 'ayesha.ali.9981057765@abdm');
    } else {
      setPatientName('Dr. Ayesha Ali');
      setAbhaAddress('ayesha.ali.9981057765@abdm');
    }
  }, [currentUser]);

  // Fetch Specialties from database
  useEffect(() => {
    async function loadSpecialties() {
      setIsLoadingSpecialties(true);
      try {
        const res = await fetch('/api/abdm/doctor-consultation/specialties');
        const data = await res.json();
        if (data.status === 'success') {
          setSpecialtiesMatrix(data.specialties);
        }
      } catch (err) {
        console.error('Failed to load specialties:', err);
        showToast(t('Error loading medical categories from server.'));
      } finally {
        setIsLoadingSpecialties(false);
      }
    }
    loadSpecialties();
  }, []);

  // Fetch Doctors dynamically depending on selections
  useEffect(() => {
    async function loadDoctors() {
      if (!selectedSystem) return;
      setIsLoadingDoctors(true);
      try {
        let url = `/api/abdm/doctor-consultation/doctors?medicalSystem=${encodeURIComponent(selectedSystem)}`;
        if (selectedCategory) url += `&speciality=${encodeURIComponent(selectedCategory)}`;
        if (selectedRole) url += `&specialistRole=${encodeURIComponent(selectedRole)}`;
        
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'success') {
          setDoctorsList(data.doctors);
        }
      } catch (err) {
        console.error('Failed to load doctors:', err);
      } finally {
        setIsLoadingDoctors(false);
      }
    }
    loadDoctors();
  }, [selectedSystem, selectedCategory, selectedRole]);

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [linkingLogs]);

  // Steps indexing mapping
  const stepOrder = ['home', 'landing', 'system', 'speciality', 'doctor', 'hospital', 'slot', 'payment', 'token', 'abha', 'consultation'];

  const getStepIndex = (stepId: string) => {
    return stepOrder.indexOf(stepId);
  };

  const currentStepIndex = getStepIndex(bookingStep);

  const transitionToStep = (step: typeof bookingStep) => {
    setBookingStep(step);
    const stepIdx = getStepIndex(step);
    if (stepIdx > highestStepReached) {
      setHighestStepReached(stepIdx);
    }
  };

  const handleStepClick = (stepId: string) => {
    if (stepId === 'home') {
      router.push('/');
      return;
    }
    const targetIdx = getStepIndex(stepId);
    if (targetIdx <= highestStepReached) {
      setBookingStep(stepId as any);
    } else {
      showToast(t('Please complete preceding steps to unlock.'));
    }
  };

  // Medical System metadata icons and descriptors
  const medicalSystems = [
    { id: 'Allopathy', name: '🏥 Allopathy', desc: 'Modern scientific medicine, clinical drug remedies, and surgery.' },
    { id: 'Dental Care', name: '🦷 Dental Care', desc: 'Comprehensive oral healthcare, orthodontics, and implants.' },
    { id: 'Dentist', name: '🦷 Dentist', desc: 'Oral health specialists, general and cosmetic dentistry.' },
    { id: 'Homeopathy', name: '🌿 Homeopathy', desc: 'Holistic therapeutics mapping individualized chronic remedies.' },
    { id: 'Ayurveda', name: '🌱 Ayurveda', desc: 'Traditional Indian systems focusing on dosha balance and therapies.' },
    { id: 'Unani', name: '☪️ Unani', desc: 'Traditional Perso-Arabic therapies matching four bodily humors.' },
    { id: 'Physiotherapy', name: '🦵 Physiotherapy', desc: 'Physical therapy, skeletal rehabilitation, and sports injuries.' },
    { id: 'Mental Health & Psychology', name: '🧠 Mental Health & Psychology', desc: 'Behavioral consulting, psychiatric diagnostics, and counseling.' }
  ];

  // Helper arrays for slot picking
  const dates = ['Today', 'Tomorrow', 'Day After'];
  const times = ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM', '07:30 PM'];

  // Safe Fee calculation
  const getDoctorFee = () => {
    if (!selectedDoctor) return 0;
    if (typeof selectedDoctor.fee === 'number') return selectedDoctor.fee;
    return parseInt(String(selectedDoctor.fee).replace(/[^0-9]/g, '')) || 0;
  };

  // Payment Confirmation
  const handlePaymentCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    const tokenNum = `SETU-TKN-${Math.floor(100 + Math.random() * 900)}`;
    setGeneratedToken(tokenNum);

    logSecurityEvent("OPD Payment Settled", `Payment settled for ${selectedDoctor.name}. Total: Rs ${getDoctorFee() + 99} via ${paymentMethod.toUpperCase()}`);
    transitionToStep('token');
  };

  // ABDM Care Context Discovery
  const handleVerifyAndDiscover = async () => {
    if (!abhaAddress.includes('@')) {
      showToast(t('Please enter a valid ABHA Address (e.g. user@abdm)'));
      return;
    }
    setIsLinking(true);
    setLinkingLogs(['[ABDM-GATEWAY] Establishing secure connection...']);
    
    try {
      await new Promise(r => setTimeout(r, 600));
      setLinkingLogs(prev => [...prev, `[ABDM-GATEWAY] Resolving HPR practitioner mapping for Doctor: ${selectedDoctor?.name}...`]);
      await new Promise(r => setTimeout(r, 600));
      setLinkingLogs(prev => [...prev, `[ABDM-GATEWAY] Initiating discovery check for ABHA: ${abhaAddress}...`]);

      const res = await fetch('/api/abdm/hip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'discover-link',
          abhaAddress,
          patientName,
          contextType: 'OPConsultation',
          detail: symptoms || 'General Consultation'
        })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setLinkingTxnId(data.txnId);
        setLinkingLogs(prev => [
          ...prev,
          `[ABDM-GATEWAY] Discovery Response: Patient matched in hospital EMR node.`,
          `[ABDM-GATEWAY] Found active record: ${data.matchedPatient.referenceNumber}`,
          `[ABDM-GATEWAY] Context: ${data.matchedPatient.careContexts[0].display}`,
          `[ABDM-GATEWAY] Gateway Transaction ID issued: ${data.txnId}`,
          `[ABDM-GATEWAY] Prompting OTP verification. Standard OTP is 123456.`
        ]);
        setOtpSent(true);
        showToast(t('Verification OTP sent.'));
      } else {
        setLinkingLogs(prev => [...prev, `[ERROR] Discovery failed: ${data.message}`]);
        showToast(data.message || t('Discovery check failed.'));
      }
    } catch (err) {
      console.error(err);
      setLinkingLogs(prev => [...prev, `[ERROR] Gateway connection timed out.`]);
    } finally {
      setIsLinking(false);
    }
  };

  // ABDM Care Context Confirmation
  const handleConfirmLink = async () => {
    if (!linkOtp) {
      showToast(t('Please enter verification OTP.'));
      return;
    }
    setIsLinking(true);
    setLinkingLogs(prev => [...prev, `[ABDM-GATEWAY] Submitting OTP verification for confirmation...`]);

    try {
      await new Promise(r => setTimeout(r, 800));
      const res = await fetch('/api/abdm/hip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm-link',
          otp: linkOtp,
          txnId: linkingTxnId
        })
      });
      const data = await res.json();

      if (data.status === 'success') {
        setLinkedReference(data.referenceNumber);
        setLinkingLogs(prev => [
          ...prev,
          `[ABDM-GATEWAY] Verification Successful! OTP confirmed.`,
          `[ABDM-GATEWAY] Link Reference Generated: ${data.referenceNumber}`,
          `[ABDM-GATEWAY] Care Context successfully registered on ABDM Gateway.`,
          `[ABDM-GATEWAY] Health locker data exchange unlocked. Status: SECURED.`
        ]);
        setLinkingSuccess(true);
        logSecurityEvent("ABHA Care Context Linked", `Care context linked successfully for ABHA: ${abhaAddress} with Ref: ${data.referenceNumber}`);
        showToast(t('ABHA Linked successfully!'));

        // Save appointment to context
        if (selectedDoctor) {
          addAppointment({
            title: `${consultMode} - ${symptoms || 'General Checkup'}`,
            doctor: selectedDoctor.name,
            meta: `${selectedDate}, ${selectedTime}`,
            status: "Confirmed",
            token: generatedToken
          });

          // Add to local history log
          setTokenHistory(prev => [
            {
              doctorName: selectedDoctor.name,
              facilityName: selectedDoctor.hospitalName,
              tokenNum: generatedToken,
              date: selectedDate,
              time: selectedTime,
              status: "Active"
            },
            ...prev
          ]);
        }

      } else {
        setLinkingLogs(prev => [...prev, `[ERROR] Link confirmation failed: ${data.message}`]);
        showToast(data.message || t('Invalid OTP. Please use 123456.'));
      }
    } catch (err) {
      console.error(err);
      setLinkingLogs(prev => [...prev, `[ERROR] Link confirmation connection timeout.`]);
    } finally {
      setIsLinking(false);
    }
  };

  // Video chat response simulation
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedDoctor) return;

    const currentMsg = chatMessage;
    setChatLogs(prev => [...prev, { sender: 'patient', text: currentMsg, time: 'Just now' }]);
    setChatMessage('');

    setTimeout(() => {
      let docResponse = "I have noted that down. Let me draft a verified prescription bundle for you under your ABHA profile.";
      if (currentMsg.toLowerCase().includes('fever') || currentMsg.toLowerCase().includes('headache') || currentMsg.toLowerCase().includes('cough')) {
        docResponse = "Fever and fatigue require proper clinical attention. I am prescribing a standard dosage plan. Please view your linked prescription below.";
      }
      setChatLogs(prev => [...prev, { sender: 'doctor', text: docResponse, time: 'Just now' }]);
    }, 1500);
  };

  return (
    <>
      {/* Route Hero Section */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }} className="back-link">
          <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
          {t('Home')}
        </a>
        <div>
          <p className="eyebrow">ABHA SETU TELEHEALTH</p>
          <h2>{t('Interoperable Doctor Consultations')}</h2>
          <p>{t('Redesigned booking workflow linking care contexts and clinic registry tokens under NHA specs.')}</p>
        </div>
      </section>

      {/* 11-Step Interactive Stepper Tracker */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        marginTop: '16px',
        marginBottom: '20px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }} className="no-scrollbar">
        {[
          { id: 'home', label: 'Home', icon: <Home style={{ width: '12px', height: '12px' }} /> },
          { id: 'landing', label: 'Consultation', icon: <Stethoscope style={{ width: '12px', height: '12px' }} /> },
          { id: 'system', label: 'System', icon: <HeartPulse style={{ width: '12px', height: '12px' }} /> },
          { id: 'speciality', label: 'Speciality', icon: <Award style={{ width: '12px', height: '12px' }} /> },
          { id: 'doctor', label: 'Doctor', icon: <User style={{ width: '12px', height: '12px' }} /> },
          { id: 'hospital', label: 'Facility', icon: <MapPin style={{ width: '12px', height: '12px' }} /> },
          { id: 'slot', label: 'Schedule', icon: <Calendar style={{ width: '12px', height: '12px' }} /> },
          { id: 'payment', label: 'Payment', icon: <CreditCard style={{ width: '12px', height: '12px' }} /> },
          { id: 'token', label: 'OPD Token', icon: <Ticket style={{ width: '12px', height: '12px' }} /> },
          { id: 'abha', label: 'ABHA Link', icon: <ShieldCheck style={{ width: '12px', height: '12px' }} /> },
          { id: 'consultation', label: 'Meet', icon: <Video style={{ width: '12px', height: '12px' }} /> }
        ].map((step, idx) => {
          const stepIdx = getStepIndex(step.id);
          const isActive = bookingStep === step.id;
          const isCompleted = stepIdx < currentStepIndex && step.id !== 'home';
          const isUnlocked = stepIdx <= highestStepReached || step.id === 'home';
          
          return (
            <React.Fragment key={step.id}>
              {idx > 0 && (
                <ChevronRight style={{ width: '12px', height: '12px', color: 'var(--text-muted)', flexShrink: 0 }} />
              )}
              <button
                onClick={() => handleStepClick(step.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: isActive ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)',
                  background: isActive 
                    ? 'color-mix(in srgb, var(--accent-teal) 15%, transparent)' 
                    : isCompleted 
                      ? 'color-mix(in srgb, var(--success) 8%, transparent)'
                      : 'var(--bg-card)',
                  color: isActive 
                    ? 'var(--accent-teal)' 
                    : isCompleted
                      ? 'var(--success)'
                      : isUnlocked 
                        ? 'var(--text-primary)' 
                        : 'var(--text-muted)',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  fontSize: '11px',
                  fontWeight: isActive ? '700' : '500',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 10px rgba(0, 212, 170, 0.2)' : 'none'
                }}
                disabled={!isUnlocked}
              >
                {isCompleted ? <Check style={{ width: '11px', height: '11px' }} /> : step.icon}
                <span>{t(step.label)}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ marginTop: '16px' }}>

        {/* ================= STEP 1: DOCTOR CONSULTATION LANDING (landing) ================= */}
        {bookingStep === 'landing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Call To Action Banner */}
            <article className="route-card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1, color: 'var(--accent-teal)' }}>
                <Stethoscope style={{ width: '120px', height: '120px' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '640px' }}>
                <span style={{ fontSize: '10px', background: 'color-mix(in srgb, var(--accent-teal) 15%, transparent)', color: 'var(--accent-teal)', padding: '4px 8px', borderRadius: '4px', alignSelf: 'flex-start', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Unified Health Interface (UHI)
                </span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Schedule a Verified Consultation</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
                  Consult with registered doctors across Allopathy, Homeopathy, Ayurveda, and more. Generate ABDM interoperable tokens, pay securely via Beckn checkout nodes, and link health records instantly to your ABHA profile.
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => transitionToStep('system')}
                    className="primary-action"
                    style={{ minHeight: 'auto', height: '38px', padding: '0 20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {t('Start Booking Wizard')} <ChevronRight style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button
                    onClick={() => router.push('/qr-scanner')}
                    className="prefill-btn"
                    style={{ minHeight: 'auto', height: '38px', padding: '0 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--border-color)' }}
                  >
                    {t('Scan QR for Spot Booking')}
                  </button>
                </div>
              </div>
            </article>

            {/* Direct Doctor Search Bar */}
            <article className="route-card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles style={{ width: '16px', height: '16px', color: 'var(--accent-teal)' }} />
                  {t('Direct Doctor Search')}
                </h4>
                <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('Search Doctors by Name or Speciality...')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '12.5px'
                    }}
                  />
                  {isSearching && (
                    <div style={{ position: 'absolute', right: '16px', top: '14px' }}>
                      <Loader2 className="animate-spin text-teal" style={{ width: '16px', height: '16px', color: 'var(--accent-teal)' }} />
                    </div>
                  )}
                </div>

                {/* Search Results Display */}
                {searchResults.length > 0 && (
                  <div style={{
                    marginTop: '10px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '10px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-color)',
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'var(--bg-secondary)'
                  }}>
                    {searchResults.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setSelectedSystem(doc.medicalSystem);
                          setSelectedCategory(doc.speciality);
                          setSelectedRole(doc.specialistRole);
                          setSearchQuery('');
                          setSearchResults([]);
                          const slotIdx = getStepIndex('slot');
                          setHighestStepReached(prev => Math.max(prev, slotIdx));
                          setBookingStep('slot');
                        }}
                        style={{
                          padding: '12px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        className="hover-scale"
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1.5px solid var(--accent-teal)', overflow: 'hidden', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          {doc.photo ? (
                            <img src={doc.photo} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <User style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                          <div style={{ fontSize: '10px', color: 'var(--accent-teal)' }}>{t(doc.specialistRole)} ({t(doc.medicalSystem)})</div>
                          <div style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'flex', gap: '6px', marginTop: '2px' }}>
                            <span>{t('Fee:')} {doc.fee}</span>
                            <span>• {t('Rating:')} {doc.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchQuery.trim() !== '' && !isSearching && searchResults.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {t('No doctors found matching search.')}
                  </div>
                )}
              </div>
            </article>

            {/* Two Column details: Active queue and historical entries */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              
              {/* Active list */}
              <section className="route-card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Calendar style={{ color: 'var(--accent-teal)', width: '18px', height: '18px' }} />
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{t('Active Consultations')}</h4>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {appointments.map((item, idx) => (
                    <article key={idx} style={{ padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '12.5px', fontWeight: '700' }}>{t(item.title)}</h5>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('Doctor')}: {item.doctor}</span>
                        <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', marginTop: '4px', fontFamily: 'monospace' }}>
                          {item.meta} {item.token && <>| {t('OPD Token')}: {item.token}</>}
                        </div>
                      </div>
                      <span style={{ background: 'color-mix(in srgb, var(--accent-teal) 12%, transparent)', color: 'var(--accent-teal)', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>
                        {t(item.status)}
                      </span>
                    </article>
                  ))}
                  {appointments.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px' }}>{t('No active scheduled appointments.')}</div>
                  )}
                </div>
              </section>

              {/* Tokens Table */}
              <section className="route-card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <History style={{ color: 'var(--accent-cyan)', width: '18px', height: '18px' }} />
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{t('OPD Token History')}</h4>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tokenHistory.map((hist, idx) => (
                    <div key={idx} style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between', fontSize: '11px', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{hist.doctorName}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>{t(hist.facilityName)}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '9px', marginTop: '2px' }}>{hist.date} {hist.time}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontFamily: 'monospace', color: 'var(--accent-teal)', fontWeight: 'bold' }}>{hist.tokenNum}</span>
                        <span style={{ fontSize: '9px', color: hist.status === 'Active' ? 'var(--success)' : 'var(--text-muted)' }}>
                          {hist.status === 'Active' ? `● ${t('Active')}` : `● ${t('Completed')}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

          </div>
        )}

        {/* ================= STEP 2: SELECT MEDICAL SYSTEM (system) ================= */}
        {bookingStep === 'system' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'color-mix(in srgb, var(--accent-teal) 5%, transparent)', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>{t('Step 1: Select Medical System')}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>{t('Select the clinical standard or traditional medicine approach for your consultation.')}</p>
            </div>

            {isLoadingSpecialties ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader2 className="animate-spin text-teal" style={{ color: 'var(--accent-teal)' }} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {medicalSystems.map((sys) => (
                  <article 
                    key={sys.id} 
                    className="route-card" 
                    onClick={() => {
                      setSelectedSystem(sys.id);
                      setSelectedCategory('');
                      setSelectedRole('');
                      transitionToStep('speciality');
                    }}
                    style={{ padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', transition: 'all 0.2s ease' }}
                  >
                    <h4 style={{ margin: 0, fontSize: '14.5px', color: 'var(--accent-teal)', fontWeight: '700' }}>{t(sys.name)}</h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.5' }}>{t(sys.desc)}</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                        {t('Explore specialties')} <ChevronRight style={{ width: '12px', height: '12px' }} />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 3: SPECIALITY & ROLE (speciality) ================= */}
        {bookingStep === 'speciality' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className="prefill-btn" 
                onClick={() => setBookingStep('system')}
                style={{ minHeight: 'auto', padding: '6px 12px', height: '32px', fontSize: '11px' }}
              >
                <ArrowLeft style={{ width: '12px', height: '12px', marginRight: '4px' }} /> {t('Back')}
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('System:')} <strong>{t(selectedSystem)}</strong></span>
            </div>

            <div style={{ background: 'color-mix(in srgb, var(--accent-teal) 5%, transparent)', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>{t('Step 2: Select Specialty / Organ System')}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>{t('Choose the specific health category or clinical specialty fields.')}</p>
            </div>

            {/* Grid of organ categories */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {Array.from(new Set(specialtiesMatrix.filter(s => s.medicalSystem === selectedSystem || (selectedSystem === 'Dentist' && s.medicalSystem === 'Dental Care')).map(s => s.category))).map((cat) => (
                <div key={cat} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '13.5px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', fontWeight: '700' }}>{t(cat)}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {specialtiesMatrix
                      .filter(s => (s.medicalSystem === selectedSystem || (selectedSystem === 'Dentist' && s.medicalSystem === 'Dental Care')) && s.category === cat)
                      .map((roleItem) => (
                        <button
                          key={roleItem.specialistRole}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setSelectedRole(roleItem.specialistRole);
                            transitionToStep('doctor');
                          }}
                          className="prefill-btn"
                          style={{ width: '100%', minHeight: 'auto', padding: '8px 12px', fontSize: '11.5px', textAlign: 'left', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                          <span>{t(roleItem.specialistRole)}</span>
                          <ChevronRight style={{ width: '12px', height: '12px', color: 'var(--text-muted)' }} />
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 4: PRACTITIONER DIRECTORY (doctor) ================= */}
        {bookingStep === 'doctor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                className="prefill-btn" 
                onClick={() => setBookingStep('speciality')}
                style={{ minHeight: 'auto', padding: '6px 12px', height: '32px', fontSize: '11px' }}
              >
                <ArrowLeft style={{ width: '12px', height: '12px', marginRight: '4px' }} /> {t('Back')}
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('System:')} <strong style={{ color: 'var(--text-primary)' }}>{t(selectedSystem)}</strong></span>
              <span style={{ color: 'var(--border-color)' }}>|</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('Speciality:')} <strong style={{ color: 'var(--text-primary)' }}>{t(selectedCategory)} ({t(selectedRole)})</strong></span>
            </div>

            <div style={{ background: 'color-mix(in srgb, var(--accent-teal) 5%, transparent)', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>{t('Step 3: Choose Registered Practitioner')}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>{t('Verify practitioner HPR licenses and digital seals before scheduling.')}</p>
            </div>

            {isLoadingDoctors ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader2 className="animate-spin text-teal" style={{ color: 'var(--accent-teal)' }} />
              </div>
            ) : doctorsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
                <Info style={{ color: 'var(--text-muted)', marginBottom: '8px', margin: '0 auto' }} />
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>{t('No doctors currently available in the database for this role.')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {doctorsList.map((doc) => (
                  <article 
                    key={doc.id} 
                    className="route-card"
                    style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}
                  >
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid var(--accent-teal)', display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {doc.photo ? (
                        <img src={doc.photo} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <User style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>{doc.name}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{t(doc.degree)} - {t(doc.experience)}</span>
                        </div>
                        <span style={{ background: 'color-mix(in srgb, var(--accent-teal) 12%, transparent)', color: 'var(--accent-teal)', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                          {t('Verified Practitioner')}
                        </span>
                      </div>

                      <p style={{ margin: '4px 0 8px', color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.5' }}>{t(doc.description)}</p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '11px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                          <Star style={{ width: '12px', height: '12px', fill: 'var(--accent-teal)', color: 'var(--accent-teal)' }} /> {doc.rating}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>{t('Fee:')} <strong style={{ color: 'var(--text-primary)' }}>Rs {doc.fee}</strong></span>
                        <span style={{ color: 'var(--text-muted)' }}>{t('License ID:')} <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{doc.certificateId}</strong></span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedDoctor(doc);
                            transitionToStep('hospital');
                          }}
                          className="primary-action"
                          style={{ minHeight: 'auto', height: '34px', padding: '6px 16px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          {t('Select Professional')} <ArrowRight style={{ width: '12px', height: '12px' }} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 5: CLINIC / FACILITY (hospital) ================= */}
        {bookingStep === 'hospital' && selectedDoctor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className="prefill-btn" 
                onClick={() => setBookingStep('doctor')}
                style={{ minHeight: 'auto', padding: '6px 12px', height: '32px', fontSize: '11px' }}
              >
                <ArrowLeft style={{ width: '12px', height: '12px', marginRight: '4px' }} /> {t('Back')}
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('Doctor')}: <strong>{selectedDoctor.name}</strong></span>
            </div>

            <div style={{ background: 'color-mix(in srgb, var(--accent-teal) 5%, transparent)', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>{t('Step 4: Select Clinical Care Facility')}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>{t('Verify the hospital/clinic facility details registered on the HFR node.')}</p>
            </div>

            <div className="route-card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'color-mix(in srgb, var(--accent-teal) 15%, transparent)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center' }}>
                  <MapPin style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>{selectedDoctor.hospitalName}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('Facility HFR ID:')} {selectedDoctor.hfrId}</span>
                </div>
              </div>

              <p style={{ margin: '4px 0', color: 'var(--text-secondary)', fontSize: '12.5px', lineHeight: '1.6' }}>
                {t('This facility is fully verified under the NHA Health Facility Registry (HFR). Choosing this location allows ABHA fast-track OPD token generation and instant record linking.')}
              </p>

              <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '11.5px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                <span>{t('Timings:')} <strong>10:00 AM - 08:00 PM</strong></span>
                <span style={{ color: 'var(--border-color)' }}>|</span>
                <span>{t('Days:')} <strong>Mon - Sat</strong></span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  onClick={() => transitionToStep('slot')}
                  className="primary-action"
                  style={{ minHeight: 'auto', height: '36px', padding: '6px 18px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {t('Confirm Location')} <ChevronRight style={{ width: '12px', height: '12px' }} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 6: DATE & TIME SLOT (slot) ================= */}
        {bookingStep === 'slot' && selectedDoctor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className="prefill-btn" 
                onClick={() => setBookingStep('hospital')}
                style={{ minHeight: 'auto', padding: '6px 12px', height: '32px', fontSize: '11px' }}
              >
                <ArrowLeft style={{ width: '12px', height: '12px', marginRight: '4px' }} /> {t('Back')}
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('Clinic:')} <strong>{selectedDoctor.hospitalName}</strong></span>
            </div>

            <div style={{ background: 'color-mix(in srgb, var(--accent-teal) 5%, transparent)', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>{t('Step 5: Pick Slot & Outline Symptoms')}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>{t('Choose your time block and describe symptoms to initialize the care context.')}</p>
            </div>

            <div className="route-card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Date Picker */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>{t('Select Date')}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {dates.map(d => (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(d)}
                      className={`prefill-btn ${selectedDate === d ? 'selected-card' : ''}`}
                      style={{ flex: 1, minHeight: 'auto', padding: '10px', fontSize: '11.5px', background: selectedDate === d ? 'var(--bg-secondary)' : 'transparent', border: '1px solid var(--border-color)', color: selectedDate === d ? 'var(--accent-teal)' : 'var(--text-primary)' }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Picker */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>{t('Select Time Slot')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {times.map(tVal => (
                    <button
                      key={tVal}
                      onClick={() => setSelectedTime(tVal)}
                      className={`prefill-btn ${selectedTime === tVal ? 'selected-card' : ''}`}
                      style={{ minHeight: 'auto', padding: '8px', fontSize: '11px', background: selectedTime === tVal ? 'var(--bg-secondary)' : 'transparent', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: selectedTime === tVal ? 'var(--accent-teal)' : 'var(--text-primary)' }}
                    >
                      <Clock style={{ width: '10px', height: '10px' }} /> {tVal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consult Mode */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>{t('Preferred Consult Mode')}</label>
                <select 
                  value={consultMode} 
                  onChange={(e) => setConsultMode(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px' }}
                >
                  <option value="Video Call">{t('Video Consultation (Virtual Room)')}</option>
                  <option value="Audio Call">{t('Audio Call Consultation')}</option>
                  <option value="Clinic OPD Visit">{t('In-Clinic OPD Appointment')}</option>
                </select>
              </div>

              {/* Symptoms Form */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>{t('Describe Symptoms / Medical Concerns')}</label>
                <input
                  type="text"
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder={t('e.g. Coughing, body fatigue, mild fever since yesterday')}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  onClick={() => {
                    if (!symptoms.trim()) {
                      showToast(t('Please describe your active symptoms first.'));
                      return;
                    }
                    transitionToStep('payment');
                  }}
                  className="primary-action"
                  style={{ minHeight: 'auto', height: '36px', padding: '6px 18px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {t('Proceed to Checkout')} <ChevronRight style={{ width: '12px', height: '12px' }} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 7: SECURE PAYMENT CHECKOUT (payment) ================= */}
        {bookingStep === 'payment' && selectedDoctor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className="prefill-btn" 
                onClick={() => setBookingStep('slot')}
                style={{ minHeight: 'auto', padding: '6px 12px', height: '32px', fontSize: '11px' }}
              >
                <ArrowLeft style={{ width: '12px', height: '12px', marginRight: '4px' }} /> {t('Back')}
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('Schedule:')} <strong>{selectedDate} ({selectedTime})</strong></span>
            </div>

            <div style={{ background: 'color-mix(in srgb, var(--accent-teal) 5%, transparent)', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>{t('Step 6: Secure Consultation Checkout')}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>{t('Verify checkout billing breakup and select simulated payment gateway.')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'start' }}>
              
              {/* Billing Summary */}
              <div className="route-card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>{t('Billing Summary')}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>{selectedDoctor.name} {t('Consultation Fee')}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>Rs {getDoctorFee()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>{t('Convenience Fee (Health locker support)')}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>Rs 99</strong>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 'bold' }}>
                  <span>{t('Total Billable Amount')}</span>
                  <strong style={{ color: 'var(--accent-teal)' }}>Rs {getDoctorFee() + 99}</strong>
                </div>
                
                <div style={{ marginTop: '8px', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <ShieldCheck style={{ color: 'var(--accent-teal)', width: '16px', height: '16px', flexShrink: 0 }} />
                  <span>{t('Secure end-to-end NHA certified UHI checkout flow.')}</span>
                </div>
              </div>

              {/* Checkout Form */}
              <div className="route-card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>{t('Payment Settlement Method')}</h4>
                
                <form onSubmit={handlePaymentCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '12px' }}>
                      <input 
                        type="radio" 
                        name="payMethod" 
                        value="upi" 
                        checked={paymentMethod === 'upi'} 
                        onChange={() => setPaymentMethod('upi')} 
                      />
                      <span>{t('UPI (Instant Check-in Settlement)')}</span>
                    </label>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '12px' }}>
                      <input 
                        type="radio" 
                        name="payMethod" 
                        value="card" 
                        checked={paymentMethod === 'card'} 
                        onChange={() => setPaymentMethod('card')} 
                      />
                      <span>{t('Credit / Debit Card')}</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '12px' }}>
                      <input 
                        type="radio" 
                        name="payMethod" 
                        value="wallet" 
                        checked={paymentMethod === 'wallet'} 
                        onChange={() => setPaymentMethod('wallet')} 
                      />
                      <span>{t('ABHA Health Wallet Balance')}</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="primary-action"
                    style={{ width: '100%', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px' }}
                  >
                    <CreditCard style={{ width: '14px', height: '14px' }} /> {t('Pay & Issue OPD Token')}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {t('Secured by NHA gateway sandbox payment processor.')}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 8: OPD QUEUE TOKEN GENERATION (token) ================= */}
        {bookingStep === 'token' && selectedDoctor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'color-mix(in srgb, var(--accent-teal) 5%, transparent)', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>{t('Step 7: OPD Queue Token Slip Issued')}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>{t('Your queue number is generated. Now link this appointment under your ABHA address.')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'center' }}>
              
              {/* Premium Ticket Stub */}
              <div style={{
                background: 'var(--bg-card)',
                border: '2px dashed var(--accent-teal)',
                borderRadius: '16px',
                padding: '24px',
                position: 'relative',
                boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                maxWidth: '360px',
                margin: '0 auto',
                width: '100%'
              }}>
                {/* Header */}
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', color: 'var(--accent-teal)' }}>{t('NATIONAL HEALTH AUTHORITY')}</span>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>{t('OPD TICKET SLIP')}</h4>
                </div>

                {/* Queue Token */}
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('QUEUE CODE')}</span>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent-teal)', margin: '4px 0', fontFamily: 'monospace' }}>
                    {generatedToken}
                  </div>
                  <span style={{ fontSize: '10px', background: 'color-mix(in srgb, var(--success) 12%, transparent)', color: 'var(--success)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                    ✔ {t('PAID & VERIFIED')}
                  </span>
                </div>

                {/* Ticket Body details */}
                <div style={{ borderTop: '1px dotted var(--border-color)', padding: '12px 0', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('Practitioner:')}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedDoctor.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('Speciality:')}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{t(selectedRole)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('Facility:')}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedDoctor.hospitalName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('Schedule:')}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedDate}, {selectedTime}</strong>
                  </div>
                </div>

                {/* Barcode representation */}
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ height: '30px', width: '100%', background: 'repeating-linear-gradient(90deg, var(--text-primary), var(--text-primary) 2px, transparent 2px, transparent 6px, var(--text-primary) 6px, var(--text-primary) 7px, transparent 7px, transparent 10px)' }}></div>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>SECURE-ABDM-{generatedToken}</span>
                </div>
              </div>

              {/* Next step Card */}
              <div className="route-card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'color-mix(in srgb, var(--accent-teal) 12%, transparent)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
                  <ShieldCheck style={{ width: '22px', height: '22px' }} />
                </div>
                
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{t('Link Appointment to ABHA')}</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12.5px', lineHeight: '1.5' }}>
                  {t('To proceed to the consultation room, you must link this appointment with your Ayushman Bharat Health Account (ABHA) to securely transmit and retrieve EHR data.')}
                </p>

                <button
                  onClick={() => transitionToStep('abha')}
                  className="primary-action"
                  style={{ minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}
                >
                  {t('Link ABHA Profile & Continue')} <ArrowRight style={{ width: '14px', height: '14px' }} />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ================= STEP 9: ABHA LINKED APPOINTMENT (abha) ================= */}
        {bookingStep === 'abha' && selectedDoctor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'color-mix(in srgb, var(--accent-teal) 5%, transparent)', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>{t('Step 8: ABHA Registry Care Context Linking')}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>{t('Interlink appointment with the National Health Authority (NHA) ABDM Sandbox node.')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', alignItems: 'start' }}>
              
              {/* Form card */}
              <div className="route-card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>{t('Patient ABHA Context Details')}</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>{t('Patient Name')}</label>
                    <input 
                      type="text" 
                      value={patientName} 
                      onChange={(e) => setPatientName(e.target.value)} 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px' }}
                      disabled={linkingSuccess}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>{t('ABHA Address (Health ID)')}</label>
                    <input 
                      type="text" 
                      value={abhaAddress} 
                      onChange={(e) => setAbhaAddress(e.target.value)} 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px' }}
                      disabled={linkingSuccess}
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <button
                    onClick={handleVerifyAndDiscover}
                    className="primary-action"
                    style={{ width: '100%', minHeight: '38px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    disabled={isLinking}
                  >
                    {isLinking ? (
                      <>
                        <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} />
                        <span>{t('Discovering Contexts...')}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck style={{ width: '14px', height: '14px' }} />
                        <span>{t('Verify & Discover Care Contexts')}</span>
                      </>
                    )}
                  </button>
                ) : !linkingSuccess ? (
                  <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {t('Enter the 6-digit verification OTP (Enter 123456 for testing):')}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input 
                        type="text" 
                        value={linkOtp} 
                        onChange={(e) => setLinkOtp(e.target.value)} 
                        placeholder="e.g. 123456"
                        maxLength={6}
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', textAlign: 'center', letterSpacing: '4px', fontWeight: 'bold' }}
                      />
                      <button
                        onClick={handleConfirmLink}
                        className="primary-action"
                        style={{ minHeight: 'auto', padding: '0 16px', fontSize: '11.5px' }}
                        disabled={isLinking}
                      >
                        {isLinking ? <Loader2 className="animate-spin" style={{ width: '12px', height: '12px' }} /> : t('Confirm')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'color-mix(in srgb, var(--success) 8%, transparent)', border: '1px solid var(--success)', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <CheckCircle style={{ color: 'var(--success)', width: '20px', height: '20px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{t('Care Context Linked!')}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Ref: {linkedReference}</div>
                    </div>
                  </div>
                )}

                {linkingSuccess && (
                  <button
                    onClick={() => transitionToStep('consultation')}
                    className="primary-action"
                    style={{ width: '100%', minHeight: '40px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--accent-teal)', color: '#ffffff' }}
                  >
                    <Video style={{ width: '14px', height: '14px' }} /> {t('Join Consultation Room')}
                  </button>
                )}
              </div>

              {/* Console log box */}
              <div className="route-card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Smartphone style={{ width: '12px', height: '12px' }} /> {t('ABDM Gateway Transaction Logs')}
                </h4>
                
                <div style={{
                  background: '#09121a',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '12px',
                  height: '200px',
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '10.5px',
                  color: 'var(--accent-teal)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  lineHeight: '1.4'
                }}>
                  {linkingLogs.map((log, idx) => (
                    <div key={idx} style={{ color: log.startsWith('[ERROR]') ? 'var(--danger)' : log.startsWith('[ABDM-GATEWAY] Verification Successful') ? 'var(--success)' : 'var(--accent-teal)' }}>
                      {log}
                    </div>
                  ))}
                  <div ref={consoleEndRef}></div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= STEP 10: TELEHEALTH CONSULTATION ROOM (consultation) ================= */}
        {bookingStep === 'consultation' && selectedDoctor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'color-mix(in srgb, var(--accent-teal) 5%, transparent)', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{t('Active Consultation Session')}</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('Professional:')} <strong>{selectedDoctor.name}</strong> | {t('OPD Token:')} <strong>{generatedToken}</strong></span>
              </div>
              <span style={{ background: 'color-mix(in srgb, var(--success) 12%, transparent)', color: 'var(--success)', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                {t('LIVE SECURE NODE')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', alignItems: 'start' }}>
              
              {/* Camera Frame */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div 
                  style={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: '280px', 
                    background: '#040b11', 
                    borderRadius: '16px', 
                    border: '1.5px solid var(--border-color)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.8)'
                  }}
                >
                  {/* Simulated Doctor Video Image */}
                  {selectedDoctor.photo ? (
                    <img 
                      src={selectedDoctor.photo} 
                      alt="Doctor Video Feed" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, filter: 'grayscale(10%) contrast(105%)' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Stethoscope style={{ width: '48px', height: '48px', margin: '0 auto 10px', color: 'var(--accent-teal)' }} />
                      <span>{t('Initializing Encrypted Video Node...')}</span>
                    </div>
                  )}

                  {/* Small Patient Video Floating Overlay */}
                  <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '80px', height: '110px', background: '#0e1d2c', borderRadius: '10px', border: '1px solid var(--accent-teal)', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.6)', display: 'grid', placeItems: 'center' }}>
                    <User style={{ width: '24px', height: '24px', color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)', position: 'absolute', bottom: '4px' }}>{t('You')} (patient@abdm)</span>
                  </div>

                  <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(5, 17, 27, 0.75)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 8px', fontSize: '9px', color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }}></span> {t('Live Connection Secured')}
                  </div>
                </div>

                {/* Consultation Tools */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setShowPrescription(!showPrescription)}
                    className="prefill-btn"
                    style={{ flex: 1, minHeight: '40px', fontSize: '11.5px', background: showPrescription ? 'var(--bg-secondary)' : 'transparent', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <FileText style={{ width: '13px', height: '13px', color: 'var(--accent-teal)' }} /> 
                    {showPrescription ? t('Hide Linked Prescription') : t('View FHIR Prescription')}
                  </button>
                </div>
              </div>

              {/* Consultation Chat console */}
              <div className="route-card" style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px', height: '330px' }}>
                <h4 style={{ margin: 0, fontSize: '13px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                  <Sparkles style={{ width: '13px', height: '13px', color: 'var(--accent-teal)' }} /> {t('Telehealth Desk')}
                </h4>
                
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
                  {chatLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        alignSelf: log.sender === 'patient' ? 'flex-end' : 'flex-start',
                        background: log.sender === 'patient' ? 'var(--bg-secondary)' : 'color-mix(in srgb, var(--accent-teal) 8%, transparent)',
                        border: '1px solid var(--border-color)',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        maxWidth: '85%',
                        fontSize: '11.5px'
                      }}
                    >
                      <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.4 }}>{log.text}</p>
                      <span style={{ fontSize: '8px', color: 'var(--text-muted)', display: 'block', textAlign: 'right', marginTop: '2px' }}>{log.time}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder={t('Describe symptoms or ask questions...')}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11.5px' }}
                  />
                  <button type="submit" className="primary-action" style={{ minHeight: 'auto', padding: '8px 12px', display: 'grid', placeItems: 'center' }}>
                    <Send style={{ width: '12px', height: '12px' }} />
                  </button>
                </form>
              </div>
            </div>

            {/* FHIR Prescription View Overlay */}
            {showPrescription && (
              <div className="route-card" style={{ padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '13.5px', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                    <Award style={{ width: '14px', height: '14px' }} /> {t('Digitally Signed FHIR MedicationRequest Bundle')}
                  </h4>
                  <span style={{ fontSize: '9px', background: 'var(--success)', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>JWS SECURED</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', fontSize: '11.5px' }}>
                  <div>
                    <h5 style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>{t('Practitioner Metadata')}</h5>
                    <div>{t('Name:')} <strong>{selectedDoctor.name}</strong></div>
                    <div>{t('License No:')} <strong>{selectedDoctor.certificateId}</strong></div>
                    <div>{t('HFR Node:')} <strong>{selectedDoctor.hfrId}</strong></div>
                  </div>
                  <div>
                    <h5 style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>{t('Prescribed Pharmacotherapy')}</h5>
                    <div>{t('Medication:')} <strong>Paracetamol 650mg tablets</strong></div>
                    <div>{t('Dosage:')} <strong>1 tablet twice daily after meals (3 Days)</strong></div>
                    <div>{t('Status:')} <strong>Active / Interoperable</strong></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}
