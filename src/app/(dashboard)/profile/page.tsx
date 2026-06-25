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
// Import modular profile tab components and modals
import { MyProfileTab } from './components/my_profile/MyProfileTab';
import { EditProfileTab } from './components/edit_profile/EditProfileTab';
import { SetPasswordTab } from './components/set_password/SetPasswordTab';
import { ReKycTab } from './components/re_kyc/ReKycTab';
import { DeactivateDeleteTab } from './components/deactivate_delete/DeactivateDeleteTab';
import { DelinkTab } from './components/delink/DelinkTab';
import { ProfileModals } from './components/ProfileModals';


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

/**
 * Interface representing the ABDM Profile returned from gateway v3/profile/account.
 */
export interface AbdmProfile {
  ABHANumber: string;
  preferredAbhaAddress: string;
  mobile: string;
  mobileVerified?: boolean;
  firstName: string;
  middleName: string;
  lastName: string;
  name: string;
  yearOfBirth: string;
  dayOfBirth: string;
  monthOfBirth: string;
  gender: string;
  email?: string;
  profilePhoto: string;
  status: string;
  stateCode?: string;
  districtCode?: string;
  pincode?: string;
  address?: string;
  kycPhoto?: string;
  stateName?: string;
  districtName?: string;
  subdistrictName?: string;
  townName?: string;
  authMethods?: string[];
  tags?: Record<string, any>;
  kycVerified?: boolean;
  verificationStatus?: string;
  verificationType?: string;
  source?: string;
  emailVerified?: string;
  localizedDetails?: {
    name?: string;
    stateName?: string;
    districtName?: string;
    villageName?: string;
    wardName?: string;
    townName?: string;
    gender?: string;
    localizedLabels?: {
      name?: string;
      abhaNumber?: string;
      abhaAddress?: string;
      gender?: string;
      dob?: string;
      mobile?: string;
    };
  };
  createdDate?: string;
}

/**
 * Formats date of birth details into DD-MM-YYYY format.
 * @param {Partial<AbdmProfile> | undefined} profileData - profile object from API
 * @returns {string} formatted DOB string
 */
const getDobString = (profileData: Partial<AbdmProfile> | undefined): string => {
  if (!profileData) return 'N/A';
  const day = profileData.dayOfBirth || '';
  const month = profileData.monthOfBirth || '';
  const year = profileData.yearOfBirth || '';
  
  if (day && month && year) {
    const formattedDay = day.toString().padStart(2, '0');
    const formattedMonth = month.toString().padStart(2, '0');
    return `${formattedDay}-${formattedMonth}-${year}`;
  }
  
  return year ? year.toString() : 'N/A';
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

  // Profile details state (integrated from GET api/abdm/v3/profile/account)
  const [profileDetails, setProfileDetails] = useState<{ status: string; data: AbdmProfile } | null>(null);
  const [profileDetailsLoading, setProfileDetailsLoading] = useState(false);
  const [profileDetailsError, setProfileDetailsError] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const fetchProfileDetails = async () => {
    setProfileDetailsLoading(true);
    setProfileDetailsError(null);
    try {
      const res = await fetch('/api/abdm/v3/profile/account');
      if (!res.ok) {
        throw new Error(t('Failed to fetch profile details.'));
      }
      const data = await res.json();
      
      // Standardize the response structure to handle both wrapped and unwrapped profile objects.
      // If the response contains a "data" property (e.g. from NestJS identityService), use it.
      // If the response is the profile object itself (e.g. has ABHANumber), wrap it under the "data" field
      // so that UI and sub-components can consistently reference profileDetails.data.<field>.
      if (data && data.status === 'success' && data.data) {
        setProfileDetails(data);
      } else if (data && data.ABHANumber) {
        setProfileDetails({ status: 'success', data: data });
      } else {
        setProfileDetails({ status: 'success', data: data });
      }
    } catch (err: any) {
      setProfileDetailsError(err.message || t('Something went wrong while fetching profile details.'));
    } finally {
      setProfileDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my_profile' && !profileDetails) {
      fetchProfileDetails();
    }
  }, [activeTab, profileDetails]);

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
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
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
            /* Styling matches printable-abha-card */
            .printable-abha-card {
              width: 580px;
              border-radius: 16px;
              overflow: hidden;
              border: 1px solid rgba(31, 58, 96, 0.15) !important;
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .printable-abha-card-header {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              padding: 12px 16px !important;
              background: #264488 !important;
              border-bottom: 2px solid #00d4aa !important;
              color: #ffffff !important;
              height: 68px !important;
              box-sizing: border-box !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .printable-abha-card-nha-img {
              height: 100% !important;
              width: auto !important;
            }
            .printable-abha-card-abdm-wrapper {
              height: 52px !important;
              width: 52px !important;
              border-radius: 50% !important;
              border: 1px solid #cbd5e1 !important;
              overflow: hidden !important;
              background: #ffffff !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .printable-abha-card-body {
              position: relative !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              padding: 14px !important;
              background: radial-gradient(circle, #ffffff 0%, #f1f5f9 100%) !important;
              color: #0f172a !important;
              flex: 1 !important;
              box-sizing: border-box !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .printable-abha-card-avatar {
              width: 95px !important;
              height: 120px !important;
              border-radius: 8px !important;
              overflow: hidden !important;
              border: 1.5px solid #cbd5e1 !important;
            }
            .printable-abha-card-details {
              flex: 1 !important;
              display: flex !important;
              flex-direction: column !important;
              gap: 6px !important;
              text-align: left !important;
            }
            .printable-abha-card-label {
              font-size: 8px !important;
              color: #64748b !important;
              display: block !important;
              font-weight: 750 !important;
            }
            .printable-abha-card-value {
              font-size: 13.5px !important;
              color: #0f172a !important;
              font-weight: 800 !important;
              display: block !important;
            }
            .token-num {
              font-family: monospace !important;
            }
            .printable-abha-card-qr-img {
              width: 100% !important;
              height: 100% !important;
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
            <MyProfileTab
              abhaProfile={abhaProfile}
              currentUser={currentUser}
              t={t}
              isDemographicsExpanded={isDemographicsExpanded}
              setIsDemographicsExpanded={setIsDemographicsExpanded}
              getPhotoSrc={getPhotoSrc}
              getGenderDisplay={getGenderDisplay}
              copyToClipboard={copyToClipboard}
              handleDownloadCard={handleDownloadCard}
              handlePrintCard={handlePrintCard}
              handleShareCard={handleShareCard}
              triggerPhotoSelect={triggerPhotoSelect}
              triggerMobileEdit={triggerMobileEdit}
              setActiveModal={setActiveModal}
              profileDetails={profileDetails}
              profileDetailsLoading={profileDetailsLoading}
              profileDetailsError={profileDetailsError}
              fetchProfileDetails={fetchProfileDetails}
              getDobString={getDobString}
            />
          )}

          {/* TAB 3: Edit Profile */}
          {activeTab === 'edit_profile' && (
            <EditProfileTab
              abhaProfile={abhaProfile}
              currentUser={currentUser}
              t={t}
              setActiveTab={setActiveTab}
              editProfileSubTab={editProfileSubTab}
              setEditProfileSubTab={setEditProfileSubTab}
              mobileLoading={mobileLoading}
              mobileCoolingTimer={mobileCoolingTimer}
              mobileForm={mobileForm}
              handleMobileSubmit={handleMobileSubmit}
              mobileError={mobileError}
              setMobileError={setMobileError}
              emailLoading={emailLoading}
              emailCoolingTimer={emailCoolingTimer}
              emailForm={emailForm}
              handleEmailSubmit={handleEmailSubmit}
              emailError={emailError}
              emailSent={emailSent}
              newEmail={newEmail}
              photoPreview={photoPreview}
              setPhotoPreview={setPhotoPreview}
              setPhotoFile={setPhotoFile}
              photoLoading={photoLoading}
              photoError={photoError}
              fileInputRef={fileInputRef}
              handlePhotoUploadSubmit={handlePhotoUploadSubmit}
              handlePhotoFileChange={handlePhotoFileChange}
              getPhotoSrc={getPhotoSrc}
            />
          )}

          {/* TAB 4: Set Password */}
          {activeTab === 'set_password' && (
            <SetPasswordTab
              t={t}
              setActiveTab={setActiveTab}
              passSuccess={passSuccess}
              passAuthMethod={passAuthMethod}
              setPassAuthMethod={setPassAuthMethod}
              passwordForm={passwordForm}
              handleSetPasswordSubmit={handleSetPasswordSubmit}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              passError={passError}
              passLoading={passLoading}
            />
          )}

          {/* TAB 5: Re-KYC Verification */}
          {activeTab === 're_kyc' && (
            <ReKycTab
              reKycSuccess={reKycSuccess}
              abhaProfile={abhaProfile}
              reKycError={reKycError}
              handleRequestReKycOtp={handleRequestReKycOtp}
              reKycLoading={reKycLoading}
            />
          )}

          {/* TAB 6: Deactivate or Delete ABHA */}
          {activeTab === 'deactivate_delete' && (
            <DeactivateDeleteTab
              deactivateOption={deactivateOption}
              setDeactivateOption={setDeactivateOption}
              deactivateAuthMethod={deactivateAuthMethod}
              setDeactivateAuthMethod={setDeactivateAuthMethod}
              deactivateError={deactivateError}
              deactivateLoading={deactivateLoading}
              handleDeactivateRequest={handleDeactivateRequest}
            />
          )}

          {/* TAB 7: Delink Mobile Number */}
          {activeTab === 'delink' && (
            <DelinkTab
              delinkError={delinkError}
              handleRequestDelinkOtp={handleRequestDelinkOtp}
              delinkLoading={delinkLoading}
            />
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

      {/* Render all other workflow dialogs and overlays via ProfileModals */}
      <ProfileModals
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        abhaProfile={abhaProfile}
        currentUser={currentUser}
        t={t}
        pvcTab={pvcTab}
        setPvcTab={setPvcTab}
        getPhotoSrc={getPhotoSrc}
        getGenderDisplay={getGenderDisplay}
        handlePrintPvc={handlePrintPvc}
        shakeModal={shakeModal}
        mobileOtpStep={mobileOtpStep}
        setMobileOtpStep={setMobileOtpStep}
        mobileForm={mobileForm}
        handleMobileSubmit={handleMobileSubmit}
        mobileLoading={mobileLoading}
        mobileCoolingTimer={mobileCoolingTimer}
        mobileError={mobileError}
        setMobileError={setMobileError}
        newMobile={newMobile}
        mobileOtp={mobileOtp}
        setMobileOtp={setMobileOtp}
        handleVerifyMobileOtp={handleVerifyMobileOtp}
        emailSent={emailSent}
        emailForm={emailForm}
        handleEmailSubmit={handleEmailSubmit}
        emailLoading={emailLoading}
        emailCoolingTimer={emailCoolingTimer}
        emailError={emailError}
        newEmail={newEmail}
        photoPreview={photoPreview}
        setPhotoPreview={setPhotoPreview}
        photoFile={photoFile}
        setPhotoFile={setPhotoFile}
        photoLoading={photoLoading}
        photoError={photoError}
        setPhotoError={setPhotoError}
        handlePhotoFileChange={handlePhotoFileChange}
        handlePhotoUploadSubmit={handlePhotoUploadSubmit}
        passSuccess={passSuccess}
        passOtpStep={passOtpStep}
        setPassOtpStep={setPassOtpStep}
        passwordForm={passwordForm}
        handleSetPasswordSubmit={handleSetPasswordSubmit}
        passAuthMethod={passAuthMethod}
        setPassAuthMethod={setPassAuthMethod}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        passError={passError}
        setPassError={setPassError}
        passLoading={passLoading}
        passOtp={passOtp}
        setPassOtp={setPassOtp}
        handleVerifyPasswordOtp={handleVerifyPasswordOtp}
        reKycSuccess={reKycSuccess}
        reKycOtpStep={reKycOtpStep}
        setReKycOtpStep={setReKycOtpStep}
        reKycError={reKycError}
        setReKycError={setReKycError}
        handleRequestReKycOtp={handleRequestReKycOtp}
        reKycLoading={reKycLoading}
        reKycOtp={reKycOtp}
        setReKycOtp={setReKycOtp}
        handleVerifyReKycOtp={handleVerifyReKycOtp}
        deactivateConfirmed={deactivateConfirmed}
        deactivateOtpStep={deactivateOtpStep}
        setDeactivateOtpStep={setDeactivateOtpStep}
        deactivateOption={deactivateOption}
        setDeactivateOption={setDeactivateOption}
        deactivateAuthMethod={deactivateAuthMethod}
        setDeactivateAuthMethod={setDeactivateAuthMethod}
        deactivateError={deactivateError}
        setDeactivateError={setDeactivateError}
        deactivateLoading={deactivateLoading}
        handleDeactivateRequest={handleDeactivateRequest}
        deactivateOtp={deactivateOtp}
        setDeactivateOtp={setDeactivateOtp}
        handleVerifyDeactivateOtp={handleVerifyDeactivateOtp}
        delinkOtpStep={delinkOtpStep}
        setDelinkOtpStep={setDelinkOtpStep}
        delinkError={delinkError}
        setDelinkError={setDelinkError}
        handleRequestDelinkOtp={handleRequestDelinkOtp}
        delinkLoading={delinkLoading}
        delinkOtp={delinkOtp}
        setDelinkOtp={setDelinkOtp}
        handleVerifyDelinkOtp={handleVerifyDelinkOtp}
        rawImageToCrop={rawImageToCrop}
        setRawImageToCrop={setRawImageToCrop}
        photoResponseData={photoResponseData}
        setPhotoResponseData={setPhotoResponseData}
      />

    </div>
  );
}
