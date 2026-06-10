/**
 * @file        page.tsx
 * @description Simplified single-page appointments booking dashboard integrated with ABDM.
 * @module      appointments
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */
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
  Ticket, Video, Send, FileText, Award, Star, ArrowRight, Sparkles, User, Info, Home, Smartphone, Check, QrCode
} from 'lucide-react';
import { showToast } from '../../../utils/toast';
import { useQuery } from '@tanstack/react-query';


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
  const [linkedReference, setLinkedReference] = useState('');
  const [linkingSuccess, setLinkingSuccess] = useState(false);
  
  // Booking modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);
  const [bookingError, setBookingError] = useState('');
  const [shakeBooking, setShakeBooking] = useState(false);

  const triggerBookingShake = () => {
    setShakeBooking(true);
    setTimeout(() => setShakeBooking(false), 500);
  };

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

  // Fetch Specialties and Doctors via TanStack Query
  const { data: specialtiesData } = useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      const res = await fetch('/api/abdm/doctor-consultation/specialties');
      if (!res.ok) throw new Error('Failed to fetch specialties');
      return res.json();
    }
  });

  const { data: doctorsData, isLoading: isDocsLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await fetch('/api/abdm/doctor-consultation/doctors');
      if (!res.ok) throw new Error('Failed to fetch doctors');
      return res.json();
    }
  });

  // Sync with component states for backward compatibility and filtering logic
  useEffect(() => {
    if (specialtiesData?.status === 'success') {
      setSpecialtiesMatrix(specialtiesData.specialties);
    }
  }, [specialtiesData]);

  useEffect(() => {
    if (doctorsData?.status === 'success') {
      setAllDoctors(doctorsData.doctors);
    }
  }, [doctorsData]);

  useEffect(() => {
    setIsLoading(isDocsLoading);
  }, [isDocsLoading]);


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
      // 1. Search Query filter (checks doctor name, medical system, speciality, profession/specialistRole, hospital name, degree, and description)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = doc.name.toLowerCase().includes(query);
        const matchSystem = doc.medicalSystem.toLowerCase().includes(query);
        const matchSpeciality = doc.speciality.toLowerCase().includes(query);
        const matchRole = doc.specialistRole.toLowerCase().includes(query);
        const matchHospital = doc.hospitalName.toLowerCase().includes(query);
        const matchDegree = doc.degree.toLowerCase().includes(query);
        const matchDesc = doc.description.toLowerCase().includes(query);
        if (!(matchName || matchSystem || matchSpeciality || matchRole || matchHospital || matchDegree || matchDesc)) {
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

  // Checkout Payment (Modal Step 2 Confirm)
  const handlePaymentCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    try {
      const maskValue = (str: string, keep = 4) => {
        if (!str) return 'N/A';
        const s = str.trim();
        if (s.length <= keep) return s;
        return '*'.repeat(s.length - keep) + s.slice(-keep);
      };

      const maskedMobile = maskValue(currentUser?.abhaProfile?.mobile || currentUser?.mobile || '');
      const maskedAadhaar = maskValue(currentUser?.abhaProfile?.aadhaar || '');
      const maskedAbha = currentUser?.abhaProfile?.preferredAddress || currentUser?.abhaProfile?.abhaAddress || 'N/A';

      const txnBody = {
        userMobileMasked: maskedMobile,
        userAadhaarMasked: maskedAadhaar,
        userAbhaMasked: maskedAbha,
        appointmentType: consultMode,
        doctorName: selectedDoctor.name,
        hospitalName: selectedDoctor.hospitalName,
        fee: getDoctorFee(),
        platformFee: 99,
        totalFee: getDoctorFee() + 99,
        paymentMethod: paymentMethod,
        status: 'SUCCESS'
      };

      const res = await fetch('/api/abdm/appointments/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txnBody)
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        const tokenNum = `SETU-TKN-${Math.floor(100 + Math.random() * 900)}`;
        setGeneratedToken(tokenNum);
        setIsPaymentSettled(true);
        setShowBookingModal(false);

        // Save appointment to context
        addAppointment({
          title: `${consultMode} - ${symptoms || 'General Checkup'}`,
          doctor: selectedDoctor.name,
          meta: `${selectedDate}, ${selectedTime}`,
          status: "Confirmed",
          token: tokenNum
        });

        logSecurityEvent("OPD Payment Settled", `Payment settled for ${selectedDoctor.name}. Total: Rs ${getDoctorFee() + 99} via ${paymentMethod.toUpperCase()}`);
        showToast(t('Payment settled successfully! ABDM linking is unlocked.'));
      } else {
        setBookingError(data.message || t('Transaction failed on gateway.'));
        triggerBookingShake();
      }
    } catch (err: any) {
      setBookingError(err.message || t('Network error completing payment.'));
      triggerBookingShake();
    }
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

  const renderActiveConsultation = () => {
    if (!selectedDoctor || !isPaymentSettled) return null;

    if (joinedVideoConsult) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* Active consult panel header */}
          <div style={{ background: 'color-mix(in srgb, var(--accent-teal) 6%, var(--bg-card))', padding: '16px', border: '1.5px solid var(--accent-teal)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>{t('Consultation Session')}</h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('Doctor:')} <strong>{selectedDoctor.name}</strong> | {t('Token:')} <strong>{generatedToken}</strong></span>
              </div>
              <button 
                onClick={() => setJoinedVideoConsult(false)} 
                style={{
                  padding: '4px 10px',
                  fontSize: '10.5px',
                  fontWeight: 'bold',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {t('Close Room')}
              </button>
            </div>
          </div>

          {/* Video Camera Frame Mock */}
          <div style={{ position: 'relative', width: '100%', height: '240px', background: '#03090e', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {selectedDoctor.photo ? (
              <img 
                src={selectedDoctor.photo} 
                alt="Doctor Video" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <Stethoscope style={{ width: '48px', height: '48px', margin: '0 auto 8px', color: 'var(--accent-teal)' }} />
                <span>{t('Establishing Encrypted Video Tunnel...')}</span>
              </div>
            )}

            {/* Picture-in-picture float */}
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '70px', height: '95px', background: '#09141d', borderRadius: '8px', border: '1px solid var(--accent-teal)', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <User style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '8px', color: 'var(--text-muted)', position: 'absolute', bottom: '6px' }}>{t('You')}</span>
            </div>

            <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 8px', fontSize: '9px', color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }}></span>
              {t('LIVE')}
            </div>
          </div>

          {/* Consultation Chat Desk */}
          <div className="route-card" style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', height: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '12.5px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles style={{ width: '14px', height: '14px', color: 'var(--accent-teal)' }} />
              {t('Telehealth Chat Box')}
            </h4>
            
            {/* Messages body */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }} className="scroll-container">
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
            <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={t('Type symptom detail or query...')}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
              />
              <button type="submit" className="primary-action" style={{ minHeight: '34px', padding: '0 12px' }}>
                <Send style={{ width: '14px', height: '14px' }} />
              </button>
            </form>
          </div>

          {/* Prescription trigger */}
          <button 
            onClick={() => setShowPrescription(!showPrescription)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <FileText style={{ width: '16px', height: '16px', color: 'var(--accent-teal)' }} /> 
            {showPrescription ? t('Hide Signed Prescription Bundle') : t('View Interoperable FHIR Prescription')}
          </button>

          {/* Digitally Signed FHIR Prescription Bundle */}
          {showPrescription && (
            <div className="route-card" style={{ padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '12px', color: 'var(--accent-teal)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award style={{ width: '14px', height: '14px' }} /> 
                  {t('MedicationRequest bundle (FHIR)')}
                </h4>
                <span style={{ fontSize: '8px', background: 'var(--success)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>JWS SIGNED</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', fontSize: '11px', lineHeight: '1.5' }}>
                <div>
                  <h5 style={{ margin: '0 0 4px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)' }}>{t('Practitioner Meta')}</h5>
                  <div>{t('Name:')} <strong>{selectedDoctor.name}</strong></div>
                  <div>{t('License:')} <strong>{selectedDoctor.certificateId}</strong></div>
                  <div>{t('HFR Node ID:')} <strong>{selectedDoctor.hfrId}</strong></div>
                </div>
                <div>
                  <h5 style={{ margin: '0 0 4px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)' }}>{t('Rx Medication Details')}</h5>
                  <div>{t('Medication:')} <strong>Paracetamol 650mg tablets</strong></div>
                  <div>{t('Dosage:')} <strong>1 tab twice daily after meals</strong></div>
                  <div>{t('Duration:')} <strong>3 Days (Active)</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        
        {/* Token issued ticket preview */}
        <div style={{ background: 'var(--bg-secondary)', border: '2px dashed var(--accent-teal)', borderRadius: '16px', padding: '20px', textAlign: 'center', position: 'relative' }}>
          <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--accent-teal)', letterSpacing: '0.5px' }}>{t('NATIONAL HEALTH AUTHORITY')}</span>
          <h4 style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>{t('OPD APPOINTMENT TOKEN')}</h4>
          
          <div style={{ margin: '12px 0', fontFamily: 'monospace', fontSize: '30px', fontWeight: '950', color: 'var(--accent-teal)', letterSpacing: '1px' }}>
            {generatedToken}
          </div>
          
          <span style={{ display: 'inline-block', fontSize: '10px', background: 'color-mix(in srgb, var(--success) 10%, transparent)', color: 'var(--success)', border: '1px solid color-mix(in srgb, var(--success) 20%, transparent)', padding: '4px 12px', borderRadius: '999px', fontWeight: '800', marginBottom: '8px' }}>
            ✔ {t('CHECKOUT SETTLED')}
          </span>

          <div style={{ borderTop: '1px dotted var(--border-color)', paddingTop: '12px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', maxWidth: '280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>{t('Practitioner:')}</span><strong style={{ color: 'var(--text-primary)' }}>{selectedDoctor.name}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>{t('Schedule:')}</span><strong style={{ color: 'var(--text-primary)' }}>{selectedDate}, {selectedTime}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>{t('Clinic node:')}</span><strong style={{ color: 'var(--text-primary)' }}>{selectedDoctor.hospitalName}</strong></div>
          </div>
        </div>

        {/* ABHA Link Card */}
        <div className="route-card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ margin: 0, fontSize: '12.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck style={{ width: '16px', height: '16px', color: 'var(--accent-teal)' }} />
            {t('ABHA Integration Binds')}
          </h4>

          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
            {t('Link this token check-in directly under your ABHA record index to securely interlink EHR health data.')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t('Patient Registered Name')}</label>
              <input 
                type="text" 
                value={patientName} 
                onChange={(e) => setPatientName(e.target.value)} 
                className="text-input-field"
                disabled={linkingSuccess}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t('ABHA Address (Health ID)')}</label>
              <input 
                type="text" 
                value={abhaAddress} 
                onChange={(e) => setAbhaAddress(e.target.value)} 
                className="text-input-field"
                disabled={linkingSuccess}
              />
            </div>
          </div>

          {!otpSent ? (
            <button
              onClick={handleVerifyAndDiscover}
              className="primary-action"
              style={{ minHeight: '38px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              disabled={isLinking}
            >
              {isLinking ? (
                <>
                  <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} />
                  <span>{t('Discovering Patient Contexts...')}</span>
                </>
              ) : (
                <>
                  <ShieldCheck style={{ width: '14px', height: '14px' }} />
                  <span>{t('Verify & Discover Care Contexts')}</span>
                </>
              )}
            </button>
          ) : !linkingSuccess ? (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>{t('Enter NHA Verification OTP')}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', display: 'block', marginTop: '2px' }}>({t('Enter 123456 for simulator check')})</span>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={linkOtp} 
                  onChange={(e) => setLinkOtp(e.target.value)} 
                  placeholder="123456"
                  maxLength={6}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '6px' }}
                />
                <button
                  onClick={handleConfirmLink}
                  className="primary-action"
                  style={{ minHeight: '36px', padding: '0 16px' }}
                  disabled={isLinking}
                >
                  {isLinking ? <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} /> : t('Confirm')}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: 'color-mix(in srgb, var(--success) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--success) 20%, transparent)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle style={{ color: 'var(--success)', width: '20px', height: '20px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--text-primary)' }}>{t('Care Context Registered!')}</div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Ref: {linkedReference}</div>
              </div>
            </div>
          )}

          {linkingSuccess && !joinedVideoConsult && (
            <button
              onClick={() => {
                setJoinedVideoConsult(true);
                logSecurityEvent("Joined Tele-health Room", `Patient joined virtual tele-health consult workspace for Token: ${generatedToken}`);
              }}
              className="primary-action"
              style={{
                width: '100%',
                minHeight: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'var(--accent-teal)',
                color: '#ffffff',
                border: '0',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: 'bold'
              }}
            >
              <Video style={{ width: '16px', height: '16px' }} /> 
              {t('Join Consultation Room')}
            </button>
          )}
        </div>

        {/* Transaction logs console */}
        {linkingLogs.length > 0 && (
          <div className="route-card" style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h5 style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Smartphone style={{ width: '14px', height: '14px' }} /> 
              {t('Gateway Transaction Logs')}
            </h5>
            
            <div className="logs-console-window">
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
    );
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

        /* Responsive Split Dashboard Layout */
        .appointments-split-layout {
          display: flex;
          flex-direction: row;
          gap: 24px;
          width: 100%;
          margin-top: 20px;
          align-items: flex-start;
        }

        @media (max-width: 992px) {
          .appointments-split-layout {
            flex-direction: column;
            gap: 20px;
          }
        }

        .left-directory-pane {
          flex: 1.25;
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }

        .right-booking-pane {
          flex: 0.75;
          position: sticky;
          top: 96px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }

        @media (max-width: 992px) {
          .right-booking-pane {
            position: relative;
            top: 0;
          }
        }

        /* Filter Controls */
        .category-btn-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .category-filter-btn {
          padding: 8px 14px;
          font-size: 11.5px;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        /* Sub-system grid */
        .medical-system-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 14px;
        }

        @media (min-width: 480px) {
          .medical-system-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (min-width: 768px) {
          .medical-system-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        @media (min-width: 992px) {
          .medical-system-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 1200px) {
          .medical-system-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        .medical-system-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          cursor: pointer;
          text-align: left;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .medical-system-card:hover {
          border-color: var(--accent-teal);
          background: var(--bg-card-hover);
          transform: translateY(-2px);
        }

        .medical-system-card.active {
          border-color: var(--accent-teal);
          background: color-mix(in srgb, var(--accent-teal) 8%, var(--bg-secondary));
          box-shadow: 0 0 12px color-mix(in srgb, var(--accent-teal) 12%, transparent);
        }

        .emoji-bubble {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          margin-bottom: 8px;
          transition: border-color 0.2s;
        }

        .medical-system-card:hover .emoji-bubble {
          border-color: var(--accent-teal);
        }

        /* Doctor card styling */
        .doctor-directory-card {
          padding: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .doctor-directory-card.active {
          border-color: var(--accent-teal);
          box-shadow: 0 4px 20px color-mix(in srgb, var(--accent-teal) 8%, transparent);
        }

        /* Slots Grid */
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        @media (max-width: 480px) {
          .slots-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Forms Layout */
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .text-input-field {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 13px;
          transition: border-color 0.2s;
        }

        .text-input-field:focus {
          border-color: var(--accent-teal);
          outline: none;
        }

        .booking-select-field {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 13px;
          cursor: pointer;
        }

        /* Checkout breakdown */
        .breakup-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
          font-size: 12.5px;
        }

        .breakup-row {
          display: flex;
          justify-content: space-between;
          color: var(--text-secondary);
        }

        .breakup-total {
          display: flex;
          justify-content: space-between;
          font-weight: 800;
          font-size: 14px;
          color: var(--text-primary);
          margin-top: 4px;
        }

        /* Payment Radio Select Options */
        .radio-select-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .radio-option-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-secondary);
          cursor: pointer;
          font-size: 12.5px;
          transition: border-color 0.2s;
        }

        .radio-option-card:hover {
          border-color: var(--accent-teal);
        }

        /* ABDM Logs Terminal window */
        .logs-console-window {
          background: #04090e;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px;
          height: 150px;
          overflow-y: auto;
          font-family: 'Courier New', Courier, monospace;
          font-size: 10.5px;
          color: var(--accent-teal);
          line-height: 1.45;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mobile-only-active-consult {
          display: none;
        }
        .desktop-only-active-consult {
          display: block;
        }
        @media (max-width: 992px) {
          .mobile-only-active-consult {
            display: block;
          }
          .desktop-only-active-consult {
            display: none;
          }
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
      <div className="appointments-split-layout">
        
        {/* Left Column: Doctor Directory, Search, QR Checkin & Category Filters */}
        <section className="left-directory-pane">

          {/* Mobile-Only Active Consult Node displayed on top */}
          {selectedDoctor && isPaymentSettled && (
            <div className="mobile-only-active-consult" style={{ width: '100%', marginBottom: '20px' }}>
              {renderActiveConsultation()}
            </div>
          )}

          {/* Prominent Directly Scan QR check-in card */}
          <article className="route-card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'color-mix(in srgb, var(--accent-teal) 15%, transparent)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <QrCode style={{ width: '22px', height: '22px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {t('Are you physically at a clinic or hospital?')}
                </h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '11.5px', lineHeight: '1.4' }}>
                  {t('Directly scan the facility check-in code at the counter to share your ABHA profile and generate a queue token.')}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/qr-scanner')}
              className="primary-action"
              style={{
                width: '100%',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px'
              }}
            >
              <QrCode style={{ width: '16px', height: '16px' }} />
              {t('Scan Counter QR Code to Check-in')}
            </button>
          </article>
          
          {/* Filters & Search Card */}
          <article className="route-card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles style={{ width: '16px', height: '16px', color: 'var(--accent-teal)' }} />
                  {t('Search Registered Practitioners')}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {t('Filter by name, specialty, degree, clinical profession, or hospital/clinic name.')}
                </p>
              </div>

              {/* Direct Search Input */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Search by doctor name, specialty, degree, hospital or clinic...')}
                  className="text-input-field"
                  aria-label="Search doctors"
                />
              </div>

              {/* Major Category Buttons */}
              <div className="category-btn-row">
                <button
                  onClick={() => {
                    setSelectedMajorCategory(null);
                    setSelectedSystem('');
                  }}
                  className="category-filter-btn"
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
                  className="category-filter-btn"
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
                  className="category-filter-btn"
                  style={{
                    background: selectedMajorCategory === 'traditional' && !selectedSystem ? 'color-mix(in srgb, var(--accent-teal) 12%, transparent)' : 'var(--bg-secondary)',
                    border: selectedMajorCategory === 'traditional' && !selectedSystem ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-color)',
                    color: selectedMajorCategory === 'traditional' && !selectedSystem ? 'var(--accent-teal)' : 'var(--text-primary)'
                  }}
                >
                  🌱 {t('Traditional Medicine (AYUSH)')} ({getMajorCategoryDoctorCount('traditional')})
                </button>
              </div>

              {/* Sub-system selection dropdown */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                <label htmlFor="medical-system-dropdown" style={{ display: 'block', margin: '0 0 8px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  {t('Filter by Specific Medical System')}
                </label>
                
                <select
                  id="medical-system-dropdown"
                  value={selectedSystem}
                  onChange={(e) => {
                    setSelectedSystem(e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontWeight: 'bold',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <option value="">{t('All Medical Systems / सभी चिकित्सा प्रणालियाँ')}</option>
                  {medicalSystems
                    .filter(sys => {
                      if (!selectedMajorCategory) return true;
                      const isModern = ['Allopathy', 'Dental Care', 'Dentist', 'Physiotherapy', 'Mental Health & Psychology'].includes(sys.id);
                      return selectedMajorCategory === 'modern' ? isModern : !isModern;
                    })
                    .map(sys => (
                      <option key={sys.id} value={sys.id}>
                        {sys.emoji} {t(sys.name)} ({getSystemDoctorCount(sys.id)} {t('Doctors')})
                      </option>
                    ))}
                </select>
              </div>

            </div>
          </article>

          {/* Directory Listings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
                <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: 'var(--accent-teal)' }} />
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
                      className={`doctor-directory-card ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSelectDoctor(doc)}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                        
                        {/* Avatar & Professional Metadata */}
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid var(--accent-teal)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {doc.photo ? (
                              <img src={doc.photo} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <User style={{ width: '24px', height: '24px', color: 'var(--text-muted)' }} />
                            )}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{doc.name}</h4>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: 'bold', background: 'var(--bg-secondary)', color: 'var(--accent-teal)', border: '1px solid color-mix(in srgb, var(--accent-teal) 20%, transparent)', padding: '2px 6px', borderRadius: '4px' }}>
                                <ShieldCheck style={{ width: '10px', height: '10px' }} />
                                {t('HPR Verified')}
                              </span>
                            </div>
                            
                            <span style={{ fontSize: '11.5px', color: 'var(--accent-cyan)', fontWeight: 'bold', display: 'block', marginTop: '2px' }}>
                              {t(doc.specialistRole)} ({t(doc.medicalSystem)})
                            </span>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                              <span>{doc.experience} {t('Exp')}</span>
                              <span>•</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#fbbf24', fontWeight: 'bold' }}>
                                <Star style={{ width: '13px', height: '13px', fill: '#fbbf24', stroke: '#fbbf24' }} />
                                {doc.rating}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing & Selection */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>{t('Consultation Fee')}</span>
                            <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>Rs {doc.fee}</strong>
                          </div>
                          <button
                            style={{
                              marginTop: '6px',
                              height: '32px',
                              padding: '0 14px',
                              fontSize: '11.5px',
                              fontWeight: 'bold',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              border: isSelected ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)',
                              background: isSelected ? 'var(--accent-teal)' : 'var(--bg-secondary)',
                              color: isSelected ? '#ffffff' : 'var(--text-primary)',
                              transition: 'all 0.2s'
                            }}
                           onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDoctor(doc);
                              setBookingStep(1);
                              setBookingError('');
                              setShowBookingModal(true);
                            }}
                          >
                            {isSelected ? t('Selected') : t('Select & Book')}
                          </button>
                        </div>

                      </div>

                      {/* Clinic Info */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <MapPin style={{ width: '14px', height: '14px', color: 'var(--text-muted)', flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{t(doc.hospitalName)}</span>
                      </div>

                    </motion.article>
                  );
                })}

                {getFilteredDoctors().length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    🌎 {t('No registered practitioners match your active filters or search term.')}
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* Right Column: Inline Booking, Payment and ABDM Linkage Console */}
        <section className="right-booking-pane">
          
          <AnimatePresence mode="wait">
            {!selectedDoctor ? (
              
              /* State A: Help State / History */
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}
              >
                {/* Visual Empty Card */}
                <div className="route-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 20px', gap: '16px', minHeight: '340px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'color-mix(in srgb, var(--accent-teal) 10%, transparent)', color: 'var(--accent-teal)', border: '1px solid color-mix(in srgb, var(--accent-teal) 20%, transparent)', display: 'grid', placeItems: 'center' }}>
                    <Stethoscope style={{ width: '32px', height: '32px' }} className="animate-pulse" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>{t('Configure Booking Slot')}</h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12.5px', maxWidth: '280px', lineHeight: '1.5' }}>
                      {t('Select any verified doctor from the catalog on the left to activate scheduling, payment checkout, and health record linking.')}
                    </p>
                  </div>
                </div>

                {/* Tokens History table acting as "Recent Bookings" */}
                <article className="route-card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <History style={{ color: 'var(--accent-cyan)', width: '18px', height: '18px' }} />
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{t('Recent Queue Tokens')}</h4>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tokenHistory.map((hist, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{hist.doctorName}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>{t(hist.facilityName)}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '4px' }}>{hist.date} at {hist.time}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ fontFamily: 'monospace', color: 'var(--accent-teal)', fontWeight: '800', letterSpacing: '0.5px' }}>{hist.tokenNum}</span>
                          <span style={{ fontSize: '10px', fontWeight: 'bold', color: hist.status === 'Active' ? 'var(--success)' : 'var(--text-muted)' }}>
                            {hist.status === 'Active' ? `● ${t('Active')}` : `● ${t('Completed')}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </motion.div>

            ) : (
              <motion.div
                key="booking-flow"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}
              >
                {/* Doctor Selection Details Header */}
                <div className="route-card" style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--accent-teal)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedDoctor.photo ? (
                          <img src={selectedDoctor.photo} alt={selectedDoctor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
                        )}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)' }}>{selectedDoctor.name}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{t(selectedDoctor.specialistRole)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedDoctor(null);
                        setJoinedVideoConsult(false);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                      aria-label="Deselect doctor"
                    >
                      <X style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>

                {!isPaymentSettled ? (
                  /* Checkout Pending Card */
                  <div className="route-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'color-mix(in srgb, var(--accent-cyan) 10%, transparent)', color: 'var(--accent-cyan)', display: 'grid', placeItems: 'center' }}>
                      <Clock style={{ width: '24px', height: '24px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>{t('Checkout Pending')}</h4>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12.5px', maxWidth: '280px', lineHeight: '1.5' }}>
                        {t('You have selected')} <strong>{selectedDoctor.name}</strong>. {t('Please complete the 2-step appointment booking & payment checkout in the modal.')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBookingStep(1);
                        setBookingError('');
                        setShowBookingModal(true);
                      }}
                      className="primary-action"
                      style={{ width: '100%', minHeight: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <CreditCard style={{ width: '16px', height: '16px' }} />
                      {t('Open Checkout Modal')}
                    </button>
                  </div>
                ) : (
                  /* Desktop Active Consultation & Binds */
                  <div className="desktop-only-active-consult" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    {renderActiveConsultation()}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </section>

      </div>

      {/* Booking and checkout 2-step overlay modal */}
      {showBookingModal && selectedDoctor && (
        <div 
          className="checkout-modal-overlay" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => {
            // Lock backdrop clicks from closing modal
          }}
        >
          <div 
            className={`checkout-modal-content ${shakeBooking ? 'shake-modal' : ''}`}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'color-mix(in srgb, var(--accent-teal) 10%, transparent)', display: 'grid', placeItems: 'center', color: 'var(--accent-teal)' }}>
                  <Stethoscope style={{ width: '16px', height: '16px' }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>{t('Book Appointment')}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedDoctor.name}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowBookingModal(false);
                }} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                aria-label="Close modal"
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Error banner inside modal */}
            {bookingError && (
              <div style={{ background: 'color-mix(in srgb, var(--danger) 10%, transparent)', border: '1px solid var(--danger)', padding: '10px 12px', borderRadius: '8px', color: 'var(--danger)', fontSize: '11.5px', fontWeight: 'bold' }}>
                {bookingError}
              </div>
            )}

            {/* Step Indicators */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'var(--accent-teal)' }}></div>
              <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: bookingStep === 2 ? 'var(--accent-teal)' : 'var(--border-color)' }}></div>
            </div>

            {/* Step 1: Appointment Details */}
            {bookingStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Date Picker */}
                <div className="form-group">
                  <label style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{t('Select Date')}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {dates.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        style={{
                          flex: 1,
                          padding: '8px 0',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: 'bold',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
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
                <div className="form-group">
                  <label style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{t('Select Time Slot')}</label>
                  <div className="slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {times.map(tVal => (
                      <button
                        key={tVal}
                        type="button"
                        onClick={() => setSelectedTime(tVal)}
                        style={{
                          padding: '8px 0',
                          borderRadius: '8px',
                          fontSize: '10.5px',
                          fontWeight: 'bold',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          background: selectedTime === tVal ? 'color-mix(in srgb, var(--accent-teal) 8%, var(--bg-secondary))' : 'var(--bg-secondary)',
                          borderColor: selectedTime === tVal ? 'var(--accent-teal)' : 'var(--border-color)',
                          color: selectedTime === tVal ? 'var(--accent-teal)' : 'var(--text-primary)'
                        }}
                      >
                        <Clock style={{ width: '11px', height: '11px', flexShrink: 0 }} /> {tVal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consult Mode */}
                <div className="form-group">
                  <label style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{t('Consultation Mode')}</label>
                  <select 
                    value={consultMode} 
                    onChange={(e) => setConsultMode(e.target.value)}
                    className="booking-select-field"
                  >
                    <option value="Video Call">{t('Video Consultation (Virtual)')}</option>
                    <option value="Audio Call">{t('Audio Call Consultation')}</option>
                    <option value="Clinic OPD Visit">{t('In-Clinic OPD Appointment')}</option>
                  </select>
                </div>

                {/* Symptom Input */}
                <div className="form-group">
                  <label style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{t('Outline active symptoms')}</label>
                  <textarea
                    required
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder={t('e.g. fatigue, sore throat since yesterday')}
                    className="text-input-field"
                    style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!symptoms.trim()) {
                      setBookingError(t('Please describe your symptoms.'));
                      triggerBookingShake();
                      return;
                    }
                    setBookingError('');
                    setBookingStep(2);
                  }}
                  className="primary-action"
                  style={{ minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginTop: '8px' }}
                >
                  {t('Proceed to Checkout')} <ChevronRight style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            )}

            {/* Step 2: Settlement & Payment Checkout */}
            {bookingStep === 2 && (
              <form onSubmit={handlePaymentCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '800' }}>{t('Settlement Method')}</h4>
                
                {/* Price breakup */}
                <div className="breakup-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <div className="breakup-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <span>{t('Consult fee')}</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Rs. {getDoctorFee()}</span>
                  </div>
                  <div className="breakup-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <span>{t('ABHA linkage fee')}</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Rs. 99</span>
                  </div>
                  <div className="breakup-total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
                    <span>{t('Total Checkout')}</span>
                    <span style={{ color: 'var(--accent-teal)' }}>Rs. {getDoctorFee() + 99}</span>
                  </div>
                </div>

                {/* Radio payment methods */}
                <div className="radio-select-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="radio-option-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '12.5px' }}>
                    <input 
                      type="radio" 
                      name="payOption" 
                      value="upi" 
                      checked={paymentMethod === 'upi'} 
                      onChange={() => setPaymentMethod('upi')} 
                    />
                    <span>{t('UPI (Instant Node Settlement)')}</span>
                  </label>
                  <label className="radio-option-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '12.5px' }}>
                    <input 
                      type="radio" 
                      name="payOption" 
                      value="card" 
                      checked={paymentMethod === 'card'} 
                      onChange={() => setPaymentMethod('card')} 
                    />
                    <span>{t('Credit / Debit Card')}</span>
                  </label>
                  <label className="radio-option-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '12.5px' }}>
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

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingStep(1);
                      setBookingError('');
                    }}
                    className="category-filter-btn"
                    style={{ flex: 1, minHeight: '40px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 'bold' }}
                  >
                    {t('Back')}
                  </button>
                  <button
                    type="submit"
                    className="primary-action"
                    style={{ flex: 2, minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <CreditCard style={{ width: '16px', height: '16px' }} /> 
                    {t('Pay & Confirm')}
                  </button>
                </div>

                <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  🛡️ {t('Secure interoperable Beckn checkout gateway.')}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
