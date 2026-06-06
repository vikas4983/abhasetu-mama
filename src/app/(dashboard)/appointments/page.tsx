'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
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

  // Loaded database registries
  const [specialtiesMatrix, setSpecialtiesMatrix] = useState<SpecialtiesMatrixItem[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajorCategory, setSelectedMajorCategory] = useState<'modern' | 'traditional' | null>(null);
  const [selectedSystem, setSelectedSystem] = useState('');

  // Selected Doctor for Booking
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Slot & Symptoms state
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState('06:00 PM');
  const [symptoms, setSymptoms] = useState('');
  const [consultMode, setConsultMode] = useState('Video Call');

  // Checkout states
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isPaymentSettled, setIsPaymentSettled] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');

  // ABHA Linking states
  const [abhaAddress, setAbhaAddress] = useState('');
  const [patientName, setPatientName] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkingLogs, setLinkingLogs] = useState<string[]>([]);
  const [linkingTxnId, setLinkingTxnId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [linkOtp, setLinkOtp] = useState('');
  const [linkingSuccess, setLinkingSuccess] = useState(false);
  const [linkedReference, setLinkedReference] = useState('');

  // Telehealth consultation room states
  const [joinedVideoConsult, setJoinedVideoConsult] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLogs, setChatLogs] = useState<{ sender: 'patient' | 'doctor'; text: string; time: string }[]>([
    { sender: 'doctor', text: 'Hello! I am reviewing your case and EMR. Let me know if you have any questions.', time: 'Just now' }
  ]);
  const [showPrescription, setShowPrescription] = useState(false);

  // Local token history
  const [tokenHistory, setTokenHistory] = useState([
    { doctorName: "Dr. Ayesha Ali", facilityName: "Dr. Ayesha Homeo Health Mall", tokenNum: "SETU-TKN-408", date: "Today", time: "06:00 PM", status: "Active" },
    { doctorName: "Dr. Yogyata Mukhraiya", facilityName: "Sanjivani Ayur Clinic", tokenNum: "SETU-TKN-912", date: "Yesterday", time: "10:30 AM", status: "Completed" }
  ]);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-fill defaults from currentUser
  useEffect(() => {
    if (currentUser) {
      setPatientName(currentUser.name || '');
      setAbhaAddress(currentUser.abhaId || 'ayesha.ali.9981057765@abdm');
    } else {
      setPatientName('Dr. Ayesha Ali');
      setAbhaAddress('ayesha.ali.9981057765@abdm');
    }
  }, [currentUser]);

  // Fetch Specialties and Doctors on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [specRes, docRes] = await Promise.all([
          fetch('/api/abdm/doctor-consultation/specialties'),
          fetch('/api/abdm/doctor-consultation/doctors')
        ]);
        const specData = await specRes.json();
        const docData = await docRes.json();

        if (specData.status === 'success') {
          setSpecialtiesMatrix(specData.specialties);
        }
        if (docData.status === 'success') {
          setAllDoctors(docData.doctors);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        showToast(t('Error loading healthcare directories from server.'));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Scroll logs to bottom
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [linkingLogs]);

  // Medical System metadata mapping (emojis + details)
  const medicalSystems = [
    { id: 'Allopathy', name: 'Allopathy', emoji: '🏥', desc: 'Modern scientific medicine & clinical diagnostics.' },
    { id: 'Dental Care', name: 'Dental Care', emoji: '🦷', desc: 'Comprehensive oral healthcare, orthodontics & surgery.' },
    { id: 'Dentist', name: 'Dentist', emoji: '🦷', desc: 'Oral health specialists, general and cosmetic dentistry.' },
    { id: 'Homeopathy', name: 'Homeopathy', emoji: '🌿', desc: 'Holistic therapeutics mapping chronic remedies.' },
    { id: 'Ayurveda', name: 'Ayurveda', emoji: '🌱', desc: 'Dosha balance therapies and herbal recovery.' },
    { id: 'Unani', name: 'Unani', emoji: '☪️', desc: 'Traditional Perso-Arabic humor therapies.' },
    { id: 'Physiotherapy', name: 'Physiotherapy', emoji: '🦵', desc: 'Skeletal rehabilitation and physical therapy.' },
    { id: 'Mental Health & Psychology', name: 'Mental Health', emoji: '🧠', desc: 'Behavioral consulting and psychiatric support.' }
  ];

  // Helper lists for picker
  const dates = ['Today', 'Tomorrow', 'Day After'];
  const times = ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM', '07:30 PM'];

  // Doctor count calculations
  const getSystemDoctorCount = (systemId: string) => {
    return allDoctors.filter(doc => {
      if (systemId === 'Dental Care' || systemId === 'Dentist') {
        return doc.medicalSystem === 'Dental Care' || doc.medicalSystem === 'Dentist';
      }
      return doc.medicalSystem === systemId;
    }).length;
  };

  const getMajorCategoryDoctorCount = (category: 'modern' | 'traditional') => {
    const modernSystems = ['Allopathy', 'Dental Care', 'Dentist', 'Physiotherapy', 'Mental Health & Psychology'];
    return allDoctors.filter(doc => {
      const isModern = modernSystems.includes(doc.medicalSystem);
      return category === 'modern' ? isModern : !isModern;
    }).length;
  };

  // Filter logic
  const getFilteredDoctors = () => {
    return allDoctors.filter(doc => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = doc.name.toLowerCase().includes(query);
        const matchSystem = doc.medicalSystem.toLowerCase().includes(query);
        const matchSpeciality = doc.speciality.toLowerCase().includes(query);
        const matchRole = doc.specialistRole.toLowerCase().includes(query);
        const matchHospital = doc.hospitalName.toLowerCase().includes(query);
        if (!(matchName || matchSystem || matchSpeciality || matchRole || matchHospital)) {
          return false;
        }
      }

      // 2. Major Category filter (if specific system is not selected)
      if (selectedMajorCategory && !selectedSystem) {
        const modernSystems = ['Allopathy', 'Dental Care', 'Dentist', 'Physiotherapy', 'Mental Health & Psychology'];
        const isModern = modernSystems.includes(doc.medicalSystem);
        if (selectedMajorCategory === 'modern' && !isModern) return false;
        if (selectedMajorCategory === 'traditional' && isModern) return false;
      }

      // 3. Specific Medical System filter
      if (selectedSystem) {
        if (selectedSystem === 'Dental Care' || selectedSystem === 'Dentist') {
          if (doc.medicalSystem !== 'Dental Care' && doc.medicalSystem !== 'Dentist') return false;
        } else if (doc.medicalSystem !== selectedSystem) {
          return false;
        }
      }

      return true;
    });
  };

  const getDoctorFee = () => {
    if (!selectedDoctor) return 0;
    if (typeof selectedDoctor.fee === 'number') return selectedDoctor.fee;
    return parseInt(String(selectedDoctor.fee).replace(/[^0-9]/g, '')) || 0;
  };

  // Step Reset helper when switching doctors
  const handleSelectDoctor = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setIsPaymentSettled(false);
    setLinkingSuccess(false);
    setJoinedVideoConsult(false);
    setOtpSent(false);
    setLinkOtp('');
    setLinkingLogs([]);
    setSymptoms('');
  };

  // Checkout Payment
  const handlePaymentCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    if (!symptoms.trim()) {
      showToast(t('Please describe your active symptoms first.'));
      return;
    }

    const tokenNum = `SETU-TKN-${Math.floor(100 + Math.random() * 900)}`;
    setGeneratedToken(tokenNum);
    setIsPaymentSettled(true);

    logSecurityEvent("OPD Payment Settled", `Payment settled for ${selectedDoctor.name}. Total: Rs ${getDoctorFee() + 99} via ${paymentMethod.toUpperCase()}`);
    showToast(t('Payment settled successfully! ABHA Linking is now unlocked.'));
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

  // Confirm Link
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

        // Success confetti celebration
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });

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

  // Video Chat Response simulation
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
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .pulse-dot-green {
          position: relative;
        }
        .pulse-dot-green::before {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          left: -14px;
          top: 50%;
          transform: translateY(-50%);
          animation: pulse-ring 2s infinite ease-in-out;
        }
        .scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }
      ` }} />

      {/* Hero Section */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }} className="back-link" aria-label="Go back to Home">
          <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
          {t('Home')}
        </a>
        <div>
          <p className="eyebrow">ABHA SETU TELEHEALTH</p>
          <h2>{t('Interoperable Doctor Consultations')}</h2>
          <p>{t('Search, filter, and schedule appointments instantly. Generate secure ABDM clinic tokens and link health records.')}</p>
        </div>
      </section>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6 items-start w-full min-h-[70vh]">
        
        {/* Left Column: Doctor Directory, Search & Category Filters (7/12 layout) */}
        <section className="w-full lg:w-3/5 flex flex-col gap-6">
          
          {/* Filters & Search Card */}
          <article className="route-card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
            <div className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-extrabold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--accent-teal)]" />
                  {t('Find Healthcare Practitioner')}
                </h3>
                <p className="text-[var(--text-secondary)] text-[12px]">{t('Search or select a medical category filter to browse doctors.')}</p>
              </div>

              {/* Direct Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Search by practitioner name, specialty, or clinic...')}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:border-[var(--accent-teal)] transition"
                  aria-label="Search doctors"
                />
              </div>

              {/* Major Category Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setSelectedMajorCategory(null);
                    setSelectedSystem('');
                  }}
                  className="px-4 py-2 text-[12px] font-bold rounded-lg transition"
                  style={{
                    background: selectedMajorCategory === null && !selectedSystem ? 'color-mix(in srgb, var(--accent-teal) 12%, transparent)' : 'var(--bg-secondary)',
                    border: selectedMajorCategory === null && !selectedSystem ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-color)',
                    color: selectedMajorCategory === null && !selectedSystem ? 'var(--accent-teal)' : 'var(--text-primary)'
                  }}
                >
                  🌎 {t('All Systems')} ({allDoctors.length})
                </button>
                <button
                  onClick={() => {
                    setSelectedMajorCategory('modern');
                    setSelectedSystem('');
                  }}
                  className="px-4 py-2 text-[12px] font-bold rounded-lg transition"
                  style={{
                    background: selectedMajorCategory === 'modern' && !selectedSystem ? 'color-mix(in srgb, var(--accent-teal) 12%, transparent)' : 'var(--bg-secondary)',
                    border: selectedMajorCategory === 'modern' && !selectedSystem ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-color)',
                    color: selectedMajorCategory === 'modern' && !selectedSystem ? 'var(--accent-teal)' : 'var(--text-primary)'
                  }}
                >
                  🏥 {t('Modern Medicine')} ({getMajorCategoryDoctorCount('modern')})
                </button>
                <button
                  onClick={() => {
                    setSelectedMajorCategory('traditional');
                    setSelectedSystem('');
                  }}
                  className="px-4 py-2 text-[12px] font-bold rounded-lg transition"
                  style={{
                    background: selectedMajorCategory === 'traditional' && !selectedSystem ? 'color-mix(in srgb, var(--accent-teal) 12%, transparent)' : 'var(--bg-secondary)',
                    border: selectedMajorCategory === 'traditional' && !selectedSystem ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-color)',
                    color: selectedMajorCategory === 'traditional' && !selectedSystem ? 'var(--accent-teal)' : 'var(--text-primary)'
                  }}
                >
                  🌱 {t('Traditional Medicine (AYUSH)')} ({getMajorCategoryDoctorCount('traditional')})
                </button>
              </div>

              {/* Sub-system selection cards (Dynamic grid listing 2-3 cards on mobile, scaling up on desktop) */}
              <div className="border-t border-[var(--border-color)] pt-4 mt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">{t('Select Medical System')}</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {medicalSystems
                    .filter(sys => {
                      if (!selectedMajorCategory) return true;
                      const isModern = ['Allopathy', 'Dental Care', 'Dentist', 'Physiotherapy', 'Mental Health & Psychology'].includes(sys.id);
                      return selectedMajorCategory === 'modern' ? isModern : !isModern;
                    })
                    .map(sys => {
                      const isActive = selectedSystem === sys.id;
                      const docCount = getSystemDoctorCount(sys.id);
                      
                      return (
                        <button
                          key={sys.id}
                          onClick={() => setSelectedSystem(isActive ? '' : sys.id)}
                          className="flex flex-col items-start p-3 rounded-xl border transition text-left cursor-pointer select-none group"
                          style={{
                            background: isActive ? 'color-mix(in srgb, var(--accent-teal) 8%, var(--bg-secondary))' : 'var(--bg-secondary)',
                            borderColor: isActive ? 'var(--accent-teal)' : 'var(--border-color)',
                            boxShadow: isActive ? '0 0 12px color-mix(in srgb, var(--accent-teal) 10%, transparent)' : 'none'
                          }}
                        >
                          {/* Circular bubble icon */}
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-md mb-2 bg-[var(--bg-card)] border border-[var(--border-color)] group-hover:border-[var(--accent-teal)] transition">
                            <span>{sys.emoji}</span>
                          </div>

                          <div className="text-[12px] font-extrabold text-[var(--text-primary)] leading-tight">{t(sys.name)}</div>
                          <span className="text-[10px] text-[var(--accent-cyan)] font-bold mt-1">{docCount} {t('Doctors')}</span>
                        </button>
                      );
                    })}
                </div>
              </div>

            </div>
          </article>

          {/* Directory Listings */}
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="animate-spin w-8 h-8 text-[var(--accent-teal)]" />
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {getFilteredDoctors().map((doc, idx) => {
                  const isSelected = selectedDoctor?.id === doc.id;
                  
                  return (
                    <motion.article
                      key={doc.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.3) }}
                      className="route-card select-none cursor-pointer"
                      style={{
                        padding: '16px',
                        background: 'var(--bg-card)',
                        border: isSelected ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)',
                        borderRadius: '16px',
                        boxShadow: isSelected ? '0 4px 20px color-mix(in srgb, var(--accent-teal) 8%, transparent)' : 'none',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onClick={() => handleSelectDoctor(doc)}
                    >
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        
                        {/* Avatar & Professional Metadata */}
                        <div className="flex gap-4 items-center">
                          <div className="w-14 h-14 rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--accent-teal)] overflow-hidden flex items-center justify-center flex-shrink-0">
                            {doc.photo ? (
                              <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-[var(--text-muted)]" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="margin-0 text-[15px] font-extrabold text-[var(--text-primary)]">{doc.name}</h4>
                              <span className="flex items-center gap-1 text-[9px] font-extrabold bg-[var(--bg-secondary)] text-[var(--accent-teal)] border border-[var(--accent-teal)]/20 px-2 py-0.5 rounded">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                {t('HPR Verified')}
                              </span>
                            </div>
                            
                            <span className="text-[12px] text-[var(--accent-cyan)] font-bold block mt-0.5">
                              {t(doc.specialistRole)} ({t(doc.medicalSystem)})
                            </span>

                            <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] mt-1">
                              <span>{doc.experience} {t('Exp')}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-[#fbbf24] font-bold">
                                <Star className="w-3.5 h-3.5 fill-[#fbbf24] stroke-[#fbbf24]" />
                                {doc.rating}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing & Selection */}
                        <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-none border-[var(--border-color)]">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-[var(--text-secondary)] block">{t('Consultation Fee')}</span>
                            <strong className="text-[16px] text-[var(--text-primary)]">Rs {doc.fee}</strong>
                          </div>
                          <button
                            className="mt-2 text-[11.5px] font-bold transition rounded-lg h-8 px-4"
                            style={{
                              background: isSelected ? 'var(--accent-teal)' : 'var(--bg-secondary)',
                              color: isSelected ? '#ffffff' : 'var(--text-primary)',
                              border: isSelected ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDoctor(doc);
                            }}
                          >
                            {isSelected ? t('Selected') : t('Select & Book')}
                          </button>
                        </div>

                      </div>

                      {/* Clinic Info */}
                      <div className="flex gap-2 items-center text-[12px] bg-[var(--bg-secondary)] px-3 py-2 rounded-xl border border-[var(--border-color)] mt-3">
                        <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
                        <span className="text-[var(--text-secondary)]">{t(doc.hospitalName)}</span>
                      </div>

                    </motion.article>
                  );
                })}

                {getFilteredDoctors().length === 0 && (
                  <div className="text-center py-16 px-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] text-[var(--text-secondary)] text-[13px]">
                    🌎 {t('No registered practitioners match your active filters or search term.')}
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* Right Column: Inline Booking, Payment and ABDM Linkage Console (5/12 layout) */}
        <section className="w-full lg:w-2/5 lg:sticky lg:top-24 flex flex-col gap-6">
          
          <AnimatePresence mode="wait">
            {!selectedDoctor ? (
              
              /* State A: Help State / History */
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                {/* Visual Empty Card */}
                <div className="route-card flex flex-col items-center justify-center text-center p-8 gap-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', minHeight: '340px' }}>
                  <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center text-[var(--accent-teal)] border border-[var(--accent-teal)]/20">
                    <Stethoscope className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="margin-0 text-[16px] font-extrabold">{t('Configure Booking Slot')}</h4>
                    <p className="margin-0 text-[var(--text-secondary)] text-[12.5px] max-w-[280px] leading-relaxed">
                      {t('Select any verified doctor from the catalog on the left to activate scheduling, payment checkout, and health record linking.')}
                    </p>
                  </div>
                </div>

                {/* Tokens History table acting as "Recent Bookings" */}
                <article className="route-card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <History className="text-[var(--accent-cyan)] w-[18px] h-[18px]" />
                    <h4 className="margin-0 text-[14px] font-extrabold">{t('Recent Queue Tokens')}</h4>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {tokenHistory.map((hist, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[12px] pb-3 border-b border-[var(--border-color)] last:border-0 last:pb-0">
                        <div>
                          <div className="font-extrabold text-[var(--text-primary)]">{hist.doctorName}</div>
                          <div className="text-[var(--text-secondary)] text-[11px] mt-0.5">{t(hist.facilityName)}</div>
                          <div className="text-[var(--text-muted)] text-[10px] mt-1">{hist.date} at {hist.time}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-mono text-[var(--accent-teal)] font-extrabold tracking-wider">{hist.tokenNum}</span>
                          <span className="text-[10px] font-bold" style={{ color: hist.status === 'Active' ? 'var(--success)' : 'var(--text-muted)' }}>
                            {hist.status === 'Active' ? `● ${t('Active')}` : `● ${t('Completed')}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </motion.div>

            ) : joinedVideoConsult ? (
              
              /* State B: Active Consultation Room */
              <motion.div
                key="consult-room"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                {/* Active consult panel header */}
                <div style={{ background: 'color-mix(in srgb, var(--accent-teal) 6%, var(--bg-card))', padding: '16px', border: '1.5px solid var(--accent-teal)', borderRadius: '16px' }}>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h4 className="margin-0 text-[14px] font-extrabold text-[var(--text-primary)]">{t('Consultation Session')}</h4>
                      <span className="text-[11px] text-[var(--text-muted)]">{t('Doctor:')} <strong>{selectedDoctor.name}</strong> | {t('Token:')} <strong>{generatedToken}</strong></span>
                    </div>
                    <button 
                      onClick={() => setJoinedVideoConsult(false)} 
                      className="px-2.5 py-1 text-[10px] font-bold bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded hover:border-[var(--danger)] text-[var(--text-secondary)] transition"
                    >
                      {t('Close Room')}
                    </button>
                  </div>
                </div>

                {/* Video Camera Frame Mock */}
                <div className="relative w-full h-[250px] bg-[#03090e] rounded-2xl border border-[var(--border-color)] overflow-hidden flex items-center justify-center shadow-inner">
                  {selectedDoctor.photo ? (
                    <img 
                      src={selectedDoctor.photo} 
                      alt="Doctor Video" 
                      className="w-full h-full object-cover opacity-85 filter contrast-[102%]"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="text-center text-[var(--text-muted)]">
                      <Stethoscope className="w-12 h-12 mx-auto mb-2 text-[var(--accent-teal)]" />
                      <span>{t('Establishing Encrypted Video Tunnel...')}</span>
                    </div>
                  )}

                  {/* Picture-in-picture float */}
                  <div className="absolute bottom-3 right-3 w-[70px] h-[95px] bg-[#09141d] rounded-lg border border-[var(--accent-teal)] overflow-hidden shadow-md flex flex-col items-center justify-center">
                    <User className="w-5 h-5 text-[var(--text-muted)]" />
                    <span className="text-[8px] text-[var(--text-muted)] absolute bottom-2">{t('You')}</span>
                  </div>

                  <div className="absolute top-3 left-3 bg-black/60 border border-[var(--border-color)] rounded-md px-2 py-1 text-[9px] text-[var(--success)] font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[var(--success)] rounded-full animate-ping inline-block"></span>
                    {t('LIVE')}
                  </div>
                </div>

                {/* Consultation Chat Desk */}
                <div className="route-card flex flex-col gap-3" style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', height: '280px' }}>
                  <h4 className="margin-0 text-[12.5px] border-b border-[var(--border-color)] pb-2 font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                    {t('Telehealth Chat Box')}
                  </h4>
                  
                  {/* Messages body */}
                  <div className="flex-1 overflow-y-auto flex flex-col gap-2 scroll-container">
                    {chatLogs.map((log, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          alignSelf: log.sender === 'patient' ? 'flex-end' : 'flex-start',
                          background: log.sender === 'patient' ? 'var(--bg-secondary)' : 'color-mix(in srgb, var(--accent-teal) 7%, transparent)',
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

                  {/* Form input */}
                  <form onSubmit={handleSendChatMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder={t('Type symptom detail or query...')}
                      className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[12px] focus:outline-none"
                    />
                    <button type="submit" className="primary-action px-3" style={{ minHeight: 'auto', height: '36px' }}>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

                {/* Prescription trigger */}
                <button 
                  onClick={() => setShowPrescription(!showPrescription)}
                  className="px-4 py-3 text-[12px] font-bold bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl flex items-center justify-center gap-2 hover:border-[var(--accent-teal)] transition"
                >
                  <FileText className="w-4 h-4 text-[var(--accent-teal)]" /> 
                  {showPrescription ? t('Hide Signed Prescription Bundle') : t('View Interoperable FHIR Prescription')}
                </button>

                {/* Digitally Signed FHIR Prescription Bundle */}
                {showPrescription && (
                  <div className="route-card" style={{ padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                    <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2 mb-3">
                      <h4 className="margin-0 text-[12px] text-[var(--accent-teal)] font-extrabold flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" /> 
                        {t('MedicationRequest bundle (FHIR)')}
                      </h4>
                      <span className="text-[8px] bg-[var(--success)] text-white px-2 py-0.5 rounded font-extrabold">JWS SIGNED</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] leading-relaxed">
                      <div>
                        <h5 className="margin-0 text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">{t('Practitioner Meta')}</h5>
                        <div>{t('Name:')} <strong>{selectedDoctor.name}</strong></div>
                        <div>{t('License:')} <strong>{selectedDoctor.certificateId}</strong></div>
                        <div>{t('HFR Node ID:')} <strong>{selectedDoctor.hfrId}</strong></div>
                      </div>
                      <div>
                        <h5 className="margin-0 text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">{t('Rx Medication Details')}</h5>
                        <div>{t('Medication:')} <strong>Paracetamol 650mg tablets</strong></div>
                        <div>{t('Dosage:')} <strong>1 tab twice daily after meals</strong></div>
                        <div>{t('Duration:')} <strong>3 Days (Active)</strong></div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

            ) : (
              
              /* State C: Selected Doctor Booking form */
              <motion.div
                key="booking-form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                {/* Doctor Selection Details Header */}
                <div className="route-card" style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--accent-teal)]/40 overflow-hidden flex items-center justify-center">
                        {selectedDoctor.photo ? (
                          <img src={selectedDoctor.photo} alt={selectedDoctor.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-[var(--text-muted)]" />
                        )}
                      </div>
                      <div>
                        <h4 className="margin-0 text-[13.5px] font-extrabold text-[var(--text-primary)]">{selectedDoctor.name}</h4>
                        <span className="text-[11px] text-[var(--accent-cyan)] font-bold">{t(selectedDoctor.specialistRole)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedDoctor(null)}
                      className="text-[var(--text-muted)] hover:text-[var(--danger)] transition p-1"
                      aria-label="Deselect doctor"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub-pane flow A: Schedule & Payment checkout */}
                {!isPaymentSettled ? (
                  <form onSubmit={handlePaymentCheckout} className="flex flex-col gap-4">
                    <div className="route-card flex flex-col gap-4" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                      
                      <h4 className="margin-0 text-[12px] uppercase tracking-wider text-[var(--text-muted)] font-extrabold">{t('Configure Appointment')}</h4>

                      {/* Date Picker */}
                      <div>
                        <label className="text-[11.5px] font-bold text-[var(--text-secondary)] block mb-1.5">{t('Select Date')}</label>
                        <div className="flex gap-2">
                          {dates.map(d => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setSelectedDate(d)}
                              className="flex-1 py-2 rounded-lg text-[11.5px] font-bold transition border"
                              style={{
                                background: selectedDate === d ? 'color-mix(in srgb, var(--accent-teal) 8%, var(--bg-secondary))' : 'var(--bg-secondary)',
                                borderColor: selectedDate === d ? 'var(--accent-teal)' : 'var(--border-color)',
                                color: selectedDate === d ? 'var(--accent-teal)' : 'var(--text-primary)'
                              }}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Time slot picker */}
                      <div>
                        <label className="text-[11.5px] font-bold text-[var(--text-secondary)] block mb-1.5">{t('Select Time Slot')}</label>
                        <div className="grid grid-cols-3 gap-2">
                          {times.map(tVal => (
                            <button
                              key={tVal}
                              type="button"
                              onClick={() => setSelectedTime(tVal)}
                              className="py-2 rounded-lg text-[10.5px] font-bold transition border flex items-center justify-center gap-1"
                              style={{
                                background: selectedTime === tVal ? 'color-mix(in srgb, var(--accent-teal) 8%, var(--bg-secondary))' : 'var(--bg-secondary)',
                                borderColor: selectedTime === tVal ? 'var(--accent-teal)' : 'var(--border-color)',
                                color: selectedTime === tVal ? 'var(--accent-teal)' : 'var(--text-primary)'
                              }}
                            >
                              <Clock className="w-3 h-3 flex-shrink-0" /> {tVal}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Consult Mode */}
                      <div>
                        <label className="text-[11.5px] font-bold text-[var(--text-secondary)] block mb-1">{t('Consultation Mode')}</label>
                        <select 
                          value={consultMode} 
                          onChange={(e) => setConsultMode(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[12px] focus:outline-none"
                        >
                          <option value="Video Call">{t('Video Consultation (Virtual)')}</option>
                          <option value="Audio Call">{t('Audio Call Consultation')}</option>
                          <option value="Clinic OPD Visit">{t('In-Clinic OPD Appointment')}</option>
                        </select>
                      </div>

                      {/* Symptom Input */}
                      <div>
                        <label className="text-[11.5px] font-bold text-[var(--text-secondary)] block mb-1">{t('Outline active symptoms')}</label>
                        <input
                          type="text"
                          required
                          value={symptoms}
                          onChange={(e) => setSymptoms(e.target.value)}
                          placeholder={t('e.g. fatigue, sore throat since yesterday')}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[12px] focus:outline-none focus:border-[var(--accent-teal)]"
                        />
                      </div>

                    </div>

                    {/* Payment checkout card */}
                    <div className="route-card flex flex-col gap-4" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                      
                      <h4 className="margin-0 text-[12px] uppercase tracking-wider text-[var(--text-muted)] font-extrabold">{t('Settlement Method')}</h4>
                      
                      {/* Price breakup */}
                      <div className="flex flex-col gap-2 text-[12px] border-b border-[var(--border-color)] pb-3">
                        <div className="flex justify-between text-[var(--text-secondary)]">
                          <span>{t('Consult fee')}</span>
                          <span className="font-bold text-[var(--text-primary)]">Rs. {getDoctorFee()}</span>
                        </div>
                        <div className="flex justify-between text-[var(--text-secondary)]">
                          <span>{t('ABHA linkage fee')}</span>
                          <span className="font-bold text-[var(--text-primary)]">Rs. 99</span>
                        </div>
                        <div className="flex justify-between font-extrabold text-[13.5px] pt-1">
                          <span>{t('Total Checkout')}</span>
                          <span className="text-[var(--accent-teal)]">Rs. {getDoctorFee() + 99}</span>
                        </div>
                      </div>

                      {/* Radio payment methods */}
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 p-2.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] cursor-pointer text-[12px]">
                          <input 
                            type="radio" 
                            name="payOption" 
                            value="upi" 
                            checked={paymentMethod === 'upi'} 
                            onChange={() => setPaymentMethod('upi')} 
                          />
                          <span>{t('UPI (Instant Node Settlement)')}</span>
                        </label>
                        <label className="flex items-center gap-2 p-2.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] cursor-pointer text-[12px]">
                          <input 
                            type="radio" 
                            name="payOption" 
                            value="card" 
                            checked={paymentMethod === 'card'} 
                            onChange={() => setPaymentMethod('card')} 
                          />
                          <span>{t('Credit / Debit Card')}</span>
                        </label>
                        <label className="flex items-center gap-2 p-2.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] cursor-pointer text-[12px]">
                          <input 
                            type="radio" 
                            name="payOption" 
                            value="wallet" 
                            checked={paymentMethod === 'wallet'} 
                            onChange={() => setPaymentMethod('wallet')} 
                          />
                          <span>{t('ABHA Health Wallet Balance')}</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="primary-action w-full flex items-center justify-center gap-2"
                        style={{ minHeight: '44px' }}
                      >
                        <CreditCard className="w-4 h-4" /> 
                        {t('Pay & Issue OPD Token')}
                      </button>

                      <div className="text-center text-[10px] text-[var(--text-muted)]">
                        🛡️ {t('Secure interoperable Beckn checkout gateway.')}
                      </div>

                    </div>
                  </form>
                ) : (
                  
                  /* Sub-pane flow B: ABHA Profile Linking */
                  <div className="flex flex-col gap-4">
                    
                    {/* Token issued ticket preview */}
                    <div className="bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--accent-teal)] rounded-2xl p-5 relative shadow-lg text-center">
                      <span className="text-[9px] font-extrabold tracking-wider text-[var(--accent-teal)]">{t('NATIONAL HEALTH AUTHORITY')}</span>
                      <h4 className="margin-0 text-[13px] font-extrabold text-[var(--text-primary)] mt-1">{t('OPD APPOINTMENT TOKEN')}</h4>
                      
                      <div className="my-3 font-mono text-[30px] font-extrabold text-[var(--accent-teal)] tracking-wider">
                        {generatedToken}
                      </div>
                      
                      <span className="inline-block text-[10px] bg-[var(--success)]/10 text-[var(--success)] font-extrabold px-3 py-1 rounded-full border border-[var(--success)]/20 mb-2">
                        ✔ {t('CHECKOUT SETTLED')}
                      </span>

                      <div className="border-t border-dotted border-[var(--border-color)] pt-3 text-[11px] flex flex-col gap-1.5 text-left max-w-[280px] mx-auto">
                        <div className="flex justify-between"><span className="text-[var(--text-muted)]">{t('Practitioner:')}</span><strong>{selectedDoctor.name}</strong></div>
                        <div className="flex justify-between"><span className="text-[var(--text-muted)]">{t('Schedule:')}</span><strong>{selectedDate}, {selectedTime}</strong></div>
                        <div className="flex justify-between"><span className="text-[var(--text-muted)]">{t('Clinic node:')}</span><strong>{selectedDoctor.hospitalName}</strong></div>
                      </div>
                    </div>

                    {/* ABHA Link Card */}
                    <div className="route-card flex flex-col gap-4" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                      <h4 className="margin-0 text-[12.5px] uppercase tracking-wider text-[var(--text-muted)] font-extrabold flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-[var(--accent-teal)]" />
                        {t('ABHA Integration Binds')}
                      </h4>

                      <p className="margin-0 text-[12px] text-[var(--text-secondary)] leading-relaxed">
                        {t('Link this token check-in directly under your ABHA record index to securely interlink EHR health data.')}
                      </p>

                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-[11px] text-[var(--text-secondary)] block mb-1">{t('Patient Registered Name')}</label>
                          <input 
                            type="text" 
                            value={patientName} 
                            onChange={(e) => setPatientName(e.target.value)} 
                            className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[12px] focus:outline-none"
                            disabled={linkingSuccess}
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-[var(--text-secondary)] block mb-1">{t('ABHA Address (Health ID)')}</label>
                          <input 
                            type="text" 
                            value={abhaAddress} 
                            onChange={(e) => setAbhaAddress(e.target.value)} 
                            className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[12px] focus:outline-none"
                            disabled={linkingSuccess}
                          />
                        </div>
                      </div>

                      {!otpSent ? (
                        <button
                          onClick={handleVerifyAndDiscover}
                          className="primary-action w-full flex items-center justify-center gap-1.5"
                          style={{ minHeight: '38px' }}
                          disabled={isLinking}
                        >
                          {isLinking ? (
                            <>
                              <Loader2 className="animate-spin w-4 h-4" />
                              <span>{t('Discovering Patient Contexts...')}</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              <span>{t('Verify & Discover Care Contexts')}</span>
                            </>
                          )}
                        </button>
                      ) : !linkingSuccess ? (
                        <div className="border-t border-[var(--border-color)] pt-3 mt-1 flex flex-col gap-3">
                          <div>
                            <span className="text-[11px] text-[var(--text-secondary)] block mb-1">{t('Enter NHA Verification OTP')}</span>
                            <span className="text-[10px] text-[var(--text-muted)] italic block mb-1">({t('Enter 123456 for simulator check')})</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={linkOtp} 
                              onChange={(e) => setLinkOtp(e.target.value)} 
                              placeholder="123456"
                              maxLength={6}
                              className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[13px] text-center font-bold tracking-[6px]"
                            />
                            <button
                              onClick={handleConfirmLink}
                              className="primary-action px-4"
                              style={{ minHeight: '36px' }}
                              disabled={isLinking}
                            >
                              {isLinking ? <Loader2 className="animate-spin w-4 h-4" /> : t('Confirm')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-xl p-3 flex items-center gap-3">
                          <CheckCircle className="text-[var(--success)] w-5 h-5 flex-shrink-0" />
                          <div>
                            <div className="text-[12px] font-extrabold text-[var(--text-primary)]">{t('Care Context Registered!')}</div>
                            <div className="text-[10px] text-[var(--text-muted)]">Ref: {linkedReference}</div>
                          </div>
                        </div>
                      )}

                      {linkingSuccess && (
                        <button
                          onClick={() => setJoinedVideoConsult(true)}
                          className="w-full flex items-center justify-center gap-2 text-[12.5px] font-bold py-3 rounded-xl transition"
                          style={{ background: 'var(--accent-teal)', color: '#ffffff' }}
                        >
                          <Video className="w-4 h-4" /> 
                          {t('Join Consultation Room')}
                        </button>
                      )}
                    </div>

                    {/* Transaction logs console */}
                    {linkingLogs.length > 0 && (
                      <div className="route-card flex flex-col gap-2" style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                        <h5 className="margin-0 text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-extrabold flex items-center gap-1">
                          <Smartphone className="w-3.5 h-3.5" /> 
                          {t('Gateway Transaction Logs')}
                        </h5>
                        
                        <div className="bg-[#03090e] border border-[var(--border-color)] rounded-xl p-3 h-[140px] overflow-y-auto font-mono text-[10px] text-[var(--accent-teal)] leading-relaxed flex flex-col gap-1.5 scroll-container">
                          {linkingLogs.map((log, idx) => (
                            <div key={idx} style={{ color: log.startsWith('[ERROR]') ? 'var(--danger)' : log.includes('Verification Successful') ? 'var(--success)' : 'var(--accent-teal)' }}>
                              {log}
                            </div>
                          ))}
                          <div ref={consoleEndRef}></div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

        </section>

      </div>
    </>
  );
}
