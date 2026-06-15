'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import { 
  UserRound, 
  Stethoscope, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Loader2, 
  Phone, 
  CreditCard, 
  Heart, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Smartphone,
  Lock,
  ArrowLeft,
  Fingerprint,
  Upload,
  Image as ImageIcon,
  FileText,
  Check,
  Trash2,
  MapPin
} from 'lucide-react';
import { showToast } from '../../../utils/toast';
import LogoLoader from '../../../components/common/LogoLoader';
import { DRIVING_LICENSE_REGEX, ABHA_NUMBER_REGEX, ABHA_ADDRESS_REGEX, INDIAN_MOBILE_REGEX, AADHAAR_REGEX } from '../../../constants/regex.constants';

/**
 * Normalizes and returns the base64 source or static path of a profile image.
 * @param {string} photo - base64 string or image path
 * @returns {string} parsed image source
 */
const getPhotoSrc = (photo: string): string => {
  if (!photo) return '';
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
 * Simple secure XOR encryption with Base64 encoding/decoding.
 */
const cryptState = (text: string, key: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(unescape(encodeURIComponent(result)));
};

const decryptState = (cipherText: string, key: string): string => {
  try {
    const decoded = decodeURIComponent(escape(atob(cipherText)));
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (e) {
    return '';
  }
};

/**
 * Gets or generates a transient session key stored in window.name.
 */
const getSessionKey = (): string => {
  if (typeof window === 'undefined') return 'fallback-key-temp';
  let key = window.name;
  if (!key || key.length < 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    key = Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    window.name = key;
  }
  return key;
};

/**
 * Compresses base64 image using canvas.
 */
const compressImage = (base64Str: string, maxSizeKb: number = 100): Promise<{ base64: string; sizeKb: number }> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({ base64: base64Str, sizeKb: 0 });
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const maxDimension = 1000;
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
        resolve({ base64: base64Str, sizeKb: Math.round(base64Str.length * 0.75 / 1024) });
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.8;
      let resultDataUrl = canvas.toDataURL('image/jpeg', quality);
      let sizeKb = Math.round((resultDataUrl.length - 22) * 3 / 4 / 1024);

      while (sizeKb > maxSizeKb && quality > 0.1) {
        quality -= 0.1;
        resultDataUrl = canvas.toDataURL('image/jpeg', quality);
        sizeKb = Math.round((resultDataUrl.length - 22) * 3 / 4 / 1024);
      }
      resolve({ base64: resultDataUrl, sizeKb });
    };
    img.onerror = () => {
      resolve({ base64: base64Str, sizeKb: Math.round(base64Str.length * 0.75 / 1024) });
    };
  });
};

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { loginWithOtp, loginWithDl, loginWithAbhaAccount } = useAuth();

  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'operator'>('patient');
  const [activeTab, setActiveTab] = useState<'mobile' | 'aadhaar' | 'abha' | 'dl'>('mobile');
  const [identifier, setIdentifier] = useState('');
  const [aadhaarMobile, setAadhaarMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [otpError, setOtpError] = useState(false); // true when OTP submission fails — triggers red highlight + shake
  const [showSelectModal, setShowSelectModal] = useState(true);
  const otpInputRef = React.useRef<HTMLInputElement>(null);

  // Profile Login States (Mobile/ABHA Number login)
  const [mobileTxnId, setMobileTxnId] = useState('');
  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);
  const [showAccountSelectModal, setShowAccountSelectModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);

  React.useEffect(() => {
    if (otpSent) {
      // Focus the first OTP digit box as soon as the OTP step is shown
      const t = setTimeout(() => {
        otpRefs[0].current?.focus();
      }, 150);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpSent]);

  // DL Specific States
  const [dlNumber, setDlNumber] = useState('');
  const [dlMobile, setDlMobile] = useState('');
  const [showDlModal, setShowDlModal] = useState(false);
  const [dlFirstName, setDlFirstName] = useState('');
  const [dlMiddleName, setDlMiddleName] = useState('');
  const [dlLastName, setDlLastName] = useState('');

  // Split input states
  const [aadhaarParts, setAadhaarParts] = useState(['', '', '']);
  const [abhaParts, setAbhaParts] = useState(['', '', '', '']);
  const [otpParts, setOtpParts] = useState(['', '', '', '', '', '']);
  const [dlParts, setDlParts] = useState(['', '', '', '']);
  const [useAbhaAddress, setUseAbhaAddress] = useState(false);

  // Refs for split inputs
  const aadhaarRefs = [React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null)];
  const abhaRefs = [React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null)];
  const otpRefs = [React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null)];
  const dlRefs = [React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null)];

  const handleSplitChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    parts: string[],
    setParts: (newParts: string[]) => void,
    refs: React.RefObject<HTMLInputElement | null>[],
    maxLength: number,
    allowedRegex: RegExp
  ) => {
    const val = e.target.value.replace(allowedRegex, '');
    const newParts = [...parts];
    newParts[index] = val.slice(0, maxLength);
    setParts(newParts);

    // Auto-advance if value reached max length
    if (val.length >= maxLength && index < refs.length - 1) {
      refs[index + 1].current?.focus();
    }
  };

  const handleSplitKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    parts: string[],
    refs: React.RefObject<HTMLInputElement | null>[]
  ) => {
    // Reverse focus on Backspace if current field is empty
    if (e.key === 'Backspace' && !parts[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const getDlFormProgress = () => {
    let points = 0;
    const maxPoints = 82;

    // 1. DL Number (15 chars max)
    points += Math.min(dlParts.join('').length, 15);

    // 2. First Name (capped at 5)
    points += Math.min(dlFirstName.trim().length, 5);

    // 3. Last Name (capped at 5)
    points += Math.min(dlLastName.trim().length, 5);

    // 4. DOB (capped at 10)
    points += Math.min(dlDob.length, 10);

    // 5. Gender (1 point)
    if (dlGender) points += 1;

    // 6. Address (capped at 15)
    points += Math.min(dlAddress.trim().length, 15);

    // 7. Pincode (6 digits max)
    points += Math.min(dlPinCode.length, 6);

    // 8. State (5 points)
    if (dlState.trim()) points += 5;

    // 9. District (5 points)
    if (dlDistrict.trim()) points += 5;

    // 10. Front Photo (15 points)
    if (dlFrontPhoto) points += 15;

    return Math.round((points / maxPoints) * 100);
  };

  const getLoginProgress = () => {
    let current = 0;
    let total = 10;

    if (activeTab === 'mobile') {
      current = identifier.length;
      total = 10;
    } else if (activeTab === 'aadhaar') {
      current = aadhaarParts.join('').length;
      total = 12;
    } else if (activeTab === 'abha') {
      if (useAbhaAddress) {
        current = Math.min(identifier.length, 14);
        total = 14;
      } else {
        current = abhaParts.join('').length;
        total = 14;
      }
    } else if (activeTab === 'dl') {
      current = dlMobile.length;
      total = 10;
    }

    if (otpSent) {
      const otpLen = otpParts.join('').length;
      const combinedCurrent = total + otpLen;
      const combinedTotal = total + 6;
      return Math.round((combinedCurrent / combinedTotal) * 100);
    }

    return Math.round((current / total) * 100);
  };
  const [dlDob, setDlDob] = useState('1994-04-26');
  const [dlGender, setDlGender] = useState('M');
  const [dlFrontPhoto, setDlFrontPhoto] = useState('');
  const [dlBackPhoto, setDlBackPhoto] = useState('');
  const [dlAddress, setDlAddress] = useState('');
  const [dlState, setDlState] = useState('');
  const [dlDistrict, setDlDistrict] = useState('');
  const [dlPinCode, setDlPinCode] = useState('');
  const [dlModalStep, setDlModalStep] = useState(1);
  const [dlFrontPhotoSize, setDlFrontPhotoSize] = useState(0);
  const [dlFrontPhotoOrigSize, setDlFrontPhotoOrigSize] = useState(0);
  const [dlBackPhotoSize, setDlBackPhotoSize] = useState(0);
  const [dlBackPhotoOrigSize, setDlBackPhotoOrigSize] = useState(0);

  // Load draft state on mount (with secure decryption)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const encryptedDraft = sessionStorage.getItem('setu_dl_draft');
      if (encryptedDraft) {
        const key = getSessionKey();
        const decrypted = decryptState(encryptedDraft, key);
        if (decrypted) {
          const draft = JSON.parse(decrypted);
          if (draft.dlNumber) {
            setDlNumber(draft.dlNumber);
            const num = draft.dlNumber;
            const state = num.substring(0, 2);
            const yearMatch = num.match(/(19|20)\d{2}/);
            let rto = '';
            let year = '';
            let serial = '';
            if (yearMatch && yearMatch.index !== undefined) {
              rto = num.substring(2, yearMatch.index);
              year = yearMatch[0];
              serial = num.substring(yearMatch.index + 4);
            } else {
              rto = num.substring(2, 4);
              year = num.substring(4, 8);
              serial = num.substring(8);
            }
            setDlParts([state, rto, year, serial]);
          }
          if (draft.dlMobile) setDlMobile(draft.dlMobile);
          if (draft.showDlModal) setShowDlModal(draft.showDlModal);
          if (draft.dlFirstName) setDlFirstName(draft.dlFirstName);
          if (draft.dlMiddleName) setDlMiddleName(draft.dlMiddleName);
          if (draft.dlLastName) setDlLastName(draft.dlLastName);
          if (draft.dlDob) setDlDob(draft.dlDob);
          if (draft.dlGender) setDlGender(draft.dlGender);
          if (draft.dlFrontPhoto) setDlFrontPhoto(draft.dlFrontPhoto);
          if (draft.dlBackPhoto) setDlBackPhoto(draft.dlBackPhoto);
          if (draft.dlAddress) setDlAddress(draft.dlAddress);
          if (draft.dlState) setDlState(draft.dlState);
          if (draft.dlDistrict) setDlDistrict(draft.dlDistrict);
          if (draft.dlPinCode) setDlPinCode(draft.dlPinCode);
          if (draft.dlModalStep) setDlModalStep(draft.dlModalStep);
          if (draft.dlFrontPhotoSize) setDlFrontPhotoSize(draft.dlFrontPhotoSize);
          if (draft.dlFrontPhotoOrigSize) setDlFrontPhotoOrigSize(draft.dlFrontPhotoOrigSize);
          if (draft.dlBackPhotoSize) setDlBackPhotoSize(draft.dlBackPhotoSize);
          if (draft.dlBackPhotoOrigSize) setDlBackPhotoOrigSize(draft.dlBackPhotoOrigSize);
          
          if (draft.showDlModal) {
            showToast(t('Restored your Driving License onboarding draft securely.'));
          }
        }
      }
    } catch (error) {
      console.warn('Failed to restore DL draft state:', error);
    }
  }, []);

  // Save draft state on changes (with secure encryption)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const draft = {
        dlNumber,
        dlMobile,
        showDlModal,
        dlFirstName,
        dlMiddleName,
        dlLastName,
        dlDob,
        dlGender,
        dlFrontPhoto,
        dlBackPhoto,
        dlAddress,
        dlState,
        dlDistrict,
        dlPinCode,
        dlModalStep,
        dlFrontPhotoSize,
        dlFrontPhotoOrigSize,
        dlBackPhotoSize,
        dlBackPhotoOrigSize
      };
      
      const key = getSessionKey();
      const encrypted = cryptState(JSON.stringify(draft), key);
      sessionStorage.setItem('setu_dl_draft', encrypted);
    } catch (error) {
      console.warn('Failed to save DL draft state:', error);
    }
  }, [
    dlNumber,
    dlMobile,
    showDlModal,
    dlFirstName,
    dlMiddleName,
    dlLastName,
    dlDob,
    dlGender,
    dlFrontPhoto,
    dlBackPhoto,
    dlAddress,
    dlState,
    dlDistrict,
    dlPinCode,
    dlModalStep,
    dlFrontPhotoSize,
    dlFrontPhotoOrigSize,
    dlBackPhotoSize,
  ]);

  // Auto-populate state/district from pincode
  React.useEffect(() => {
    if (dlPinCode.length === 6) {
      const fetchPincodeDetails = async () => {
        try {
          const res = await fetch(`/api/abdm/pincode/${dlPinCode}`);
          const data = await res.json();
          if (data.status === 'success') {
            setDlState(data.state);
            setDlDistrict(data.district);
            showToast(t(`Location auto-populated: ${data.district}, ${data.state}`));
          }
        } catch (err) {
          console.warn('Pincode lookup failed:', err);
        }
      };
      fetchPincodeDetails();
    }
  }, [dlPinCode]);

  // Synchronize split inputs with single values
  React.useEffect(() => {
    if (activeTab === 'aadhaar') {
      setIdentifier(aadhaarParts.join(''));
    } else if (activeTab === 'abha' && !useAbhaAddress) {
      const joined = abhaParts.join('');
      if (joined.length === 14) {
        setIdentifier(`${abhaParts[0]}-${abhaParts[1]}-${abhaParts[2]}-${abhaParts[3]}`);
      } else {
        setIdentifier(joined);
      }
    }
  }, [aadhaarParts, abhaParts, activeTab, useAbhaAddress]);

  React.useEffect(() => {
    setDlNumber(dlParts.join('').toUpperCase());
  }, [dlParts]);

  React.useEffect(() => {
    setOtp(otpParts.join(''));
  }, [otpParts]);

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      showToast(t('Please enter a valid identifier.'));
      return;
    }
    
    setIsSendingOtp(true);
    setErrorMsg('');

    if (activeTab === 'mobile' || activeTab === 'abha') {
      try {
        const cleanedId = identifier.replace(/[-\s]/g, '').trim();
        const hint = activeTab === 'mobile' ? 'mobile' : 'abha-number';
        
        const res = await fetch('/api/abdm/v3/profile/login/request/otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scope: ['abha-login', 'mobile-verify'],
            loginHint: hint,
            loginId: cleanedId,
            otpSystem: 'abdm'
          })
        });
        const data = await res.json();
        setIsSendingOtp(false);

        if (res.ok && data.txnId) {
          setMobileTxnId(data.txnId);
          setOtpSent(true);
          showToast(t(data.message || 'OTP sent successfully!'));
        } else {
          const msg = data.description || data.message || data.loginId || data.scope || data.loginHint || t('Failed to send OTP.');
          setErrorMsg(msg);
          showToast(t('Failed to send OTP.'));
        }
      } catch (err: any) {
        setIsSendingOtp(false);
        setErrorMsg(err.message || t('Gateway connection failed.'));
        showToast(t('Network error.'));
      }
    } else if (activeTab === 'aadhaar') {
      try {
        const cleanedId = identifier.replace(/[-\s]/g, '').trim();
        const res = await fetch('/api/abdm/v3/enrollment/request/otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loginHint: 'aadhaar',
            loginId: cleanedId
          })
        });
        const data = await res.json();
        setIsSendingOtp(false);

        if (res.ok && data.txnId) {
          setMobileTxnId(data.txnId);
          setOtpSent(true);
          showToast(t(data.message || 'OTP sent to Aadhaar-linked mobile!'));
        } else {
          setErrorMsg(data.message || t('Failed to send Aadhaar OTP.'));
          showToast(t('Failed to send OTP.'));
        }
      } catch (err: any) {
        setIsSendingOtp(false);
        setErrorMsg(err.message || t('Gateway connection failed.'));
        showToast(t('Network error.'));
      }
    }
  };

  // DL OTP Request Flow
  const handleSendDlOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dlMobile || dlMobile.length !== 10) {
      showToast(t('Please enter a valid 10-digit mobile number.'));
      return;
    }

    setIsSendingOtp(true);
    setErrorMsg('');

    try {
      const sessionRes = await fetch('/api/abdm/v3/enrollment/dl/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const sessionData = await sessionRes.json();
      if (sessionData.status !== 'success') {
        throw new Error(sessionData.message || 'Failed to establish DL session');
      }

      const otpRes = await fetch('/api/abdm/v3/enrollment/dl/request/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: dlMobile, dlNumber: '' })
      });
      const otpData = await otpRes.json();
      setIsSendingOtp(false);

      if (otpRes.ok && otpData.status === 'success') {
        setOtpSent(true);
        showToast(t('OTP sent successfully to DL linked mobile!'));
      } else {
        setErrorMsg(otpData.message || t('Failed to send DL OTP.'));
        showToast(t('Failed to send OTP.'));
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      setErrorMsg(err.message || t('DL Gateway connection failed.'));
      showToast(t('Network error.'));
    }
  };

  // Verify and login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      showToast(t('Please enter the verification OTP.'));
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    if (activeTab === 'mobile' || activeTab === 'abha') {
      try {
        const res = await fetch('/api/abdm/v3/profile/login/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scope: ['abha-login', 'mobile-verify'],
            authData: {
              authMethods: ['otp'],
              otp: {
                txnId: mobileTxnId,
                otpValue: otp
              }
            }
          })
        });
        const data = await res.json();
        setIsVerifying(false);

        if (res.ok && data.authResult === 'success') {
          showToast(t('OTP verified successfully!'));
          if (data.accounts && data.accounts.length > 0) {
            setLinkedAccounts(data.accounts);
            setSelectedAccount(data.accounts[0]);
            if (data.accounts.length === 1) {
              handleSelectAbhaAccount(data.accounts[0], data.accounts);
            } else {
              setShowAccountSelectModal(true);
            }
          } else {
            setErrorMsg(t('No linked accounts found.'));
          }
        } else {
          const msg = data.description || data.message || data.otpValue || data.txnId || data.authMethods || data.scope || t('Verification failed.');
          setErrorMsg(msg);
          showToast(t('Verification failed.'));
        }
      } catch (err: any) {
        setIsVerifying(false);
        setErrorMsg(err.message || t('Gateway connection failed.'));
        showToast(t('Network error.'));
      }
    } else if (activeTab === 'aadhaar') {
      try {
        const res = await fetch('/api/abdm/v3/enrollment/enrol/byAadhaar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txnId: mobileTxnId,
            authData: {
              otp: {
                otpValue: otp,
                mobile: aadhaarMobile
              }
            }
          })
        });
        const data = await res.json();
        setIsVerifying(false);

        if (res.ok && data.status === 'success') {
          setOtpError(false);
          showToast(t('OTP verified successfully!'));
          const profile = data.ABHAProfile || data;
          const finalName = profile.name || [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') || 'ABHA User';
          const preferredAddr = data.abhaAddress || profile.preferredAddress || profile.preferredAbhaAddress || (profile.phrAddress && profile.phrAddress[0]) || profile.abhaId || '';
          const abhaNum = data.abhaNumber || profile.ABHANumber || profile.abhaNumber || '';
          const normalizedAcc = {
            name: finalName,
            preferredAbhaAddress: preferredAddr,
            ABHANumber: abhaNum,
            profilePhoto: profile.photo || '',
            photo: profile.photo || '',
            gender: profile.gender === 'F' ? 'Female' : profile.gender === 'M' ? 'Male' : profile.gender,
            dob: profile.dob || '',
            mobile: profile.mobile || '',
            firstName: profile.firstName || '',
            middleName: profile.middleName || '',
            lastName: profile.lastName || '',
            address: profile.address || '',
            stateName: profile.stateName || '',
            districtName: profile.districtName || '',
            pinCode: profile.pinCode || '',
            abhaStatus: profile.abhaStatus || 'ACTIVE',
            abhaType: profile.abhaType || 'STANDARD',
            email: profile.email || ''
          };
          const success = await loginWithAbhaAccount(selectedRole, normalizedAcc, [normalizedAcc]);
          if (success) {
            const sessionTtl = 1200;
            const refreshTtl = 1800;
            localStorage.setItem('abha_session_expiry', String(Date.now() + sessionTtl * 1000));
            localStorage.setItem('abha_refresh_expiry', String(Date.now() + refreshTtl * 1000));
            localStorage.setItem('x_token_expiry', String(Date.now() + sessionTtl * 1000));
            localStorage.setItem('public_key_expiry', String(Date.now() + 90 * 24 * 3600 * 1000));
            window.dispatchEvent(new Event('setu_state_update'));

            showToast(t('Authentication successful! Welcome back.'));
            // Redirect to My ABHA Profile after Aadhaar login
            router.push('/profile');
          } else {
            showToast(t('Failed to establish local session.'));
          }
        } else {
          // Mark OTP boxes as errored and shake
          setOtpError(true);
          setErrorMsg(data.message || t('Verification failed.'));
          showToast(data.message || t('Verification failed.'));
          // Auto-refocus first box after error
          setTimeout(() => { otpRefs[0].current?.focus(); }, 200);
        }
      } catch (err: any) {
        setIsVerifying(false);
        setOtpError(true);
        setErrorMsg(err.message || t('Gateway connection failed.'));
        showToast(t('Network error.'));
        setTimeout(() => { otpRefs[0].current?.focus(); }, 200);
      }
    }
  };

  const handleSelectAbhaAccount = async (acc: any, allAccounts?: any[]) => {
    setIsVerifying(true);
    try {
      const success = await loginWithAbhaAccount(selectedRole, acc, allAccounts || linkedAccounts || [acc]);
      setIsVerifying(false);
      if (success) {
        const sessionTtl = 1200;
        const refreshTtl = 1800;
        localStorage.setItem('abha_session_expiry', String(Date.now() + sessionTtl * 1000));
        localStorage.setItem('abha_refresh_expiry', String(Date.now() + refreshTtl * 1000));
        localStorage.setItem('x_token_expiry', String(Date.now() + sessionTtl * 1000));
        localStorage.setItem('public_key_expiry', String(Date.now() + 90 * 24 * 3600 * 1000));
        window.dispatchEvent(new Event('setu_state_update'));

        setShowAccountSelectModal(false);
        showToast(t('ABHA account linked and authenticated!'));
        router.push('/profile');
      } else {
        showToast(t('Failed to establish local session.'));
      }
    } catch (e: any) {
      setIsVerifying(false);
      showToast(e.message || t('Authentication failed.'));
    }
  };

  // DL OTP Verify Flow
  const handleVerifyDlOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      showToast(t('Please enter the verification OTP.'));
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/abdm/v3/enrollment/dl/verify/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      setIsVerifying(false);

      if (res.ok && data.status === 'success') {
        showToast(t('OTP Verified! Please complete DL demographic details.'));
        setShowDlModal(true);
      } else {
        setErrorMsg(data.message || t('Invalid OTP. Please try again.'));
        showToast(t('Verification failed.'));
      }
    } catch (err: any) {
      setIsVerifying(false);
      showToast(err.message || t('DL verification connection failed.'));
    }
  };

  // Submit DL details
  const handleDlDemographicsSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dlNumber) {
      showToast(t('Driving License number is required.'));
      return;
    }
    if (dlNumber.includes('-') || dlNumber !== dlNumber.toUpperCase() || !DRIVING_LICENSE_REGEX.test(dlNumber)) {
      showToast(t('Driving License number must be fully in CAPS and contain no hyphens (-).'));
      return;
    }
    if (!dlFirstName || !dlLastName) {
      showToast(t('First Name and Last Name are required.'));
      return;
    }
    if (!dlAddress || !dlState || !dlDistrict || !dlPinCode) {
      showToast(t('All address fields are required.'));
      return;
    }
    if (!dlFrontPhoto) {
      showToast(t('Front side photo of your Driving License is required.'));
      return;
    }
    setIsVerifying(true);

    try {
      const res = await fetch('/api/abdm/v3/enrollment/enrol/byDl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dlNumber,
          firstName: dlFirstName,
          middleName: dlMiddleName,
          lastName: dlLastName,
          dob: dlDob,
          gender: dlGender,
          mobile: dlMobile,
          frontPhoto: dlFrontPhoto,
          backPhoto: dlBackPhoto,
          address: dlAddress,
          state: dlState,
          district: dlDistrict,
          pinCode: dlPinCode
        })
      });
      const data = await res.json();
      setIsVerifying(false);

      if (res.ok && data.status === 'success') {
        setShowDlModal(false);
        setDlModalStep(1); // Reset step
        await loginWithDl(dlNumber, data.abhaProfile);
        showToast(t('Authentication successful! Welcome back.'));
        router.push('/profile');
      } else {
        showToast(data.message || t('DL Demographics validation failed.'));
      }
    } catch (err: any) {
      setIsVerifying(false);
      showToast(err.message || t('DL registration request failed.'));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file extension/type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!validTypes.includes(fileType) && !['jpg', 'jpeg', 'png'].includes(fileExtension || '')) {
        showToast(t('Invalid file format. Please upload JPEG, PNG, or JPG only.'));
        return;
      }

      const origSizeKb = Math.round(file.size / 1024);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        
        // Track orig size
        if (side === 'front') {
          setDlFrontPhotoOrigSize(origSizeKb);
        } else {
          setDlBackPhotoOrigSize(origSizeKb);
        }

        // Compress targeting 150 KB
        showToast(t('Optimizing image for upload...'));
        const compressed = await compressImage(rawBase64, 150);
        
        if (side === 'front') {
          setDlFrontPhoto(compressed.base64);
          setDlFrontPhotoSize(compressed.sizeKb);
        } else {
          setDlBackPhoto(compressed.base64);
          setDlBackPhotoSize(compressed.sizeKb);
        }
        showToast(t(`${side === 'front' ? 'Front' : 'Back'} side photo optimized.`));
      };
      reader.readAsDataURL(file);
    }
  };

  // Format labels and inputs based on tabs
  const getIdentifierPlaceholder = () => {
    if (activeTab === 'mobile') return 'e.g. 9876543210';
    if (activeTab === 'aadhaar') return 'e.g. 123456789012';
    return 'e.g. 91-1234-5678-9012';
  };

  const getIdentifierLabel = () => {
    if (activeTab === 'mobile') return '10-Digit Mobile Number';
    if (activeTab === 'aadhaar') return '12-Digit Aadhaar Number';
    return '14-Digit ABHA ID / Address';
  };

  const getMaxIdentifierLength = () => {
    if (activeTab === 'mobile') return 10;
    if (activeTab === 'aadhaar') return 12;
    return 17;
  };

  return (
    <div className="login-container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '20px', background: 'radial-gradient(circle at top, var(--bg-primary) 30%, #03080e 100%)' }}>
      <LogoLoader isLoading={isVerifying} type="login" />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '440px' }}>
        
        {/* Login Card */}
        <div className="login-card" style={{
          width: '100%',
          background: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '30px 24px',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid rgba(20, 184, 166, ${0.15 + (getLoginProgress() / 100) * 0.45})`,
          boxShadow: `var(--surface-shadow), 0 0 30px rgba(20, 184, 166, ${(getLoginProgress() / 100) * 0.12})`,
          transition: 'border 0.3s, box-shadow 0.3s'
        }}>
          
          {/* Progress bar at top of card */}
          {/* SVG Progress Rectangle Border (Indian Flag Colors) */}
          <svg style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10
          }}>
            <defs>
              <linearGradient id="indian-flag-grad-login" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF9933" stopOpacity={0.9} />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#138808" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <rect
              x="1.5"
              y="1.5"
              width="calc(100% - 3px)"
              height="calc(100% - 3px)"
              rx="16"
              fill="none"
              stroke="url(#indian-flag-grad-login)"
              strokeWidth="3"
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={100 - getLoginProgress()}
              style={{
                transition: 'stroke-dashoffset 0.3s ease-in-out',
                opacity: getLoginProgress() > 0 ? 1 : 0
              }}
            />
          </svg>

          {/* Shimmer progress bar at top of card when submitting */}
          {(isSendingOtp || isVerifying) && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, transparent, var(--accent-teal), transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer-sweep 1.2s infinite linear',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              zIndex: 11
            }} />
          )}
          
          {/* Brand Logo */}
          <div className="logo" style={{ justifyContent: 'center', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              className="logo-icon" 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '50%', 
                background: 'transparent', 
                display: 'grid', 
                placeItems: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src="/assets/logos/logo7.png"
                alt="Brand Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div className="logo-text" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>ABHA SETU</h1>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t('Digital Health Portal')}</span>
            </div>
          </div>

          <h2 style={{ fontSize: '16px', textAlign: 'center', margin: '0 0 4px', fontWeight: 800 }}>National Health Gateway Portal</h2>
          <p className="subtitle" style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 16px', lineHeight: 1.5 }}>
            Access clinical records, UHI consults, and link care contexts using secure OTP.
          </p>

          {/* Subtitle / Role Context Header */}
          <div style={{ textAlign: 'center', marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-teal)', textTransform: 'uppercase' }}>Citizen / Patient Portal</span>
          </div>


          {/* Form Area */}
          {!otpSent ? (
            activeTab === 'dl' ? (
              <form onSubmit={handleSendDlOtp} style={{ display: 'grid', gap: '12px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  10-Digit Mobile Number
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    disabled={isSendingOtp}
                    value={dlMobile}
                    onChange={(e) => setDlMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9876543210"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace', outline: 'none', opacity: isSendingOtp ? 0.6 : 1 }}
                  />
                </label>
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="join-btn"
                  style={{ width: '100%', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: isSendingOtp ? 'not-allowed' : 'pointer' }}
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} />
                      <span>Requesting OTP...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone style={{ width: '14px', height: '14px' }} />
                      <span>Send DL Verification OTP</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSendOtp} style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'grid', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{getIdentifierLabel()}</span>
                    {activeTab === 'abha' && (
                      <button
                        type="button"
                        onClick={() => setUseAbhaAddress(!useAbhaAddress)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-teal)', fontSize: '10px', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                      >
                        {useAbhaAddress ? t('Use 14-Digit ABHA Number') : t('Use ABHA Address (@sbx)')}
                      </button>
                    )}
                  </div>

                  {activeTab === 'mobile' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        disabled={isSendingOtp}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ''))}
                        placeholder={getIdentifierPlaceholder()}
                        style={{ flex: 1, minWidth: '0', width: '100%', padding: '10px 8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace', outline: 'none', opacity: isSendingOtp ? 0.6 : 1 }}
                      />
                      <Check
                        style={{
                          width: '18px',
                          height: '18px',
                          color: INDIAN_MOBILE_REGEX.test(identifier) ? 'var(--accent-teal)' : 'var(--text-muted)',
                          opacity: INDIAN_MOBILE_REGEX.test(identifier) ? 1 : 0.4,
                          transition: 'all 0.2s',
                          flexShrink: 0
                        }}
                      />
                    </div>
                  ) : activeTab === 'aadhaar' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                      <div style={{ display: 'flex', gap: '6px', flex: 1, minWidth: '0' }}>
                        {aadhaarParts.map((part, index) => (
                          <input
                            key={index}
                            ref={aadhaarRefs[index]}
                            type="text"
                            required
                            disabled={isSendingOtp}
                            maxLength={4}
                            value={part}
                            onChange={(e) => handleSplitChange(
                              e,
                              index,
                              aadhaarParts,
                              setAadhaarParts,
                              aadhaarRefs,
                              4,
                              /\D/g
                            )}
                            onKeyDown={(e) => handleSplitKeyDown(e, index, aadhaarParts, aadhaarRefs)}
                            placeholder="••••"
                            style={{
                              flex: 1,
                              minWidth: '0',
                              width: '100%',
                              padding: '10px 4px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-primary)',
                              fontSize: '13px',
                              fontFamily: 'monospace',
                              textAlign: 'center',
                              outline: 'none',
                              opacity: isSendingOtp ? 0.6 : 1
                            }}
                          />
                        ))}
                      </div>
                      <Check
                        style={{
                          width: '18px',
                          height: '18px',
                          color: AADHAAR_REGEX.test(identifier) ? 'var(--accent-teal)' : 'var(--text-muted)',
                          opacity: AADHAAR_REGEX.test(identifier) ? 1 : 0.4,
                          transition: 'all 0.2s',
                          flexShrink: 0
                        }}
                      />
                    </div>
                  ) : useAbhaAddress ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                      <input
                        type="text"
                        required
                        disabled={isSendingOtp}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. ashish.patel@sbx"
                        style={{ flex: 1, minWidth: '0', width: '100%', padding: '10px 8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace', outline: 'none', opacity: isSendingOtp ? 0.6 : 1 }}
                      />
                      <Check
                        style={{
                          width: '18px',
                          height: '18px',
                          color: ABHA_ADDRESS_REGEX.test(identifier) ? 'var(--accent-teal)' : 'var(--text-muted)',
                          opacity: ABHA_ADDRESS_REGEX.test(identifier) ? 1 : 0.4,
                          transition: 'all 0.2s',
                          flexShrink: 0
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                      <div style={{ display: 'flex', gap: '4px', flex: 1, minWidth: '0' }}>
                        {abhaParts.map((part, index) => {
                          const maxLen = index === 0 ? 2 : 4;
                          const placeholder = index === 0 ? '••' : '••••';
                          return (
                            <input
                              key={index}
                              ref={abhaRefs[index]}
                              type="text"
                              required
                              disabled={isSendingOtp}
                              maxLength={maxLen}
                              value={part}
                              onChange={(e) => handleSplitChange(
                                e,
                                index,
                                abhaParts,
                                setAbhaParts,
                                abhaRefs,
                                maxLen,
                                /\D/g
                              )}
                              onKeyDown={(e) => handleSplitKeyDown(e, index, abhaParts, abhaRefs)}
                              placeholder={placeholder}
                              style={{
                                flex: index === 0 ? 0.5 : 1,
                                minWidth: '0',
                                width: '100%',
                                padding: '10px 2px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                textAlign: 'center',
                                outline: 'none',
                                opacity: isSendingOtp ? 0.6 : 1
                              }}
                            />
                          );
                        })}
                      </div>
                      <Check
                        style={{
                          width: '18px',
                          height: '18px',
                          color: ABHA_NUMBER_REGEX.test(identifier) ? 'var(--accent-teal)' : 'var(--text-muted)',
                          opacity: ABHA_NUMBER_REGEX.test(identifier) ? 1 : 0.4,
                          transition: 'all 0.2s',
                          flexShrink: 0
                        }}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="join-btn"
                  style={{ width: '100%', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: isSendingOtp ? 'not-allowed' : 'pointer' }}
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} />
                      <span>Requesting OTP...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone style={{ width: '14px', height: '14px' }} />
                      <span>Send Gateway Verification OTP</span>
                    </>
                  )}
                </button>
              </form>
            )
          ) : null}

          {/* Change Method Button */}
          {!otpSent && (
            <button
              type="button"
              onClick={() => setShowSelectModal(true)}
              style={{
                alignSelf: 'center',
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-teal)',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '12px',
                justifyContent: 'center',
                width: '100%'
              }}
            >
              <ArrowLeft style={{ width: '12px', height: '12px' }} />
              <span>Change Login Method</span>
            </button>
          )}

          {otpSent && (
            activeTab === 'dl' ? (
              <form onSubmit={handleVerifyDlOtp} style={{ display: 'grid', gap: '12px' }}>
                <div style={{ background: 'rgba(20, 184, 166, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.15)', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
                  <Info style={{ width: '14px', height: '14px', color: 'var(--accent-teal)', flexShrink: 0 }} />
                  <div>
                    OTP sent to DL linked phone. Use dummy code <strong>123456</strong> for testing.
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>Enter 6-Digit OTP Code</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flex: 1, minWidth: '0' }}>
                      {otpParts.map((part, index) => (
                        <input
                          key={index}
                          ref={otpRefs[index]}
                          type="text"
                          inputMode="numeric"
                          required
                          disabled={isVerifying}
                          maxLength={1}
                          value={part}
                          onChange={(e) => {
                            setOtpError(false);
                            handleSplitChange(e, index, otpParts, setOtpParts, otpRefs, 1, /\D/g);
                          }}
                          onKeyDown={(e) => handleSplitKeyDown(e, index, otpParts, otpRefs)}
                          onFocus={(e) => e.target.select()}
                          placeholder="-"
                          aria-label={`OTP digit ${index + 1}`}
                          style={{
                            flex: 1,
                            minWidth: '0',
                            width: '100%',
                            maxWidth: '52px',
                            height: '58px',
                            borderRadius: '12px',
                            border: otpError
                              ? '2px solid var(--danger)'
                              : part ? '2px solid var(--accent-teal)' : '2px solid var(--border-color)',
                            background: otpError
                              ? 'rgba(239,68,68,0.06)'
                              : part ? 'rgba(20,184,166,0.06)' : 'var(--bg-secondary)',
                            color: otpError ? 'var(--danger)' : 'var(--text-primary)',
                            fontSize: '22px',
                            fontWeight: '800',
                            textAlign: 'center',
                            outline: 'none',
                            opacity: isVerifying ? 0.6 : 1,
                            transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                            boxShadow: otpError
                              ? '0 0 0 3px rgba(239,68,68,0.15)'
                              : part ? '0 0 0 3px rgba(20,184,166,0.12)' : 'none',
                            caretColor: 'transparent',
                            animation: otpError ? 'otp-shake 0.4s ease' : 'none'
                          }}
                        />
                      ))}
                    </div>
                    <Check
                      style={{
                        width: '22px',
                        height: '22px',
                        color: otp.length === 6 ? 'var(--accent-teal)' : 'var(--text-muted)',
                        opacity: otp.length === 6 ? 1 : 0.3,
                        transition: 'all 0.2s',
                        flexShrink: 0
                      }}
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div style={{ color: 'var(--danger)', fontSize: '10.5px', fontWeight: '600', background: 'rgba(239,68,68,0.08)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.15)' }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={() => setOtpSent(false)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      cursor: isVerifying ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.2s',
                      opacity: isVerifying ? 0.6 : 1
                    }}
                  >
                    <ArrowLeft style={{ width: '13px', height: '13px' }} />
                    <span>Edit Mobile</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="join-btn"
                    style={{ flex: 2, minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: isVerifying ? 'not-allowed' : 'pointer' }}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles style={{ width: '14px', height: '14px' }} />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'grid', gap: '14px' }}>
                {/* Info banner */}
                <div style={{ background: 'rgba(20, 184, 166, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.15)', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
                  <Info style={{ width: '14px', height: '14px', color: 'var(--accent-teal)', flexShrink: 0 }} />
                  <div>
                    OTP sent to credential linked phone. Use dummy code <strong>123456</strong> for testing.
                  </div>
                </div>

                {/* ── OTP Digit Boxes (primary focus area) ── */}
                <div style={{ display: 'grid', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>Enter 6-Digit OTP Code</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flex: 1, minWidth: '0' }}>
                      {otpParts.map((part, index) => (
                        <input
                          key={index}
                          ref={otpRefs[index]}
                          type="text"
                          inputMode="numeric"
                          required
                          disabled={isVerifying}
                          maxLength={1}
                          value={part}
                          onChange={(e) => handleSplitChange(
                            e,
                            index,
                            otpParts,
                            setOtpParts,
                            otpRefs,
                            1,
                            /\D/g
                          )}
                          onKeyDown={(e) => handleSplitKeyDown(e, index, otpParts, otpRefs)}
                          onFocus={(e) => e.target.select()}
                          placeholder="-"
                          aria-label={`OTP digit ${index + 1}`}
                          style={{
                            flex: 1,
                            minWidth: '0',
                            width: '100%',
                            maxWidth: '52px',
                            height: '58px',
                            borderRadius: '12px',
                            border: part ? '2px solid var(--accent-teal)' : '2px solid var(--border-color)',
                            background: part ? 'rgba(20,184,166,0.06)' : 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '22px',
                            fontWeight: '800',
                            textAlign: 'center',
                            outline: 'none',
                            opacity: isVerifying ? 0.6 : 1,
                            transition: 'border-color 0.15s, background 0.15s',
                            boxShadow: part ? '0 0 0 3px rgba(20,184,166,0.12)' : 'none',
                            caretColor: 'transparent'
                          }}
                        />
                      ))}
                    </div>
                    <Check
                      style={{
                        width: '22px',
                        height: '22px',
                        color: otp.length === 6 ? 'var(--accent-teal)' : 'var(--text-muted)',
                        opacity: otp.length === 6 ? 1 : 0.3,
                        transition: 'all 0.2s',
                        flexShrink: 0
                      }}
                    />
                  </div>
                </div>

                {/* ── Aadhaar-Linked Mobile (shown below OTP for Aadhaar tab) ── */}
                {activeTab === 'aadhaar' && (
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 700 }}>Aadhaar-Linked Mobile Number</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      disabled={isVerifying}
                      value={aadhaarMobile}
                      onChange={(e) => setAadhaarMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 9876543210"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace', outline: 'none', opacity: isVerifying ? 0.6 : 1, boxSizing: 'border-box' }}
                    />
                  </label>
                )}

                {errorMsg && (
                  <div style={{ color: 'var(--danger)', fontSize: '10.5px', fontWeight: '600', background: 'rgba(239,68,68,0.08)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.15)' }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={() => setOtpSent(false)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      cursor: isVerifying ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.2s',
                      opacity: isVerifying ? 0.6 : 1
                    }}
                  >
                    <ArrowLeft style={{ width: '13px', height: '13px' }} />
                    <span>{activeTab === 'mobile' ? t('Edit Mobile') : activeTab === 'aadhaar' ? t('Edit Aadhaar') : t('Edit ABHA')}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="join-btn"
                    style={{ flex: 2, minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: isVerifying ? 'not-allowed' : 'pointer' }}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles style={{ width: '14px', height: '14px' }} />
                        <span>Verify & Login</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )
          )}

          {/* Quick link to staff portal */}
          <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Are you clinical staff, operator, or admin? </span>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); router.push('/staff-login'); }}
              style={{ color: 'var(--accent-teal)', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              <ShieldCheck style={{ width: '12px', height: '12px' }} />
              Access Stakeholder Suite
            </a>
          </div>

        </div>

      </div>

      {/* Select Authentication Method Modal Overlay */}
      {showSelectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(10px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9998,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '500px',
            padding: '30px',
            boxShadow: 'var(--surface-shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            textAlign: 'center'
          }}>
            {/* Header */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <img src="/assets/logos/logo7.png" alt="Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>ABHA SETU</h1>
              </div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Select Authentication Method</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>Choose how you want to log into your Digital Health Portal</p>
            </div>

            {/* Grid */}
            <div className="setu-method-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
              {[
                { id: 'mobile', label: 'Mobile OTP', desc: 'Login via linked mobile number', icon: Phone },
                { id: 'aadhaar', label: 'Aadhaar OTP', desc: 'Verify via Aadhaar secure OTP', icon: Fingerprint },
                { id: 'abha', label: 'ABHA OTP', desc: 'Access via your health ID address', icon: Heart },
                { id: 'dl', label: 'Driving License', desc: 'Authenticate via DL linked phone', icon: CreditCard }
              ].map(item => {
                const Icon = item.icon;
                const isRec = item.id === 'aadhaar';
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`setu-method-btn ${isRec ? 'recommended' : ''}`}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setOtpSent(false);
                      setIdentifier('');
                      setOtp('');
                      setShowSelectModal(false);
                    }}
                    style={{
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {isRec && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(90deg, #FF9933, #d97706)',
                        color: '#ffffff',
                        fontSize: '7.5px',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 10px rgba(217, 119, 6, 0.4)',
                        letterSpacing: '0.6px',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        zIndex: 2
                      }}>
                        ★ RECOMMENDED ★
                      </div>
                    )}
                    <div 
                      className="setu-icon-container"
                      style={{
                        width: '76px',
                        height: '76px',
                        borderRadius: '50%',
                        background: isRec ? 'rgba(217, 119, 6, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                        padding: ['aadhaar', 'abha', 'mobile', 'dl'].includes(item.id) ? '10px' : '0',
                        border: isRec ? '1px solid rgba(217, 119, 6, 0.35)' : '1px solid rgba(255, 255, 255, 0.25)',
                        boxShadow: isRec ? '0 4px 12px rgba(217, 119, 6, 0.2)' : '0 4px 10px rgba(0,0,0,0.1)',
                        display: 'grid',
                        placeItems: 'center',
                        color: isRec ? '#FF9933' : 'var(--text-primary)',
                        overflow: 'hidden',
                        backdropFilter: 'blur(4px)',
                        flexShrink: 0
                      }}
                    >
                      {item.id === 'aadhaar' ? (
                        <img src="/assets/logos/aadhaar.png" alt="Aadhaar" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : item.id === 'abha' ? (
                        <img src="/assets/logos/abha.png" alt="ABHA" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'var(--logo-filter)' }} />
                      ) : item.id === 'mobile' ? (
                        <img src="/assets/logos/mobile.png" alt="Mobile" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'var(--logo-filter)' }} />
                      ) : item.id === 'dl' ? (
                        <img src="/assets/logos/dl.png" alt="DL" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'var(--logo-filter)' }} />
                      ) : (
                        <Icon style={{ width: '32px', height: '32px', color: 'var(--accent-teal)' }} />
                      )}
                    </div>
                    <div className="setu-method-text">
                      <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', color: 'var(--text-primary)' }}>{item.label}</span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{item.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Staff Redirect Link */}
            <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Are you clinical staff or operator?</span>
              <button
                type="button"
                onClick={() => router.push('/staff-login')}
                style={{ marginLeft: '6px', background: 'transparent', border: 'none', color: 'var(--accent-teal)', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Staff Access Suite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DL Demographics Modal */}
      {showDlModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(12px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '520px',
            padding: '30px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflow: 'hidden',
            border: `1px solid rgba(20, 184, 166, ${0.15 + (getDlFormProgress() / 100) * 0.45})`,
            boxShadow: `0 24px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(20, 184, 166, ${(getDlFormProgress() / 100) * 0.12})`,
            transition: 'border 0.3s, box-shadow 0.3s'
          }}>
            
            {/* SVG Progress Rectangle Border (Indian Flag Colors) */}
            <svg style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 10
            }}>
              <defs>
                <linearGradient id="indian-flag-grad-dl" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF9933" stopOpacity={0.9} />
                  <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#138808" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <rect
                x="1.5"
                y="1.5"
                width="calc(100% - 3px)"
                height="calc(100% - 3px)"
                rx="24"
                fill="none"
                stroke="url(#indian-flag-grad-dl)"
                strokeWidth="3"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={100 - getDlFormProgress()}
                style={{
                  transition: 'stroke-dashoffset 0.3s ease-in-out',
                  opacity: getDlFormProgress() > 0 ? 1 : 0
                }}
              />
            </svg>
            {/* Header */}
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'left' }}>
                Driving License Onboarding
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'left' }}>
                Complete your profile verification via NHA gateway.
              </p>
            </div>

            {/* Visual Step Progress Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', position: 'relative', padding: '0 10px' }}>
              <div style={{ position: 'absolute', top: '14px', left: '25px', right: '25px', height: '2px', background: 'var(--border-color)', zIndex: 1 }} />
              <div style={{ position: 'absolute', top: '14px', left: '25px', width: `${((dlModalStep - 1) / 2) * 88}%`, height: '2px', background: 'var(--accent-teal)', zIndex: 2, transition: 'width 0.3s ease' }} />
              
              {/* Step 1 indicator */}
              <div style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => dlModalStep > 1 && setDlModalStep(1)}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: dlModalStep >= 1 ? 'var(--accent-teal)' : 'var(--bg-secondary)',
                  color: dlModalStep >= 1 ? '#ffffff' : 'var(--text-secondary)',
                  border: dlModalStep >= 1 ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}>
                  {dlModalStep > 1 ? <Check style={{ width: '14px', height: '14px' }} /> : '1'}
                </div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: dlModalStep >= 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>Document</span>
              </div>

              {/* Step 2 indicator */}
              <div style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => dlModalStep > 2 && setDlModalStep(2)}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: dlModalStep >= 2 ? 'var(--accent-teal)' : 'var(--bg-secondary)',
                  color: dlModalStep >= 2 ? '#ffffff' : 'var(--text-secondary)',
                  border: dlModalStep >= 2 ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}>
                  {dlModalStep > 2 ? <Check style={{ width: '14px', height: '14px' }} /> : '2'}
                </div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: dlModalStep >= 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>Address</span>
              </div>

              {/* Step 3 indicator */}
              <div style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: dlModalStep >= 3 ? 'var(--accent-teal)' : 'var(--bg-secondary)',
                  color: dlModalStep >= 3 ? '#ffffff' : 'var(--text-secondary)',
                  border: dlModalStep >= 3 ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}>
                  3
                </div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: dlModalStep >= 3 ? 'var(--text-primary)' : 'var(--text-muted)' }}>Uploads</span>
              </div>
            </div>

            {/* Step 1: Document Details */}
            {dlModalStep === 1 && (
              <div style={{ display: 'grid', gap: '14px', textAlign: 'left' }}>
                <div style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>Driving License Number</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                    <div style={{ display: 'flex', gap: '4px', flex: 1, minWidth: '0' }}>
                      {/* State code (2 letters) */}
                      <input
                        ref={dlRefs[0]}
                        type="text"
                        required
                        maxLength={2}
                        value={dlParts[0]}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                          const newParts = [...dlParts];
                          newParts[0] = val;
                          setDlParts(newParts);
                          if (val.length === 2) dlRefs[1].current?.focus();
                        }}
                        placeholder="MP"
                        style={{
                          flex: 0.8,
                          minWidth: '0',
                          width: '100%',
                          padding: '10px 2px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          textAlign: 'center',
                          outline: 'none'
                        }}
                      />

                      {/* RTO code (2 or 3 chars, alphanumeric) */}
                      <input
                        ref={dlRefs[1]}
                        type="text"
                        required
                        maxLength={3}
                        value={dlParts[1]}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                          const newParts = [...dlParts];
                          newParts[1] = val;
                          setDlParts(newParts);
                          if (val.length === 3) dlRefs[2].current?.focus();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !dlParts[1]) dlRefs[0].current?.focus();
                        }}
                        placeholder="20N"
                        style={{
                          flex: 1,
                          minWidth: '0',
                          width: '100%',
                          padding: '10px 2px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          textAlign: 'center',
                          outline: 'none'
                        }}
                      />

                      {/* Year of issue (4 digits) */}
                      <input
                        ref={dlRefs[2]}
                        type="text"
                        required
                        maxLength={4}
                        value={dlParts[2]}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const newParts = [...dlParts];
                          newParts[2] = val;
                          setDlParts(newParts);
                          if (val.length === 4) dlRefs[3].current?.focus();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !dlParts[2]) dlRefs[1].current?.focus();
                        }}
                        placeholder="2016"
                        style={{
                          flex: 1.2,
                          minWidth: '0',
                          width: '100%',
                          padding: '10px 2px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          textAlign: 'center',
                          outline: 'none'
                        }}
                      />

                      {/* Serial number (7 digits) */}
                      <input
                        ref={dlRefs[3]}
                        type="text"
                        required
                        maxLength={7}
                        value={dlParts[3]}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const newParts = [...dlParts];
                          newParts[3] = val;
                          setDlParts(newParts);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !dlParts[3]) dlRefs[2].current?.focus();
                        }}
                        placeholder="0311714"
                        style={{
                          flex: 2,
                          minWidth: '0',
                          width: '100%',
                          padding: '10px 2px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          textAlign: 'center',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <Check
                      style={{
                        width: '18px',
                        height: '18px',
                        color: (dlNumber.length >= 15 && DRIVING_LICENSE_REGEX.test(dlNumber)) ? 'var(--accent-teal)' : 'var(--text-muted)',
                        opacity: (dlNumber.length >= 15 && DRIVING_LICENSE_REGEX.test(dlNumber)) ? 1 : 0.4,
                        transition: 'all 0.2s',
                        flexShrink: 0
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    First Name
                    <input
                      type="text"
                      required
                      value={dlFirstName}
                      onChange={(e) => setDlFirstName(e.target.value)}
                      placeholder="First Name"
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                    />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Middle Name (Optional)
                    <input
                      type="text"
                      value={dlMiddleName}
                      onChange={(e) => setDlMiddleName(e.target.value)}
                      placeholder="Middle Name"
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                    />
                  </label>
                </div>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Last Name
                  <input
                    type="text"
                    required
                    value={dlLastName}
                    onChange={(e) => setDlLastName(e.target.value)}
                    placeholder="Last Name"
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                  />
                </label>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDlModal(false);
                      setDlModalStep(1);
                    }}
                    style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!dlNumber) {
                        showToast(t('Driving License number is required.'));
                        return;
                      }
                      if (dlNumber.includes('-') || dlNumber !== dlNumber.toUpperCase() || !DRIVING_LICENSE_REGEX.test(dlNumber)) {
                        showToast(t('Driving License number must be fully in CAPS and contain no hyphens (-).'));
                        return;
                      }
                      if (!dlFirstName || !dlLastName) {
                        showToast(t('First and Last Names are required.'));
                        return;
                      }
                      setDlModalStep(2);
                    }}
                    className="join-btn"
                    style={{ flex: 1.5, padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Demographics & Address */}
            {dlModalStep === 2 && (
              <div style={{ display: 'grid', gap: '14px', textAlign: 'left' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Gender
                    <select
                      value={dlGender}
                      onChange={(e) => setDlGender(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', height: '42px', outline: 'none' }}
                    >
                      <option value="M">Male / पुरुष</option>
                      <option value="F">Female / महिला</option>
                      <option value="O">Other / अन्य</option>
                    </select>
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Date of Birth
                    <input
                      type="date"
                      required
                      value={dlDob}
                      onChange={(e) => setDlDob(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', height: '42px', outline: 'none' }}
                    />
                  </label>
                </div>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Full Address (as printed in DL)
                  <input
                    type="text"
                    required
                    value={dlAddress}
                    onChange={(e) => setDlAddress(e.target.value)}
                    placeholder="e.g. 1787, Nagpur Road, Medical"
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    State
                    <input
                      type="text"
                      required
                      value={dlState}
                      onChange={(e) => setDlState(e.target.value)}
                      disabled={dlPinCode.length === 6 && !!dlState}
                      placeholder="e.g. Maharashtra"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        outline: 'none',
                        opacity: (dlPinCode.length === 6 && !!dlState) ? 0.6 : 1,
                        cursor: (dlPinCode.length === 6 && !!dlState) ? 'not-allowed' : 'text'
                      }}
                    />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    District / City
                    <input
                      type="text"
                      required
                      value={dlDistrict}
                      onChange={(e) => setDlDistrict(e.target.value)}
                      disabled={dlPinCode.length === 6 && !!dlDistrict}
                      placeholder="e.g. Nagpur"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        outline: 'none',
                        opacity: (dlPinCode.length === 6 && !!dlDistrict) ? 0.6 : 1,
                        cursor: (dlPinCode.length === 6 && !!dlDistrict) ? 'not-allowed' : 'text'
                      }}
                    />
                  </label>
                </div>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Pincode
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={dlPinCode}
                    onChange={(e) => setDlPinCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 440001"
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                  />
                </label>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setDlModalStep(1)}
                    style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!dlDob || !dlGender) {
                        showToast(t('Please complete demographics fields.'));
                        return;
                      }
                      if (!dlAddress || !dlState || !dlDistrict || !dlPinCode) {
                        showToast(t('All address fields are required.'));
                        return;
                      }
                      setDlModalStep(3);
                    }}
                    className="join-btn"
                    style={{ flex: 1.5, padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Photo Uploads */}
            {dlModalStep === 3 && (
              <div style={{ display: 'grid', gap: '16px', textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Upload clear photos of your Driving License card (JPEG or PNG):
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {/* Front Photo Card */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Front Side Photo *</span>
                    {dlFrontPhoto ? (
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '110px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1.5px solid var(--accent-teal)'
                      }}>
                        <img src={dlFrontPhoto} alt="DL Front" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => {
                            setDlFrontPhoto('');
                            setDlFrontPhotoSize(0);
                            setDlFrontPhotoOrigSize(0);
                          }}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'rgba(239, 68, 68, 0.85)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'grid',
                            placeItems: 'center',
                            cursor: 'pointer',
                            color: '#ffffff'
                          }}
                        >
                          <Trash2 style={{ width: '12px', height: '12px' }} />
                        </button>
                      </div>
                    ) : (
                      <label style={{
                        width: '100%',
                        height: '110px',
                        border: '2px dashed var(--border-color)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        background: 'rgba(255, 255, 255, 0.02)',
                        transition: 'all 0.2s',
                        color: 'var(--text-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.border = '2px dashed var(--accent-teal)';
                        e.currentTarget.style.background = 'rgba(20, 184, 166, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.border = '2px dashed var(--border-color)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      }}
                      >
                        <Upload style={{ width: '20px', height: '20px', color: 'var(--accent-teal)' }} />
                        <span style={{ fontSize: '10px', fontWeight: 600 }}>Select Front Photo</span>
                        <input
                          type="file"
                          accept="image/jpeg, image/png, image/jpg"
                          onChange={(e) => handlePhotoUpload(e, 'front')}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                    {dlFrontPhoto ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--accent-teal)', fontWeight: 'bold' }}>
                          ✓ Optimized: {dlFrontPhotoSize} KB {dlFrontPhotoOrigSize > 0 && `(from ${dlFrontPhotoOrigSize > 1024 ? `${(dlFrontPhotoOrigSize / 1024).toFixed(1)} MB` : `${dlFrontPhotoOrigSize} KB`})`}
                        </span>
                        <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>
                          Size Limit: 150 KB (JPEG/PNG/JPG)
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Size Limit: Max 150 KB (JPEG/PNG/JPG)
                      </span>
                    )}
                  </div>

                  {/* Back Photo Card */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Back Side Photo (Optional)</span>
                    {dlBackPhoto ? (
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '110px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1.5px solid var(--accent-teal)'
                      }}>
                        <img src={dlBackPhoto} alt="DL Back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => {
                            setDlBackPhoto('');
                            setDlBackPhotoSize(0);
                            setDlBackPhotoOrigSize(0);
                          }}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'rgba(239, 68, 68, 0.85)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'grid',
                            placeItems: 'center',
                            cursor: 'pointer',
                            color: '#ffffff'
                          }}
                        >
                          <Trash2 style={{ width: '12px', height: '12px' }} />
                        </button>
                      </div>
                    ) : (
                      <label style={{
                        width: '100%',
                        height: '110px',
                        border: '2px dashed var(--border-color)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        background: 'rgba(255, 255, 255, 0.02)',
                        transition: 'all 0.2s',
                        color: 'var(--text-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.border = '2px dashed var(--accent-teal)';
                        e.currentTarget.style.background = 'rgba(20, 184, 166, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.border = '2px dashed var(--border-color)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      }}
                      >
                        <Upload style={{ width: '20px', height: '20px', color: 'var(--accent-teal)' }} />
                        <span style={{ fontSize: '10px', fontWeight: 600 }}>Select Back Photo</span>
                        <input
                          type="file"
                          accept="image/jpeg, image/png, image/jpg"
                          onChange={(e) => handlePhotoUpload(e, 'back')}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                    {dlBackPhoto ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--accent-teal)', fontWeight: 'bold' }}>
                          ✓ Optimized: {dlBackPhotoSize} KB {dlBackPhotoOrigSize > 0 && `(from ${dlBackPhotoOrigSize > 1024 ? `${(dlBackPhotoOrigSize / 1024).toFixed(1)} MB` : `${dlBackPhotoOrigSize} KB`})`}
                        </span>
                        <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>
                          Size Limit: 150 KB (JPEG/PNG/JPG)
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Size Limit: Max 150 KB (JPEG/PNG/JPG)
                      </span>
                    )}
                  </div>
                </div>

                {/* Consent checkbox */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  marginTop: '4px'
                }}>
                  <input
                    type="checkbox"
                    required
                    defaultChecked={true}
                    style={{ marginTop: '2px', accentColor: 'var(--accent-teal)' }}
                  />
                  <span>
                    I hereby give my consent for ABHA enrollment (version 1.4) using my Driving License demographic details and photo credentials.
                  </span>
                </label>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={() => setDlModalStep(2)}
                    style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', cursor: isVerifying ? 'not-allowed' : 'pointer' }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={() => handleDlDemographicsSubmit()}
                    className="join-btn"
                    style={{
                      flex: 1.5,
                      padding: '12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: isVerifying ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} />
                        <span>Verifying & Enrolling...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles style={{ width: '14px', height: '14px' }} />
                        <span>Submit & Verify</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account Selection Modal */}
      {showAccountSelectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '500px',
            padding: '30px',
            boxShadow: 'var(--surface-shadow)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <img src="/assets/logos/logo7.png" alt="Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>ABHA SETU</h1>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Select ABHA Profile</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                We found {linkedAccounts.length} profiles linked with this number. Choose one to log in:
              </p>
            </div>

            {/* Custom Alert Box */}
            <div style={{
              background: 'rgba(217, 119, 6, 0.1)',
              border: '1px solid rgba(217, 119, 6, 0.25)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textAlign: 'left',
              color: '#d97706',
              fontSize: '11px',
              fontWeight: 600,
              lineHeight: '1.4'
            }}>
              <span style={{ fontSize: '18px' }}>📢</span>
              <div>
                <strong>Multiple Accounts Found / एकाधिक खाते मिले:</strong> We detected multiple active ABHA profiles linked with this mobile number. Please select the correct profile below to establish a secure session.
              </div>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
              {linkedAccounts.map((acc, index) => {
                const isSelected = selectedAccount && (selectedAccount.ABHANumber === acc.ABHANumber || selectedAccount.preferredAbhaAddress === acc.preferredAbhaAddress);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedAccount(acc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px',
                      borderRadius: '16px',
                      border: isSelected ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(20, 184, 166, 0.08)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxShadow: isSelected ? '0 0 12px rgba(20, 184, 166, 0.15)' : 'none'
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(20, 184, 166, 0.1)',
                      display: 'grid',
                      placeItems: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {acc.profilePhoto ? (
                        <img src={getPhotoSrc(acc.profilePhoto)} alt={acc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Fingerprint style={{ width: '20px', height: '20px', color: 'var(--accent-teal)' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{acc.name}</span>
                        <span style={{ fontSize: '9px', background: 'rgba(20, 184, 166, 0.15)', color: 'var(--accent-teal)', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {acc.verificationType || 'VERIFIED'}
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '2px' }}>
                        ABHA ID: {acc.preferredAbhaAddress || 'N/A'}
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        ABHA No: {acc.ABHANumber} | Gender: {acc.gender === 'M' ? 'Male' : 'Female'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowAccountSelectModal(false);
                  setIsVerifying(false);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedAccount}
                onClick={() => handleSelectAbhaAccount(selectedAccount)}
                className="join-btn"
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: !selectedAccount ? 'not-allowed' : 'pointer',
                  opacity: !selectedAccount ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles style={{ width: '14px', height: '14px' }} />
                <span>Confirm & Log In</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
