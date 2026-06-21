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
import { ImageCropper } from '../../../components/common/ImageCropper';
import Badge from '../../../components/common/Badge';

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
  Pencil,
  Copy,
  Share2,
  RefreshCw,
  UserMinus,
  ShieldAlert,
  Trash2,
  Eye,
  EyeOff,
  Menu,
  ChevronRight,
  ChevronDown,
  Check,
  AlertCircle
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
  const [pvcTab, setPvcTab] = useState<'front' | 'back'>('front');
  const [mobileCoolingTimer, setMobileCoolingTimer] = useState(0);
  const [emailCoolingTimer, setEmailCoolingTimer] = useState(0);
  const [isDemographicsExpanded, setIsDemographicsExpanded] = useState(false);
  const [editProfileSubTab, setEditProfileSubTab] = useState<'mobile' | 'email' | 'picture'>('mobile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    showToast(t(`${fieldName} copied to clipboard!`));
  };

  const triggerMobileEdit = () => {
    setActiveTab('edit_profile');
    setEditProfileSubTab('mobile');
  };

  const triggerPhotoSelect = () => {
    setActiveTab('edit_profile');
    setEditProfileSubTab('picture');
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 150);
  };

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
  const [photoResponseData, setPhotoResponseData] = useState<any>(null);
  const [photoCompressing, setPhotoCompressing] = useState(false);
  const [rawImageToCrop, setRawImageToCrop] = useState('');
  const hasCustomPhoto = !!(abhaProfile.photo && 
    !abhaProfile.photo.includes('unsplash.com') && 
    !abhaProfile.photo.includes('placeholder'));

  // 4. Set Password States
  const [passAuthMethod, setPassAuthMethod] = useState<'aadhaar' | 'abha'>('aadhaar');
  const [passFormStep, setPassFormStep] = useState<1 | 2>(1);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
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

    setOldPassword('');
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

  const passwordForm = useForm<{ oldPassword: string; newPassword: string; confirmPassword: string }>({
    mode: 'onChange',
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' }
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

  const handleShareCard = async () => {
    const abhaNo = abhaProfile.ABHANumber || abhaProfile.abhaNumber || '';
    const shareText = `ABHA Card details:\nName: ${abhaProfile.name || currentUser?.name || ''}\nABHA Number: ${abhaNo}\nABHA Address: ${abhaProfile.preferredAddress || abhaProfile.abhaAddress || abhaProfile.preferredAbhaAddress}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ABHA Smart Card',
          text: shareText,
          url: window.location.href
        });
        showToast(t('Shared successfully!'));
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast(t('ABHA card details copied to clipboard!'));
      } catch (err) {
        showToast(t('Failed to share card details.'));
      }
    }
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
              background: #264488;
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
              padding: 2.5mm 3mm;
              background: #264488 !important;
              border-bottom: 0.5mm solid #10b981;
              color: #ffffff;
              height: 13.6mm;
              box-sizing: border-box;
            }
            .setu-abha-card-nha-img {
              height: 9.6mm !important;
            }
            .setu-abha-card-abdm-wrapper {
              width: 11.2mm !important;
              height: 11.2mm !important;
              border-radius: 50%;
              border: 0.2mm solid #cbd5e1;
              background: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .setu-abha-card-abdm-wrapper img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .setu-abha-card-body {
              display: flex;
              flex-direction: row;
              gap: 2.5mm;
              padding: 3mm;
              background: radial-gradient(circle, #ffffff 0%, #f1f5f9 100%) !important;
              height: calc(54mm - 13.6mm);
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
            .pvc-back-body {
              padding: 2.5mm 3mm;
              display: flex;
              flex-direction: column;
              height: calc(54mm - 13.6mm);
              box-sizing: border-box;
              justify-content: space-between;
            }
            .pvc-instructions {
              list-style-type: disc;
              margin: 0;
              padding-left: 3.5mm;
              font-size: 3.6px;
              line-height: 1.25;
              color: #334155;
              text-align: left;
            }
            .pvc-instructions li {
              margin-bottom: 0.4mm;
            }
            .pvc-instructions li div {
              font-size: 3.2px;
              color: #64748b;
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

  // Helper for compressing image
  const compressImage = (file: File): Promise<{ compressedBase64: string; compressedSizeKb: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const maxDimension = 600;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context is null'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.8;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          let size = Math.round((dataUrl.length - 'data:image/jpeg;base64,'.length) * 3 / 4);

          while (size > 100 * 1024 && quality > 0.1) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            size = Math.round((dataUrl.length - 'data:image/jpeg;base64,'.length) * 3 / 4);
          }

          const base64 = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
          resolve({
            compressedBase64: base64,
            compressedSizeKb: parseFloat((size / 1024).toFixed(1))
          });
        };
        img.onerror = () => reject(new Error('Failed to load image.'));
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
    });
  };

  // 3. Photo upload file change with auto-compression
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format
    const isJpeg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');
    if (!isJpeg) {
      setPhotoError(t('Invalid format. Please upload JPEG or JPG file.'));
      triggerModalShake();
      return;
    }

    setPhotoFile(file);
    setPhotoCompressing(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawImageToCrop(event.target?.result as string);
        setPhotoCompressing(false);
        setActiveModal('photo_crop_custom');
      };
      reader.onerror = () => {
        setPhotoError(t('Failed to read selected file.'));
        setPhotoCompressing(false);
        triggerModalShake();
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Error reading image:', err);
      setPhotoError(t('Failed to process/compress selected photo.'));
      setPhotoCompressing(false);
      triggerModalShake();
    }
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
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profilePhoto: cleanedBase64
        })
      });

      const data = await res.json();
      setPhotoResponseData(data); // Store raw response data for the Response Details modal

      if (res.ok) {
        const returnedPhoto = data.profilePhoto || data.kycPhoto || cleanedBase64;
        const updatedProfile = { 
          ...abhaProfile, 
          photo: returnedPhoto,
          profilePhoto: returnedPhoto,
          name: data.name || abhaProfile.name,
          firstName: data.firstName || abhaProfile.firstName,
          middleName: data.middleName || abhaProfile.middleName,
          lastName: data.lastName || abhaProfile.lastName,
          mobile: data.mobile || abhaProfile.mobile,
          gender: data.gender || abhaProfile.gender,
          preferredAbhaAddress: data.preferredAbhaAddress || abhaProfile.preferredAbhaAddress
        };
        const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
        if (state.currentUser) {
          state.currentUser.photo = `data:image/jpeg;base64,${returnedPhoto}`;
          state.currentUser.abhaProfile = updatedProfile;
          localStorage.setItem('setu_state', JSON.stringify(state));
        }
        updateCurrentUser({
          photo: `data:image/jpeg;base64,${returnedPhoto}`,
          abhaProfile: updatedProfile
        });
        showToast(t('Profile photo updated successfully!'));
        setPhotoLoading(false);
        setActiveModal(null);
        setConfirmPhotoModal(false);
        setPhotoFile(null);
        setPhotoPreview('');
        setPhotoError('');
        resetAllForms();
      } else {
        const errorMsg = data.message || data.description || data.error || t('Failed to upload picture.');
        setPhotoError(errorMsg);
        setPhotoLoading(false);
        showToast(errorMsg, true);
        triggerModalShake();
      }
    } catch (err: any) {
      const errorMsg = err.message || t('Failed to upload picture.');
      setPhotoError(errorMsg);
      setPhotoLoading(false);
      showToast(errorMsg, true);
      triggerModalShake();
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm(t('Are you sure you want to remove your profile photo?'))) {
      return;
    }
    setPhotoLoading(true);
    setPhotoError('');
    try {
      const res = await fetch('/api/abdm/v3/profile/account', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profilePhoto: '' // empty string to indicate removal
        })
      });

      const data = await res.json();
      if (res.ok) {
        const updatedProfile = { 
          ...abhaProfile, 
          photo: '',
          profilePhoto: '',
        };
        const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
        if (state.currentUser) {
          state.currentUser.photo = '';
          state.currentUser.abhaProfile = updatedProfile;
          localStorage.setItem('setu_state', JSON.stringify(state));
        }
        updateCurrentUser({
          photo: '',
          abhaProfile: updatedProfile
        });
        showToast(t('Profile photo removed successfully!'));
        setPhotoFile(null);
        setPhotoPreview('');
        setPhotoError('');
        setActiveModal(null);
      } else {
        const errorMsg = data.message || data.description || data.error || t('Failed to remove picture.');
        setPhotoError(errorMsg);
        showToast(errorMsg, true);
      }
    } catch (err: any) {
      const errorMsg = err.message || t('Failed to remove picture.');
      setPhotoError(errorMsg);
      showToast(errorMsg, true);
    } finally {
      setPhotoLoading(false);
    }
  };

  // 4. Set Password Actions (receives validated data from RHF handleSubmit)
  const handleSetPasswordSubmit = async (formData: { oldPassword?: string; newPassword: string; confirmPassword: string }) => {
    setOldPassword(formData.oldPassword || '');
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
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  gap: 16px;
                  width: 100%;
                  max-width: 680px;
                  margin-bottom: 8px;
                }
                .profile-actions-stack {
                  display: flex;
                  flex-direction: row;
                  flex-wrap: wrap;
                  justify-content: center;
                  align-items: center;
                  gap: 12px 24px;
                  width: 100%;
                  margin-top: 12px;
                }
                .profile-welcome-links {
                  display: flex !important;
                  gap: 16px !important;
                  flex-wrap: nowrap !important;
                  align-items: center !important;
                }
                .profile-welcome-links button {
                  display: inline-flex !important;
                  align-items: center !important;
                  gap: 6px !important;
                  background: none !important;
                  border: none !important;
                  padding: 4px 0 !important;
                  color: #c2410c !important;
                  font-weight: 600 !important;
                  font-size: 13px !important;
                  cursor: pointer !important;
                  white-space: nowrap !important;
                }
                @media (max-width: 480px) {
                  .profile-welcome-row {
                    flex-direction: row !important;
                    flex-wrap: nowrap !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    gap: 8px !important;
                  }
                  .profile-welcome-row h1 {
                    font-size: 14px !important;
                  }
                  .profile-welcome-links {
                    gap: 8px !important;
                  }
                  .profile-welcome-links button span {
                    display: none !important;
                  }
                  .profile-welcome-links button {
                    padding: 8px !important;
                    background: rgba(194, 65, 12, 0.08) !important;
                    border-radius: 50% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                  }
                }
              `}} />

              <div className="profile-layout-container">
                {/* Welcome Header & Actions Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: '580px',
                  marginBottom: '4px',
                  padding: '0 4px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }} className="profile-welcome-row">
                  <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    Welcome, {abhaProfile.name || [abhaProfile.firstName, abhaProfile.middleName, abhaProfile.lastName].filter(Boolean).join(' ') || currentUser?.name || "Ashish Patel"}
                  </h1>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }} className="profile-welcome-links">
                    <button
                      onClick={handleDownloadCard}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px 0',
                        color: '#c2410c',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Download style={{ width: '15px', height: '15px', color: '#c2410c' }} />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={handlePrintCard}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px 0',
                        color: '#c2410c',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Printer style={{ width: '15px', height: '15px', color: '#c2410c' }} />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={() => setActiveModal('print_pvc')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px 0',
                        color: '#c2410c',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <CreditCard style={{ width: '15px', height: '15px', color: '#c2410c' }} />
                      <span>Print PVC</span>
                    </button>
                    <button
                      onClick={handleShareCard}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px 0',
                        color: '#c2410c',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Share2 style={{ width: '15px', height: '15px', color: '#c2410c' }} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
                <article 
                  id="abha-card-capture-profile"
                  className="setu-abha-card" 
                  style={{ 
                    width: '100%',
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
                      background: '#264488', 
                      borderBottom: '2px solid #10b981' 
                    }}
                  >
                    <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img
                        src="/assets/svg/nha.svg"
                        alt="NHA Logo"
                        className="setu-abha-card-nha-img"
                        style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ textAlign: 'center', color: '#ffffff', flex: 1, padding: '0 6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="setu-abha-card-header-title" style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Ayushman Bharat Health Account</span>
                      <span className="setu-abha-card-header-subtitle" style={{ fontSize: '11px', opacity: 0.9, fontWeight: 600 }}>आयुष्मान भारत स्वास्थ्य खाता (आभा)</span>
                    </div>
                    <div style={{ height: '56px', width: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: '50%', border: '1px solid #cbd5e1', overflow: 'hidden', background: '#ffffff' }} className="setu-abha-card-abdm-wrapper">
                      <img
                        src="/assets/svg/abdm1.svg"
                        alt="ABDM Logo"
                        style={{ height: '100%', width: '100%', objectFit: 'contain' }}
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
                      background: 'radial-gradient(circle, #ffffff 0%, #f1f5f9 100%)', 
                      color: '#0f172a' 
                    }}
                  >
                    <div className="setu-abha-card-avatar-wrapper" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <div 
                        className="setu-abha-card-avatar" 
                        style={{ 
                          borderRadius: '6px', 
                          overflow: 'visible', 
                          border: '1px solid #94a3b8', 
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                        onClick={triggerPhotoSelect}
                      >
                        <img
                          src={getPhotoSrc(abhaProfile.photo || abhaProfile.profilePhoto || currentUser.photo)}
                          alt={abhaProfile.name || abhaProfile.firstName || 'ABHA User'}
                          style={{ width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150';
                          }}
                        />
                        {/* Always visible small edit badge */}
                        <div 
                          style={{ 
                            position: 'absolute', 
                            bottom: '-4px', 
                            right: '-4px', 
                            background: '#10b981', 
                            borderRadius: '50%', 
                            width: '20px', 
                            height: '20px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            border: '1.5px solid #ffffff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                            zIndex: 10
                          }}
                        >
                          <Pencil style={{ width: '10px', height: '10px', color: '#ffffff' }} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="setu-abha-card-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left', minWidth: 0 }}>
                      <div className="setu-abha-card-field">
                        <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>Name / नाम</span>
                        <strong className="setu-abha-card-value" style={{ color: '#0f172a', fontWeight: '800', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {abhaProfile.name ||
                            [abhaProfile.firstName, abhaProfile.middleName, abhaProfile.lastName].filter(Boolean).join(' ') ||
                            currentUser.name}
                        </strong>
                      </div>
                      
                      <div className="setu-abha-card-field">
                        <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>ABHA Number / आभा संख्या</span>
                        <strong className="setu-abha-card-value token-num" style={{ color: 'var(--accent-blue)', fontFamily: 'monospace', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span>{abhaProfile.ABHANumber || abhaProfile.abhaNumber}</span>
                          <button 
                            onClick={() => copyToClipboard(abhaProfile.ABHANumber || abhaProfile.abhaNumber || '', 'ABHA Number')}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              padding: '2px', 
                              cursor: 'pointer', 
                              display: 'inline-flex', 
                              alignItems: 'center',
                              color: 'var(--text-muted)'
                            }}
                            title="Copy ABHA Number"
                          >
                            <Copy style={{ width: '12px', height: '12px' }} />
                          </button>
                        </strong>
                      </div>
                      
                      <div className="setu-abha-card-field">
                        <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>ABHA Address / आभा पता</span>
                        <strong className="setu-abha-card-value token-num" style={{ color: '#0f172a', fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span>{abhaProfile.preferredAbhaAddress || abhaProfile.preferredAddress || abhaProfile.abhaAddress || abhaProfile.abhaId || (abhaProfile.phrAddress && abhaProfile.phrAddress.join(", "))}</span>
                          <button 
                            onClick={() => copyToClipboard(abhaProfile.preferredAbhaAddress || abhaProfile.preferredAddress || abhaProfile.abhaAddress || abhaProfile.abhaId || '', 'ABHA Address')}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              padding: '2px', 
                              cursor: 'pointer', 
                              display: 'inline-flex', 
                              alignItems: 'center',
                              color: 'var(--text-muted)'
                            }}
                            title="Copy ABHA Address"
                          >
                            <Copy style={{ width: '12px', height: '12px' }} />
                          </button>
                        </strong>
                      </div>
                      
                      <div className="setu-abha-card-row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
                        <div className="setu-abha-card-field" style={{ flex: 1, minWidth: 0 }}>
                          <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>Gender / लिंग</span>
                          <span className="setu-abha-card-value setu-abha-card-row-value" style={{ fontWeight: 600 }}>
                            {getGenderDisplay(abhaProfile.gender)}
                          </span>
                        </div>
                        <div className="setu-abha-card-field" style={{ flex: 1, minWidth: 0 }}>
                          <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>DOB / जन्म तिथि</span>
                          <span className="setu-abha-card-value setu-abha-card-row-value" style={{ fontWeight: 600 }}>{abhaProfile.dob}</span>
                        </div>
                        <div className="setu-abha-card-field" style={{ flex: 1, minWidth: 0 }}>
                          <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>Mobile / मोबाइल</span>
                          <span className="setu-abha-card-value setu-abha-card-row-value" style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span>{abhaProfile.mobile}</span>
                            <button 
                              onClick={triggerMobileEdit}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                padding: '2px', 
                                cursor: 'pointer', 
                                display: 'inline-flex', 
                                alignItems: 'center',
                                color: '#10b981'
                              }}
                              title="Edit Mobile Number"
                            >
                              <Pencil style={{ width: '10px', height: '10px' }} />
                            </button>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="setu-abha-card-qr-wrapper" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="setu-abha-card-qr" style={{ padding: '4px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({
                            district_name: (abhaProfile.districtName || "JABALPUR").toUpperCase(),
                            hid: abhaProfile.preferredAbhaAddress || abhaProfile.preferredAddress || abhaProfile.abhaAddress || abhaProfile.abhaId || "medibuddy.9981435702@abdm",
                            address: abhaProfile.address || "1787, Nagpur Road, In Front Of Sai Niwas, Medical, Jabalpur, Jabalpur, Madhya Pradesh",
                            gender: abhaProfile.gender ? (['male', 'm'].includes(abhaProfile.gender.toLowerCase()) ? 'M' : ['female', 'f'].includes(abhaProfile.gender.toLowerCase()) ? 'F' : abhaProfile.gender) : 'M',
                            distlgd: abhaProfile.distLgd || abhaProfile.distlgd || "411",
                            dob: abhaProfile.dob || "24-09-1992",
                            name: abhaProfile.name || [abhaProfile.firstName, abhaProfile.middleName, abhaProfile.lastName].filter(Boolean).join(' ') || currentUser?.name || "Ashish Patel",
                            mobile: abhaProfile.mobile || "9981435702",
                            statelgd: abhaProfile.stateLgd || abhaProfile.statelgd || "23",
                            hidn: abhaProfile.ABHANumber || abhaProfile.abhaNumber || "91-6005-4602-2077",
                            "state name": (abhaProfile.stateName || "MADHYA PRADESH").toUpperCase()
                          }))}`}
                          alt="ABHA QR"
                          className="setu-abha-card-qr-img"
                          style={{ display: 'block' }}
                        />
                      </div>
                    </div>
                  </div>
                </article>
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
                    <Badge variant="success" icon={<Check style={{ width: '10px', height: '10px' }} />}>
                      {t('ACTIVE')}
                    </Badge>
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
                  
                  <form onSubmit={handlePhotoUploadSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    {/* Single Large Photo Container */}
                    <div style={{ position: 'relative', width: '140px', height: '175px', borderRadius: '12px', border: photoPreview ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)', overflow: 'visible', background: 'var(--bg-primary)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                      <div style={{ width: '100%', height: '100%', borderRadius: '10px', overflow: 'hidden' }}>
                        <img 
                          src={photoPreview || getPhotoSrc(abhaProfile.photo || abhaProfile.profilePhoto || currentUser.photo)} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          alt="Profile photo"
                        />
                      </div>
                      
                      {/* Pencil button (blue) to upload/edit image */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          position: 'absolute',
                          bottom: '-8px',
                          right: '-8px',
                          background: '#2563eb',
                          border: '2px solid #ffffff',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#ffffff',
                          boxShadow: '0 4px 6px rgba(37, 99, 235, 0.25)',
                          transition: 'all 0.2s ease',
                          zIndex: 10
                        }}
                        title="Upload Photo"
                      >
                        <Pencil style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>

                    <input 
                      ref={fileInputRef}
                      id="custom-file-upload-input"
                      type="file" 
                      accept="image/jpeg, image/jpg"
                      onChange={handlePhotoFileChange} 
                      style={{ display: 'none' }}
                    />

                    {/* Brief Instruction */}
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '300px', lineHeight: '1.4', margin: '0' }}>
                      Please upload JPG, JPEG file types. Maximum size allowed for the attachment is 100KB.
                    </p>

                    {photoError && <div style={{ color: 'var(--danger)', fontSize: '11px', animation: 'fadeIn 0.2s' }}>{photoError}</div>}

                    {/* Once cropped, ask to save and upload */}
                    {photoPreview && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', animation: 'fadeIn 0.25s ease' }}>
                        <span style={{ fontSize: '11.5px', color: 'var(--accent-teal)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check style={{ width: '14px', height: '14px' }} />
                          <span>Photo cropped successfully! Click save to upload.</span>
                        </span>
                        
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button 
                            type="button"
                            onClick={() => {
                              setPhotoPreview('');
                              setPhotoFile(null);
                            }}
                            style={{
                              padding: '10px 20px', 
                              border: '1px solid var(--border-color)', 
                              borderRadius: '8px', 
                              background: 'var(--bg-primary)', 
                              color: 'var(--text-primary)', 
                              fontWeight: 700, 
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Cancel
                          </button>
                          
                          <button 
                            type="submit" 
                            disabled={photoLoading} 
                            style={{ 
                              padding: '10px 24px', 
                              border: 'none', 
                              borderRadius: '8px', 
                              background: 'var(--accent-teal)', 
                              color: '#ffffff', 
                              fontWeight: 800, 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12px',
                              boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
                            }}
                          >
                            {photoLoading ? (
                              <>
                                <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                <span>Saving...</span>
                              </>
                            ) : 'Save & Upload'}
                          </button>
                        </div>
                      </div>
                    )}
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
            width: '580px',
            minHeight: '270px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            boxShadow: 'none',
            background: 'radial-gradient(circle, #ffffff 0%, #f8fafc 100%)',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Back Card Header identical to Front Card Header */}
          <div 
            className="setu-abha-card-header" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              background: '#264488', 
              borderBottom: '2px solid #10b981',
              padding: '16px',
              height: '68px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img
                src="/assets/svg/nha.svg"
                alt="NHA Logo"
                className="setu-abha-card-nha-img"
                style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div style={{ textAlign: 'center', color: '#ffffff', flex: 1, padding: '0 6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="setu-abha-card-header-title" style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Ayushman Bharat Health Account</span>
              <span className="setu-abha-card-header-subtitle" style={{ fontSize: '11px', opacity: 0.9, fontWeight: 600 }}>आयुष्मान भारत स्वास्थ्य खाता (आभा)</span>
            </div>
            <div style={{ height: '56px', width: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: '50%', border: '1px solid #cbd5e1', overflow: 'hidden', background: '#ffffff' }} className="setu-abha-card-abdm-wrapper">
              <img
                src="/assets/svg/abdm1.svg"
                alt="ABDM Logo"
                style={{ height: '100%', width: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Back Card Body */}
          <div 
            className="pvc-back-body" 
            style={{ 
              padding: '16px', 
              display: 'flex', 
              flexDirection: 'column', 
              height: 'calc(100% - 68px)', 
              boxSizing: 'border-box',
              justifyContent: 'space-between',
              color: '#0f172a'
            }}
          >
            {/* Top row with Instructions heading and Toll-Free Number */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', color: '#0f172a' }}>
              <span>Instructions</span>
              <span>Toll-Free Number: 1800 114 477</span>
            </div>

            {/* Billingual instructions list */}
            <ul className="pvc-instructions" style={{ margin: 0, paddingLeft: '20px', fontSize: '9.5px', lineHeight: '1.4', color: '#334155', textAlign: 'left', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '6px' }}>
                With this ABHA you have become a part of India's digital health ecosystem.
                <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 500 }}>इस आभा के साथ आप भारत के डिजिटल हेल्थ इकोसिस्टम का हिस्सा बन गए हैं।</div>
              </li>
              <li style={{ marginBottom: '6px' }}>
                ABHA provides you a unique identification and helps in storing - safekeeping all your digital health records at one place.
                <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 500 }}>आभा आपको एक विशिष्ट पहचान प्रदान करता है और आपके सभी डिजिटल स्वास्थ्य रिकॉर्ड को सुरक्षित एक ही स्थान पर संग्रहीत रखने में मदद करता है।</div>
              </li>
              <li style={{ marginBottom: '6px' }}>
                You can download the ABHA mobile app, Aarogya Setu or other ABDM enabled app to view and share your digital health records with ABDM registered healthcare service providers.
                <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 500 }}>आप एबीडीएम पंजीकृत स्वास्थ्य सेवा प्रदाताओं के साथ अपने डिजिटल स्वास्थ्य रिकॉर्ड देखने और साझा करने के लिए आभा मोबाइल ऐप, आरोग्य सेतु या अन्य एबीडीएम सक्षम ऐप डाउनलोड कर सकते हैं।</div>
              </li>
              <li style={{ marginBottom: '6px' }}>
                If this card is lost kindly download it from www.abha.abdm.gov.in, it is digitally acceptable.
                <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 500 }}>यदि यह कार्ड खो जाता है तो कृपया इसे www.abha.abdm.gov.in से डाउनलोड करें, यह डिजिटल रूप से स्वीकार्य है।</div>
              </li>
            </ul>

            {/* Divider line and footer */}
            <div style={{ width: '100%', marginTop: '6px' }}>
              <hr style={{ border: 'none', borderTop: '1px solid #cbd5e1', margin: '4px 0' }} />
              <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>
                Issued on: 30-11-2022
              </div>
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

            {/* Tabs Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', margin: '0 -24px' }}>
              <button 
                onClick={() => setPvcTab('front')} 
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  background: pvcTab === 'front' ? 'transparent' : 'var(--bg-secondary)', 
                  border: 'none',
                  borderBottom: pvcTab === 'front' ? '2.5px solid var(--accent-teal)' : '2.5px solid transparent',
                  color: pvcTab === 'front' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 700, 
                  fontSize: '13px', 
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Front View Of PVC Card
              </button>
              <button 
                onClick={() => setPvcTab('back')} 
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  background: pvcTab === 'back' ? 'transparent' : 'var(--bg-secondary)', 
                  border: 'none',
                  borderBottom: pvcTab === 'back' ? '2.5px solid var(--accent-teal)' : '2.5px solid transparent',
                  color: pvcTab === 'back' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 700, 
                  fontSize: '13px', 
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Back View Of PVC Card
              </button>
            </div>

            {/* Modal Body / Previews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', minHeight: '300px', justifyContent: 'center', padding: '10px 0' }}>
              {pvcTab === 'front' ? (
                /* FRONT PREVIEW */
                <div style={{ width: '100%', maxWidth: '440px' }}>
                  <article 
                    className="setu-abha-card" 
                    style={{ 
                      width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1',
                      fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minHeight: '277px', background: '#ffffff'
                    }}
                  >
                    {/* Header */}
                    <div className="setu-abha-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#264488', borderBottom: '2px solid #10b981', height: '56px', boxSizing: 'border-box' }}>
                      <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img src="/assets/svg/nha.svg" alt="NHA Logo" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
                      </div>
                      <div style={{ textAlign: 'center', color: '#ffffff', flex: 1, padding: '0 6px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.2px', textTransform: 'uppercase' }}>Ayushman Bharat Health Account</span>
                        <span style={{ fontSize: '8px', opacity: 0.9, fontWeight: 600 }}>आयुष्मान भारत स्वास्थ्य खाता (आभा)</span>
                      </div>
                      <div style={{ height: '42px', width: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: '50%', border: '1px solid #cbd5e1', overflow: 'hidden', background: '#ffffff' }}>
                        <img src="/assets/svg/abdm1.svg" alt="ABDM Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                      </div>
                    </div>
                    
                    {/* Body */}
                    <div className="setu-abha-card-body" style={{ display: 'grid', gridTemplateColumns: '85px 1fr 75px', gap: '12px', padding: '12px', background: 'radial-gradient(circle, #ffffff 0%, #f1f5f9 100%)', color: '#0f172a', alignItems: 'center', height: 'calc(100% - 56px)', boxSizing: 'border-box' }}>
                      <div style={{ width: '85px', height: '110px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #94a3b8', flexShrink: 0 }}>
                        <img src={getPhotoSrc(abhaProfile.photo || abhaProfile.profilePhoto || currentUser.photo)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', minWidth: 0 }}>
                        <div>
                          <span style={{ fontSize: '6px', color: '#64748b', display: 'block', fontWeight: 700 }}>Name / नाम</span>
                          <strong style={{ fontSize: '10px', color: '#0f172a', fontWeight: '800', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {abhaProfile.name || [abhaProfile.firstName, abhaProfile.middleName, abhaProfile.lastName].filter(Boolean).join(' ') || currentUser.name}
                          </strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '6px', color: '#64748b', display: 'block', fontWeight: 700 }}>ABHA Number / आभा संख्या</span>
                          <strong style={{ fontSize: '9.5px', color: 'var(--accent-blue)', fontFamily: 'monospace', fontWeight: 800 }}>
                            {abhaProfile.ABHANumber || abhaProfile.abhaNumber}
                          </strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '6px', color: '#64748b', display: 'block', fontWeight: 700 }}>ABHA Address / आभा पता</span>
                          <strong style={{ fontSize: '8px', color: '#0f172a', fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all' }}>
                            {abhaProfile.preferredAbhaAddress || abhaProfile.preferredAddress || abhaProfile.abhaAddress || abhaProfile.abhaId}
                          </strong>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '4px', width: '100%', marginTop: '2px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '5px', color: '#64748b', display: 'block', fontWeight: 700 }}>Gender / लिंग</span>
                            <span style={{ fontSize: '8px', fontWeight: 600, color: '#0f172a' }}>{getGenderDisplay(abhaProfile.gender)}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '5px', color: '#64748b', display: 'block', fontWeight: 700 }}>DOB / जन्म तिथि</span>
                            <span style={{ fontSize: '8px', fontWeight: 600, color: '#0f172a' }}>{abhaProfile.dob}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '5px', color: '#64748b', display: 'block', fontWeight: 700 }}>Mobile / मोबाइल</span>
                            <span style={{ fontSize: '8px', fontWeight: 600, color: '#0f172a' }}>{abhaProfile.mobile}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({
                            district_name: (abhaProfile.districtName || "JABALPUR").toUpperCase(),
                            hid: abhaProfile.preferredAbhaAddress || abhaProfile.preferredAddress || abhaProfile.abhaAddress || abhaProfile.abhaId,
                            address: abhaProfile.address || "1787, Nagpur Road, In Front Of Sai Niwas, Medical, Jabalpur, Jabalpur, Madhya Pradesh",
                            gender: abhaProfile.gender ? (['male', 'm'].includes(abhaProfile.gender.toLowerCase()) ? 'M' : ['female', 'f'].includes(abhaProfile.gender.toLowerCase()) ? 'F' : abhaProfile.gender) : 'M',
                            distlgd: abhaProfile.distLgd || abhaProfile.distlgd || "411",
                            dob: abhaProfile.dob || "24-09-1992",
                            name: abhaProfile.name || [abhaProfile.firstName, abhaProfile.middleName, abhaProfile.lastName].filter(Boolean).join(' ') || currentUser?.name || "Ashish Patel",
                            mobile: abhaProfile.mobile || "9981435702",
                            statelgd: abhaProfile.stateLgd || abhaProfile.statelgd || "23",
                            hidn: abhaProfile.ABHANumber || abhaProfile.abhaNumber || "91-6005-4602-2077",
                            "state name": (abhaProfile.stateName || "MADHYA PRADESH").toUpperCase()
                          }))}`}
                          style={{ width: '75px', height: '75px', display: 'block' }}
                        />
                      </div>
                    </div>
                  </article>
                </div>
              ) : (
                /* BACK PREVIEW */
                <div style={{ width: '100%', maxWidth: '440px' }}>
                  <article 
                    className="pvc-back-card"
                    style={{
                      width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1',
                      fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minHeight: '277px', background: 'radial-gradient(circle, #ffffff 0%, #f8fafc 100%)'
                    }}
                  >
                    {/* Header */}
                    <div className="setu-abha-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#264488', borderBottom: '2px solid #10b981', height: '56px', boxSizing: 'border-box' }}>
                      <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img src="/assets/svg/nha.svg" alt="NHA Logo" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
                      </div>
                      <div style={{ textAlign: 'center', color: '#ffffff', flex: 1, padding: '0 6px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.2px', textTransform: 'uppercase' }}>Ayushman Bharat Health Account</span>
                        <span style={{ fontSize: '8px', opacity: 0.9, fontWeight: 600 }}>आयुष्मान भारत स्वास्थ्य खाता (आभा)</span>
                      </div>
                      <div style={{ height: '42px', width: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: '50%', border: '1px solid #cbd5e1', overflow: 'hidden', background: '#ffffff' }}>
                        <img src="/assets/svg/abdm1.svg" alt="ABDM Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                      </div>
                    </div>
                    
                    {/* Body */}
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', height: 'calc(100% - 56px)', boxSizing: 'border-box', justifyContent: 'space-between', color: '#0f172a' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '9px', marginBottom: '4px', color: '#0f172a' }}>
                        <span>Instructions</span>
                        <span>Toll-Free Number: 1800 114 477</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '7.5px', lineHeight: '1.3', color: '#334155', textAlign: 'left', listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>
                          With this ABHA you have become a part of India's digital health ecosystem.
                          <div style={{ color: '#64748b', fontSize: '7px' }}>इस आभा के साथ आप भारत के डिजिटल हेल्थ इकोसिस्टम का हिस्सा बन गए हैं।</div>
                        </li>
                        <li style={{ marginBottom: '4px' }}>
                          ABHA provides you a unique identification and helps in storing - safekeeping all your digital health records at one place.
                          <div style={{ color: '#64748b', fontSize: '7px' }}>आभा आपको एक विशिष्ट पहचान प्रदान करता है और आपके सभी डिजिटल स्वास्थ्य रिकॉर्ड को सुरक्षित एक ही स्थान पर संग्रहीत रखने में मदद करता है।</div>
                        </li>
                        <li style={{ marginBottom: '4px' }}>
                          You can download the ABHA mobile app, Aarogya Setu or other ABDM enabled app to view and share your digital health records with ABDM registered healthcare service providers.
                          <div style={{ color: '#64748b', fontSize: '7px' }}>आप एबीडीएम पंजीकृत स्वास्थ्य सेवा प्रदाताओं के साथ अपने डिजिटल स्वास्थ्य रिकॉर्ड देखने और साझा करने के लिए आभा मोबाइल ऐप, आरोग्य सेतु या अन्य एबीडीएम सक्षम ऐप डाउनलोड कर सकते हैं।</div>
                        </li>
                        <li style={{ marginBottom: '4px' }}>
                          If this card is lost kindly download it from www.abha.abdm.gov.in, it is digitally acceptable.
                          <div style={{ color: '#64748b', fontSize: '7px' }}>यदि यह कार्ड खो जाता है तो कृपया इसे www.abha.abdm.gov.in से डाउनलोड करें, यह डिजिटल रूप से स्वीकार्य है।</div>
                        </li>
                      </ul>
                      
                      <div style={{ width: '100%', marginTop: '4px' }}>
                        <hr style={{ border: 'none', borderTop: '1px solid #cbd5e1', margin: '3px 0' }} />
                        <div style={{ textAlign: 'center', fontSize: '8.5px', fontWeight: 'bold', color: '#334155' }}>
                          Issued on: 30-11-2022
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setActiveModal(null)} 
                style={{ 
                  flex: 1, 
                  padding: '10px 14px', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  background: 'var(--bg-secondary)', 
                  color: 'var(--text-primary)', 
                  fontWeight: 700, 
                  cursor: 'pointer', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px' 
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
                <span>Close</span>
              </button>
              <button 
                onClick={handlePrintPvc} 
                style={{ 
                  flex: 1, 
                  padding: '10px 14px', 
                  border: 'none', 
                  borderRadius: '8px', 
                  background: '#c2410c', 
                  color: '#ffffff', 
                  fontWeight: 800, 
                  cursor: 'pointer', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px' 
                }}
              >
                <Printer style={{ width: '16px', height: '16px', color: '#ffffff' }} />
                <span>Print</span>
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

      {/* Photo Crop Modal */}
      {activeModal === 'photo_crop_custom' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <ImageCropper 
            imageSrc={rawImageToCrop}
            onCropComplete={(croppedBase64, sizeKb) => {
              setPhotoPreview(`data:image/jpeg;base64,${croppedBase64}`);
              setPhotoError('');
              setActiveModal(null);
            }}
            onCancel={() => {
              setRawImageToCrop('');
              setActiveModal(null);
            }}
          />
        </div>
      )}

      {/* 13. Response Details Modal */}
      {activeModal === 'photo_response_custom' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div 
            className="custom-bottom-sheet"
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '460px', padding: '24px', boxShadow: 'var(--surface-shadow)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left',
              position: 'relative', overflowY: 'auto', maxHeight: '85vh'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Check style={{ color: photoResponseData && !photoResponseData.code ? 'var(--success)' : 'var(--danger)', width: '18px', height: '18px' }} />
                <span>Response Details</span>
              </h3>
              <button onClick={() => { setActiveModal(null); setPhotoResponseData(null); }} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Success / Failure Banner */}
              {photoResponseData && !photoResponseData.code ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px 16px', borderRadius: '12px' }}>
                  <Check style={{ color: 'var(--success)', width: '16px', height: '16px' }} />
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    Profile updated successfully on ABHA card
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 16px', borderRadius: '12px' }}>
                  <AlertCircle style={{ color: 'var(--danger)', width: '16px', height: '16px' }} />
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    Gateway submission failed
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderBottom: '1px solid var(--border-color)', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                  API RESPONSE DATA
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '300px', overflowY: 'auto' }}>
                  {photoResponseData ? (
                    Object.entries(photoResponseData).map(([key, val]) => {
                      if (key === 'profilePhoto' || key === 'kycPhoto' || key === 'photo') {
                        return (
                          <div key={key} style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', fontSize: '11px', padding: '10px 14px', background: 'var(--bg-secondary)' }}>
                            <span style={{ width: '140px', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>{key}</span>
                            <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all', fontFamily: 'monospace', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              [base64 image data - {(typeof val === 'string' ? val.length / 1024 : 0).toFixed(1)} KB]
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div key={key} style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', fontSize: '11px', padding: '10px 14px', background: 'var(--bg-secondary)' }}>
                          <span style={{ width: '140px', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>{key}</span>
                          <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all', fontFamily: 'monospace', flex: 1 }}>
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '14px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                      No data received.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Actions Container at Bottom */}
            <div 
              className="sticky-actions-container"
              style={{ 
                display: 'flex', 
                gap: '10px', 
                marginTop: '12px', 
                borderTop: '1px solid var(--border-color)', 
                paddingTop: '16px' 
              }}
            >
              <button 
                type="button" 
                onClick={() => { setActiveModal(null); setPhotoResponseData(null); }} 
                style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', textAlign: 'center' }}
              >
                Close & Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
