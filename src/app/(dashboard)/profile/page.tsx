/**
 * @file        page.tsx
 * @description Advanced Profile dashboard featuring vertical grouped submenus, double-sided CR-80 PVC print preview, update profile photo (max 100kb), mobile/email modals, password setup, Re-KYC verification, Delete/Deactivate workflows, and mobile hamburger drawer.
 * @module      profile
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-14
 * @modified    2026-06-14
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import { showToast } from '../../../utils/toast';
import OtpInput from '../../../components/common/OtpInput';

import {
  User,
  ShieldCheck,
  Download,
  Database,
  Send,
  ArrowLeft,
  Phone,
  Mail,
  X,
  Lock,
  Unlock,
  Key,
  Printer,
  CreditCard,
  Camera,
  RefreshCw,
  UserMinus,
  ShieldAlert,
  Trash2,
  Eye,
  EyeOff,
  Menu,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

/**
 * Normalizes and returns the base64 source or static path of a profile image.
 * @param {string} photo - base64 string or image path
 * @returns {string} parsed image source
 */
const getPhotoSrc = (photo: string | undefined): string => {
  if (!photo) return 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150';
  if (photo.startsWith('data:') || photo.startsWith('http')) {
    return photo;
  }
  if (photo.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${photo}`;
  }
  if (photo.startsWith('/')) {
    return photo;
  }
  return `data:image/jpeg;base64,${photo}`;
};

/**
 * Maps gender letters/words to bilingual English/Hindi output.
 * @param {string} gender - gender string
 * @returns {string} bilingual gender description
 */
const getGenderDisplay = (gender: string | undefined): string => {
  if (!gender) return '';
  const g = gender.toLowerCase();
  if (g === 'male' || g === 'm') return 'Male / पुरुष';
  if (g === 'female' || g === 'f') return 'Female / महिला';
  return `${gender} / अन्य`;
};

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { currentUser, updateCurrentUser, addRecord, logout } = useAuth();

  // Active Management Section Modal / Submenu Panel states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shakeModal, setShakeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'my_profile' | 'edit_profile' | 'set_password' | 're_kyc' | 'deactivate_delete' | 'delink'>('my_profile');
  const [mobileCoolingTimer, setMobileCoolingTimer] = useState(0);
  const [emailCoolingTimer, setEmailCoolingTimer] = useState(0);
  const [isDemographicsExpanded, setIsDemographicsExpanded] = useState(false);
  const [editProfileSubTab, setEditProfileSubTab] = useState<'mobile' | 'email' | 'picture'>('mobile');

  useEffect(() => {
    const timer = setInterval(() => {
      setMobileCoolingTimer(prev => (prev > 0 ? prev - 1 : 0));
      setEmailCoolingTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Common Notification/State Triggers
  const triggerModalShake = () => {
    setShakeModal(true);
    setTimeout(() => setShakeModal(false), 500);
  };

  // State definitions for all Submenu Actions
  const abhaProfile = currentUser?.abhaProfile || {};

  // 1. Mobile Number Update States
  const [newMobile, setNewMobile] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileTxnId, setMobileTxnId] = useState('');
  const [mobileLoading, setMobileLoading] = useState(false);
  const [mobileError, setMobileError] = useState('');
  const [mobileOtpStep, setMobileOtpStep] = useState(false);

  // 2. Email Address Update States
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // 3. Profile Picture Update States (Max 100 KB constraint)
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [confirmPhotoModal, setConfirmPhotoModal] = useState(false);

  // 4. Set Password States
  const [passAuthMethod, setPassAuthMethod] = useState<'aadhaar' | 'abha'>('aadhaar');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passOtp, setPassOtp] = useState('');
  const [passOtpStep, setPassOtpStep] = useState(false);
  const [passTxnId, setPassTxnId] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // 5. Re-KYC Verification States
  const [reKycOtp, setReKycOtp] = useState('');
  const [reKycOtpStep, setReKycOtpStep] = useState(false);
  const [reKycTxnId, setReKycTxnId] = useState('');
  const [reKycLoading, setReKycLoading] = useState(false);
  const [reKycError, setReKycError] = useState('');
  const [reKycSuccess, setReKycSuccess] = useState(false);

  // 6. Deactivate / Delete ABHA States
  const [deactivateOption, setDeactivateOption] = useState<'deactivate' | 'delete'>('deactivate');
  const [deactivateAuthMethod, setDeactivateAuthMethod] = useState<'aadhaar' | 'abha'>('aadhaar');
  const [deactivateOtp, setDeactivateOtp] = useState('');
  const [deactivateOtpStep, setDeactivateOtpStep] = useState(false);
  const [deactivateTxnId, setDeactivateTxnId] = useState('');
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');
  const [deactivateConfirmed, setDeactivateConfirmed] = useState(false);

  // 7. Delink Mobile Number States
  const [delinkOtp, setDelinkOtp] = useState('');
  const [delinkOtpStep, setDelinkOtpStep] = useState(false);
  const [delinkTxnId, setDelinkTxnId] = useState('');
  const [delinkLoading, setDelinkLoading] = useState(false);
  const [delinkError, setDelinkError] = useState('');

  // OTP Countdown Timers
  const [resendTimer, setResendTimer] = useState(60);
  const [otpExpiryTimer, setOtpExpiryTimer] = useState(600);

  useEffect(() => {
    let timerId: any;
    if (mobileOtpStep || passOtpStep || reKycOtpStep || deactivateOtpStep || delinkOtpStep) {
      timerId = setInterval(() => {
        setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
        setOtpExpiryTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [mobileOtpStep, passOtpStep, reKycOtpStep, deactivateOtpStep, delinkOtpStep]);

  // General Error / Input Shake Helpers
  const resetAllForms = () => {
    setNewMobile('');
    setMobileOtp('');
    setMobileError('');
    setMobileOtpStep(false);

    setNewEmail('');
    setEmailError('');
    setEmailSent(false);

    setPhotoPreview('');
    setPhotoFile(null);
    setPhotoError('');

    setNewPassword('');
    setConfirmPassword('');
    setPassOtp('');
    setPassOtpStep(false);
    setPassError('');
    setPassSuccess(false);

    setReKycOtp('');
    setReKycOtpStep(false);
    setReKycError('');
    setReKycSuccess(false);

    setDeactivateOtp('');
    setDeactivateOtpStep(false);
    setDeactivateError('');
    setDeactivateConfirmed(false);

    setDelinkOtp('');
    setDelinkOtpStep(false);
    setDelinkError('');

    mobileForm.reset();
    emailForm.reset();
    passwordForm.reset();
  };

  // React Hook Form Instances for validated forms
  const mobileForm = useForm<{ newMobile: string }>({
    mode: 'onChange',
    defaultValues: { newMobile: '' }
  });

  const emailForm = useForm<{ newEmail: string }>({
    mode: 'onChange',
    defaultValues: { newEmail: '' }
  });

  const passwordForm = useForm<{ newPassword: string; confirmPassword: string }>({
    mode: 'onChange',
    defaultValues: { newPassword: '', confirmPassword: '' }
  });

  // Actions for Card Downloader
  const handleSaveToLocker = (cardName = 'ABHA_Smart_Card.pdf') => {
    if (!addRecord) return;
    const newRecord = {
      name: cardName,
      type: 'ID Card',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      source: 'National Health Authority',
    };
    addRecord(newRecord);
    showToast(t('ABHA ID Card successfully synced and saved inside secure Health Locker.'));
  };

  const handleDownloadCard = async () => {
    try {
      showToast(t('Downloading official ABHA Card image...'));
      const res = await fetch('/api/abdm/v3/profile/account/abha-card');
      if (!res.ok) {
        const errData = await res.json();
        const msg = errData.description || errData.message || t('Failed to download ABHA card');
        showToast(t('Error: ') + msg);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `ABHA_Smart_Card_${abhaProfile.ABHANumber || abhaProfile.abhaNumber || 'Verified'}.png`;
      link.href = url;
      link.click();
      window.URL.revokeObjectURL(url);
      showToast(t('ABHA Card downloaded successfully!'));
    } catch (err: any) {
      console.error(err);
      showToast(t('Failed to download card.'));
    }
  };

  const handlePrintCard = () => {
    const printContent = document.getElementById('abha-card-capture-profile');
    if (!printContent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print ABHA Card</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #ffffff;
              font-family: 'Inter', sans-serif;
            }
            .print-wrapper {
              display: flex;
              flex-direction: column;
              gap: 20px;
              align-items: center;
            }
            /* Styling matches setu-abha-card */
            .setu-abha-card {
              width: 440px;
              border-radius: 16px;
              overflow: hidden;
              border: 1px solid #cbd5e1;
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            }
            .setu-abha-card-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 10px 14px;
              background: #273890;
              border-bottom: 2px solid #10b981;
            }
            .setu-abha-card-body {
              position: relative;
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: stretch;
              gap: 12px;
              padding: 14px;
              background: radial-gradient(circle, #ffffff 0%, #f1f5f9 100%);
              color: #0f172a;
            }
            .setu-abha-card-avatar {
              width: 75px;
              height: 95px;
              border-radius: 6px;
              overflow: hidden;
              border: 1px solid #94a3b8;
            }
            .setu-abha-card-details {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 5px;
              text-align: left;
            }
            .setu-abha-card-label {
              font-size: 7px;
              color: #64748b;
              display: block;
              font-weight: 700;
            }
            .setu-abha-card-value {
              font-size: 11px;
              color: #0f172a;
              font-weight: 800;
              display: block;
            }
            .token-num {
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="print-wrapper">
            ${printContent.outerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintPvc = () => {
    const printContent = document.getElementById('abha-card-capture-profile');
    const pvcBackContent = document.getElementById('abha-card-pvc-back');
    if (!printContent || !pvcBackContent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print PVC ABHA Card</title>
          <style>
            @page {
              size: 85.6mm 54mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-family: 'Inter', sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .pvc-container {
              display: flex;
              flex-direction: column;
              gap: 15px;
              page-break-inside: avoid;
            }
            .setu-abha-card, .pvc-back-card {
              width: 85.6mm;
              height: 54mm;
              border-radius: 3.2mm;
              overflow: hidden;
              border: 0.5px solid #cbd5e1;
              box-shadow: none;
              page-break-after: always;
              box-sizing: border-box;
            }
            .setu-abha-card-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 2mm 3mm;
              background: #273890 !important;
              border-bottom: 0.5mm solid #10b981;
              color: #ffffff;
            }
            .setu-abha-card-body {
              display: flex;
              flex-direction: row;
              gap: 2.5mm;
              padding: 3mm;
              background: radial-gradient(circle, #ffffff 0%, #f1f5f9 100%) !important;
              height: calc(54mm - 11mm);
              box-sizing: border-box;
            }
            .setu-abha-card-avatar {
              width: 16mm;
              height: 21mm;
              border-radius: 1mm;
              border: 0.2mm solid #94a3b8;
              overflow: hidden;
            }
            .setu-abha-card-avatar img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .setu-abha-card-details {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 0.8mm;
              text-align: left;
            }
            .setu-abha-card-label {
              font-size: 5px;
              color: #64748b;
              font-weight: 700;
              display: block;
            }
            .setu-abha-card-value {
              font-size: 7.5px;
              color: #0f172a;
              font-weight: 800;
              display: block;
            }
            .token-num {
              font-family: monospace;
            }
            .setu-abha-card-qr-wrapper img {
              width: 14mm;
              height: 14mm;
            }
            /* PVC Back Styling */
            .pvc-back-card {
              background: radial-gradient(circle, #ffffff 0%, #f8fafc 100%) !important;
              display: flex;
              flex-direction: column;
              color: #0f172a;
            }
            .pvc-back-header {
              background: #273890;
              color: #ffffff;
              padding: 2mm;
              font-size: 6px;
              font-weight: 800;
              text-align: center;
              border-bottom: 0.5mm solid #10b981;
              text-transform: uppercase;
              letter-spacing: 0.2mm;
            }
            .pvc-back-body {
              padding: 3mm;
              display: flex;
              flex-direction: row;
              gap: 3mm;
              align-items: center;
              height: calc(54mm - 10mm);
              box-sizing: border-box;
            }
            .pvc-instructions {
              flex: 1;
              font-size: 5px;
              line-height: 1.3;
              color: #334155;
              text-align: left;
              margin: 0;
              padding-left: 2mm;
            }
            .pvc-instructions li {
              margin-bottom: 0.5mm;
            }
            .pvc-back-qr {
              border: 0.2mm solid #cbd5e1;
              padding: 0.5mm;
              background: #ffffff;
              border-radius: 1mm;
            }
          </style>
        </head>
        <body>
          <div class="pvc-container">
            ${printContent.outerHTML}
            ${pvcBackContent.outerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Submenu Submit Handlers (Modal Driven)

  // 1. Mobile update submit (receives validated data from RHF handleSubmit)
  const handleMobileSubmit = async (formData: { newMobile: string }) => {
    const mobile = formData.newMobile;
    setMobileLoading(true);
    setMobileError('');
    try {
      const res = await fetch('/api/abdm/v3/enrollment/request/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginHint: 'mobile',
          loginId: mobile,
          currentMobile: abhaProfile.mobile
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setNewMobile(mobile);
        setMobileTxnId(data.txnId);
        setMobileOtpStep(true);
        setMobileCoolingTimer(60);
        setResendTimer(60);
        setOtpExpiryTimer(600);
        showToast(t('Verification OTP sent successfully!'));
        setActiveModal('edit_mobile');
      } else {
        setMobileError(data.message || t('Failed to send OTP code.'));
        triggerModalShake();
      }
    } catch (err: any) {
      setMobileError(err.message || t('Network error requesting OTP.'));
      triggerModalShake();
    } finally {
      setMobileLoading(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    if (mobileOtp.length !== 6) {
      setMobileError(t('Please enter a 6-digit OTP.'));
      triggerModalShake();
      return;
    }
    setMobileLoading(true);
    setMobileError('');
    try {
      const res = await fetch('/api/abdm/v3/enrollment/auth/byAbdm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txnId: mobileTxnId,
          authData: {
            authMethods: ['otp'],
            otp: {
              txnId: mobileTxnId,
              otpValue: mobileOtp
            }
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const updatedProfile = { ...abhaProfile, mobile: newMobile };
        const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
        if (state.currentUser) {
          state.currentUser.abhaProfile = updatedProfile;
          localStorage.setItem('setu_state', JSON.stringify(state));
        }
        updateCurrentUser({ abhaProfile: updatedProfile });
        showToast(t('Mobile number updated successfully on ABHA card!'));
        setActiveModal(null);
        resetAllForms();
      } else {
        setMobileError(data.message || t('Invalid OTP. Please try again.'));
        triggerModalShake();
      }
    } catch (err: any) {
      setMobileError(err.message || t('OTP verification failed.'));
      triggerModalShake();
    } finally {
      setMobileLoading(false);
    }
  };

  // 2. Email link verification submit (receives validated data from RHF handleSubmit)
  const handleEmailSubmit = async (formData: { newEmail: string }) => {
    const email = formData.newEmail;
    setEmailLoading(true);
    setEmailError('');
    try {
      const res = await fetch('/api/abdm/v3/profile/account/request/emailVerificationLink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, currentEmail: abhaProfile.email })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setNewEmail(email);
        setEmailSent(true);
        setEmailCoolingTimer(60);
        showToast(t('Verification email sent successfully!'));
      } else {
        setEmailError(data.message || t('Failed to send verification link.'));
        triggerModalShake();
      }
    } catch (err: any) {
      setEmailError(err.message || t('Network error.'));
      triggerModalShake();
    } finally {
      setEmailLoading(false);
    }
  };

  const simulateEmailConfirmation = () => {
    setEmailLoading(true);
    setTimeout(() => {
      const updatedProfile = { ...abhaProfile, email: newEmail };
      const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
      if (state.currentUser) {
        state.currentUser.abhaProfile = updatedProfile;
        localStorage.setItem('setu_state', JSON.stringify(state));
      }
      updateCurrentUser({ abhaProfile: updatedProfile });
      showToast(t('Email address successfully verified and updated on ABHA card!'));
      setEmailLoading(false);
      setActiveModal(null);
      resetAllForms();
    }, 1200);
  };

  // 3. Photo upload submit (Max 100 KB constraint)
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format
    const validFormats = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validFormats.includes(file.type)) {
      setPhotoError(t('Invalid format. Please upload JPEG, JPG or PNG.'));
      triggerModalShake();
      return;
    }

    // Validate file size (100 KB max limit)
    if (file.size > 100 * 1024) {
      setPhotoError(t('File size exceeds 100 KB. Please upload a smaller image.'));
      triggerModalShake();
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUploadSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!photoPreview) {
      setPhotoError(t('Please select a photo first.'));
      triggerModalShake();
      return;
    }

    setPhotoLoading(true);
    setPhotoError('');
    try {
      const cleanedBase64 = photoPreview.replace(/^data:image\/[a-z]+;base64,/, '');
      const res = await fetch('/api/abdm/v3/profile/account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profilePhoto: cleanedBase64
        })
      });

      const data = await res.json();
      if (res.ok) {
        const updatedProfile = { 
          ...abhaProfile, 
          photo: cleanedBase64,
          profilePhoto: cleanedBase64
        };
        const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
        if (state.currentUser) {
          state.currentUser.photo = photoPreview;
          state.currentUser.abhaProfile = updatedProfile;
          localStorage.setItem('setu_state', JSON.stringify(state));
        }
        updateCurrentUser({
          photo: photoPreview,
          abhaProfile: updatedProfile
        });
        showToast(t('ABHA card profile photo updated successfully!'));
        setPhotoLoading(false);
        setActiveModal(null);
        setConfirmPhotoModal(false);
        resetAllForms();
      } else {
        const errorMsg = data.ProfilePhoto || data.message || t('Failed to upload picture.');
        setPhotoError(errorMsg);
        setPhotoLoading(false);
        triggerModalShake();
      }
    } catch (err: any) {
      setPhotoError(err.message || t('Failed to upload picture.'));
      setPhotoLoading(false);
      triggerModalShake();
    }
  };

  // 4. Set Password Actions (receives validated data from RHF handleSubmit)
  const handleSetPasswordSubmit = async (formData: { newPassword: string; confirmPassword: string }) => {
    setNewPassword(formData.newPassword);
    setConfirmPassword(formData.confirmPassword);
    setPassError('');
    setPassLoading(true);
    try {
      const res = await fetch('/api/abdm/v3/enrollment/request/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginHint: passAuthMethod === 'aadhaar' ? 'aadhaar' : 'mobile',
          loginId: passAuthMethod === 'aadhaar' ? '919981057765' : abhaProfile.mobile
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setPassTxnId(data.txnId);
        setPassOtpStep(true);
        setResendTimer(60);
        setOtpExpiryTimer(600);
        showToast(t('Security OTP sent successfully!'));
      } else {
        setPassError(data.message || t('Failed to send OTP code.'));
        triggerModalShake();
      }
    } catch (err: any) {
      setPassError(t('Network error.'));
      triggerModalShake();
    } finally {
      setPassLoading(false);
    }
  };

  const handleVerifyPasswordOtp = async () => {
    if (passOtp.length !== 6) {
      setPassError(t('Please enter a 6-digit OTP.'));
      triggerModalShake();
      return;
    }
    setPassLoading(true);
    setPassError('');
    try {
      setTimeout(() => {
        if (passOtp === '123456') {
          showToast(t('ABHA secure password set successfully!'));
          setPassSuccess(true);
          setPassLoading(false);
          setTimeout(() => {
            setActiveModal(null);
            resetAllForms();
          }, 1500);
        } else {
          setPassError(t('Invalid OTP. Use simulated code: 123456'));
          setPassLoading(false);
          triggerModalShake();
        }
      }, 1200);
    } catch (err) {
      setPassError(t('Verification failed.'));
      setPassLoading(false);
      triggerModalShake();
    }
  };

  // 5. Re-KYC Verification Actions
  const handleRequestReKycOtp = async () => {
    setReKycLoading(true);
    setReKycError('');
    try {
      const res = await fetch('/api/abdm/v3/profile/account/request/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abhaNumber: abhaProfile.ABHANumber
        })
      });
      const data = await res.json();
      if (res.ok && (data.status === 'success' || data.txnId)) {
        setReKycTxnId(data.txnId);
        setReKycOtpStep(true);
        setResendTimer(60);
        setOtpExpiryTimer(600);
        showToast(t('Re-KYC verification OTP sent!'));
        setActiveModal('re_kyc');
      } else {
        const errMsg = data.scope || 
                       data.loginId || 
                       data.loginHint || 
                       data.message || 
                       data.description || 
                       t('Failed to send OTP code.');
        setReKycError(errMsg);
        showToast(errMsg);
        triggerModalShake();
      }
    } catch (err: any) {
      setReKycError(t('Network error.'));
      triggerModalShake();
    } finally {
      setReKycLoading(false);
    }
  };

  const handleVerifyReKycOtp = async () => {
    if (reKycOtp.length !== 6) {
      setReKycError(t('Please enter a 6-digit OTP.'));
      triggerModalShake();
      return;
    }
    setReKycLoading(true);
    setReKycError('');
    try {
      const res = await fetch('/api/abdm/v3/profile/account/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: reKycOtp,
          txnId: reKycTxnId
        })
      });
      const data = await res.json();
      if (res.ok && (data.authResult === 'success' || data.status === 'success' || data.message === 'Re-kyc done successfully')) {
        const successMsg = data.message || t('Re-KYC done successfully');
        showToast(successMsg);
        setReKycSuccess(true);
        setReKycLoading(false);
        setTimeout(() => {
          setActiveModal(null);
          resetAllForms();
        }, 3000);
      } else {
        const errMsg = data.Message || 
                       data.message || 
                       (data.txnId && data.txnId.toLowerCase().includes('invalid') ? data.txnId : null) ||
                       data.otpValue || 
                       data.authMethods || 
                       data.scope || 
                       data.description || 
                       t('Re-KYC failed.');
        setReKycError(errMsg);
        showToast(errMsg);
        setReKycLoading(false);
        triggerModalShake();
      }
    } catch (err: any) {
      setReKycError(t('Network error.'));
      setReKycLoading(false);
      triggerModalShake();
    }
  };

  // 6. Deactivate / Delete ABHA Actions
  const handleDeactivateRequest = async () => {
    setDeactivateLoading(true);
    setDeactivateError('');
    try {
      const res = await fetch('/api/abdm/v3/enrollment/request/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginHint: deactivateAuthMethod === 'aadhaar' ? 'aadhaar' : 'mobile',
          loginId: deactivateAuthMethod === 'aadhaar' ? '919981057765' : abhaProfile.mobile
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setDeactivateTxnId(data.txnId);
        setDeactivateOtpStep(true);
        setResendTimer(60);
        setOtpExpiryTimer(600);
        showToast(t('Account change verification OTP sent!'));
      } else {
        setDeactivateError(data.message || t('Failed to send OTP code.'));
        triggerModalShake();
      }
    } catch (err) {
      setDeactivateError(t('Network error.'));
      triggerModalShake();
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleVerifyDeactivateOtp = async () => {
    if (deactivateOtp.length !== 6) {
      setDeactivateError(t('Please enter a 6-digit OTP.'));
      triggerModalShake();
      return;
    }
    setDeactivateLoading(true);
    setDeactivateError('');
    try {
      setTimeout(() => {
        if (deactivateOtp === '123456') {
          setDeactivateConfirmed(true);
          setDeactivateLoading(false);
          showToast(deactivateOption === 'deactivate' ? t('ABHA number temporarily deactivated.') : t('ABHA number permanently deleted.'));
          setTimeout(() => {
            setActiveModal(null);
            resetAllForms();
            logout();
            router.push('/login');
          }, 2000);
        } else {
          setDeactivateError(t('Invalid OTP. Use simulated code: 123456'));
          setDeactivateLoading(false);
          triggerModalShake();
        }
      }, 1200);
    } catch (err) {
      setDeactivateError(t('Action failed.'));
      setDeactivateLoading(false);
      triggerModalShake();
    }
  };

  // 7. Delink Mobile Actions
  const handleRequestDelinkOtp = async () => {
    setDelinkLoading(true);
    setDelinkError('');
    try {
      const res = await fetch('/api/abdm/v3/enrollment/request/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginHint: 'mobile',
          loginId: abhaProfile.mobile
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setDelinkTxnId(data.txnId);
        setDelinkOtpStep(true);
        setResendTimer(60);
        setOtpExpiryTimer(600);
        showToast(t('Delink verification OTP sent successfully!'));
      } else {
        setDelinkError(data.message || t('Failed to send OTP code.'));
        triggerModalShake();
      }
    } catch (err) {
      setDelinkError(t('Network error.'));
      triggerModalShake();
    } finally {
      setDelinkLoading(false);
    }
  };

  const handleVerifyDelinkOtp = async () => {
    if (delinkOtp.length !== 6) {
      setDelinkError(t('Please enter a 6-digit OTP.'));
      triggerModalShake();
      return;
    }
    setDelinkLoading(true);
    setDelinkError('');
    try {
      setTimeout(() => {
        if (delinkOtp === '123456') {
          showToast(t('Mobile number delinked successfully! Logging out.'));
          setDelinkLoading(false);
          setTimeout(() => {
            setActiveModal(null);
            resetAllForms();
            logout();
            router.push('/login');
          }, 1500);
        } else {
          setDelinkError(t('Invalid OTP. Use simulated code: 123456'));
          setDelinkLoading(false);
          triggerModalShake();
        }
      }, 1200);
    } catch (err) {
      setDelinkError(t('Delink failed.'));
      setDelinkLoading(false);
      triggerModalShake();
    }
  };

  // Submenu configuration
  const submenus = [
    { id: 'my_profile', label: t('My Profile'), icon: User },
    { id: 'edit_profile', label: t('Edit Profile'), icon: Camera },
    { id: 'set_password', label: t('Set Password'), icon: Key },
    { id: 're_kyc', label: t('Re-KYC Verification'), icon: RefreshCw },
    { id: 'deactivate_delete', label: t('Deactivate/Delete ABHA'), icon: ShieldAlert },
    { id: 'delink', label: t('Delink Mobile Number'), icon: UserMinus }
  ];

  if (!currentUser || !currentUser.abhaProfile) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-primary)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{t('Access Denied')}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
          {t('Please verify or link your ABHA card first to view this profile dashboard.')}
        </p>
        <button
          onClick={() => router.push('/abha')}
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            background: 'var(--accent-teal)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {t('Go to ABHA Onboarding')}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 16px', maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.push('/abha')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
            aria-label="Back"
          >
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
          </button>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {t('My ABHA Profile')}
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Manage secure demographics, linked mobile and email address verification
            </span>
          </div>
        </div>

        {/* Mobile menu toggle hamburger (3 lines icon) */}
        <button
          className="mobile-menu-toggle-btn"
          onClick={() => setMobileMenuOpen(true)}
          style={{
            background: 'rgba(20, 184, 166, 0.08)',
            border: '1px solid rgba(20, 184, 166, 0.2)',
            borderRadius: '8px',
            padding: '8px',
            color: 'var(--accent-teal)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Toggle settings menu"
        >
          <Menu style={{ width: '20px', height: '20px' }} />
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '24px',
        width: '100%',
        alignItems: 'start'
      }} className="profile-grid">
        
        {/* CSS grid media query support for desktop layout */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media (min-width: 900px) {
            .profile-grid {
              grid-template-columns: 280px 1fr !important;
            }
            .mobile-menu-toggle-btn {
              display: none !important;
            }
            .desktop-menu-sidebar {
              display: flex !important;
              order: 1 !important;
            }
            .active-tab-content-panel {
              order: 2 !important;
            }
          }
          @media (max-width: 899px) {
            .mobile-menu-toggle-btn {
              display: flex !important;
            }
            .desktop-menu-sidebar {
              display: none !important;
            }
          }
        `}} />

        {/* Left Side (on Desktop): Submenu list as vertical navigation tabs */}
        <div className="desktop-menu-sidebar" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'left'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            {t('ABHA Menu')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {submenus.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(20, 184, 166, 0.08)' : 'transparent',
                    border: isActive ? '1px solid var(--accent-teal)' : '1px solid transparent',
                    color: isActive ? 'var(--accent-teal)' : 'var(--text-primary)',
                    fontSize: '12.5px',
                    fontWeight: isActive ? 700 : 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon style={{ width: '15px', height: '15px', color: isActive ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
                    {item.label}
                  </span>
                  <ChevronRight style={{ width: '12px', height: '12px', color: isActive ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side / Active Tab content */}
        <div className="active-tab-content-panel" style={{ width: '100%' }}>
          
          {/* TAB 1: My Profile */}
          {activeTab === 'my_profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%' }}>
              <style dangerouslySetInnerHTML={{ __html: `
                .profile-layout-container {
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  justify-content: center;
                  gap: 28px;
                  width: 100%;
                  max-width: 680px;
                  margin-bottom: 8px;
                }
                .profile-actions-stack {
                  display: flex;
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 16px;
                }
                @media (max-width: 680px) {
                  .profile-layout-container {
                    flex-direction: column;
                    gap: 16px;
                  }
                  .profile-actions-stack {
                    flex-direction: row;
                    flex-wrap: wrap;
                    justify-content: center;
                    align-items: center;
                    gap: 10px 18px;
                    margin-top: 8px;
                  }
                }
              `}} />

              <div className="profile-layout-container">
                <article 
                  id="abha-card-capture-profile"
                  className="setu-abha-card" 
                  style={{ 
                    width: '100%',
                    maxWidth: '440px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontFamily: "'Inter', sans-serif",
                    flexShrink: 0
                  }}
                >
                  <div 
                    className="setu-abha-card-header" 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '10px 14px', 
                      background: '#273890', 
                      borderBottom: '2px solid #10b981' 
                    }}
                  >
                    <div style={{ height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img
                        src="/nha.png"
                        alt="NHA Logo"
                        style={{ height: '100%', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                      />
                    </div>
                    <div style={{ textAlign: 'center', color: '#ffffff', flex: 1, padding: '0 6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Ayushman Bharat Health Account</span>
                      <span style={{ fontSize: '9px', opacity: 0.9, fontWeight: 600 }}>आयुष्मान भारत स्वास्थ्य खाता (आभा)</span>
                    </div>
                    <div style={{ height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img
                        src="/abdm_new.png"
                        alt="ABDM Logo"
                        style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                  
                  <div 
                    className="setu-abha-card-body" 
                    style={{ 
                      position: 'relative', 
                      display: 'flex', 
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'stretch',
                      gap: '12px', 
                      padding: '14px', 
                      background: 'radial-gradient(circle, #ffffff 0%, #f1f5f9 100%)', 
                      color: '#0f172a' 
                    }}
                  >
                    <div className="setu-abha-card-avatar-wrapper" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                      <div className="setu-abha-card-avatar" style={{ width: '75px', height: '95px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #94a3b8', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <img
                          src={getPhotoSrc(abhaProfile.photo || abhaProfile.profilePhoto || currentUser.photo)}
                          alt={abhaProfile.name || abhaProfile.firstName || 'ABHA User'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150';
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="setu-abha-card-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left', minWidth: 0 }}>
                      <div className="setu-abha-card-field">
                        <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>Name / नाम</span>
                        <strong className="setu-abha-card-value" style={{ fontSize: '11px', color: '#0f172a', fontWeight: '800', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {abhaProfile.name ||
                            [abhaProfile.firstName, abhaProfile.middleName, abhaProfile.lastName].filter(Boolean).join(' ') ||
                            currentUser.name}
                        </strong>
                      </div>
                      
                      <div className="setu-abha-card-field">
                        <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>ABHA Number / आभा संख्या</span>
                        <strong className="setu-abha-card-value token-num" style={{ fontSize: '11px', color: 'var(--accent-blue)', fontFamily: 'monospace', fontWeight: 800 }}>
                          {abhaProfile.ABHANumber || abhaProfile.abhaNumber}
                        </strong>
                      </div>
                      
                      <div className="setu-abha-card-field">
                        <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>ABHA Address / आभा पता</span>
                        <strong className="setu-abha-card-value token-num" style={{ color: '#0f172a', fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all' }}>
                          {abhaProfile.preferredAbhaAddress || abhaProfile.preferredAddress || abhaProfile.abhaAddress || abhaProfile.abhaId || (abhaProfile.phrAddress && abhaProfile.phrAddress.join(", "))}
                        </strong>
                      </div>
                      
                      <div className="setu-abha-card-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', marginTop: '2px' }}>
                        <div className="setu-abha-card-field">
                          <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>Gender / लिंग</span>
                          <span className="setu-abha-card-value" style={{ fontSize: '9px', fontWeight: 600 }}>
                            {getGenderDisplay(abhaProfile.gender)}
                          </span>
                        </div>
                        <div className="setu-abha-card-field">
                          <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>DOB / जन्म तिथि</span>
                          <span className="setu-abha-card-value" style={{ fontSize: '9px', fontWeight: 600 }}>{abhaProfile.dob}</span>
                        </div>
                        <div className="setu-abha-card-field" style={{ gridColumn: 'span 2' }}>
                          <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>Mobile / मोबाइल</span>
                          <span className="setu-abha-card-value" style={{ fontSize: '9px', fontWeight: 600 }}>{abhaProfile.mobile}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="setu-abha-card-qr-wrapper" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="setu-abha-card-qr" style={{ padding: '4px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ABHA:${abhaProfile.ABHANumber || abhaProfile.abhaNumber};${abhaProfile.preferredAddress || abhaProfile.abhaAddress}`}
                          alt="ABHA QR"
                          style={{ width: '68px', height: '68px', display: 'block' }}
                        />
                      </div>
                    </div>
                  </div>
                </article>

                <div className="profile-actions-stack">
                  <button
                    onClick={handleDownloadCard}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px 6px',
                      color: 'var(--accent-teal)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Download style={{ width: '15px', height: '15px' }} />
                    <span>Download ABHA</span>
                  </button>

                  <button
                    onClick={handlePrintCard}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px 6px',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Printer style={{ width: '15px', height: '15px', color: 'var(--accent-teal)' }} />
                    <span>Print ABHA</span>
                  </button>

                  <button
                    onClick={() => setActiveModal('print_pvc')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px 6px',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <CreditCard style={{ width: '15px', height: '15px', color: 'var(--accent-teal)' }} />
                    <span>Print PVC</span>
                  </button>

                  <button
                    onClick={() => handleSaveToLocker(`ABHA_Smart_Card_${abhaProfile.ABHANumber || abhaProfile.abhaNumber}.pdf`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px 6px',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Database style={{ width: '15px', height: '15px', color: 'var(--accent-teal)' }} />
                    <span>Save to Locker</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Demographics Card */}
              <div 
                style={{ 
                  width: '100%', 
                  maxWidth: '680px', 
                  background: 'var(--bg-secondary)', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-color)', 
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setIsDemographicsExpanded(!isDemographicsExpanded)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--text-primary)'
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isDemographicsExpanded ? (
                      <ChevronDown style={{ width: '14px', height: '14px', color: 'var(--accent-teal)' }} />
                    ) : (
                      <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                    )}
                    <span>{t('Demographic Details')}</span>
                  </span>

                  {/* ABHA Status Active badge if active */}
                  {(abhaProfile.abhaStatus === 'ACTIVE' || abhaProfile.status === 'ACTIVE' || abhaProfile.abhaStatus === undefined) && (
                    <span 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        color: 'var(--success)', 
                        fontWeight: 700, 
                        fontSize: '10px' 
                      }} 
                      title="Abha Status: ACTIVE"
                    >
                      <img src="/assets/check_icon.png" alt="Active" style={{ width: '12px', height: '12px' }} />
                      <span>{t('ACTIVE')}</span>
                    </span>
                  )}
                </button>

                {isDemographicsExpanded && (
                  <div 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '12px', 
                      padding: '0 16px 16px 16px', 
                      fontSize: '11px', 
                      textAlign: 'left', 
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '16px'
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('Mobile Number')}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{abhaProfile.mobile || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('Email Address')}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{abhaProfile.email || 'Not verified'}</span>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('Street Address')}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{abhaProfile.address || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('District & State')}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{(abhaProfile.districtName || abhaProfile.district) || 'N/A'}, {(abhaProfile.stateName || abhaProfile.state) || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('Pin Code')}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{abhaProfile.pinCode || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Edit Profile */}
          {activeTab === 'edit_profile' && (
            <div className="edit-profile-container">
              <style dangerouslySetInnerHTML={{ __html: `
                @media (max-width: 900px) {
                  .edit-profile-container {
                    position: fixed !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    top: 0 !important;
                    background: rgba(15, 23, 42, 0.6) !important;
                    backdrop-filter: blur(8px) !important;
                    z-index: 9995 !important;
                    display: flex !important;
                    align-items: flex-end !important;
                    justify-content: center !important;
                  }
                  .edit-profile-card {
                    border-bottom-left-radius: 0 !important;
                    border-bottom-right-radius: 0 !important;
                    border-top-left-radius: 24px !important;
                    border-top-right-radius: 24px !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    background: var(--bg-card) !important;
                    padding: 24px !important;
                    animation: modal-slide-up 0.3s ease-out !important;
                    box-shadow: 0 -10px 25px rgba(0,0,0,0.15) !important;
                    max-height: 85vh !important;
                    overflow-y: auto !important;
                  }
                  .edit-profile-mobile-header {
                    display: flex !important;
                  }
                }
              `}} />
              <div 
                className="edit-profile-card"
                style={{
                  display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left',
                  width: '100%'
                }}
              >
                {/* Mobile close header */}
                <div className="edit-profile-mobile-header" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {t('Edit Profile')}
                  </h3>
                  <button 
                    onClick={() => setActiveTab('my_profile')} 
                    style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <X style={{ width: '20px', height: '20px' }} />
                  </button>
                </div>
              
              {/* Inner Sub-Tabs for Edit Profile */}
              <div style={{ 
                display: 'flex', 
                gap: '4px', 
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '4px',
                width: '100%',
                maxWidth: '440px',
                overflowX: 'auto'
              }}>
                <button
                  type="button"
                  onClick={() => setEditProfileSubTab('mobile')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: editProfileSubTab === 'mobile' ? 'var(--accent-teal)' : 'transparent',
                    color: editProfileSubTab === 'mobile' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Phone style={{ width: '13px', height: '13px' }} />
                  {t('Mobile')}
                </button>
                <button
                  type="button"
                  onClick={() => setEditProfileSubTab('email')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: editProfileSubTab === 'email' ? 'var(--accent-teal)' : 'transparent',
                    color: editProfileSubTab === 'email' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Mail style={{ width: '13px', height: '13px' }} />
                  {t('Email')}
                </button>
                <button
                  type="button"
                  onClick={() => setEditProfileSubTab('picture')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: editProfileSubTab === 'picture' ? 'var(--accent-teal)' : 'transparent',
                    color: editProfileSubTab === 'picture' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Camera style={{ width: '13px', height: '13px' }} />
                  {t('Photo')}
                </button>
              </div>

              {/* Sub-tab 1: Update Mobile Number */}
              {editProfileSubTab === 'mobile' && (
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', animation: 'fadeIn 0.25s ease' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
                    <span>Update Mobile Number</span>
                  </h4>
                  <form onSubmit={mobileForm.handleSubmit(handleMobileSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Current Mobile Number</span>
                      <input type="text" value={abhaProfile.mobile || 'N/A'} disabled style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-muted)', marginTop: '4px', cursor: 'not-allowed', letterSpacing: '2px', fontSize: '13px' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>New Mobile Number</span>
                      <div style={{ position: 'relative', marginTop: '4px' }}>
                        {(() => {
                          const { onChange: onMobileChange, ...mobileReg } = mobileForm.register('newMobile', {
                            required: t('Mobile number is required.'),
                            pattern: { value: /^\d{10}$/, message: t('Please enter a valid 10-digit mobile number.') },
                            validate: (val) => val !== abhaProfile.mobile || t('New mobile cannot be the same as current mobile.')
                          });
                          return (
                            <input 
                              type="tel" 
                              maxLength={10}
                              placeholder="Enter 10-digit mobile number" 
                              disabled={mobileLoading || mobileCoolingTimer > 0}
                              {...mobileReg}
                              onChange={async (e) => {
                                const cleaned = e.target.value.replace(/\D/g, '');
                                e.target.value = cleaned;
                                await onMobileChange(e);
                                setMobileError('');
                              }}
                              style={{ 
                                width: '100%', padding: '10px 36px 10px 10px', borderRadius: '8px', 
                                border: (mobileForm.formState.errors.newMobile || mobileError) ? '2px solid var(--danger)' : mobileForm.watch('newMobile')?.length === 10 && !mobileForm.formState.errors.newMobile ? '2px solid var(--success)' : '1px solid var(--border-color)', 
                                background: 'var(--bg-primary)', color: 'var(--text-primary)',
                                boxShadow: (mobileForm.formState.errors.newMobile || mobileError) ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                                animation: (mobileForm.formState.errors.newMobile || mobileError) ? 'otp-shake 0.4s ease' : 'none',
                                opacity: (mobileLoading || mobileCoolingTimer > 0) ? 0.6 : 1,
                                cursor: (mobileLoading || mobileCoolingTimer > 0) ? 'not-allowed' : 'auto',
                                letterSpacing: '2px', fontSize: '13px'
                              }} 
                            />
                          );
                        })()}
                        {/* Green check circle for valid filled state */}
                        {mobileForm.watch('newMobile')?.length === 10 && !mobileForm.formState.errors.newMobile && !mobileError && (
                          <img 
                            src="/assets/check_icon.png" 
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px' }} 
                            alt="Verified" 
                          />
                        )}
                      </div>
                    </div>
                    {mobileForm.formState.errors.newMobile && <div style={{ color: 'var(--danger)', fontSize: '11.5px', fontWeight: 600 }}>{mobileForm.formState.errors.newMobile.message}</div>}
                    {mobileError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{mobileError}</div>}
                    <button 
                      type="submit" 
                      disabled={mobileLoading || mobileCoolingTimer > 0} 
                      style={{ 
                        width: 'fit-content', padding: '10px 20px', borderRadius: '8px', border: 'none', 
                        background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: (mobileLoading || mobileCoolingTimer > 0) ? 'not-allowed' : 'pointer',
                        opacity: (mobileLoading || mobileCoolingTimer > 0) ? 0.7 : 1
                      }}
                    >
                      {mobileLoading ? 'Sending...' : mobileCoolingTimer > 0 ? `Resend OTP in ${mobileCoolingTimer}s` : 'Request OTP / ओटीपी प्राप्त करें'}
                    </button>
                  </form>
                </div>
              )}

              {/* Sub-tab 2: Link & Verify Email */}
              {editProfileSubTab === 'email' && (
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', animation: 'fadeIn 0.25s ease' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
                    <span>Link & Verify Email</span>
                  </h4>
                  
                  <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Current Email Address</span>
                      <input type="text" value={abhaProfile.email || 'Not verified'} disabled style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-muted)', marginTop: '4px', cursor: 'not-allowed' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>New Email Address</span>
                      <div style={{ position: 'relative', marginTop: '4px' }}>
                        <input 
                          type="email" 
                          placeholder="Enter email address (e.g. name@domain.com)" 
                          disabled={emailLoading || emailCoolingTimer > 0}
                          {...emailForm.register('newEmail', {
                            required: t('Email address is required.'),
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('Please enter a valid email address (e.g. name@domain.com).') },
                            validate: (val) => val !== abhaProfile.email || t('New email cannot be the same as current email.')
                          })}
                          style={{ 
                            width: '100%', padding: '10px 36px 10px 10px', borderRadius: '8px', 
                            border: (emailForm.formState.errors.newEmail || emailError) ? '2px solid var(--danger)' : emailForm.watch('newEmail') && !emailForm.formState.errors.newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.watch('newEmail') || '') ? '2px solid var(--success)' : '1px solid var(--border-color)', 
                            background: 'var(--bg-primary)', color: 'var(--text-primary)',
                            boxShadow: (emailForm.formState.errors.newEmail || emailError) ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                            animation: (emailForm.formState.errors.newEmail || emailError) ? 'otp-shake 0.4s ease' : 'none',
                            opacity: (emailLoading || emailCoolingTimer > 0) ? 0.6 : 1,
                            cursor: (emailLoading || emailCoolingTimer > 0) ? 'not-allowed' : 'auto'
                          }} 
                        />
                        {/* Green check circle for valid filled state */}
                        {emailForm.watch('newEmail') && !emailForm.formState.errors.newEmail && !emailError && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.watch('newEmail') || '') && (
                          <img 
                            src="/assets/check_icon.png" 
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px' }} 
                            alt="Verified" 
                          />
                        )}
                      </div>
                    </div>
                    {emailForm.formState.errors.newEmail && <div style={{ color: 'var(--danger)', fontSize: '11.5px', fontWeight: 600 }}>{emailForm.formState.errors.newEmail.message}</div>}
                    {emailError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{emailError}</div>}
                    
                    <button 
                      type="submit" 
                      disabled={emailLoading || emailCoolingTimer > 0} 
                      style={{ 
                        width: 'fit-content', padding: '10px 20px', borderRadius: '8px', border: 'none', 
                        background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: (emailLoading || emailCoolingTimer > 0) ? 'not-allowed' : 'pointer',
                        opacity: (emailLoading || emailCoolingTimer > 0) ? 0.7 : 1
                      }}
                    >
                      {emailLoading ? 'Sending link...' : emailCoolingTimer > 0 ? `Resend Link in ${emailCoolingTimer}s` : 'Send Verification Link'}
                    </button>
                  </form>

                  {emailSent && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'center', maxWidth: '400px', margin: '20px auto 0 auto', padding: '16px', background: 'rgba(20, 184, 166, 0.04)', borderRadius: '12px', border: '1px dashed var(--accent-teal)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
                        <Mail style={{ width: '20px', height: '20px' }} />
                      </div>
                      <h5 style={{ margin: '4px 0 2px', fontWeight: 800 }}>Verification Link Sent</h5>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                        We have sent a verification email to <strong>{newEmail}</strong>. Please click the link inside the mail to verify.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 3: Update Profile Photo */}
              {editProfileSubTab === 'picture' && (
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', animation: 'fadeIn 0.25s ease' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Camera style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
                    <span>Update Profile Photo</span>
                  </h4>
                  <form onSubmit={(e) => { e.preventDefault(); setConfirmPhotoModal(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '80px', height: '100px', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden', background: 'var(--bg-primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <img src={getPhotoSrc(abhaProfile.photo || abhaProfile.profilePhoto || currentUser.photo)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Current Profile Photo</span>
                        <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>File size constraint: <strong>Max 100 KB</strong>. Aspect ratio matching ABHA standard card.</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Drag & Drop Upload Zone */}
                      <label 
                        htmlFor="custom-file-upload-input" 
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          padding: '30px 20px',
                          borderRadius: '12px',
                          border: photoError ? '2px dashed var(--danger)' : '2px dashed var(--accent-teal)',
                          background: 'rgba(20, 184, 166, 0.03)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s ease',
                          boxShadow: photoError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                          animation: photoError ? 'otp-shake 0.4s ease' : 'none'
                        }}
                      >
                        <Camera style={{ width: '28px', height: '28px', color: 'var(--accent-teal)' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {photoFile ? t('Change Selected Photo') : t('Choose Profile Photo')}
                          </span>
                          <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>
                            JPEG, JPG or PNG (Max 100 KB)
                          </span>
                        </div>
                      </label>
                      <input 
                        id="custom-file-upload-input"
                        type="file" 
                        accept="image/jpeg, image/png, image/jpg"
                        onChange={handlePhotoFileChange} 
                        style={{ display: 'none' }}
                      />
                    </div>

                    {photoPreview && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        padding: '16px',
                        background: 'var(--bg-primary)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        animation: 'fadeIn 0.2s ease'
                      }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>
                          {t('Preview New Photo:')}
                        </span>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <div style={{
                            width: '100px',
                            height: '125px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            overflow: 'hidden',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                            flexShrink: 0
                          }}>
                            <img src={photoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                              {photoFile?.name}
                            </span>
                            <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>
                              {photoFile ? (photoFile.size / 1024).toFixed(1) : 0} KB
                            </span>
                            <span style={{ fontSize: '9.5px', color: 'var(--accent-teal)', fontWeight: 700 }}>
                              ✓ Ready to upload
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {photoError && <div style={{ color: 'var(--danger)', fontSize: '11px' }}>{photoError}</div>}

                    <button type="submit" disabled={photoLoading || !photoFile} style={{ width: 'fit-content', padding: '10px 20px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                      {photoLoading ? 'Uploading...' : 'Save Picture'}
                    </button>
                  </form>
                </div>
              )}

              </div>
            </div>
          )}

          {/* TAB 3: Set Password (drawer on mobile viewports via CSS) */}
          {activeTab === 'set_password' && (
            <div className="set-password-container">
              <style dangerouslySetInnerHTML={{ __html: `
                @media (max-width: 600px) {
                  .set-password-container {
                    position: fixed !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    top: 0 !important;
                    background: rgba(15, 23, 42, 0.6) !important;
                    backdrop-filter: blur(8px) !important;
                    z-index: 9995 !important;
                    display: flex !important;
                    align-items: flex-end !important;
                    justify-content: center !important;
                  }
                  .set-password-card {
                    border-bottom-left-radius: 0 !important;
                    border-bottom-right-radius: 0 !important;
                    border-top-left-radius: 24px !important;
                    border-top-right-radius: 24px !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    background: var(--bg-card) !important;
                    padding: 24px !important;
                    animation: modal-slide-up 0.3s ease-out !important;
                    box-shadow: 0 -10px 25px rgba(0,0,0,0.15) !important;
                  }
                  .mobile-only-header {
                    display: flex !important;
                  }
                }
              `}} />
              <div 
                className="set-password-card"
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px',
                  width: '100%', padding: '24px', textAlign: 'left'
                }}
              >
                {/* Mobile close header */}
                <div className="mobile-only-header" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {t('Set Password')}
                  </h3>
                  <button 
                    onClick={() => setActiveTab('my_profile')} 
                    style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <X style={{ width: '20px', height: '20px' }} />
                  </button>
                </div>

                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }} className="desktop-only-title">
                  <Key style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
                  <span>Set Security Password</span>
                </h4>

                {passSuccess ? (
                  <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                    <img 
                      src="/assets/check_icon.png" 
                      style={{ width: '48px', height: '48px', display: 'block', margin: '0 auto 12px' }} 
                      alt="Verified" 
                    />
                    <h4 style={{ margin: '0 0 6px', fontWeight: 800 }}>Password Set Successfully</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>You can now use this password alongside your ABHA address to access clinical dashboards directly.</p>
                  </div>
                ) : (
                  <form onSubmit={passwordForm.handleSubmit(handleSetPasswordSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Verification Channel</span>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <label style={{ flex: 1, padding: '10px', borderRadius: '8px', border: passAuthMethod === 'aadhaar' ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)', background: passAuthMethod === 'aadhaar' ? 'rgba(20, 184, 166, 0.06)' : 'var(--bg-primary)', cursor: 'pointer', fontSize: '11.5px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
                          <input type="radio" checked={passAuthMethod === 'aadhaar'} onChange={() => setPassAuthMethod('aadhaar')} style={{ display: 'none' }} />
                          Aadhaar Linked Mobile
                        </label>
                        <label style={{ flex: 1, padding: '10px', borderRadius: '8px', border: passAuthMethod === 'abha' ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)', background: passAuthMethod === 'abha' ? 'rgba(20, 184, 166, 0.06)' : 'var(--bg-primary)', cursor: 'pointer', fontSize: '11.5px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
                          <input type="radio" checked={passAuthMethod === 'abha'} onChange={() => setPassAuthMethod('abha')} style={{ display: 'none' }} />
                          ABHA Linked Mobile
                        </label>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>New Password</span>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="Minimum 8 characters" 
                          {...passwordForm.register('newPassword', {
                            required: t('Password is required.'),
                            minLength: { value: 8, message: t('Password must be at least 8 characters long.') }
                          })}
                          style={{ 
                            width: '100%', padding: '10px 64px 10px 10px', borderRadius: '8px', 
                            border: passwordForm.formState.errors.newPassword ? '2px solid var(--danger)' : (passwordForm.watch('newPassword') || '').length >= 8 ? '2px solid var(--success)' : '1px solid var(--border-color)', 
                            background: 'var(--bg-primary)', color: 'var(--text-primary)',
                            boxShadow: passwordForm.formState.errors.newPassword ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                            animation: passwordForm.formState.errors.newPassword ? 'otp-shake 0.4s ease' : 'none'
                          }}
                        />
                        <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {(passwordForm.watch('newPassword') || '').length >= 8 && !passwordForm.formState.errors.newPassword && (
                            <img 
                              src="/assets/check_icon.png" 
                              style={{ width: '18px', height: '18px' }} 
                              alt="Verified" 
                            />
                          )}
                          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: '4px', cursor: 'pointer' }}>
                            {showPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                          </button>
                        </div>
                      </div>
                      {passwordForm.formState.errors.newPassword && <div style={{ color: 'var(--danger)', fontSize: '10.5px', fontWeight: 600, marginTop: '2px' }}>{passwordForm.formState.errors.newPassword.message}</div>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Confirm Password</span>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showConfirmPassword ? 'text' : 'password'} 
                          placeholder="Confirm your password" 
                          {...passwordForm.register('confirmPassword', {
                            required: t('Please confirm your password.'),
                            validate: (val) => val === passwordForm.watch('newPassword') || t('Passwords do not match.')
                          })}
                          style={{ 
                            width: '100%', padding: '10px 64px 10px 10px', borderRadius: '8px', 
                            border: passwordForm.formState.errors.confirmPassword ? '2px solid var(--danger)' : (passwordForm.watch('confirmPassword') || '').length >= 8 && passwordForm.watch('confirmPassword') === passwordForm.watch('newPassword') ? '2px solid var(--success)' : '1px solid var(--border-color)', 
                            background: 'var(--bg-primary)', color: 'var(--text-primary)',
                            boxShadow: passwordForm.formState.errors.confirmPassword ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                            animation: passwordForm.formState.errors.confirmPassword ? 'otp-shake 0.4s ease' : 'none'
                          }}
                        />
                        <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {(passwordForm.watch('confirmPassword') || '').length >= 8 && passwordForm.watch('confirmPassword') === passwordForm.watch('newPassword') && !passwordForm.formState.errors.confirmPassword && (
                            <img 
                              src="/assets/check_icon.png" 
                              style={{ width: '18px', height: '18px' }} 
                              alt="Verified" 
                            />
                          )}
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: '4px', cursor: 'pointer' }}>
                            {showConfirmPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                          </button>
                        </div>
                      </div>
                      {passwordForm.formState.errors.confirmPassword && <div style={{ color: 'var(--danger)', fontSize: '10.5px', fontWeight: 600, marginTop: '2px' }}>{passwordForm.formState.errors.confirmPassword.message}</div>}
                    </div>

                    {passError && <div style={{ color: 'var(--danger)', fontSize: '11px', fontWeight: 600 }}>{passError}</div>}
                    
                    <button type="submit" disabled={passLoading} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', marginTop: '6px' }}>
                      {passLoading ? 'Requesting OTP...' : 'Send Verification OTP'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Re-KYC Verification */}
          {activeTab === 're_kyc' && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', textAlign: 'left' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
                <span>Re-KYC Verification</span>
              </h4>

              {reKycSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                  <img 
                    src="/assets/check_icon.png" 
                    style={{ width: '48px', height: '48px', display: 'block', margin: '0 auto 12px' }} 
                    alt="Verified" 
                  />
                  <h4 style={{ margin: '0 0 6px', fontWeight: 800 }}>Re-KYC Complete</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>UIDAI verification resolved. Your demographic verification status is now updated to fully compliant.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                    Re-KYC verifies your demographic identity against the central UIDAI registry. We will send an OTP confirmation to your registered mobile ending with <strong>******{abhaProfile.mobile?.slice(-4)}</strong>.
                  </p>
                  {reKycError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{reKycError}</div>}
                  <button onClick={handleRequestReKycOtp} disabled={reKycLoading} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', width: 'fit-content' }}>
                    {reKycLoading ? 'Requesting OTP...' : 'Send Re-KYC verification OTP'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Deactivate / Delete ABHA */}
          {activeTab === 'deactivate_delete' && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', textAlign: 'left' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert style={{ color: 'var(--danger)', width: '16px', height: '16px' }} />
                <span>Deactivate or Delete ABHA</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Option tabs */}
                <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-color)' }}>
                  <button type="button" onClick={() => setDeactivateOption('deactivate')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: deactivateOption === 'deactivate' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: deactivateOption === 'deactivate' ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
                    Deactivate Card
                  </button>
                  <button type="button" onClick={() => setDeactivateOption('delete')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: deactivateOption === 'delete' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: deactivateOption === 'delete' ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
                    Delete Permanently
                  </button>
                </div>

                {/* Warnings List */}
                {deactivateOption === 'deactivate' ? (
                  <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '11.5px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    <strong style={{ display: 'block', color: 'var(--danger)', marginBottom: '6px' }}>⚠️ Temporary Deactivation Warnings:</strong>
                    <ul style={{ margin: 0, paddingLeft: '14px' }}>
                      <li>You will lose all access to the ABDM application temporarily.</li>
                      <li>You will no longer be able to share your health records over ABDM.</li>
                      <li>You will no longer be able to share health records with any Health Facility.</li>
                    </ul>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Suggestion notice */}
                    <div style={{ background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.25)', padding: '10px 14px', borderRadius: '10px', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                      💡 <strong>Suggestion:</strong> Rather than deleting permanently, you can temporarily <strong>deactivate your card</strong> instead, which preserves your data while locking active shares.
                    </div>
                    
                    <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '11.5px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                      <strong style={{ display: 'block', color: 'var(--danger)', marginBottom: '6px' }}>🚨 Permanent Deletion Warnings:</strong>
                      <ul style={{ margin: 0, paddingLeft: '14px' }}>
                        <li>Your ABHA number will be permanently deleted, along with all your demographic details.</li>
                        <li>You will not be able to retrieve any information tagged to your ABHA number in the future.</li>
                        <li>You will never be able to access ABDM applications or any health records over ABDM network with this deleted number.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* OTP Method Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Send OTP Channel</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ flex: 1, padding: '8px', borderRadius: '8px', border: deactivateAuthMethod === 'aadhaar' ? '2px solid var(--danger)' : '1px solid var(--border-color)', background: deactivateAuthMethod === 'aadhaar' ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-primary)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
                      <input type="radio" checked={deactivateAuthMethod === 'aadhaar'} onChange={() => setDeactivateAuthMethod('aadhaar')} style={{ display: 'none' }} />
                      Aadhaar Mobile
                    </label>
                    <label style={{ flex: 1, padding: '8px', borderRadius: '8px', border: deactivateAuthMethod === 'abha' ? '2px solid var(--danger)' : '1px solid var(--border-color)', background: deactivateAuthMethod === 'abha' ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-primary)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
                      <input type="radio" checked={deactivateAuthMethod === 'abha'} onChange={() => setDeactivateAuthMethod('abha')} style={{ display: 'none' }} />
                      ABHA Mobile
                    </label>
                  </div>
                </div>

                {deactivateError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{deactivateError}</div>}
                
                <button onClick={handleDeactivateRequest} disabled={deactivateLoading} style={{ padding: '12px', border: 'none', borderRadius: '8px', background: 'var(--danger)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', width: 'fit-content' }}>
                  {deactivateLoading ? 'Requesting OTP...' : deactivateOption === 'deactivate' ? 'Deactivate ABHA Card' : 'Delete Permanent'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: Delink Mobile Number */}
          {activeTab === 'delink' && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', textAlign: 'left' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserMinus style={{ color: 'var(--danger)', width: '16px', height: '16px' }} />
                <span>Delink Mobile Number</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '11.5px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  <strong>⚠️ Delink Warning:</strong> If this ABHA number does not belong to you or your family members, you can opt to delink your mobile number, which will remove it from the ABHA record.
                </div>
                {delinkError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{delinkError}</div>}
                <button onClick={handleRequestDelinkOtp} disabled={delinkLoading} style={{ padding: '12px 20px', border: 'none', borderRadius: '8px', background: 'var(--danger)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', width: 'fit-content' }}>
                  {delinkLoading ? 'Requesting OTP...' : 'Proceed Delink OTP'}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Hidden Back card representation used for PVC print injection */}
      <div style={{ display: 'none' }}>
        <article 
          id="abha-card-pvc-back"
          className="pvc-back-card"
          style={{
            width: '440px',
            height: '277px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            boxShadow: 'none',
            background: 'radial-gradient(circle, #ffffff 0%, #f8fafc 100%)',
            fontFamily: "'Inter', sans-serif"
          }}
        >
          <div className="pvc-back-header" style={{ background: '#273890', color: '#ffffff', padding: '10px', fontSize: '9px', fontWeight: 'bold', borderBottom: '2px solid #10b981', textAlign: 'center', letterSpacing: '0.5px' }}>
            Ayushman Bharat Digital Mission (ABDM)
          </div>
          <div className="pvc-back-body" style={{ padding: '14px', display: 'flex', flexDirection: 'row', gap: '14px', alignItems: 'center', height: 'calc(100% - 35px)', boxSizing: 'border-box' }}>
            <ul className="pvc-instructions" style={{ flex: 1, fontSize: '8.5px', lineHeight: '1.4', color: '#334155', textAlign: 'left', margin: 0, paddingLeft: '14px' }}>
              <li style={{ marginBottom: '4px' }}>This card is a digital identity for your healthcare records.</li>
              <li style={{ marginBottom: '4px' }}>यह कार्ड आपके स्वास्थ्य रिकॉर्ड के लिए एक डिजिटल पहचान है।</li>
              <li style={{ marginBottom: '4px' }}>Show this card at hospital reception to share records.</li>
              <li style={{ marginBottom: '4px' }}>रिकॉर्ड साझा करने के लिए अस्पताल के रिसेप्शन पर यह कार्ड दिखाएं।</li>
              <li>ABDM Helpdesk Helpline / हेल्पलाइन: 14477</li>
            </ul>
            <div className="pvc-back-qr" style={{ padding: '4px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ABHA:${abhaProfile.ABHANumber || abhaProfile.abhaNumber};${abhaProfile.preferredAddress || abhaProfile.abhaAddress}`}
                alt="Verification QR"
                style={{ width: '60px', height: '60px', display: 'block' }}
              />
            </div>
          </div>
        </article>
      </div>

      {/* ==================== WORKFLOW MODALS ==================== */}

      {/* 1. Mobile Menu Hamburger bottom-sheet drawer for mobile viewports */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
            zIndex: 9990, display: 'flex', alignItems: 'flex-end'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            style={{
              background: 'var(--bg-primary)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
              width: '100%', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px',
              boxShadow: '0 -10px 25px rgba(0,0,0,0.15)', maxHeight: '80vh', overflowY: 'auto',
              animation: 'modal-slide-up 0.3s ease-out', textAlign: 'left'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {t('ABHA Menu / आभा मेनू')}
              </h3>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {submenus.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActiveTab(item.id as any);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: isActive ? 'rgba(20, 184, 166, 0.08)' : 'var(--bg-secondary)',
                      border: isActive ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)',
                      color: isActive ? 'var(--accent-teal)' : 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: isActive ? 700 : 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon style={{ width: '16px', height: '16px', color: isActive ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. PVC Print Card Preview Modal */}
      {activeModal === 'print_pvc' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
            width: '100%', maxWidth: '520px', padding: '24px', boxShadow: 'var(--surface-shadow)',
            display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <CreditCard style={{ color: 'var(--accent-teal)' }} />
                <span>Print PVC Card Preview</span>
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', maxHeight: '420px', overflowY: 'auto', padding: '10px 0' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Front Side / सामने का भाग</span>
              {/* Copy of card Front */}
              <div style={{ transform: 'scale(0.85)', margin: '-20px 0' }}>
                <article 
                  className="setu-abha-card" 
                  style={{ 
                    width: '440px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  <div className="setu-abha-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#273890', borderBottom: '2px solid #10b981' }}>
                    <div style={{ height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/nha.png" alt="NHA" style={{ height: '100%', filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <div style={{ textAlign: 'center', color: '#ffffff', flex: 1, padding: '0 6px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '9px', fontWeight: '800' }}>Ayushman Bharat Health Account</span>
                      <span style={{ fontSize: '8px', opacity: 0.9 }}>आयुष्मान भारत स्वास्थ्य खाता (आभा)</span>
                    </div>
                    <div style={{ height: '34px', display: 'flex', alignItems: 'center' }}>
                      <img src="/abdm_new.png" alt="ABDM" style={{ height: '100%' }} />
                    </div>
                  </div>
                  <div className="setu-abha-card-body" style={{ display: 'flex', flexDirection: 'row', gap: '12px', padding: '14px', background: 'radial-gradient(circle, #ffffff 0%, #f1f5f9 100%)', color: '#0f172a' }}>
                    <div style={{ width: '75px', height: '95px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #94a3b8' }}>
                      <img src={getPhotoSrc(abhaProfile.photo || abhaProfile.profilePhoto || currentUser.photo)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left' }}>
                      <div>
                        <span style={{ fontSize: '6px', color: '#64748b' }}>Name / नाम</span>
                        <strong style={{ fontSize: '10px', color: '#0f172a', fontWeight: '800' }}>{abhaProfile.name || currentUser.name}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '6px', color: '#64748b' }}>ABHA Number / आभा संख्या</span>
                        <strong style={{ fontSize: '10px', color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{abhaProfile.ABHANumber || abhaProfile.abhaNumber}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '6px', color: '#64748b' }}>ABHA Address / आभा पता</span>
                        <strong style={{ fontSize: '8px', fontFamily: 'monospace' }}>{abhaProfile.preferredAbhaAddress || abhaProfile.preferredAddress}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ABHA:${abhaProfile.ABHANumber || abhaProfile.abhaNumber}`} style={{ width: '60px', height: '60px' }} />
                    </div>
                  </div>
                </article>
              </div>

              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '10px' }}>Back Side / पीछे का भाग</span>
              {/* Copy of Back Side */}
              <div style={{ transform: 'scale(0.85)', margin: '-20px 0' }}>
                <article 
                  className="pvc-back-card"
                  style={{
                    width: '440px', height: '168px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1',
                    background: 'radial-gradient(circle, #ffffff 0%, #f8fafc 100%)', fontFamily: "'Inter', sans-serif"
                  }}
                >
                  <div style={{ background: '#273890', color: '#ffffff', padding: '6px', fontSize: '8px', fontWeight: 'bold', borderBottom: '2px solid #10b981', textAlign: 'center' }}>
                    Ayushman Bharat Digital Mission (ABDM)
                  </div>
                  <div style={{ padding: '10px', display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                    <ul style={{ flex: 1, fontSize: '7.5px', lineHeight: '1.3', color: '#334155', textAlign: 'left', margin: 0, paddingLeft: '10px' }}>
                      <li>This card is a digital identity for your healthcare records.</li>
                      <li>यह कार्ड आपके स्वास्थ्य रिकॉर्ड के लिए एक डिजिटल पहचान है।</li>
                      <li>ABDM Helpdesk Helpline / हेल्पलाइन: 14477</li>
                    </ul>
                    <div style={{ padding: '2px', background: '#ffffff', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ABHA:${abhaProfile.ABHANumber || abhaProfile.abhaNumber}`} style={{ width: '50px', height: '50px' }} />
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handlePrintPvc} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                Print PVC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile Update Modal */}
      {activeModal === 'edit_mobile' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div 
            className={shakeModal ? 'shake-modal' : ''}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '440px', padding: '24px', boxShadow: 'var(--surface-shadow)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Phone style={{ color: 'var(--accent-teal)', width: '18px', height: '18px' }} />
                <span>Update Mobile Number</span>
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {!mobileOtpStep ? (
              <form onSubmit={mobileForm.handleSubmit(handleMobileSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Current Mobile Number</span>
                  <input type="text" value={abhaProfile.mobile || 'N/A'} disabled style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-muted)', marginTop: '4px', cursor: 'not-allowed', letterSpacing: '2px', fontSize: '13px' }} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>New Mobile Number</span>
                  <div style={{ position: 'relative', marginTop: '4px' }}>
                    {(() => {
                      const { onChange: onMobileChange, ...mobileReg } = mobileForm.register('newMobile', {
                        required: t('Mobile number is required.'),
                        pattern: { value: /^\d{10}$/, message: t('Please enter a valid 10-digit mobile number.') },
                        validate: (val) => val !== abhaProfile.mobile || t('New mobile cannot be the same as current mobile.')
                      });
                      return (
                        <input 
                          type="tel" 
                          maxLength={10}
                          placeholder="Enter 10-digit mobile number" 
                          disabled={mobileLoading || mobileCoolingTimer > 0}
                          {...mobileReg}
                          onChange={async (e) => {
                            const cleaned = e.target.value.replace(/\D/g, '');
                            e.target.value = cleaned;
                            await onMobileChange(e);
                            setMobileError('');
                          }}
                          style={{ 
                            width: '100%', padding: '10px 36px 10px 10px', borderRadius: '8px', 
                            border: (mobileForm.formState.errors.newMobile || mobileError) ? '2px solid var(--danger)' : mobileForm.watch('newMobile')?.length === 10 && !mobileForm.formState.errors.newMobile ? '2px solid var(--success)' : '1px solid var(--border-color)', 
                            background: 'var(--bg-primary)', color: 'var(--text-primary)',
                            boxShadow: (mobileForm.formState.errors.newMobile || mobileError) ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                            animation: (mobileForm.formState.errors.newMobile || mobileError) ? 'otp-shake 0.4s ease' : 'none',
                            letterSpacing: '2px', fontSize: '13px'
                          }} 
                        />
                      );
                    })()}
                    {mobileForm.watch('newMobile')?.length === 10 && !mobileForm.formState.errors.newMobile && !mobileError && (
                      <img 
                        src="/assets/check_icon.png" 
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px' }} 
                        alt="Verified" 
                      />
                    )}
                  </div>
                </div>
                {mobileForm.formState.errors.newMobile && <div style={{ color: 'var(--danger)', fontSize: '11.5px', fontWeight: 600 }}>{mobileForm.formState.errors.newMobile.message}</div>}
                {mobileError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{mobileError}</div>}
                <button type="submit" disabled={mobileLoading} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                  {mobileLoading ? 'Sending...' : 'Request OTP / ओटीपी प्राप्त करें'}
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(20, 184, 166, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.15)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  OTP sent to new mobile ending with ******{newMobile.slice(-4)}.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Enter 6-Digit OTP</span>
                  <OtpInput value={mobileOtp} onChange={(val) => { setMobileError(''); setMobileOtp(val); }} error={!!mobileError} disabled={mobileLoading} shake={shakeModal} onEnter={handleVerifyMobileOtp} />
                </div>
                {mobileError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{mobileError}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setMobileOtpStep(false)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                    Edit Mobile
                  </button>
                  <button onClick={handleVerifyMobileOtp} disabled={mobileLoading || mobileOtp.length !== 6} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                    Verify & Update
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Link & Verify Email Modal */}
      {activeModal === 'edit_email' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div 
            className={shakeModal ? 'shake-modal' : ''}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '440px', padding: '24px', boxShadow: 'var(--surface-shadow)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Mail style={{ color: 'var(--accent-teal)', width: '18px', height: '18px' }} />
                <span>Link & Verify Email</span>
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {!emailSent ? (
              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Current Email Address</span>
                  <input type="text" value={abhaProfile.email || 'Not verified'} disabled style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-muted)', marginTop: '4px', cursor: 'not-allowed' }} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>New Email Address</span>
                  <div style={{ position: 'relative', marginTop: '4px' }}>
                    <input 
                      type="email" 
                      placeholder="Enter email address (e.g. name@domain.com)" 
                      disabled={emailLoading || emailCoolingTimer > 0}
                      {...emailForm.register('newEmail', {
                        required: t('Email address is required.'),
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('Please enter a valid email address (e.g. name@domain.com).') },
                        validate: (val) => val !== abhaProfile.email || t('New email cannot be the same as current email.')
                      })}
                      style={{ 
                        width: '100%', padding: '10px 36px 10px 10px', borderRadius: '8px', 
                        border: (emailForm.formState.errors.newEmail || emailError) ? '2px solid var(--danger)' : emailForm.watch('newEmail') && !emailForm.formState.errors.newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.watch('newEmail') || '') ? '2px solid var(--success)' : '1px solid var(--border-color)', 
                        background: 'var(--bg-primary)', color: 'var(--text-primary)',
                        boxShadow: (emailForm.formState.errors.newEmail || emailError) ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                        animation: (emailForm.formState.errors.newEmail || emailError) ? 'otp-shake 0.4s ease' : 'none',
                        opacity: (emailLoading || emailCoolingTimer > 0) ? 0.6 : 1,
                        cursor: (emailLoading || emailCoolingTimer > 0) ? 'not-allowed' : 'auto'
                      }} 
                    />
                    {emailForm.watch('newEmail') && !emailForm.formState.errors.newEmail && !emailError && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.watch('newEmail') || '') && (
                      <img 
                        src="/assets/check_icon.png" 
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px' }} 
                        alt="Verified" 
                      />
                    )}
                  </div>
                </div>
                {emailForm.formState.errors.newEmail && <div style={{ color: 'var(--danger)', fontSize: '11.5px', fontWeight: 600 }}>{emailForm.formState.errors.newEmail.message}</div>}
                {emailError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{emailError}</div>}
                <button 
                  type="submit" 
                  disabled={emailLoading || emailCoolingTimer > 0} 
                  style={{ 
                    padding: '12px', borderRadius: '8px', border: 'none', 
                    background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: (emailLoading || emailCoolingTimer > 0) ? 'not-allowed' : 'pointer',
                    opacity: (emailLoading || emailCoolingTimer > 0) ? 0.7 : 1
                  }}
                >
                  {emailLoading ? 'Sending link...' : emailCoolingTimer > 0 ? `Resend Link in ${emailCoolingTimer}s` : 'Send Verification Link'}
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
                  <Mail style={{ width: '24px', height: '24px' }} />
                </div>
                <h4 style={{ margin: '8px 0 2px', fontWeight: 800 }}>Verification Link Sent</h4>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  We have sent a verification email to <strong>{newEmail}</strong>. Please click the link inside the mail to verify.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Update Profile Photo Modal (Max 100 KB constraint) */}
      {activeModal === 'edit_photo' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div 
            className={shakeModal ? 'shake-modal' : ''}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '440px', padding: '24px', boxShadow: 'var(--surface-shadow)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Camera style={{ color: 'var(--accent-teal)', width: '18px', height: '18px' }} />
                <span>Update Profile Photo</span>
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <form onSubmit={handlePhotoUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '100px', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden', background: 'var(--bg-secondary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <img src={photoPreview || getPhotoSrc(abhaProfile.photo)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Upload JPEG/PNG Photo</span>
                  <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>File size constraint: <strong>Max 100 KB</strong>. Aspect ratio matching ABHA standard card.</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/jpg"
                  onChange={handlePhotoFileChange} 
                  style={{
                    fontSize: '12px', width: '100%', padding: '10px',
                    borderRadius: '8px', border: photoError ? '2px solid var(--danger)' : '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                    boxShadow: photoError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none'
                  }}
                />
              </div>

              {photoError && <div style={{ color: 'var(--danger)', fontSize: '11px' }}>{photoError}</div>}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={photoLoading || !photoFile} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                  {photoLoading ? 'Uploading...' : 'Save Picture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Set Security Password Modal (Drawer on Mobile viewports) */}
      {activeModal === 'set_password' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} className="pass-modal-backdrop">
          
          {/* CSS to convert this to bottom drawer on mobile */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media (max-width: 600px) {
              .pass-modal-backdrop {
                align-items: flex-end !important;
                padding: 0 !important;
              }
              .pass-modal-card {
                border-bottom-left-radius: 0 !important;
                border-bottom-right-radius: 0 !important;
                border-top-left-radius: 24px !important;
                border-top-right-radius: 24px !important;
                width: 100% !important;
                max-width: 100% !important;
                animation: modal-slide-up 0.3s ease-out !important;
              }
            }
          `}} />

          <div 
            className="pass-modal-card shake-modal"
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '440px', padding: '24px', boxShadow: 'var(--surface-shadow)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left',
              animation: shakeModal ? 'otp-shake 0.4s ease' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Key style={{ color: 'var(--accent-teal)', width: '18px', height: '18px' }} />
                <span>Set Security Password</span>
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {passSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                <img 
                  src="/assets/check_icon.png" 
                  style={{ width: '48px', height: '48px', display: 'block', margin: '0 auto 12px' }} 
                  alt="Verified" 
                />
                <h4 style={{ margin: '0 0 6px', fontWeight: 800 }}>Password Set Successfully</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>You can now use this password alongside your ABHA address to access clinical dashboards directly.</p>
              </div>
            ) : !passOtpStep ? (
              <form onSubmit={passwordForm.handleSubmit(handleSetPasswordSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Verification Channel</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ flex: 1, padding: '10px', borderRadius: '8px', border: passAuthMethod === 'aadhaar' ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)', background: passAuthMethod === 'aadhaar' ? 'rgba(20, 184, 166, 0.06)' : 'var(--bg-secondary)', cursor: 'pointer', fontSize: '11.5px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
                      <input type="radio" checked={passAuthMethod === 'aadhaar'} onChange={() => setPassAuthMethod('aadhaar')} style={{ display: 'none' }} />
                      Aadhaar Linked Mobile
                    </label>
                    <label style={{ flex: 1, padding: '10px', borderRadius: '8px', border: passAuthMethod === 'abha' ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)', background: passAuthMethod === 'abha' ? 'rgba(20, 184, 166, 0.06)' : 'var(--bg-secondary)', cursor: 'pointer', fontSize: '11.5px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
                      <input type="radio" checked={passAuthMethod === 'abha'} onChange={() => setPassAuthMethod('abha')} style={{ display: 'none' }} />
                      ABHA Linked Mobile
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>New Password</span>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Minimum 8 characters" 
                      {...passwordForm.register('newPassword', {
                        required: t('Password is required.'),
                        minLength: { value: 8, message: t('Password must be at least 8 characters long.') }
                      })}
                      style={{ 
                        width: '100%', padding: '10px 64px 10px 10px', borderRadius: '8px', 
                        border: passwordForm.formState.errors.newPassword ? '2px solid var(--danger)' : (passwordForm.watch('newPassword') || '').length >= 8 ? '2px solid var(--success)' : '1px solid var(--border-color)', 
                        background: 'var(--bg-primary)', color: 'var(--text-primary)',
                        boxShadow: passwordForm.formState.errors.newPassword ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                        animation: passwordForm.formState.errors.newPassword ? 'otp-shake 0.4s ease' : 'none'
                      }}
                    />
                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {(passwordForm.watch('newPassword') || '').length >= 8 && !passwordForm.formState.errors.newPassword && (
                        <img 
                          src="/assets/check_icon.png" 
                          style={{ width: '18px', height: '18px' }} 
                          alt="Verified" 
                        />
                      )}
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: '4px', cursor: 'pointer' }}>
                        {showPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                      </button>
                    </div>
                  </div>
                  {passwordForm.formState.errors.newPassword && <div style={{ color: 'var(--danger)', fontSize: '10.5px', fontWeight: 600, marginTop: '2px' }}>{passwordForm.formState.errors.newPassword.message}</div>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Confirm Password</span>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      placeholder="Confirm your password" 
                      {...passwordForm.register('confirmPassword', {
                        required: t('Please confirm your password.'),
                        validate: (val) => val === passwordForm.watch('newPassword') || t('Passwords do not match.')
                      })}
                      style={{ 
                        width: '100%', padding: '10px 64px 10px 10px', borderRadius: '8px', 
                        border: passwordForm.formState.errors.confirmPassword ? '2px solid var(--danger)' : (passwordForm.watch('confirmPassword') || '').length >= 8 && passwordForm.watch('confirmPassword') === passwordForm.watch('newPassword') ? '2px solid var(--success)' : '1px solid var(--border-color)', 
                        background: 'var(--bg-primary)', color: 'var(--text-primary)',
                        boxShadow: passwordForm.formState.errors.confirmPassword ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                        animation: passwordForm.formState.errors.confirmPassword ? 'otp-shake 0.4s ease' : 'none'
                      }}
                    />
                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {(passwordForm.watch('confirmPassword') || '').length >= 8 && passwordForm.watch('confirmPassword') === passwordForm.watch('newPassword') && !passwordForm.formState.errors.confirmPassword && (
                        <img 
                          src="/assets/check_icon.png" 
                          style={{ width: '18px', height: '18px' }} 
                          alt="Verified" 
                        />
                      )}
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: '4px', cursor: 'pointer' }}>
                        {showConfirmPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                      </button>
                    </div>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && <div style={{ color: 'var(--danger)', fontSize: '10.5px', fontWeight: 600, marginTop: '2px' }}>{passwordForm.formState.errors.confirmPassword.message}</div>}
                </div>

                {passError && <div style={{ color: 'var(--danger)', fontSize: '11px', fontWeight: 600 }}>{passError}</div>}
                
                <button type="submit" disabled={passLoading} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', marginTop: '6px' }}>
                  {passLoading ? 'Requesting OTP...' : 'Send Verification OTP'}
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(20, 184, 166, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.15)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Enter secure OTP sent to {passAuthMethod === 'aadhaar' ? 'Aadhaar linked phone ending with ******5682' : `ABHA linked phone ending with ******${abhaProfile.mobile?.slice(-4)}`}.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Enter 6-Digit OTP</span>
                  <OtpInput value={passOtp} onChange={(val) => { setPassError(''); setPassOtp(val); }} error={!!passError} disabled={passLoading} shake={shakeModal} onEnter={handleVerifyPasswordOtp} />
                </div>
                {passError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{passError}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setPassOtpStep(false)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                    Edit Fields
                  </button>
                  <button onClick={handleVerifyPasswordOtp} disabled={passLoading || passOtp.length !== 6} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                    Confirm & Verify
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Re-KYC Verification Modal */}
      {activeModal === 're_kyc' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div 
            className={shakeModal ? 'shake-modal' : ''}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '440px', padding: '24px', boxShadow: 'var(--surface-shadow)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left',
              animation: shakeModal ? 'otp-shake 0.4s ease' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <RefreshCw style={{ color: 'var(--accent-teal)', width: '18px', height: '18px' }} />
                <span>Re-KYC Verification</span>
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {reKycSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                <img 
                  src="/assets/check_icon.png" 
                  style={{ width: '48px', height: '48px', display: 'block', margin: '0 auto 12px' }} 
                  alt="Verified" 
                />
                <h4 style={{ margin: '0 0 6px', fontWeight: 800 }}>Re-KYC Complete</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>UIDAI verification resolved. Your demographic verification status is now updated to fully compliant.</p>
              </div>
            ) : !reKycOtpStep ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                  Re-KYC verifies your demographic identity against the central UIDAI registry. We will send an OTP confirmation to your registered mobile ending with <strong>******{abhaProfile.mobile?.slice(-4)}</strong>.
                </p>
                {reKycError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{reKycError}</div>}
                <button onClick={handleRequestReKycOtp} disabled={reKycLoading} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', width: '100%' }}>
                  {reKycLoading ? 'Requesting OTP...' : 'Send Re-KYC verification OTP'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(20, 184, 166, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.15)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Re-KYC OTP sent to registered mobile.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Enter 6-Digit OTP</span>
                  <OtpInput value={reKycOtp} onChange={(val) => { setReKycError(''); setReKycOtp(val); }} error={!!reKycError} disabled={reKycLoading} shake={shakeModal} onEnter={handleVerifyReKycOtp} />
                </div>
                {reKycError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{reKycError}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setReKycOtpStep(false)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                    Back
                  </button>
                  <button onClick={handleVerifyReKycOtp} disabled={reKycLoading || reKycOtp.length !== 6} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                    Verify & Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. Deactivate / Delete ABHA Modal */}
      {activeModal === 'deactivate_delete' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div 
            className={shakeModal ? 'shake-modal' : ''}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '480px', padding: '24px', boxShadow: 'var(--surface-shadow)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left',
              animation: shakeModal ? 'otp-shake 0.4s ease' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <ShieldAlert style={{ color: 'var(--danger)', width: '18px', height: '18px' }} />
                <span>Deactivate or Delete ABHA</span>
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {deactivateConfirmed ? (
              <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                  <ShieldAlert style={{ width: '28px', height: '28px' }} />
                </div>
                <h4 style={{ margin: '0 0 6px', fontWeight: 800 }}>Account Closed</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>ABHA record updated. Terminating current active login session...</p>
              </div>
            ) : !deactivateOtpStep ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Deactivate vs Delete Choice tab header */}
                <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-color)' }}>
                  <button type="button" onClick={() => setDeactivateOption('deactivate')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: deactivateOption === 'deactivate' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: deactivateOption === 'deactivate' ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
                    Deactivate Card
                  </button>
                  <button type="button" onClick={() => setDeactivateOption('delete')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: deactivateOption === 'delete' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: deactivateOption === 'delete' ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
                    Delete Permanently
                  </button>
                </div>

                {/* Warnings List */}
                {deactivateOption === 'deactivate' ? (
                  <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '11px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    <strong style={{ display: 'block', color: 'var(--danger)', marginBottom: '6px' }}>⚠️ Temporary Deactivation Warnings:</strong>
                    <ul style={{ margin: 0, paddingLeft: '14px' }}>
                      <li>You will lose all access to the ABDM application temporarily.</li>
                      <li>You will no longer be able to share your health records over ABDM.</li>
                      <li>You will no longer be able to share health records with any Health Facility.</li>
                    </ul>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Temporary suggestion banner */}
                    <div style={{ background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.25)', padding: '10px 14px', borderRadius: '10px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                      💡 <strong>Suggestion:</strong> Rather than deleting permanently, you can temporarily <strong>deactivate your card</strong> instead, which preserves your data while locking active shares.
                    </div>
                    
                    <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '11px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                      <strong style={{ display: 'block', color: 'var(--danger)', marginBottom: '6px' }}>🚨 Permanent Deletion Warnings:</strong>
                      <ul style={{ margin: 0, paddingLeft: '14px' }}>
                        <li>Your ABHA number will be permanently deleted, along with all your demographic details.</li>
                        <li>You will not be able to retrieve any information tagged to your ABHA number in the future.</li>
                        <li>You will never be able to access ABDM applications or any health records over ABDM network with this deleted number.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* OTP Method Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Send OTP Channel</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ flex: 1, padding: '8px', borderRadius: '8px', border: deactivateAuthMethod === 'aadhaar' ? '2px solid var(--danger)' : '1px solid var(--border-color)', background: deactivateAuthMethod === 'aadhaar' ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-secondary)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
                      <input type="radio" checked={deactivateAuthMethod === 'aadhaar'} onChange={() => setDeactivateAuthMethod('aadhaar')} style={{ display: 'none' }} />
                      Aadhaar Mobile
                    </label>
                    <label style={{ flex: 1, padding: '8px', borderRadius: '8px', border: deactivateAuthMethod === 'abha' ? '2px solid var(--danger)' : '1px solid var(--border-color)', background: deactivateAuthMethod === 'abha' ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-secondary)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
                      <input type="radio" checked={deactivateAuthMethod === 'abha'} onChange={() => setDeactivateAuthMethod('abha')} style={{ display: 'none' }} />
                      ABHA Mobile
                    </label>
                  </div>
                </div>

                {deactivateError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{deactivateError}</div>}
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button type="button" onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleDeactivateRequest} disabled={deactivateLoading} style={{ flex: 2, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--danger)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                    {deactivateLoading ? 'Requesting OTP...' : deactivateOption === 'deactivate' ? 'Deactivate ABHA Card' : 'Delete Permanent'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Confirm OTP sent to {deactivateAuthMethod === 'aadhaar' ? 'Aadhaar linked mobile' : 'ABHA linked mobile'}.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Enter 6-Digit OTP</span>
                  <OtpInput value={deactivateOtp} onChange={(val) => { setDeactivateError(''); setDeactivateOtp(val); }} error={!!deactivateError} disabled={deactivateLoading} shake={shakeModal} onEnter={handleVerifyDeactivateOtp} />
                </div>
                {deactivateError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{deactivateError}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setDeactivateOtpStep(false)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                    Back
                  </button>
                  <button onClick={handleVerifyDeactivateOtp} disabled={deactivateLoading || deactivateOtp.length !== 6} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--danger)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                    Confirm Action
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. Delink Mobile Number Modal */}
      {activeModal === 'delink' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div 
            className={shakeModal ? 'shake-modal' : ''}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '440px', padding: '24px', boxShadow: 'var(--surface-shadow)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left',
              animation: shakeModal ? 'otp-shake 0.4s ease' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <UserMinus style={{ color: 'var(--danger)', width: '18px', height: '18px' }} />
                <span>Delink Mobile Number</span>
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {!delinkOtpStep ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '11.5px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  <strong>⚠️ Delink Warning:</strong> If this ABHA number does not belong to you or your family members, you can opt to delink your mobile number, which will remove it from the ABHA record.
                </div>
                {delinkError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{delinkError}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleRequestDelinkOtp} disabled={delinkLoading} style={{ flex: 2, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--danger)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                    {delinkLoading ? 'Requesting OTP...' : 'Proceed Delink OTP'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Enter OTP sent to your linked mobile to delink account permanently.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Enter 6-Digit OTP</span>
                  <OtpInput value={delinkOtp} onChange={(val) => { setDelinkError(''); setDelinkOtp(val); }} error={!!delinkError} disabled={delinkLoading} shake={shakeModal} onEnter={handleVerifyDelinkOtp} />
                </div>
                {delinkError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{delinkError}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setDelinkOtpStep(false)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                    Back
                  </button>
                  <button onClick={handleVerifyDelinkOtp} disabled={delinkLoading || delinkOtp.length !== 6} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--danger)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                    Confirm Delink
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 10. Photo Upload Confirmation Modal */}
      {confirmPhotoModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div 
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '400px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left',
              animation: shakeModal ? 'otp-shake 0.4s ease' : 'fadeIn 0.25s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Camera style={{ color: 'var(--accent-teal)', width: '18px', height: '18px' }} />
                <span>Confirm Photo Update</span>
              </h3>
              <button onClick={() => setConfirmPhotoModal(false)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }} disabled={photoLoading}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }}>
              <div style={{
                width: '120px',
                height: '150px',
                borderRadius: '12px',
                border: '2px solid var(--accent-teal)',
                overflow: 'hidden',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }}>
                <img src={photoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Are you sure you want to update your official ABHA Card profile photo to this new image?
              </p>
            </div>

            {photoError && <div style={{ color: 'var(--danger)', fontSize: '11px', textAlign: 'center' }}>{photoError}</div>}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button 
                type="button" 
                onClick={() => setConfirmPhotoModal(false)} 
                style={{ flex: 1, padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}
                disabled={photoLoading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => handlePhotoUploadSubmit()} 
                style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                disabled={photoLoading}
              >
                {photoLoading ? 'Uploading...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
