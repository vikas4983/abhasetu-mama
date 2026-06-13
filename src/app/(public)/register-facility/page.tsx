'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../providers/LanguageProvider';
import { showToast } from '../../../utils/toast';
import LogoLoader from '../../../components/common/LogoLoader';
import { 
  Building2, 
  Stethoscope, 
  FlaskConical, 
  Building, 
  Pill, 
  GraduationCap, 
  ShieldCheck, 
  User, 
  Upload, 
  FileText, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles 
} from 'lucide-react';

export default function RegisterFacilityPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<'hospital' | 'clinic' | 'lab' | 'diagnostic_centre' | 'pharmacy' | 'iqra_alumni' | 'insurance_org' | 'individual_doctor'>('hospital');
  const [selectedLogo, setSelectedLogo] = useState<string>('default');

  // Form fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [expertise, setExpertise] = useState('');
  
  // Role specific
  const [bedCount, setBedCount] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [testsCovered, setTestsCovered] = useState('');
  const [accreditation, setAccreditation] = useState('');
  const [imagingEquip, setImagingEquip] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [policiesCount, setPoliciesCount] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [coverageDetails, setCoverageDetails] = useState('');
  const [homeDelivery, setHomeDelivery] = useState(false);

  // File Upload states
  const [abdmDocUrl, setAbdmDocUrl] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [degreeDocUrl, setDegreeDocUrl] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    try {
      const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
      if (state.selectedLogo) {
        setSelectedLogo(state.selectedLogo);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'abdmDoc' | 'photo' | 'degreeDoc') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/abdm/admin/upload-doc', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        if (field === 'abdmDoc') setAbdmDocUrl(data.url);
        if (field === 'photo') setPhotoUrl(data.url);
        if (field === 'degreeDoc') setDegreeDocUrl(data.url);
        showToast(t('Document uploaded successfully.'));
      } else {
        showToast(data.message || t('File upload failed.'));
      }
    } catch (err) {
      showToast(t('Error uploading file.'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!name.trim()) {
        showToast(t('Please enter facility or organization name.'));
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        showToast(t('Please enter a valid login email address.'));
        return;
      }
      if (!password || password.length < 6) {
        showToast(t('Password must be at least 6 characters.'));
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!address.trim()) {
        showToast(t('Please enter complete physical address.'));
        return;
      }
      if (!contact.trim()) {
        showToast(t('Please enter a valid contact number.'));
        return;
      }
      setStep(4);
    } else if (step === 4) {
      // Validate step 4 specific fields
      if (selectedRole === 'hospital') {
        if (!bedCount) {
          showToast(t('Please enter total beds count.'));
          return;
        }
        if (!specialties.trim()) {
          showToast(t('Please enter key specialties.'));
          return;
        }
      } else if (selectedRole === 'clinic') {
        if (!specialties.trim()) {
          showToast(t('Please enter clinic specialties.'));
          return;
        }
        if (!consultationFee) {
          showToast(t('Please enter the consultation fee.'));
          return;
        }
      } else if (selectedRole === 'lab') {
        if (!testsCovered.trim()) {
          showToast(t('Please enter tests covered.'));
          return;
        }
        if (!accreditation.trim()) {
          showToast(t('Please enter lab accreditation body.'));
          return;
        }
      } else if (selectedRole === 'diagnostic_centre') {
        if (!testsCovered.trim()) {
          showToast(t('Please enter tests covered.'));
          return;
        }
        if (!imagingEquip.trim()) {
          showToast(t('Please enter imaging & diagnostic equipment.'));
          return;
        }
      } else if (selectedRole === 'pharmacy') {
        if (!licenseNumber.trim()) {
          showToast(t('Please enter state drug license number.'));
          return;
        }
      } else if (['iqra_alumni', 'insurance_org', 'individual_doctor'].includes(selectedRole)) {
        if (!licenseNumber.trim()) {
          showToast(t('Please enter license/registration number.'));
          return;
        }
        if (selectedRole === 'iqra_alumni') {
          if (!registrationId.trim()) {
            showToast(t('Please enter IQRA Alumni registration ID.'));
            return;
          }
          if (!expertise.trim()) {
            showToast(t('Please enter medical expertise/specialties.'));
            return;
          }
          if (!experienceYears) {
            showToast(t('Please enter years of experience.'));
            return;
          }
        } else if (selectedRole === 'individual_doctor') {
          if (!registrationId.trim()) {
            showToast(t('Please enter Doctor registration ID.'));
            return;
          }
          if (!expertise.trim()) {
            showToast(t('Please enter medical expertise/specialties.'));
            return;
          }
          if (!consultationFee) {
            showToast(t('Please enter consultation fee.'));
            return;
          }
        } else if (selectedRole === 'insurance_org') {
          if (!coverageDetails.trim()) {
            showToast(t('Please enter coverage details description.'));
            return;
          }
          if (!policiesCount) {
            showToast(t('Please enter active policies count.'));
            return;
          }
        }
      }
      setStep(5);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.push('/staff-login');
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (['hospital', 'clinic', 'lab', 'diagnostic_centre', 'pharmacy', 'insurance_org'].includes(selectedRole) && !abdmDocUrl) {
      showToast(t('Please upload the ABDM Approved Certificate.'));
      return;
    }
    if (['iqra_alumni', 'individual_doctor'].includes(selectedRole) && !degreeDocUrl) {
      showToast(t('Please upload the professional degree/certification.'));
      return;
    }

    setIsSubmitting(true);

    const payload = {
      email,
      password,
      role: selectedRole,
      name,
      address,
      contact,
      licenseNumber,
      registrationId,
      expertise,
      bedCount,
      specialties,
      testsCovered,
      accreditation,
      imagingEquip,
      experienceYears,
      policiesCount,
      consultationFee,
      coverageDetails,
      homeDelivery,
      abdmDoc: abdmDocUrl,
      photos: photoUrl,
      degreeDoc: degreeDocUrl
    };

    try {
      const res = await fetch('/api/abdm/admin/register-facility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(t('Registration submitted! Verification pending admin approval.'));
        setStep(6);
      } else {
        showToast(data.message || t('Failed to submit registration.'));
      }
    } catch (err) {
      showToast(t('Connection error while registering.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const facilityRoles = [
    { id: 'hospital', label: 'Hospital', icon: Building2, desc: 'NHA HFR hospitals' },
    { id: 'clinic', label: 'Clinic', icon: Stethoscope, desc: 'Clinics & health units' },
    { id: 'lab', label: 'Diagnostic Lab', icon: FlaskConical, desc: 'NABL diagnostics' },
    { id: 'diagnostic_centre', label: 'Diagnostic Center', icon: Building, desc: 'Imaging & screening' },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill, desc: 'Retail & online chemists' },
    { id: 'iqra_alumni', label: 'IQRA Alumni', icon: GraduationCap, desc: 'Help desk facilitators' },
    { id: 'insurance_org', label: 'Insurance Org', icon: ShieldCheck, desc: 'PM-JAY & private insurers' },
    { id: 'individual_doctor', label: 'Individual Doctor', icon: User, desc: 'Telehealth & freelance' }
  ];

  return (
    <div 
      className="login-container" 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        padding: isMobile ? '0' : '20px', 
        background: 'radial-gradient(circle at top, var(--bg-primary) 30%, #050a12 100%)',
        boxSizing: 'border-box'
      }}
    >
      <LogoLoader isLoading={isSubmitting} type="register" />
      
      {/* Mobile-First Layout Card Wrapper */}
      <div 
        style={{ 
          width: '100%', 
          maxWidth: isMobile ? '100%' : '420px', 
          minHeight: isMobile ? '100vh' : '650px',
          height: isMobile ? '100vh' : 'auto',
          background: 'var(--bg-card)', 
          border: isMobile ? 'none' : '1px solid var(--border-color)', 
          borderRadius: isMobile ? '0px' : '24px', 
          padding: isMobile ? '24px 16px' : '32px 24px', 
          boxShadow: isMobile ? 'none' : '0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)', 
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}
      >
        
        {/* Beautiful & Compact Back Button */}
        {step < 6 && (
          <button
            onClick={handleBack}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(20, 184, 166, 0.12)';
              e.currentTarget.style.borderColor = 'var(--accent-teal)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label={t('Back')}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
          </button>
        )}

        {/* Brand Logo Header */}
        <div className="logo" style={{ justifyContent: 'center', marginTop: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: 'transparent', 
              display: 'grid', 
              placeItems: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              src={selectedLogo === 'default' ? '/assets/logos/logo7.png' : selectedLogo}
              alt="Brand Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '15px', margin: 0, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>ABHA SETU</h1>
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{t('Multi-Role Facility Registry Portal')}</span>
          </div>
        </div>

        {/* 5-Step Progress Bar */}
        {step < 6 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', position: 'relative', padding: '0 8px' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'var(--border-color)', zIndex: 1 }} />
            <div style={{ position: 'absolute', top: '50%', left: 0, width: `${((step - 1) / 4) * 100}%`, height: '2px', background: 'var(--accent-teal)', zIndex: 2, transition: 'all 0.3s ease' }} />
            
            {[1, 2, 3, 4, 5].map(num => (
              <div 
                key={num} 
                style={{ 
                  width: '22px', 
                  height: '22px', 
                  borderRadius: '50%', 
                  background: step >= num ? 'var(--accent-teal)' : 'var(--bg-secondary)', 
                  border: step >= num ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)',
                  color: step >= num ? '#fff' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  zIndex: 3,
                  transition: 'all 0.3s ease'
                }}
              >
                {num}
              </div>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* STEP 1: Select Registry Type */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>{t('1. Select Registry Type')}</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {t('Choose your stakeholder category to get started.')}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '24px', flex: 1 }}>
                {facilityRoles.map(role => {
                  const Icon = role.icon;
                  const isSel = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id as any)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 6px',
                        borderRadius: '12px',
                        border: isSel ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)',
                        background: isSel ? 'rgba(20, 184, 166, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        color: isSel ? 'var(--accent-teal)' : 'var(--text-primary)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        gap: '6px'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isSel ? 'rgba(20, 184, 166, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSel ? 'var(--accent-teal)' : 'var(--text-secondary)'
                      }}>
                        <Icon style={{ width: '16px', height: '16px' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <strong style={{ fontSize: '10.5px', display: 'block', fontWeight: 600 }}>{t(role.label)}</strong>
                        <span style={{ fontSize: '8.5px', color: 'var(--text-secondary)', display: 'block', marginTop: '1px' }}>{t(role.desc)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="join-btn"
                style={{ width: '100%', minHeight: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: 'auto' }}
              >
                <span>{t('Continue to Credentials')}</span>
              </button>
            </div>
          )}

          {/* STEP 2: Account Credentials */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>{t('2. Account Credentials')}</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {t('Set up the login details for your secure portal access.')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {t('Facility / Organization Name')}
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('e.g. Apollo Hospital / Dr. Sharma')}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {t('Login Email Address')}
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@facility.com"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {t('Password')}
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="join-btn"
                style={{ width: '100%', minHeight: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' }}
              >
                <span>{t('Continue to Location')}</span>
              </button>
            </div>
          )}

          {/* STEP 3: Contact & Location */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>{t('3. Contact & Location')}</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {t('Provide physical contact coordinates for the registry listing.')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {t('Complete Physical Address')}
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Health Street, Sector 4..."
                    rows={3}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'none' }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {t('Contact Number')}
                  <input
                    type="tel"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g. 040-1234567"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="join-btn"
                style={{ width: '100%', minHeight: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' }}
              >
                <span>{t('Continue to Specifics')}</span>
              </button>
            </div>
          )}

          {/* STEP 4: Professional Parameters */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>
                {t('4. Details for ') + t(facilityRoles.find(r => r.id === selectedRole)?.label || '')}
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {t('Enter credentials and details specific to your role.')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                
                {/* Hospital Fields */}
                {selectedRole === 'hospital' && (
                  <>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {t('Total Beds Count')}
                      <input
                        type="number"
                        required
                        value={bedCount}
                        onChange={(e) => setBedCount(e.target.value)}
                        placeholder="e.g. 150"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {t('Key Specialties (comma separated)')}
                      <input
                        type="text"
                        required
                        value={specialties}
                        onChange={(e) => setSpecialties(e.target.value)}
                        placeholder="Cardiology, Pediatrics, ICU"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </label>
                  </>
                )}

                {/* Clinic Fields */}
                {selectedRole === 'clinic' && (
                  <>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {t('Clinic Specialties')}
                      <input
                        type="text"
                        required
                        value={specialties}
                        onChange={(e) => setSpecialties(e.target.value)}
                        placeholder="Pediatrics, General Medicine"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {t('Consultation Fee (INR)')}
                      <input
                        type="number"
                        required
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        placeholder="e.g. 500"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </label>
                  </>
                )}

                {/* Lab & Diagnostic Fields */}
                {['lab', 'diagnostic_centre'].includes(selectedRole) && (
                  <>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {t('Tests Covered / Specialties')}
                      <input
                        type="text"
                        required
                        value={testsCovered}
                        onChange={(e) => setTestsCovered(e.target.value)}
                        placeholder="CBC, Liver Profile, MRI, X-Ray"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </label>
                    {selectedRole === 'lab' ? (
                      <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {t('Lab Accreditation Body')}
                        <input
                          type="text"
                          required
                          value={accreditation}
                          onChange={(e) => setAccreditation(e.target.value)}
                          placeholder="e.g. NABL Accredited"
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </label>
                    ) : (
                      <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {t('Imaging Equipment')}
                        <input
                          type="text"
                          required
                          value={imagingEquip}
                          onChange={(e) => setImagingEquip(e.target.value)}
                          placeholder="1.5T Siemens MRI, GE CT Scanner"
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </label>
                    )}
                  </>
                )}

                {/* Pharmacy Fields */}
                {selectedRole === 'pharmacy' && (
                  <>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {t('Drug License Number')}
                      <input
                        type="text"
                        required
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="TS-DRUG-40292"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11.5px', color: 'var(--text-primary)', cursor: 'pointer', padding: '6px 0' }}>
                      <input
                        type="checkbox"
                        checked={homeDelivery}
                        onChange={(e) => setHomeDelivery(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent-teal)' }}
                      />
                      {t('Provides Home Delivery / होम डिलीवरी')}
                    </label>
                  </>
                )}

                {/* IQRA Alumni, Insurance, Doctors Fields */}
                {['iqra_alumni', 'insurance_org', 'individual_doctor'].includes(selectedRole) && (
                  <>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {t('License / Council Registration Number')}
                      <input
                        type="text"
                        required
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="e.g. MCI-12345 / IQRA-AL-987"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </label>
                  </>
                )}

                {/* IQRA Alumni / Doctor Specific */}
                {['iqra_alumni', 'individual_doctor'].includes(selectedRole) && (
                  <>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {selectedRole === 'iqra_alumni' ? t('Alumni Registration ID') : t('Doctor Registration ID')}
                      <input
                        type="text"
                        required
                        value={registrationId}
                        onChange={(e) => setRegistrationId(e.target.value)}
                        placeholder="e.g. REG-403920-IND"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {t('Medical Expertise / Specialties')}
                      <input
                        type="text"
                        required
                        value={expertise}
                        onChange={(e) => setExpertise(e.target.value)}
                        placeholder="Pediatric Care, Patient Navigation"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </label>
                    {selectedRole === 'iqra_alumni' ? (
                      <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {t('Years of Experience')}
                        <input
                          type="number"
                          required
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          placeholder="e.g. 5"
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </label>
                    ) : (
                      <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {t('Consultation Fee (INR)')}
                        <input
                          type="number"
                          required
                          value={consultationFee}
                          onChange={(e) => setConsultationFee(e.target.value)}
                          placeholder="e.g. 600"
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </label>
                    )}
                  </>
                )}

                {/* Insurance Specific */}
                {selectedRole === 'insurance_org' && (
                  <>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {t('Coverage Details Description')}
                      <textarea
                        required
                        value={coverageDetails}
                        onChange={(e) => setCoverageDetails(e.target.value)}
                        placeholder="Details of PM-JAY and cashless coverage policies..."
                        rows={2}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'none' }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {t('Active Policies Count')}
                      <input
                        type="number"
                        required
                        value={policiesCount}
                        onChange={(e) => setPoliciesCount(e.target.value)}
                        placeholder="e.g. 24"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </label>
                  </>
                )}

              </div>

              <button
                type="button"
                onClick={handleNext}
                className="join-btn"
                style={{ width: '100%', minHeight: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' }}
              >
                <span>{t('Continue to Attachments')}</span>
              </button>
            </div>
          )}

          {/* STEP 5: Attachments & Verification */}
          {step === 5 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>{t('5. Verify Credentials')}</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {t('Attach certification documents. Approved formats: PDF, PNG, JPG (Max 4MB).')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                
                {/* ABDM Certificate Upload */}
                {['hospital', 'clinic', 'lab', 'diagnostic_centre', 'pharmacy', 'insurance_org'].includes(selectedRole) && (
                  <div style={{ padding: '16px 12px', border: '1.5px dashed var(--border-color)', borderRadius: '10px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.01)', position: 'relative' }}>
                    <Upload style={{ width: '22px', height: '22px', margin: '0 auto 8px', color: abdmDocUrl ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: '11.5px', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>
                      {abdmDocUrl ? t('ABDM Certificate Attached') : t('Upload ABDM/HFR Certificate')}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {abdmDocUrl ? abdmDocUrl.split('/').pop() : t('Required for validation')}
                    </span>
                    <input 
                      type="file" 
                      required={!abdmDocUrl}
                      onChange={(e) => handleFileUpload(e, 'abdmDoc')}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                      disabled={isUploading}
                    />
                    {isUploading && <span style={{ fontSize: '10px', color: 'var(--accent-teal)' }}>Uploading...</span>}
                  </div>
                )}

                {/* Degree upload for Doctors / Alumni */}
                {['iqra_alumni', 'individual_doctor'].includes(selectedRole) && (
                  <div style={{ padding: '16px 12px', border: '1.5px dashed var(--border-color)', borderRadius: '10px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.01)', position: 'relative' }}>
                    <Upload style={{ width: '22px', height: '22px', margin: '0 auto 8px', color: degreeDocUrl ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: '11.5px', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>
                      {degreeDocUrl ? t('Degree Attached') : t('Upload Professional Degree')}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {degreeDocUrl ? degreeDocUrl.split('/').pop() : t('Required for registration')}
                    </span>
                    <input 
                      type="file" 
                      required={!degreeDocUrl}
                      onChange={(e) => handleFileUpload(e, 'degreeDoc')}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                      disabled={isUploading}
                    />
                    {isUploading && <span style={{ fontSize: '10px', color: 'var(--accent-teal)' }}>Uploading...</span>}
                  </div>
                )}

                {/* Optional facility outer photo */}
                {['hospital', 'clinic'].includes(selectedRole) && (
                  <div style={{ padding: '16px 12px', border: '1.5px dashed var(--border-color)', borderRadius: '10px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.01)', position: 'relative' }}>
                    <Upload style={{ width: '22px', height: '22px', margin: '0 auto 8px', color: photoUrl ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: '11.5px', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>
                      {photoUrl ? t('Photo Attached') : t('Upload Facility Image')}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {photoUrl ? photoUrl.split('/').pop() : t('Optional banner photo')}
                    </span>
                    <input 
                      type="file" 
                      onChange={(e) => handleFileUpload(e, 'photo')}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                      disabled={isUploading}
                    />
                  </div>
                )}

              </div>

              <button
                type="submit"
                className="join-btn"
                style={{ width: '100%', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: 'auto' }}
                disabled={isUploading || isSubmitting}
              >
                <Sparkles style={{ width: '14px', height: '14px' }} />
                <span>{t('Register and Request Access')}</span>
              </button>
            </form>
          )}

          {/* STEP 6: Success View */}
          {step === 6 && (
            <div style={{ textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
              <CheckCircle2 style={{ width: '56px', height: '56px', color: 'var(--accent-teal)', margin: '0 auto 16px', animation: 'scaleUp 0.3s ease-out' }} />
              
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>{t('Registration Submitted!')}</h2>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
                {t('Your facility registry application is successfully lodged. Administrators will audit your documents and verify credentials. You will receive an email once approved.')}
              </p>

              <button
                onClick={() => router.push('/staff-login')}
                className="join-btn"
                style={{ width: '100%', minHeight: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <span>{t('Return to Login')}</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
