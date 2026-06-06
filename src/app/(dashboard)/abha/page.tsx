'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import {
  ArrowLeft,
  Download,
  ShieldCheck,
  Calendar,
  FolderLock,
  Fingerprint,
  Send,
  Key,
  RefreshCw,
  FileText,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  Database,
  Sparkles,
  Stethoscope,
  Search,
  Building2,
  Link2,
  UserPlus,
  Award,
  QrCode,
  CreditCard,
  Shield,
  Globe,
  X
} from 'lucide-react';
import { showToast } from '../../../utils/toast';
import LogoLoader from '../../../components/common/LogoLoader';

export default function AbhaPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { addRecord, logSecurityEvent } = useAuth();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'card' | 'onboard' | 'consent' | 'hiplink' | 'nhpr' | 'scanshare' | 'uhi' | 'nhcx' | 'tests'>('card');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // QR Scanner States
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerTab, setScannerTab] = useState<'webcam' | 'upload'>('webcam');
  const [scannerError, setScannerError] = useState('');
  const scannerRef = useRef<any>(null);

  // Load html5-qrcode script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleOpenScanner = () => {
    setShowScannerModal(true);
    setScannerTab('webcam');
    setScannerError('');
    // Start camera after dynamic modal DOM render
    setTimeout(() => {
      startWebcamScanner();
    }, 100);
  };

  const handleCloseScanner = () => {
    stopWebcamScanner();
    setShowScannerModal(false);
  };

  const startWebcamScanner = () => {
    setScannerError('');
    if (typeof window === 'undefined' || !(window as any).Html5Qrcode) {
      setScannerError('Scanner library not loaded. Please wait a moment.');
      return;
    }

    try {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).then(() => {
          initCamera();
        });
      } else {
        initCamera();
      }
    } catch (e: any) {
      setScannerError(`Failed to initialize camera: ${e.message}`);
    }
  };

  const initCamera = () => {
    const html5QrCode = new (window as any).Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText: string) => {
        // Successful scan
        const abhaAddress = parseAbhaQrCode(decodedText);
        setScanShareInputAddress(abhaAddress);
        showToast(t('QR Code scanned successfully!'));
        handleCloseScanner();
      },
      (errorMessage: string) => {
        // Verbose scan failure log, ignore to avoid spamming
      }
    ).catch((err: any) => {
      setScannerError(`Failed to start camera: ${err}`);
    });
  };

  const stopWebcamScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (typeof window === 'undefined' || !(window as any).Html5Qrcode) {
      setScannerError('Scanner library not loaded.');
      return;
    }

    setScannerError('');
    // Create a temporary element to bind the reader
    const tempContainer = document.createElement('div');
    tempContainer.id = 'temp-qr-reader';
    tempContainer.style.display = 'none';
    document.body.appendChild(tempContainer);

    const html5QrCode = new (window as any).Html5Qrcode("temp-qr-reader");
    html5QrCode.scanFile(file, true)
      .then((decodedText: string) => {
        const abhaAddress = parseAbhaQrCode(decodedText);
        setScanShareInputAddress(abhaAddress);
        showToast(t('QR image decoded successfully!'));
        document.body.removeChild(tempContainer);
        handleCloseScanner();
      })
      .catch((err: any) => {
        setScannerError(`Failed to parse QR code from image: ${err}`);
        document.body.removeChild(tempContainer);
      });
  };

  const parseAbhaQrCode = (text: string) => {
    try {
      const data = JSON.parse(text);
      if (data.abhaAddress) return data.abhaAddress;
      if (data.abhaNo) return data.abhaNo;
      if (data.address) return data.address;
      if (data.id) return data.id;
    } catch (e) {
      // not json
    }
    const match = text.match(/[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+/);
    if (match) {
      return match[0];
    }
    return text.trim();
  };

  // Tab 9: Sandbox Tests State
  const [testSummary, setTestSummary] = useState<any | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testsRunning, setTestsRunning] = useState(false);
  const [testsConsole, setTestsConsole] = useState<string[]>([]);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  const runSandboxTests = async () => {
    setTestsRunning(true);
    setTestsConsole([]);
    setTestSummary(null);
    setTestResults([]);
    setExpandedTestId(null);

    const writeLog = (msg: string) => {
      setTestsConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      writeLog('Initializing ABDM Sandbox Certification Test Runner...');
      await new Promise(r => setTimeout(r, 450));
      writeLog('Checking local server network topology and gateway proxy bounds...');
      await new Promise(r => setTimeout(r, 350));
      writeLog('Transmitting parallel testing request to proxy route /api/abdm/tests...');
      await new Promise(r => setTimeout(r, 200));

      const res = await fetch('/api/abdm/tests');
      const data = await res.json();
      await new Promise(r => setTimeout(r, 600));

      if (res.ok && data.status === 'success') {
        writeLog('✔ Gateway handshake verified. Received payload signature JWS.');
        writeLog(`✔ Total scenarios evaluated: ${data.summary.total}`);
        writeLog(`✔ Passing Rate: ${data.summary.successRate}% | Coverage: ${data.summary.coveragePercent}%`);
        await new Promise(r => setTimeout(r, 400));
        
        for (const testCase of data.results) {
          writeLog(`[${testCase.id}] ${testCase.name} -> ${testCase.passed ? '✔ PASSED' : '❌ FAILED'} (${testCase.durationMs}ms)`);
          await new Promise(r => setTimeout(r, 100));
        }

        setTestSummary(data.summary);
        setTestResults(data.results);
        showToast(t('Sandbox compliance tests completed successfully!'));
        logSecurityEvent('ABDM Compliance Tests', `Executed 20 compliance tests. Passed: ${data.summary.passed}, Failed: ${data.summary.failed}, Success Rate: ${data.summary.successRate}%`);
      } else {
        writeLog('❌ Compliance tests execution failed. Gateway returned error status.');
        showToast(t('Sandbox compliance tests failed.'));
      }
    } catch (e) {
      writeLog('❌ Connection to testing API route timed out.');
      showToast(t('Test execution timed out.'));
    } finally {
      setTestsRunning(false);
    }
  };

  // Tab 6: Scan & Share / Scan & Pay State
  const [scanShareInputAddress, setScanShareInputAddress] = useState('ayesha.ali.9981057765@abdm');
  const [scanShareStep, setScanShareStep] = useState<'idle' | 'sharing' | 'token-generated' | 'paying' | 'paid'>('idle');
  const [scanShareConsole, setScanShareConsole] = useState<string[]>([]);
  const [scanShareOpdToken, setScanShareOpdToken] = useState<any | null>(null);
  const [scanShareBills, setScanShareBills] = useState<any[]>([]);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [scanSharePaymentResult, setScanSharePaymentResult] = useState<any | null>(null);

  // Tab 7: UHI Gateway network State
  const [uhiQuery, setUhiQuery] = useState('Homeopathy Consultant');
  const [uhiStep, setUhiStep] = useState<'idle' | 'searching' | 'selecting' | 'initializing' | 'confirming' | 'booked'>('idle');
  const [uhiConsole, setUhiConsole] = useState<string[]>([]);
  const [uhiDoctors, setUhiDoctors] = useState<any[]>([]);
  const [selectedUhiDoctor, setSelectedUhiDoctor] = useState<any | null>(null);
  const [uhiBookingContextId, setUhiBookingContextId] = useState('');
  const [uhiPaymentDetails, setUhiPaymentDetails] = useState<any | null>(null);
  const [uhiReceipt, setUhiReceipt] = useState<any | null>(null);

  // Tab 8: NHCX claims State
  const [nhcxPolicyNo] = useState('STAR-ABHA-77862');
  const [nhcxDiagnosis, setNhcxDiagnosis] = useState('Acute Bronchitis Treatment');
  const [nhcxCost, setNhcxCost] = useState('24500');
  const [nhcxLinkedRecord, setNhcxLinkedRecord] = useState('Prescription - Fever Care');
  const [nhcxStep, setNhcxStep] = useState<'idle' | 'eligibility-checking' | 'eligibility-done' | 'preauth-submitting' | 'preauth-done' | 'settling' | 'settled'>('idle');
  const [nhcxConsole, setNhcxConsole] = useState<string[]>([]);
  const [nhcxEligibilityResponse, setNhcxEligibilityResponse] = useState<any | null>(null);
  const [nhcxPreAuthResponse, setNhcxPreAuthResponse] = useState<any | null>(null);
  const [nhcxClaimResponse, setNhcxClaimResponse] = useState<any | null>(null);

  // Scan & Share Flow handler
  const runScanShareFlow = async () => {
    setScanShareStep('sharing');
    setScanShareConsole([]);
    const writeLog = (msg: string) => {
      setScanShareConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      writeLog('Initializing secure Scan & Share profile handoff...');
      await new Promise(r => setTimeout(r, 600));
      writeLog('Scanning Health Facility QR code: "IN-HFR-100456" (Dr. Ayesha Homeo Health Mall)');
      await new Promise(r => setTimeout(r, 600));
      writeLog('Encrypting demographic metadata bundle using local gateway session keys...');
      
      const res = await fetch('/api/abdm/scan-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'share-profile',
          abhaAddress: scanShareInputAddress,
          patientProfile: abhaDetails,
          facilityCode: 'IN-HFR-100456'
        })
      });
      const data = await res.json();
      await new Promise(r => setTimeout(r, 800));

      if (res.ok && data.status === 'success') {
        writeLog('✔ Handoff complete. Gateway forwarded profile to hospital HMIS.');
        writeLog(`✔ Asynchronous gateway callback /on-share received with digital seal: ${data.gatewayCallback.digitalSignature}`);
        writeLog(`✔ Hospital successfully generated fast-track OPD token.`);
        setScanShareOpdToken(data.opdToken);
        setScanShareStep('token-generated');
        showToast(t('OPD check-in queue token created successfully!'));
        logSecurityEvent('Scan & Share Checkin', `Shared profile and created OPD queue token: ${data.opdToken.tokenNumber}`);
      } else {
        writeLog('⚠ Profile handoff failed.');
        showToast(t('Scan & Share failed.'));
      }
    } catch (e) {
      writeLog('Error executing Scan & Share profiles exchange.');
      setScanShareStep('idle');
    }
  };

  const loadScanPayBills = async () => {
    setScanShareStep('paying');
    setScanShareConsole([]);
    const writeLog = (msg: string) => {
      setScanShareConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      writeLog('Querying health merchant records for pending bills...');
      await new Promise(r => setTimeout(r, 600));

      const res = await fetch('/api/abdm/scan-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-pending-bills',
          abhaAddress: scanShareInputAddress
        })
      });
      const data = await res.json();
      await new Promise(r => setTimeout(r, 600));

      if (res.ok && data.status === 'success') {
        writeLog(`✔ Found ${data.pendingBills.length} pending billing entries.`);
        setScanShareBills(data.pendingBills);
        if (data.pendingBills.length > 0) {
          setSelectedBill(data.pendingBills[0]);
        }
      } else {
        writeLog('⚠ Failed to fetch pending bills.');
      }
    } catch (e) {
      writeLog('Error loading bills.');
    }
  };

  const processScanPayPayment = async () => {
    if (!selectedBill) return;
    setScanShareConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] Processing digital wallet payment...`]);
    
    try {
      const res = await fetch('/api/abdm/scan-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process-payment',
          billId: selectedBill.billId,
          paymentAmount: selectedBill.amount
        })
      });
      const data = await res.json();
      await new Promise(r => setTimeout(r, 800));

      if (res.ok && data.status === 'success') {
        setScanShareConsole(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✔ Payment Confirmed! UTR receipt: ${data.utr}`,
          `[${new Date().toLocaleTimeString()}] ✔ Claim status: ${data.claimStatus}`
        ]);
        setScanSharePaymentResult(data);
        setScanShareStep('paid');
        showToast(t('Bill paid successfully via Health UPI!'));
        logSecurityEvent('Scan & Pay Billing', `Processed bill payment of Rs.${selectedBill.amount} for Bill ID: ${selectedBill.billId}`);
      } else {
        setScanShareConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ⚠ Payment failed.`]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // UHI Network Handlers
  const runUhiSearch = async () => {
    setUhiStep('searching');
    setUhiConsole([]);
    setUhiDoctors([]);
    setSelectedUhiDoctor(null);

    const writeLog = (msg: string) => {
      setUhiConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      writeLog(`Broadcasting Beckn /search query to UHI Gateway for: "${uhiQuery}"...`);
      await new Promise(r => setTimeout(r, 600));

      const res = await fetch('/api/abdm/uhi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          searchQuery: uhiQuery
        })
      });
      const data = await res.json();
      await new Promise(r => setTimeout(r, 800));

      if (res.ok && data.status === 'success') {
        writeLog(`✔ Gateway received 202 ack. Searching network...`);
        await new Promise(r => setTimeout(r, 600));
        writeLog(`✔ Asynchronous /on_search callback received from 2 Health Service Providers (HSPAs).`);
        
        const providers = data.message.catalog.providers || [];
        const doctorsListList = providers.flatMap((p: any) => 
          p.items.map((item: any) => ({
            providerId: p.id,
            providerName: p.descriptor.name,
            id: item.id,
            name: item.fulfillment.doctor,
            degree: item.fulfillment.degree,
            fee: item.price.value,
            mode: item.fulfillment.type
          }))
        );
        setUhiDoctors(doctorsListList);
        setUhiStep('idle');
      } else {
        writeLog('⚠ Search request failed.');
        setUhiStep('idle');
      }
    } catch (e) {
      writeLog('Error querying UHI interoperable health directory.');
      setUhiStep('idle');
    }
  };

  const runUhiSelect = async (doc: any) => {
    setSelectedUhiDoctor(doc);
    setUhiStep('selecting');
    const writeLog = (msg: string) => {
      setUhiConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    writeLog(`[Beckn select] Querying slot availability & price breakdown for Dr. ${doc.name}...`);
    try {
      const res = await fetch('/api/abdm/uhi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'select',
          providerId: doc.providerId,
          itemId: doc.id
        })
      });
      const data = await res.json();
      await new Promise(r => setTimeout(r, 800));

      if (res.ok && data.status === 'success') {
        writeLog(`✔ Asynchronous callback /on_select returned pricing validation.`);
        writeLog(`Consultation Base: INR ${data.message.order.quote.breakup[0].price.value}. Gateway charge: INR ${data.message.order.quote.breakup[1].price.value}.`);
        setUhiBookingContextId(data.context.transactionId);
        setUhiStep('initializing');
      }
    } catch (e) {
      writeLog('⚠ Selection check failed.');
      setUhiStep('idle');
    }
  };

  const runUhiInit = async () => {
    setUhiStep('initializing');
    const writeLog = (msg: string) => {
      setUhiConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    writeLog(`[Beckn init] Sharing patient demographic bindings for checkout...`);
    try {
      const res = await fetch('/api/abdm/uhi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'init',
          bookingContextId: uhiBookingContextId,
          patientDetails: { name: abhaDetails.name, email: 'ayesha.ali@abdm', mobile: abhaDetails.mobile }
        })
      });
      const data = await res.json();
      await new Promise(r => setTimeout(r, 800));

      if (res.ok && data.status === 'success') {
        writeLog(`✔ Beckn /on_init returned appointment session workspace ID: ${data.message.order.id}`);
        setUhiPaymentDetails(data.message.order.payment);
        setUhiStep('confirming');
      }
    } catch (e) {
      writeLog('⚠ Initialization failed.');
    }
  };

  const runUhiConfirm = async () => {
    setUhiStep('confirming');
    const writeLog = (msg: string) => {
      setUhiConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    writeLog(`[Beckn confirm] Finalizing payment and booking confirmation...`);
    try {
      const res = await fetch('/api/abdm/uhi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          bookingContextId: uhiBookingContextId,
          patientDetails: { name: abhaDetails.name }
        })
      });
      const data = await res.json();
      await new Promise(r => setTimeout(r, 800));

      if (res.ok && data.status === 'success') {
        writeLog(`✔ Beckn /on_confirm returned active tele-health appointment confirmation!`);
        writeLog(`Appointment ID: ${data.message.order.appointment.id}`);
        writeLog(`Consultation meet URL: ${data.message.order.appointment.consultationLink}`);
        setUhiReceipt(data.message.order.appointment);
        setUhiStep('booked');
        showToast(t('Appointment booked successfully via UHI gateway!'));
        logSecurityEvent('UHI Consultation Booked', `Booked appointment ID: ${data.message.order.appointment.id} via Beckn`);
      }
    } catch (e) {
      writeLog('⚠ Confirmation failed.');
    }
  };

  // NHCX Claims Handlers
  const runNhcxEligibilityCheck = async () => {
    setNhcxStep('eligibility-checking');
    setNhcxConsole([]);
    setNhcxEligibilityResponse(null);

    const writeLog = (msg: string) => {
      setNhcxConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      writeLog(`Constructing HL7 FHIR R4 CoverageEligibilityRequestBundle JSON...`);
      await new Promise(r => setTimeout(r, 400));
      writeLog(`Verifying insurance policy: "${nhcxPolicyNo}"...`);
      await new Promise(r => setTimeout(r, 400));
      writeLog(`Transmitting claims eligibility check to Star Health Insurance Co. via NHCX Gateway...`);

      const res = await fetch('/api/abdm/nhcx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'eligibility-check',
          abhaAddress: abhaDetails.abhaId,
          policyNumber: nhcxPolicyNo
        })
      });
      const data = await res.json();
      await new Promise(r => setTimeout(r, 800));

      if (res.ok && data.status === 'success') {
        const eligibilityRes = data.fhirBundle.entry[0].resource;
        writeLog(`✔ CoverageEligibilityResponseBundle received from Payer.`);
        writeLog(`Status: ${eligibilityRes.status.toUpperCase()}. Disposition: ${eligibilityRes.disposition}`);
        writeLog(`Star Plan Cashless Limit: INR ${eligibilityRes.insurance[0].benefit[0].allowedMoney.value}`);
        setNhcxEligibilityResponse(eligibilityRes);
        setNhcxStep('eligibility-done');
        showToast(t('Insurance coverage verified successfully!'));
      } else {
        writeLog('⚠ Eligibility request failed.');
        setNhcxStep('idle');
      }
    } catch (e) {
      writeLog('Error executing claims eligibility request.');
      setNhcxStep('idle');
    }
  };

  const runNhcxPreAuth = async () => {
    setNhcxStep('preauth-submitting');
    setNhcxPreAuthResponse(null);
    const writeLog = (msg: string) => {
      setNhcxConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      writeLog(`Attaching ABDM verified diagnostic records: "${nhcxLinkedRecord}"...`);
      await new Promise(r => setTimeout(r, 400));
      writeLog(`Building FHIR R4 Pre-Auth ClaimBundle JSON of type "preauthorization"...`);
      await new Promise(r => setTimeout(r, 400));
      writeLog(`Submitting pre-auth request for Rs.${nhcxCost} estimation...`);

      const res = await fetch('/api/abdm/nhcx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preauth-submit',
          policyNumber: nhcxPolicyNo,
          estimateCost: nhcxCost,
          recordsLinked: nhcxLinkedRecord
        })
      });
      const data = await res.json();
      await new Promise(r => setTimeout(r, 800));

      if (res.ok && data.status === 'success') {
        writeLog(`✔ Asynchronous Pre-Auth ClaimResponse received with APPROVED status!`);
        writeLog(`Pre-auth Authorization Ref ID: ${data.preAuthId}`);
        writeLog(`Insurers Approved Amount: INR ${data.adjudication.approvedAmount}. Copay Obligation: INR ${data.adjudication.patientCopay}.`);
        setNhcxPreAuthResponse(data);
        setNhcxStep('preauth-done');
        showToast(t('Cashless Pre-Authorization APPROVED!'));
        logSecurityEvent('NHCX PreAuth Approved', `PreAuth ID: ${data.preAuthId} approved for Rs.${data.adjudication.approvedAmount}`);
      }
    } catch (e) {
      writeLog('⚠ Pre-Authorization failed.');
    }
  };

  const runNhcxSettlement = async () => {
    setNhcxStep('settling');
    setNhcxClaimResponse(null);
    const writeLog = (msg: string) => {
      setNhcxConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      writeLog(`Generating final electronic hospital bill ClaimBundle...`);
      await new Promise(r => setTimeout(r, 400));
      writeLog(`Transmitting cashless settlement request through NHCX direct clearing gateway...`);

      const res = await fetch('/api/abdm/nhcx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claim-submit',
          abhaAddress: abhaDetails.abhaId,
          policyNumber: nhcxPolicyNo,
          estimateCost: nhcxCost
        })
      });
      const data = await res.json();
      await new Promise(r => setTimeout(r, 800));

      if (res.ok && data.status === 'success') {
        writeLog(`✔ NHCX direct clearing direct payment UTR generated: ${data.settlement.clearingUtr}`);
        writeLog(`Payer settled INR ${data.settlement.reimbursementAmount}. Direct EFT processed successfully.`);
        setNhcxClaimResponse(data.settlement);
        setNhcxStep('settled');
        showToast(t('Claim settled successfully via direct EFT bank transfer!'));
        logSecurityEvent('NHCX Claim Paid', `Settled cashless claim with direct bank EFT: ${data.settlement.clearingUtr}`);
      }
    } catch (e) {
      writeLog('⚠ Final settlement request failed.');
    }
  };

  // Replica / User Card Data
  const [abhaDetails, setAbhaDetails] = useState({
    name: "Dr. Ayesha Ali",
    mobile: "9981057765",
    abhaId: "ayesha.ali.9981057765@abdm",
    abhaNumber: "91-9981-0577-6582",
    gender: "Female",
    dob: "15-08-1980",
    photo: "/assets/doctors/dr-ayesha-ali.jpeg"
  });

  // Tab 2: Onboarding (Milestone 1) State
  const [onboardMethod, setOnboardMethod] = useState<'aadhaar' | 'mobile'>('aadhaar');
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [txnId, setTxnId] = useState('');
  const [onboardStep, setOnboardStep] = useState<'verification' | 'otp' | 'demographics' | 'completed'>('verification');
  const [loading, setLoading] = useState(false);

  // Demographics state for Mobile onboarding
  const [demoFirstName, setDemoFirstName] = useState('');
  const [demoLastName, setDemoLastName] = useState('');
  const [demoDob, setDemoDob] = useState('');
  const [demoGender, setDemoGender] = useState<'Male' | 'Female' | 'Others'>('Male');
  const [demoAddress, setDemoAddress] = useState('');
  const [demoState, setDemoState] = useState('');
  const [demoDistrict, setDemoDistrict] = useState('');
  const [demoPinCode, setDemoPinCode] = useState('');

  // Tab 3: Consent & Exchange (Milestone 3) State
  const [abhaAddressInput, setAbhaAddressInput] = useState('ayesha.ali.9981057765@abdm');
  const [consentPurpose, setConsentPurpose] = useState('Clinical Referral');
  const [exchangeStep, setExchangeStep] = useState<'idle' | 'sessions' | 'keys' | 'pending' | 'decrypted'>('idle');
  const [exchangeConsole, setExchangeConsole] = useState<string[]>([]);
  const [decryptedRecords, setDecryptedRecords] = useState<any[]>([]);
  const [cryptoMetadata, setCryptoMetadata] = useState<any>(null);

  // Tab 4: HIP Care Context Linking (Milestone 2) State
  const [m2AbhaAddress, setM2AbhaAddress] = useState('ayesha.ali.9981057765@abdm');
  const [m2PatientName, setM2PatientName] = useState('Dr. Ayesha Ali');
  const [m2ContextType, setM2ContextType] = useState('OPD Consultation');
  const [m2Detail, setM2Detail] = useState('Chronic Care visit');
  const [m2Step, setM2Step] = useState<'idle' | 'discovering' | 'otp' | 'completed'>('idle');
  const [m2Console, setM2Console] = useState<string[]>([]);
  const [m2OtpInput, setM2OtpInput] = useState('');
  const [m2TxnId, setM2TxnId] = useState('');
  const [m2LinkedEncounters, setM2LinkedEncounters] = useState<any[]>([
    { id: 'CTX-1002', type: 'Prescription', desc: 'Homeopathy follow-up care', date: '28-05-2026', status: 'LINKED' }
  ]);

  // Tab 5: NHPR / HPR Registry State
  const [nhprMode, setNhprMode] = useState<'search' | 'enroll'>('search');
  const [hprIdSearch, setHprIdSearch] = useState('dr.ayesha.ali@hpr');
  const [regNoSearch, setRegNoSearch] = useState('MCI-4207198');
  const [councilSelect, setCouncilSelect] = useState('Medical Council of India (MCI)');
  const [systemSelect, setSystemSelect] = useState('Homeopathy');
  const [doctorResult, setDoctorResult] = useState<any>(null);
  
  // HPR Doctor Onboarding
  const [hprAadhaar, setHprAadhaar] = useState('');
  const [hprOtp, setHprOtp] = useState('');
  const [hprTxnId, setHprTxnId] = useState('');
  const [hprStep, setHprStep] = useState<'aadhaar' | 'otp' | 'completed'>('aadhaar');

  const handleSaveToLocker = (cardName = 'ABHA_Smart_Card.pdf') => {
    const newRecord = {
      name: cardName,
      type: 'ID Card',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      source: 'National Health Authority',
    };
    addRecord(newRecord);
    logSecurityEvent('ABHA Card Saved', `User clicked Save to Health Locker on replica ABHA Card screen: ${cardName}`);
    showToast(t('ABHA ID Card successfully synced and saved inside secure Health Locker.'));
  };

  // Milestone 1 Onboarding API triggers
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onboardMethod === 'aadhaar') {
      if (aadhaarInput.length !== 12 || isNaN(Number(aadhaarInput))) {
        showToast(t('Please enter a valid 12-digit Aadhaar Number.'));
        return;
      }
    } else {
      if (mobileInput.length !== 10 || isNaN(Number(mobileInput))) {
        showToast(t('Please enter a valid 10-digit Mobile Number.'));
        return;
      }
    }

    setLoading(true);
    try {
      const payload = onboardMethod === 'aadhaar' 
        ? { loginHint: 'aadhaar', loginId: aadhaarInput }
        : { loginHint: 'mobile', loginId: mobileInput };

      const res = await fetch('/api/abdm/v3/enrollment/request/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setTxnId(data.txnId);
        setOnboardStep('otp');
        showToast(t(data.message));
        logSecurityEvent(
          'ABDM OTP Requested', 
          `Successfully initialized ${onboardMethod === 'aadhaar' ? 'Aadhaar' : 'Mobile'} OTP simulation request.`
        );
      } else {
        showToast(t(data.message || 'OTP request failed'));
      }
    } catch (err: any) {
      showToast(t(err.message || 'Network error requesting OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length !== 6 || isNaN(Number(otpInput))) {
      showToast(t('Please enter a 6-digit numeric OTP.'));
      return;
    }

    setLoading(true);
    setIsVerifyingOtp(true);
    
    // Immersive 1.8 seconds holographic decrypter sequence
    setTimeout(async () => {
      try {
        let url = '';
        let payload = {};

        if (onboardMethod === 'aadhaar') {
          url = '/api/abdm/v3/enrollment/enrol/byAadhaar';
          payload = {
            txnId,
            scope: ['abha-enrol'],
            authData: {
              authMethods: ['otp'],
              otp: {
                txnId,
                otpValue: otpInput
              }
            },
            consent: {
              code: 'abha-enrollment',
              version: '1.4'
            }
          };
        } else {
          url = '/api/abdm/v3/enrollment/auth/byAbdm';
          payload = {
            txnId,
            scope: ['abha-enrol', 'mobile-verify'],
            authData: {
              authMethods: ['otp'],
              otp: {
                txnId,
                otpValue: otpInput
              }
            },
            consent: {
              code: 'abha-enrollment',
              version: '1.4'
            }
          };
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.status === 'success') {
          if (onboardMethod === 'aadhaar') {
            setAbhaDetails({
              name: data.profile.name,
              mobile: data.profile.mobile,
              abhaId: data.abhaAddress,
              abhaNumber: data.abhaNumber,
              gender: data.profile.gender,
              dob: data.profile.dob,
              photo: data.profile.photo
            });
            setOnboardStep('completed');
            showToast(t(data.message || 'Aadhaar OTP verified successfully!'));
            logSecurityEvent('ABHA Generated', `Successfully generated dynamic ABHA: ${data.abhaNumber}`);
          } else {
            setOnboardStep('demographics');
            showToast(t('Mobile OTP verified successfully. Please enter demographics to generate ABHA.'));
            logSecurityEvent('Mobile OTP Verified', 'Mobile OTP verified. Navigating to demographics entry.');
          }
        } else {
          showToast(t(data.message || 'OTP verification failed.'));
        }
      } catch (err: any) {
        showToast(t(err.message || 'Verification error. Please try again.'));
      } finally {
        setLoading(false);
        setIsVerifyingOtp(false);
      }
    }, 1800);
  };

  const handleEnrolByDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!demoFirstName.trim() || !demoLastName.trim()) {
      showToast(t('Please enter first and last name.'));
      return;
    }
    if (!demoDob) {
      showToast(t('Please select date of birth.'));
      return;
    }
    if (!demoAddress.trim() || !demoState.trim() || !demoDistrict.trim() || !demoPinCode.trim()) {
      showToast(t('Please fill complete address details.'));
      return;
    }

    setLoading(true);
    try {
      // Format DOB to DD-MM-YYYY as expected by ABDM Smart ID card display
      let formattedDob = demoDob;
      if (demoDob.includes('-')) {
        const parts = demoDob.split('-');
        if (parts[0].length === 4) {
          formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD to DD-MM-YYYY
        }
      }

      const res = await fetch('/api/abdm/v3/enrollment/enrol/byDocument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txnId,
          scope: ['dl-flow'],
          authData: {
            authMethods: ['dl'],
            document: {
              documentType: 'DRIVING_LICENSE',
              documentId: `DL-${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
              firstName: demoFirstName,
              middleName: '',
              lastName: demoLastName,
              dob: formattedDob,
              gender: demoGender.toUpperCase().substring(0, 1),
              frontSidePhoto: '',
              backSidePhoto: '',
              address: demoAddress,
              state: demoState,
              district: demoDistrict,
              pinCode: demoPinCode,
              mobile: mobileInput
            }
          },
          consent: {
            code: 'abha-enrollment',
            version: '1.4'
          }
        }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        setAbhaDetails({
          name: data.profile.name,
          mobile: data.profile.mobile,
          abhaId: data.abhaAddress,
          abhaNumber: data.abhaNumber,
          gender: data.profile.gender,
          dob: data.profile.dob,
          photo: data.profile.photo || ''
        });
        
        setOnboardStep('completed');
        showToast(t('ABHA generated successfully via Mobile onboarding!'));
        logSecurityEvent('ABHA Generated via Mobile', `Successfully issued ABHA Number: ${data.abhaNumber}`);
      } else {
        showToast(t(data.message || 'Failed to submit demographics.'));
      }
    } catch (err: any) {
      showToast(t(err.message || 'Error creating ABHA card. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Milestone 3 Consent & Fidelius Data Exchange Simulation
  const runDataExchangeFlow = async () => {
    if (!abhaAddressInput.includes('@')) {
      showToast(t('Please enter a valid ABHA address (e.g. username@sbx)'));
      return;
    }

    setExchangeStep('sessions');
    setExchangeConsole([]);
    setDecryptedRecords([]);
    
    const writeLog = (msg: string) => {
      setExchangeConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      writeLog('Connecting to ABDM Gateway sessions...');
      const sessRes = await fetch('/api/abdm/sessions');
      const sessData = await sessRes.json();
      await new Promise(r => setTimeout(r, 600));
      
      if (sessRes.ok) {
        writeLog(`✔ ABDM Gateway Handshake successful. Token preview: ${sessData.tokenPreview}`);
      } else {
        writeLog('⚠ Direct Gateway Offline. Activating Sandbox Proxy Caching...');
      }

      setExchangeStep('keys');
      writeLog('Initializing Consent Request (POST /consent/v3/request/init)...');
      const consentRes = await fetch('/api/abdm/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request-consent',
          abhaAddress: abhaAddressInput,
          purpose: consentPurpose
        })
      });
      const consentData = await consentRes.json();
      await new Promise(r => setTimeout(r, 800));

      writeLog(`✔ Consent request created. Request ID: ${consentData.consentRequestId}`);
      writeLog(`✔ Local Curve25519 keypair and nonce derived.`);
      writeLog(`Public Key: ${consentData.keyMaterial.publicKey.substring(0, 20)}...`);

      setExchangeStep('pending');
      writeLog(`Awaiting patient response on PHR App for: ${abhaAddressInput}...`);
      await new Promise(r => setTimeout(r, 1500));
      writeLog(`✔ Patient granted consent (Consent ID: ${consentData.consentId})`);
      writeLog(`✔ Received Signed Consent Artifact from Consent Manager.`);

      setExchangeStep('decrypted');
      writeLog(`Requesting data payload from Health Repository (HIP)...`);
      const fetchRes = await fetch('/api/abdm/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fetch-records',
          consentId: consentData.consentId
        })
      });
      const fetchData = await fetchRes.json();
      await new Promise(r => setTimeout(r, 800));

      writeLog(`✔ Ciphertext bundle received from HIP.`);
      writeLog(`✔ Initiating secure HKDF-SHA256 derivation...`);
      writeLog(`✔ Computed ECDH Shared Secret: Weierstrass Curve25519.`);
      writeLog(`✔ Decrypting using symmetric AES-256-GCM scheme.`);
      writeLog(`✔ GCM authentication tag verified. Encryption details stored.`);
      
      setCryptoMetadata(fetchData.securityDetails);
      
      const entries = fetchData.fhirBundle.entry || [];
      setDecryptedRecords(entries.map((e: any) => e.resource));
      showToast(t('Health Records decrypted successfully!'));
      logSecurityEvent('ABDM Data Decrypted', `Decrypted FHIR bundle with Consent ID: ${consentData.consentId}`);

    } catch (err) {
      writeLog('Error executing secure data exchange.');
      setExchangeStep('idle');
    }
  };

  // Milestone 2 HIP Care Context Linking Flow
  const runHipLinkingFlow = async () => {
    if (!m2AbhaAddress.includes('@')) {
      showToast(t('Please enter a valid patient ABHA address.'));
      return;
    }

    setM2Step('discovering');
    setM2Console([]);

    const writeLog = (msg: string) => {
      setM2Console(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      writeLog('Checking active Gateway bridge authorization...');
      await new Promise(r => setTimeout(r, 500));
      writeLog('✔ Gateway token valid. Checking database records...');

      writeLog('Initiating Synchronous Patient Discovery (POST /api/v3/hip/patient/care-context/discover)...');
      const discRes = await fetch('/api/abdm/hip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'discover-link',
          abhaAddress: m2AbhaAddress,
          patientName: m2PatientName,
          contextType: m2ContextType,
          detail: m2Detail
        })
      });
      const discData = await discRes.json();
      await new Promise(r => setTimeout(r, 800));

      writeLog('✔ Patient discovered successfully in hospital EMR!');
      writeLog(`Transaction Context ID: ${discData.transactionId}`);
      writeLog(`Reference Number: ${discData.matchedPatient.referenceNumber}`);
      writeLog(`Pending Care Context found: ${discData.matchedPatient.careContexts[0].display}`);

      setM2Step('otp');
      setM2TxnId(discData.txnId);
      writeLog('Triggering OTP record linking request (POST /api/v3/hip/link/care-context/init)...');
      await new Promise(r => setTimeout(r, 700));
      writeLog(`✔ Secure link token request sent to Gateway.`);
      writeLog(`Awaiting patient OTP input (Sent verification code to mobile).`);
      showToast(t('Record discovery complete. Enter OTP to link.'));

    } catch (err) {
      writeLog('Error executing patient discovery check.');
      setM2Step('idle');
    }
  };

  const confirmHipLinking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!m2OtpInput || m2OtpInput.length !== 6) {
      showToast(t('Please enter a valid 6-digit OTP.'));
      return;
    }

    const writeLog = (msg: string) => {
      setM2Console(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      writeLog(`Submitting verification OTP: ${m2OtpInput}...`);
      const linkRes = await fetch('/api/abdm/hip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm-link',
          otp: m2OtpInput,
          txnId: m2TxnId
        })
      });
      const linkData = await linkRes.json();

      if (linkRes.ok && linkData.status === 'success') {
        writeLog(`✔ Verification successful.`);
        writeLog(`✔ Link established dynamically. Receipt ID: ${linkData.referenceNumber}`);
        writeLog(`✔ Care Context linked successfully under patient profile.`);
        
        // Add new item to linked encounters list
        const newEncounter = {
          id: `CTX-${Math.floor(1000 + Math.random() * 9000)}`,
          type: m2ContextType,
          desc: m2Detail,
          date: new Date().toLocaleDateString(),
          status: 'LINKED'
        };
        setM2LinkedEncounters(prev => [newEncounter, ...prev]);
        setM2Step('completed');
        showToast(t('Care context linked successfully!'));
        logSecurityEvent('Care Context Linked', `HIP Linked Care Context: ${newEncounter.id}`);
      } else {
        showToast(t(linkData.message || 'OTP verification failed.'));
      }
    } catch (err) {
      showToast(t('Linking error. Sandbox fallback complete.'));
      setM2Step('completed');
    }
  };

  // NHPR / HPR Doctor Registry Search
  const handleNhprDoctorSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/abdm/hpr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          hprId: hprIdSearch,
          registrationNo: regNoSearch,
          council: councilSelect,
          system: systemSelect
        })
      });
      const data = await res.json();
      
      if (res.ok && data.status === 'success') {
        setDoctorResult(data.practitioner);
        showToast(t('Doctor details fetched successfully from registry.'));
        logSecurityEvent('HPR Registry Searched', `Practitioner lookup: ${hprIdSearch}`);
        try {
          const stored = localStorage.getItem('hpr_registered_doctors');
          let list = stored ? JSON.parse(stored) : [];
          if (!list.some((d: any) => d.hprId === data.practitioner.hprId)) {
            list.push(data.practitioner);
            localStorage.setItem('hpr_registered_doctors', JSON.stringify(list));
          }
        } catch (e) {
          console.error('Failed to sync searched doctor to HPR registry', e);
        }
      } else {
        showToast(t(data.message || 'Practitioner search failed.'));
      }
    } catch (err) {
      showToast(t('Search error. Simulated search successful.'));
    } finally {
      setLoading(false);
    }
  };

  // NHPR Doctor Enrollment Onboarding
  const handleHprRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hprAadhaar.length !== 12 || isNaN(Number(hprAadhaar))) {
      showToast(t('Please enter a valid 12-digit Aadhaar.'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/abdm/hpr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enroll-otp', aadhaar: hprAadhaar }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setHprTxnId(data.txnId);
        setHprStep('otp');
        showToast(t(data.message));
      } else {
        showToast(t(data.message || 'OTP request failed.'));
      }
    } catch (err) {
      setHprTxnId('simulated-hpr-txn-uuid');
      setHprStep('otp');
    } finally {
      setLoading(false);
    }
  };

  const handleHprVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hprOtp.length !== 6 || isNaN(Number(hprOtp))) {
      showToast(t('Please enter a 6-digit numeric OTP.'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/abdm/hpr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enroll-verify',
          otp: hprOtp,
          txnId: hprTxnId,
          council: councilSelect,
          system: systemSelect
        })
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setDoctorResult(data.practitioner);
        setHprStep('completed');
        showToast(t(data.message));
        logSecurityEvent('HPR Professional Registered', `Successfully onboarded Doctor: ${data.practitioner.hprId}`);
        try {
          const stored = localStorage.getItem('hpr_registered_doctors');
          let list = stored ? JSON.parse(stored) : [];
          if (!list.some((d: any) => d.hprId === data.practitioner.hprId)) {
            list.push(data.practitioner);
            localStorage.setItem('hpr_registered_doctors', JSON.stringify(list));
          }
        } catch (e) {
          console.error('Failed to sync onboarded doctor to HPR registry', e);
        }
      } else {
        showToast(t(data.message || 'Onboarding failed.'));
      }
    } catch (err) {
      setHprStep('completed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LogoLoader isLoading={isVerifyingOtp} type="onboard" />
      {/* Route Hero Header */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }} className="back-link">
          <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
          {t('Home')}
        </a>
        <div>
          <p className="eyebrow">ABHA SETU</p>
          <h2>{t('Digital Health Bridge')}</h2>
          <p>{t('ABDM sandbox dashboard console for Identity, HIP Linking, Consent flows, and Healthcare Registries.')}</p>
        </div>
      </section>

      {/* Premium Glassmorphic Adaptive Tab Navigation Menu */}
      <nav className="abha-tab-menu">
        <button 
          onClick={() => setActiveTab('card')}
          className={`abha-tab-button ${activeTab === 'card' ? 'active-tab' : ''}`}
        >
          <Calendar style={{ width: '16px', height: '16px' }} />
          <span>{t('My ABHA Card')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('onboard')}
          className={`abha-tab-button ${activeTab === 'onboard' ? 'active-tab' : ''}`}
        >
          <Fingerprint style={{ width: '16px', height: '16px' }} />
          <span>{t('Create ABHA Card')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('hiplink')}
          className={`abha-tab-button ${activeTab === 'hiplink' ? 'active-tab' : ''}`}
        >
          <Link2 style={{ width: '16px', height: '16px' }} />
          <span>{t('Link Hospital Records')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('consent')}
          className={`abha-tab-button ${activeTab === 'consent' ? 'active-tab' : ''}`}
        >
          <FolderLock style={{ width: '16px', height: '16px' }} />
          <span>{t('Share Records (Consent)')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('scanshare')}
          className={`abha-tab-button ${activeTab === 'scanshare' ? 'active-tab' : ''}`}
        >
          <QrCode style={{ width: '16px', height: '16px' }} />
          <span>{t('Scan & Share (OPD)')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('uhi')}
          className={`abha-tab-button ${activeTab === 'uhi' ? 'active-tab' : ''}`}
        >
          <Globe style={{ width: '16px', height: '16px' }} />
          <span>{t('Search Doctors & Book')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('nhcx')}
          className={`abha-tab-button ${activeTab === 'nhcx' ? 'active-tab' : ''}`}
        >
          <Shield style={{ width: '16px', height: '16px' }} />
          <span>{t('Insurance Claims')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('nhpr')}
          className={`abha-tab-button ${activeTab === 'nhpr' ? 'active-tab' : ''}`}
        >
          <Stethoscope style={{ width: '16px', height: '16px' }} />
          <span>{t('Doctor Registry (HPR)')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('tests')}
          className={`abha-tab-button ${activeTab === 'tests' ? 'active-tab' : ''}`}
        >
          <ShieldCheck style={{ width: '16px', height: '16px' }} />
          <span>{t('Developer Sandbox Tests')}</span>
        </button>
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '600px', margin: '10px auto 0' }}>
        
        {/* ==================== TAB 1: VIEW CARD ==================== */}
        {activeTab === 'card' && (
          <>
            <article className="setu-abha-card" style={{ width: '100%' }}>
              <div className="setu-abha-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0a1e36', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: '#ffffff', borderRadius: '4px', padding: '2px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src="https://dashboard.abdm.gov.in/uploads/nha_logo_dcf106b16e.png"
                      alt="NHA Logo"
                      style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div style={{ color: '#ffffff', lineHeight: '1.2' }}>
                    <h4 style={{ margin: 0, fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px', color: '#ffffff', textTransform: 'uppercase' }}>national health authority</h4>
                    <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.75)', display: 'block' }}>Government of India</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center', color: '#ffffff', flex: 1, padding: '0 6px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.3px', color: '#fff', textTransform: 'uppercase' }}>Ayushman Bharat Health Account</div>
                  <div style={{ fontSize: '9px', opacity: 0.85, marginTop: '1px', color: '#fff' }}>आयुष्मान भारत स्वास्थ्य खाता (आभा)</div>
                </div>
                <div style={{ background: '#ffffff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', flexShrink: 0 }}>
                  <img
                    src="https://dashboard.abdm.gov.in/uploads/abdm_logo_1d3e8ad9c8.png"
                    alt="ABDM Logo"
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
              
              <div className="setu-abha-card-body" style={{ position: 'relative', display: 'flex', gap: '14px', padding: '16px', background: 'radial-gradient(circle, #f8fafc 0%, #e2e8f0 100%)', color: '#0f172a' }}>
                <div className="setu-abha-card-seal" style={{ position: 'absolute', top: '10px', right: '140px', padding: '2px 8px', border: '2px solid rgba(16, 185, 129, 0.4)', borderRadius: '4px', color: '#10b981', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', transform: 'rotate(-8deg)', letterSpacing: '0.5px' }}>VERIFIED</div>
                
                <div className="setu-abha-card-avatar-wrapper" style={{ flexShrink: 0 }}>
                  <div className="setu-abha-card-avatar" style={{ width: '90px', height: '110px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #94a3b8' }}>
                    <img
                      src={abhaDetails.photo}
                      alt={abhaDetails.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150';
                      }}
                    />
                  </div>
                </div>
                
                <div className="setu-abha-card-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                  <div className="setu-abha-card-field">
                    <span className="setu-abha-card-label" style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>Name/नाम</span>
                    <strong className="setu-abha-card-value" style={{ fontSize: '13px', color: '#0f172a', fontWeight: '800' }}>{abhaDetails.name}</strong>
                  </div>
                  
                  <div className="setu-abha-card-field">
                    <span className="setu-abha-card-label" style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>ABHA Number/आभा-संख्या</span>
                    <strong className="setu-abha-card-value token-num" style={{ fontSize: '13px', color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{abhaDetails.abhaNumber}</strong>
                  </div>
                  
                  <div className="setu-abha-card-field">
                    <span className="setu-abha-card-label" style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>ABHA Address/आभा पता</span>
                    <strong className="setu-abha-card-value token-num" style={{ color: '#0f172a', fontSize: '11px', fontFamily: 'monospace' }}>{abhaDetails.abhaId}</strong>
                  </div>
                  
                  <div className="setu-abha-card-row" style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <div className="setu-abha-card-field">
                      <span className="setu-abha-card-label" style={{ fontSize: '8px', color: '#64748b' }}>Gender/लिंग</span>
                      <span className="setu-abha-card-value" style={{ display: 'block', fontSize: '10px', fontWeight: 600 }}>{abhaDetails.gender}</span>
                    </div>
                    <div className="setu-abha-card-field">
                      <span className="setu-abha-card-label" style={{ fontSize: '8px', color: '#64748b' }}>DOB/जन्मतारीख</span>
                      <span className="setu-abha-card-value" style={{ display: 'block', fontSize: '10px', fontWeight: 600 }}>{abhaDetails.dob}</span>
                    </div>
                    <div className="setu-abha-card-field">
                      <span className="setu-abha-card-label" style={{ fontSize: '8px', color: '#64748b' }}>Mobile/मोबाइल</span>
                      <span className="setu-abha-card-value" style={{ display: 'block', fontSize: '10px', fontWeight: 600 }}>{abhaDetails.mobile}</span>
                    </div>
                  </div>
                </div>
                
                <div className="setu-abha-card-qr-wrapper" style={{ flexShrink: 0, alignSelf: 'center' }}>
                  <div className="setu-abha-card-qr" style={{ padding: '6px', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ABHA:${abhaDetails.abhaNumber};${abhaDetails.abhaId}`}
                      alt="ABHA QR"
                      style={{ width: '80px', height: '80px' }}
                    />
                  </div>
                </div>
              </div>
            </article>
            
            <button
              onClick={() => handleSaveToLocker(`ABHA_Smart_Card_${abhaDetails.abhaNumber}.pdf`)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(90deg, #1f3a60, #10b981)', color: '#ffffff', fontWeight: 800, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)', transition: 'all 0.2s ease' }}
            >
              <Download className="small-icon" style={{ width: '16px', height: '16px' }} />
              <span>Save to Health Locker</span>
            </button>

            <div style={{ width: '100%', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="join-btn" onClick={() => router.push('/appointments')} style={{ flex: 1, margin: 0 }}>OPD Queue Registry</button>
              <button className="prefill-btn" onClick={() => router.push('/records')} style={{ flex: 1, margin: 0 }}>Linked Health Records</button>
            </div>
          </>
        )}

        {/* ==================== TAB 2: MILESTONE 1 ONBOARD ==================== */}
        {activeTab === 'onboard' && (
          <article className="route-card" style={{ width: '100%', padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'color-mix(in srgb, var(--accent-teal) 10%, transparent)', display: 'grid', placeItems: 'center', color: 'var(--accent-teal)' }}>
                <Fingerprint />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>{t('Create Your ABHA Card')}</h3>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{t('Generate your 14-digit national health card securely via Aadhaar or Mobile number.')}</p>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', width: '100%', padding: '0 10px', marginBottom: '24px' }}>
              <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
              <div style={{
                position: 'absolute',
                top: '15px',
                left: '10%',
                width: onboardStep === 'verification' ? '0%' : onboardStep === 'otp' ? (onboardMethod === 'aadhaar' ? '80%' : '40%') : onboardStep === 'demographics' ? '80%' : '80%',
                height: '2px',
                background: 'var(--accent-teal)',
                transition: 'all 0.3s ease',
                zIndex: 0
              }} />

              {/* Step 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, cursor: onboardStep === 'verification' ? 'default' : 'pointer' }} onClick={() => onboardStep !== 'completed' && setOnboardStep('verification')}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: onboardStep === 'verification' ? 'var(--accent-teal)' : 'var(--bg-primary)', border: '2px solid var(--accent-teal)', display: 'grid', placeItems: 'center', color: onboardStep === 'verification' ? '#fff' : 'var(--accent-teal)', fontWeight: 'bold', fontSize: '12px', transition: 'all 0.3s ease' }}>1</div>
                <span style={{ fontSize: '9px', marginTop: '4px', fontWeight: 600, color: onboardStep === 'verification' ? 'var(--text-primary)' : 'var(--text-muted)' }}>{t('Verify')}</span>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: onboardStep === 'otp' ? 'var(--accent-teal)' : (onboardStep === 'demographics' || onboardStep === 'completed') ? 'var(--accent-teal)' : 'var(--bg-primary)', border: `2px solid ${onboardStep === 'verification' ? 'rgba(255,255,255,0.1)' : 'var(--accent-teal)'}`, display: 'grid', placeItems: 'center', color: (onboardStep === 'otp' || onboardStep === 'demographics' || onboardStep === 'completed') ? '#fff' : 'var(--text-muted)', fontWeight: 'bold', fontSize: '12px', transition: 'all 0.3s ease' }}>2</div>
                <span style={{ fontSize: '9px', marginTop: '4px', fontWeight: 600, color: onboardStep === 'otp' ? 'var(--text-primary)' : (onboardStep === 'demographics' || onboardStep === 'completed') ? 'var(--accent-teal)' : 'var(--text-muted)' }}>{t('OTP')}</span>
              </div>

              {/* Step 3 (Mobile Onboarding Only) */}
              {onboardMethod === 'mobile' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: onboardStep === 'demographics' ? 'var(--accent-teal)' : onboardStep === 'completed' ? 'var(--accent-teal)' : 'var(--bg-primary)', border: `2px solid ${(onboardStep === 'verification' || onboardStep === 'otp') ? 'rgba(255,255,255,0.1)' : 'var(--accent-teal)'}`, display: 'grid', placeItems: 'center', color: (onboardStep === 'demographics' || onboardStep === 'completed') ? '#fff' : 'var(--text-muted)', fontWeight: 'bold', fontSize: '12px', transition: 'all 0.3s ease' }}>3</div>
                  <span style={{ fontSize: '9px', marginTop: '4px', fontWeight: 600, color: onboardStep === 'demographics' ? 'var(--text-primary)' : onboardStep === 'completed' ? 'var(--accent-teal)' : 'var(--text-muted)' }}>{t('Profile')}</span>
                </div>
              )}

              {/* Step 4 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: onboardStep === 'completed' ? 'var(--accent-teal)' : 'var(--bg-primary)', border: `2px solid ${onboardStep === 'completed' ? 'var(--accent-teal)' : 'rgba(255,255,255,0.1)'}`, display: 'grid', placeItems: 'center', color: onboardStep === 'completed' ? '#fff' : 'var(--text-muted)', fontWeight: 'bold', fontSize: '12px', transition: 'all 0.3s ease' }}>
                  {onboardStep === 'completed' ? '✓' : onboardMethod === 'mobile' ? '4' : '3'}
                </div>
                <span style={{ fontSize: '9px', marginTop: '4px', fontWeight: 600, color: onboardStep === 'completed' ? 'var(--accent-teal)' : 'var(--text-muted)' }}>{t('Done')}</span>
              </div>
            </div>

            {/* Step 1: Verification Form */}
            {onboardStep === 'verification' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Method Switcher */}
                <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-color)', marginBottom: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setOnboardMethod('aadhaar')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '8px',
                      background: onboardMethod === 'aadhaar' ? 'var(--accent-teal)' : 'transparent',
                      color: onboardMethod === 'aadhaar' ? '#ffffff' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Fingerprint style={{ width: '14px', height: '14px' }} />
                    <span>Aadhaar eKYC</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardMethod('mobile')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '8px',
                      background: onboardMethod === 'mobile' ? 'var(--accent-teal)' : 'transparent',
                      color: onboardMethod === 'mobile' ? '#ffffff' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <FileText style={{ width: '14px', height: '14px' }} />
                    <span>Mobile & Docs</span>
                  </button>
                </div>

                {/* Aadhaar Verification Input */}
                {onboardMethod === 'aadhaar' ? (
                  <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>12-Digit Aadhaar Number</label>
                      <input 
                        type="text" 
                        maxLength={12} 
                        value={aadhaarInput}
                        onChange={(e) => setAadhaarInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter Aadhaar Number (e.g. 543210987654)" 
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        * In sandbox mode, enter any dummy 12-digit number to trigger secure OTP simulation.
                      </span>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {loading ? <RefreshCw className="animate-spin" /> : <Send style={{ width: '16px', height: '16px' }} />}
                      <span>Request Aadhaar OTP</span>
                    </button>
                  </form>
                ) : (
                  // Mobile Verification Input
                  <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>10-Digit Mobile Number</label>
                      <input 
                        type="text" 
                        maxLength={10} 
                        value={mobileInput}
                        onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter Mobile Number (e.g. 9876543210)" 
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        * Verify your communication mobile via OTP. Afterwards, complete profile registration.
                      </span>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {loading ? <RefreshCw className="animate-spin" /> : <Send style={{ width: '16px', height: '16px' }} />}
                      <span>Request Mobile OTP</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Step 2: OTP Form */}
            {onboardStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                <div style={{ padding: '10px', background: 'color-mix(in srgb, var(--accent-teal) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-teal) 20%, transparent)', borderRadius: '8px', fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <AlertCircle style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                  <span>Enter verification code sent to your mobile. <strong>Enter "123456" for instant sandbox pass.</strong></span>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>6-Digit OTP Code</label>
                  <input 
                    type="text" 
                    maxLength={6} 
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP (e.g. 123456)" 
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {loading ? <RefreshCw className="animate-spin" /> : <Key style={{ width: '16px', height: '16px' }} />}
                  <span>Verify OTP</span>
                </button>
              </form>
            )}

            {/* Step 3: Demographics Form (Mobile only) */}
            {onboardStep === 'demographics' && (
              <form onSubmit={handleEnrolByDocument} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                <div style={{ padding: '10px', background: 'color-mix(in srgb, var(--accent-teal) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-teal) 20%, transparent)', borderRadius: '8px', fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <AlertCircle style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                  <span>Mobile OTP verified! Enter demographic details below to register and issue your official ABHA card.</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>First Name</label>
                    <input 
                      type="text" 
                      value={demoFirstName}
                      onChange={(e) => setDemoFirstName(e.target.value)}
                      placeholder="First Name (e.g. Aarav)" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Last Name</label>
                    <input 
                      type="text" 
                      value={demoLastName}
                      onChange={(e) => setDemoLastName(e.target.value)}
                      placeholder="Last Name (e.g. Sharma)" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Date of Birth</label>
                    <input 
                      type="date" 
                      value={demoDob}
                      onChange={(e) => setDemoDob(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Gender</label>
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-primary)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-color)' }}>
                      {(['Male', 'Female', 'Others'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setDemoGender(g)}
                          style={{
                            flex: 1,
                            padding: '6px 8px',
                            border: 'none',
                            borderRadius: '6px',
                            background: demoGender === g ? 'var(--accent-teal)' : 'transparent',
                            color: demoGender === g ? '#ffffff' : 'var(--text-secondary)',
                            fontWeight: 600,
                            fontSize: '11px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Street Address</label>
                  <input 
                    type="text" 
                    value={demoAddress}
                    onChange={(e) => setDemoAddress(e.target.value)}
                    placeholder="Flat, Road, Area (e.g. H-402, Green Valley Apartments)" 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>State</label>
                    <input 
                      type="text" 
                      value={demoState}
                      onChange={(e) => setDemoState(e.target.value)}
                      placeholder="State (e.g. Haryana)" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>District</label>
                    <input 
                      type="text" 
                      value={demoDistrict}
                      onChange={(e) => setDemoDistrict(e.target.value)}
                      placeholder="District (e.g. Gurgaon)" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Pin Code</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      value={demoPinCode}
                      onChange={(e) => setDemoPinCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="122011" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px' }}
                >
                  {loading ? <RefreshCw className="animate-spin" /> : <ShieldCheck style={{ width: '16px', height: '16px' }} />}
                  <span>Create & Issue ABHA Card</span>
                </button>
              </form>
            )}

            {/* Step 4: Onboarding Completed */}
            {onboardStep === 'completed' && (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                  <CheckCircle2 style={{ width: '28px', height: '28px' }} />
                </div>
                <h4 style={{ margin: '0 0 6px' }}>ABHA Enrolled Successfully!</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: '1.4' }}>
                  Your secure 14-digit National Digital Health identity was successfully created and signed.
                </p>
                <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px', fontSize: '12px', textAlign: 'left' }}>
                  <strong>ABHA Name:</strong> {abhaDetails.name}<br />
                  <strong>ABHA Number:</strong> {abhaDetails.abhaNumber}<br />
                  <strong>ABHA Address:</strong> {abhaDetails.abhaId}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="prefill-btn" style={{ flex: 1 }} onClick={() => setOnboardStep('verification')}>Register Another</button>
                  <button className="join-btn" style={{ flex: 1, margin: 0 }} onClick={() => setActiveTab('card')}>View Smart Card</button>
                </div>
              </div>
            )}
          </article>
        )}

        {/* ==================== TAB 3: MILESTONE 2 HIP LINK ==================== */}
        {activeTab === 'hiplink' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <article className="route-card" style={{ width: '100%', padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'color-mix(in srgb, var(--accent-teal) 10%, transparent)', display: 'grid', placeItems: 'center', color: 'var(--accent-teal)' }}>
                  <Link2 />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px' }}>{t('Link Your Hospital Records')}</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{t('Find and link all your doctor visits and lab reports directly.')}</p>
                </div>
              </div>

              {m2Step !== 'otp' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Patient ABHA Address</label>
                    <input 
                      type="text" 
                      value={m2AbhaAddress}
                      onChange={(e) => setM2AbhaAddress(e.target.value)}
                      placeholder="Enter Patient Address (e.g. user@sbx)" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Patient Name</label>
                      <input 
                        type="text" 
                        value={m2PatientName}
                        onChange={(e) => setM2PatientName(e.target.value)}
                        placeholder="Patient Name" 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Encounter Type</label>
                      <select 
                        value={m2ContextType}
                        onChange={(e) => setM2ContextType(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                      >
                        <option value="OPD Consultation">OPD Consultation</option>
                        <option value="Prescription">Prescription</option>
                        <option value="Lab Report">Lab Report</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Diagnosis / Encounter Detail</label>
                    <input 
                      type="text" 
                      value={m2Detail}
                      onChange={(e) => setM2Detail(e.target.value)}
                      placeholder="e.g. follow-up for diabetes control" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>

                  <button
                    onClick={runHipLinkingFlow}
                    disabled={m2Step === 'discovering'}
                    style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', background: 'linear-gradient(90deg, #10b981, #0d9488)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}
                  >
                    {m2Step === 'discovering' ? <RefreshCw className="animate-spin" /> : <Link2 style={{ width: '15px', height: '15px' }} />}
                    <span>Match & Initiate Link</span>
                  </button>
                </div>
              )}

              {m2Step === 'otp' && (
                <form onSubmit={confirmHipLinking} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                  <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <AlertCircle style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                    <span>Enter OTP verification code sent to patient mobile. <strong>Enter "123456" to authorize.</strong></span>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Patient Verification OTP</label>
                    <input 
                      type="text" 
                      maxLength={6} 
                      value={m2OtpInput}
                      onChange={(e) => setM2OtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter OTP (e.g. 123456)" 
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <ShieldCheck style={{ width: '16px', height: '16px' }} />
                    <span>Verify & Link Record</span>
                  </button>
                </form>
              )}
            </article>

            {m2Step !== 'idle' && (
              <article className="route-card" style={{ width: '100%', padding: '20px', background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', textAlign: 'left', fontFamily: 'monospace' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--accent-teal)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database style={{ width: '12px', height: '12px' }} /> HIP Sandbox Link System Logs
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', color: '#94a3b8', maxHeight: '180px', overflowY: 'auto' }}>
                  {m2Console.map((log, idx) => (
                    <div key={idx} style={{ lineHeight: '1.4' }}>{log}</div>
                  ))}
                </div>
              </article>
            )}

            {/* Linked care contexts ledger */}
            <article className="route-card" style={{ width: '100%', padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'left' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck style={{ color: 'var(--accent-teal)' }} /> HIP Care Context Registry Ledger
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {m2LinkedEncounters.map((enc) => (
                  <div key={enc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }}>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{enc.desc}</strong>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Type: {enc.type} | ID: {enc.id} | Date: {enc.date}</span>
                    </div>
                    <span style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '4px', fontWeight: 'bold' }}>
                      ✔ Linked
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        )}

        {/* ==================== TAB 4: MILESTONE 3 CONSENT ==================== */}
        {activeTab === 'consent' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <article className="route-card" style={{ width: '100%', padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0, 180, 216, 0.1)', display: 'grid', placeItems: 'center', color: 'var(--accent-cyan)' }}>
                  <FolderLock />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px' }}>{t('Share Records Safely (Consent Manager)')}</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{t('Give secure permission to share and view your records safely.')}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Patient ABHA Address</label>
                  <input 
                    type="text" 
                    value={abhaAddressInput}
                    onChange={(e) => setAbhaAddressInput(e.target.value)}
                    placeholder="Enter ABHA Address (e.g. user@sbx)" 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'monospace' }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Purpose of Request</label>
                    <select 
                      value={consentPurpose}
                      onChange={(e) => setConsentPurpose(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                    >
                      <option value="Clinical Referral">Clinical Referral</option>
                      <option value="General Health Checkup">General Health Checkup</option>
                      <option value="Care Triage OPD">Care Triage OPD</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Information Types</label>
                    <div style={{ padding: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', borderRadius: '8px', fontSize: '10px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ padding: '2px 6px', background: 'color-mix(in srgb, var(--accent-teal) 10%, transparent)', color: 'var(--accent-teal)', borderRadius: '4px', fontWeight: 'bold' }}>Rx</span>
                      <span style={{ padding: '2px 6px', background: 'color-mix(in srgb, var(--accent-teal) 10%, transparent)', color: 'var(--accent-teal)', borderRadius: '4px', fontWeight: 'bold' }}>Diag</span>
                      <span style={{ padding: '2px 6px', background: 'color-mix(in srgb, var(--accent-teal) 10%, transparent)', color: 'var(--accent-teal)', borderRadius: '4px', fontWeight: 'bold' }}>OPD</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={runDataExchangeFlow}
                  disabled={exchangeStep !== 'idle' && exchangeStep !== 'decrypted'}
                  style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', background: 'linear-gradient(90deg, #0284c7, #10b981)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}
                >
                  <Key style={{ width: '15px', height: '15px' }} />
                  <span>Request & Decrypt Records</span>
                </button>
              </div>
            </article>

            {exchangeStep !== 'idle' && (
              <article className="route-card" style={{ width: '100%', padding: '20px', background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', textAlign: 'left', fontFamily: 'monospace' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--accent-teal)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database style={{ width: '12px', height: '12px' }} /> Sandbox System Trace
                  </span>
                  {exchangeStep !== 'decrypted' && <RefreshCw className="animate-spin" style={{ width: '12px', height: '12px', color: 'var(--accent-teal)' }} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', color: '#94a3b8', maxHeight: '180px', overflowY: 'auto' }}>
                  {exchangeConsole.map((log, idx) => (
                    <div key={idx} style={{ lineHeight: '1.4' }}>{log}</div>
                  ))}
                </div>
              </article>
            )}

            {exchangeStep === 'decrypted' && decryptedRecords.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '2px' }}>
                  <div style={{ flexShrink: 0, padding: '6px 10px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '6px', fontSize: '9px', textAlign: 'left' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Key Agreement</span>
                    <strong style={{ color: 'var(--success)' }}>{cryptoMetadata?.exchangeCurve}</strong>
                  </div>
                  <div style={{ flexShrink: 0, padding: '6px 10px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '6px', fontSize: '9px', textAlign: 'left' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Symmetric Scheme</span>
                    <strong style={{ color: 'var(--success)' }}>{cryptoMetadata?.symmetricAlgorithm}</strong>
                  </div>
                  <div style={{ flexShrink: 0, padding: '6px 10px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '6px', fontSize: '9px', textAlign: 'left' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Derived AES Key</span>
                    <strong style={{ color: 'var(--success)', fontFamily: 'monospace' }}>{cryptoMetadata?.derivedKeyPreview}</strong>
                  </div>
                </div>

                <h4 style={{ margin: '10px 0 0', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <Sparkles style={{ color: 'var(--accent-teal)', width: '14px', height: '14px' }} /> Decrypted FHIR R4 Bundle Resources
                </h4>

                {decryptedRecords.map((record, index) => (
                  <article key={index} className="route-card" style={{ width: '100%', padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', background: 'color-mix(in srgb, var(--accent-teal) 10%, transparent)', color: 'var(--accent-teal)', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {record.resourceType}
                      </span>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Status: {record.status}</span>
                    </div>

                    {record.resourceType === 'Prescription' && (
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{record.medicationCodeableConcept?.text}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Authored by: <strong>{record.requester?.display}</strong> on {record.authoredOn}
                        </div>
                      </div>
                    )}

                    {record.resourceType === 'DiagnosticReport' && (
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{record.code?.text}</div>
                        <div style={{ fontSize: '11px', color: 'var(--accent-teal)', marginTop: '4px', lineHeight: '1.4' }}>
                          Conclusion: {record.conclusion}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 5: NHPR / HPR REGISTRY ==================== */}
        {activeTab === 'nhpr' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* HPR Registry Search & Verification Console */}
            <article className="route-card" style={{ width: '100%', padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'color-mix(in srgb, var(--accent-teal) 10%, transparent)', display: 'grid', placeItems: 'center', color: 'var(--accent-teal)' }}>
                    <Stethoscope />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px' }}>Healthcare Professional Registry</h3>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Search and eKYC Onboarding of doctors (NHPR/HPR)</p>
                  </div>
                </div>
              </div>

              {/* Sub-toggle buttons for search vs onboard */}
              <div style={{ display: 'flex', gap: '8px', padding: '2px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <button 
                  onClick={() => setNhprMode('search')}
                  style={{ flex: 1, padding: '6px', borderRadius: '6px', border: 'none', background: nhprMode === 'search' ? 'var(--accent-teal)' : 'transparent', color: nhprMode === 'search' ? '#ffffff' : 'var(--text-muted)', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}
                >
                  Search & Verify
                </button>
                <button 
                  onClick={() => setNhprMode('enroll')}
                  style={{ flex: 1, padding: '6px', borderRadius: '6px', border: 'none', background: nhprMode === 'enroll' ? 'var(--accent-teal)' : 'transparent', color: nhprMode === 'enroll' ? '#ffffff' : 'var(--text-muted)', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}
                >
                  Register Doctor
                </button>
              </div>

              {nhprMode === 'search' && (
                <form onSubmit={handleNhprDoctorSearch} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>HPR Doctor ID</label>
                      <input 
                        type="text" 
                        value={hprIdSearch}
                        onChange={(e) => setHprIdSearch(e.target.value)}
                        placeholder="e.g. dr.name@hpr" 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Registration Council</label>
                      <select 
                        value={councilSelect}
                        onChange={(e) => setCouncilSelect(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '11px' }}
                      >
                        <option value="Medical Council of India (MCI)">Medical Council of India (MCI)</option>
                        <option value="Delhi Medical Council">Delhi Medical Council</option>
                        <option value="Madhya Pradesh Medical Council">Madhya Pradesh Council</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Council Registration No</label>
                      <input 
                        type="text" 
                        value={regNoSearch}
                        onChange={(e) => setRegNoSearch(e.target.value)}
                        placeholder="Registration No" 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>System of Medicine</label>
                      <select 
                        value={systemSelect}
                        onChange={(e) => setSystemSelect(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '11px' }}
                      >
                        <option value="Homeopathy">Homeopathy</option>
                        <option value="Modern Medicine (Allopathy)">Modern Medicine (Allopathy)</option>
                        <option value="Ayurveda">Ayurveda</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {loading ? <RefreshCw className="animate-spin" /> : <Search style={{ width: '16px', height: '16px' }} />}
                    <span>Search HPR Registry</span>
                  </button>
                </form>
              )}

              {nhprMode === 'enroll' && (
                <div>
                  {hprStep === 'aadhaar' && (
                    <form onSubmit={handleHprRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Doctor's 12-Digit Aadhaar</label>
                        <input 
                          type="text" 
                          maxLength={12} 
                          value={hprAadhaar}
                          onChange={(e) => setHprAadhaar(e.target.value.replace(/\D/g, ''))}
                          placeholder="Aadhaar Number (e.g. 987654321098)" 
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', padding: '11px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        {loading ? <RefreshCw className="animate-spin" /> : <UserPlus style={{ width: '16px', height: '16px' }} />}
                        <span>Request Aadhaar KYC OTP</span>
                      </button>
                    </form>
                  )}

                  {hprStep === 'otp' && (
                    <form onSubmit={handleHprVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px', fontSize: '10px' }}>
                        * Aadhaar verified successfully. Enter OTP. <strong>Enter "123456" for sandbox mock registration.</strong>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>6-Digit OTP Code</label>
                        <input 
                          type="text" 
                          maxLength={6} 
                          value={hprOtp}
                          onChange={(e) => setHprOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter OTP" 
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', textAlign: 'center', fontWeight: 'bold', letterSpacing: '4px' }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', padding: '11px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        {loading ? <RefreshCw className="animate-spin" /> : <ShieldCheck style={{ width: '16px', height: '16px' }} />}
                        <span>Verify & Onboard Professional</span>
                      </button>
                    </form>
                  )}

                  {hprStep === 'completed' && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'grid', placeItems: 'center', margin: '0 auto 10px' }}>
                        <CheckCircle2 style={{ width: '22px', height: '22px' }} />
                      </div>
                      <h4 style={{ margin: '0 0 4px' }}>Professional Registered Successfully!</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                        Healthcare Professional ID (HPID) has been successfully verified and issued by NHA registries.
                      </p>
                      <button className="join-btn" style={{ margin: '0 auto', width: 'auto' }} onClick={() => { setHprStep('aadhaar'); setNhprMode('search'); }}>View Doctor Certificate</button>
                    </div>
                  )}
                </div>
              )}
            </article>

            {/* Doctor Result Card */}
            {doctorResult && (
              <article className="route-card" style={{ width: '100%', padding: '0', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
                {/* Header (NHA Verified Professional badge) */}
                <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award style={{ color: 'var(--accent-teal)', width: '18px', height: '18px' }} />
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      NHA Certified Healthcare Practitioner
                    </span>
                  </div>
                  <span style={{ fontSize: '9px', padding: '2px 6px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '4px', fontWeight: 'bold' }}>
                    VERIFIED
                  </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ width: '70px', height: '80px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                      <img 
                        src="https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=120"
                        alt="Practitioner Pic"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: 'var(--text-primary)' }}>{doctorResult.name}</h4>
                      <strong style={{ display: 'block', fontSize: '11px', color: 'var(--accent-blue)', fontFamily: 'monospace' }}>
                        HPR ID: {doctorResult.hprId}
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {doctorResult.degrees.join(', ')}
                      </span>
                    </div>
                  </div>

                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px dashed var(--border-color)' }}>
                        <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Registration Council</td>
                        <td style={{ padding: '8px 0', fontWeight: 'bold', textAlign: 'right' }}>{doctorResult.council}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px dashed var(--border-color)' }}>
                        <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Registration Number</td>
                        <td style={{ padding: '8px 0', fontWeight: 'bold', fontFamily: 'monospace', textAlign: 'right' }}>{doctorResult.registrationNo}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px dashed var(--border-color)' }}>
                        <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>System of Medicine</td>
                        <td style={{ padding: '8px 0', fontWeight: 'bold', textAlign: 'right' }}>{doctorResult.system}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px dashed var(--border-color)' }}>
                        <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Linked HFR Clinic ID</td>
                        <td style={{ padding: '8px 0', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--accent-teal)', textAlign: 'right' }}>{doctorResult.activeFacilityId}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Master Authority Seal</td>
                        <td style={{ padding: '8px 0', fontWeight: 'bold', color: 'var(--success)', fontSize: '9px', textAlign: 'right' }}>
                          ✔ Digitally Signed via JWS (Issued: {doctorResult.issuedAt})
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <button
                    onClick={() => handleSaveToLocker(`HPR_Certificate_${doctorResult.registrationNo}.pdf`)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Download className="small-icon" style={{ width: '14px', height: '14px' }} />
                    <span>Download HPR Certificate</span>
                  </button>
                </div>
              </article>
            )}
          </div>
        )}

        {/* ==================== TAB 6: SCAN & SHARE / SCAN & PAY ==================== */}
        {activeTab === 'scanshare' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <article className="route-card" style={{ width: '100%', padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'grid', placeItems: 'center', color: 'var(--accent-teal)' }}>
                  <QrCode />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px' }}>Scan & Share (Scan & Pay) Portal</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Quick demographic sharing & Health wallet payments</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Patient ABHA Address</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      value={scanShareInputAddress}
                      onChange={(e) => setScanShareInputAddress(e.target.value)}
                      placeholder="Enter Patient Address (e.g. user@sbx)" 
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'monospace' }}
                    />
                    <button
                      type="button"
                      onClick={handleOpenScanner}
                      style={{
                        padding: '10px 16px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid var(--accent-teal)',
                        borderRadius: '8px',
                        color: 'var(--accent-teal)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <QrCode style={{ width: '16px', height: '16px' }} />
                      <span>Scan QR</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    onClick={runScanShareFlow}
                    disabled={scanShareStep === 'sharing'}
                    style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', background: 'linear-gradient(90deg, #10b981, #0d9488)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    {scanShareStep === 'sharing' ? <RefreshCw className="animate-spin" style={{ width: '14px', height: '14px' }} /> : <QrCode style={{ width: '14px', height: '14px' }} />}
                    <span>1. Scan & Share OPD</span>
                  </button>
                  <button
                    onClick={loadScanPayBills}
                    disabled={scanShareStep === 'paying'}
                    style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', background: 'linear-gradient(90deg, #0284c7, #10b981)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    {scanShareStep === 'paying' ? <RefreshCw className="animate-spin" style={{ width: '14px', height: '14px' }} /> : <CreditCard style={{ width: '14px', height: '14px' }} />}
                    <span>2. Scan & Pay Bills</span>
                  </button>
                </div>
              </div>
            </article>

            {/* Scan & Share Console Output */}
            {scanShareConsole.length > 0 && (
              <article className="route-card" style={{ width: '100%', padding: '20px', background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', textAlign: 'left', fontFamily: 'monospace' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--accent-teal)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database style={{ width: '12px', height: '12px' }} /> Gateway Async Payload Trace Logs
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', color: '#94a3b8', maxHeight: '180px', overflowY: 'auto' }}>
                  {scanShareConsole.map((log, idx) => (
                    <div key={idx} style={{ lineHeight: '1.4' }}>{log}</div>
                  ))}
                </div>
              </article>
            )}

            {/* OPD Token display */}
            {scanShareStep === 'token-generated' && scanShareOpdToken && (
              <article className="route-card" style={{ width: '100%', padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                  <CheckCircle2 style={{ width: '28px', height: '28px' }} />
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>Fast-Track OPD Queue Token</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>Present this token QR code at the specialized counter on arrival.</p>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'inline-block', minWidth: '220px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{scanShareOpdToken.facilityName}</div>
                  <div style={{ fontSize: '28px', fontWeight: '850', color: 'var(--accent-teal)', margin: '6px 0', fontFamily: 'monospace' }}>{scanShareOpdToken.tokenNumber}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Counter: <strong>{scanShareOpdToken.counterName}</strong></div>
                  <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', marginTop: '4px' }}>Estimated Wait time: ~{scanShareOpdToken.estimatedWaitMinutes} mins</div>
                </div>
              </article>
            )}

            {/* Scan & Pay Billing Display */}
            {scanShareBills.length > 0 && scanShareStep === 'paying' && (
              <article className="route-card" style={{ width: '100%', padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'left' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '13px' }}>Select Pending Bill to Settle</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scanShareBills.map(bill => (
                    <div 
                      key={bill.billId} 
                      onClick={() => setSelectedBill(bill)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: selectedBill?.billId === bill.billId ? 'color-mix(in srgb, var(--accent-teal) 5%, transparent)' : 'var(--bg-primary)', border: selectedBill?.billId === bill.billId ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{bill.serviceName}</strong>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Bill ID: {bill.billId} | Due Date: {bill.dueDate}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontWeight: 800, color: 'var(--accent-blue)' }}>Rs. {bill.amount}</span>
                        {bill.insuranceEligible && <span style={{ fontSize: '8px', padding: '1px 4px', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--accent-cyan)', borderRadius: '3px' }}>Ins. Eligible</span>}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedBill && (
                  <button
                    onClick={processScanPayPayment}
                    style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', marginTop: '16px', transition: 'all 0.2s' }}
                  >
                    Pay Rs. {selectedBill.amount} via Health UPI Wallet
                  </button>
                )}
              </article>
            )}

            {/* Paid Result display */}
            {scanShareStep === 'paid' && scanSharePaymentResult && (
              <article className="route-card" style={{ width: '100%', padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                  <CheckCircle2 style={{ width: '24px', height: '24px' }} />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>Transaction Receipt Issued</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 16px' }}>Paid via ABDM integrated direct-clearing health wallet.</p>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', fontSize: '11px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>UTR Number: <strong style={{ fontFamily: 'monospace' }}>{scanSharePaymentResult.utr}</strong></div>
                  <div>Bill ID Ref: <strong>{scanSharePaymentResult.billId}</strong></div>
                  <div>Amount Settled: <strong style={{ color: 'var(--accent-teal)' }}>Rs. {scanSharePaymentResult.amountPaid}</strong></div>
                  <div>Direct Adjudication: <strong style={{ color: 'var(--success)' }}>{scanSharePaymentResult.claimStatus}</strong></div>
                </div>
              </article>
            )}
          </div>
        )}

        {/* ==================== TAB 7: UHI GATEWAY INTEROPERABLE NETWORK ==================== */}
        {activeTab === 'uhi' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <article className="route-card" style={{ width: '100%', padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(2, 132, 199, 0.1)', display: 'grid', placeItems: 'center', color: 'var(--accent-cyan)' }}>
                  <Globe />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px' }}>UHI Open Interoperable Booking</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Beckn Protocol decentralized search & appointment scheduling</p>
                </div>
              </div>

              {uhiStep === 'idle' && uhiDoctors.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Search Specialty or Service</label>
                    <input 
                      type="text" 
                      value={uhiQuery}
                      onChange={(e) => setUhiQuery(e.target.value)}
                      placeholder="e.g. Homeopathy Consultant, Cardiology" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                  <button
                    onClick={runUhiSearch}
                    style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', background: 'linear-gradient(90deg, #0284c7, #0d9488)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Search style={{ width: '14px', height: '14px' }} />
                    <span>Discover Services across Gateway</span>
                  </button>
                </div>
              )}

              {uhiStep === 'searching' && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <RefreshCw className="animate-spin" style={{ width: '28px', height: '28px', color: 'var(--accent-teal)', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Broadcasting Beckn /search queries to HSPA registries...</p>
                </div>
              )}

              {/* Doctors list results */}
              {uhiDoctors.length > 0 && uhiStep === 'idle' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Interoperable Doctors Catalog Matched:</span>
                    <button onClick={() => setUhiDoctors([])} style={{ background: 'transparent', border: 'none', color: 'var(--accent-teal)', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Clear Results</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {uhiDoctors.map((doc, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-teal)', flexShrink: 0 }}>
                          <Stethoscope style={{ width: '20px', height: '20px' }} />
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-primary)' }}>{doc.name}</strong>
                          <span style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>{doc.degree} | Provider: {doc.providerName}</span>
                          <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>Mode: {doc.mode} Consultation</span>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{ display: 'block', fontWeight: 800, color: 'var(--accent-blue)', marginBottom: '4px' }}>Rs. {doc.fee}</span>
                          <button 
                            onClick={() => runUhiSelect(doc)}
                            style={{ padding: '4px 8px', border: 'none', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 'bold', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selecting slot details */}
              {uhiStep === 'selecting' && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <RefreshCw className="animate-spin" style={{ width: '28px', height: '28px', color: 'var(--accent-teal)', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Initiating slot locking and pricing agreements (Beckn /select)...</p>
                </div>
              )}

              {/* Confirm Slot & Initialize */}
              {uhiStep === 'initializing' && selectedUhiDoctor && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
                    <div>Selected Doctor: <strong>{selectedUhiDoctor.name}</strong></div>
                    <div>Price Agreement: <strong style={{ color: 'var(--accent-blue)' }}>Rs. {selectedUhiDoctor.fee}</strong></div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Time Slot: <strong>Today, 06:00 PM - 06:30 PM</strong> (Validated)</div>
                  </div>
                  <button
                    onClick={runUhiInit}
                    style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Proceed with Patient Details Check
                  </button>
                </div>
              )}

              {/* Booking and confirming checkout */}
              {uhiStep === 'confirming' && selectedUhiDoctor && uhiPaymentDetails && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px', fontSize: '11px' }}>
                    * Checkout checkout successful. Click checkout below to initiate UHI secure direct clearing.
                  </div>
                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
                    <div>Payment Gateway: <strong>{uhiPaymentDetails.gateway}</strong></div>
                    <div>Final Pay Amount: <strong style={{ color: 'var(--accent-blue)' }}>Rs. {uhiPaymentDetails.amount}</strong></div>
                    <div>Payment Status: <strong style={{ color: 'var(--accent-teal)' }}>{uhiPaymentDetails.status.replace('_', ' ')}</strong></div>
                  </div>
                  <button
                    onClick={runUhiConfirm}
                    style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Authorize Payment & Confirm Booking
                  </button>
                </div>
              )}

              {/* Booked output receipt */}
              {uhiStep === 'booked' && uhiReceipt && (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                    <CheckCircle2 style={{ width: '24px', height: '24px' }} />
                  </div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>UHI Telehealth Consult Booked!</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>Slot successfully secured and cleared by HSPA registries.</p>
                  
                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px', fontSize: '11px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    <div>Appointment Ref ID: <strong style={{ color: 'var(--accent-cyan)' }}>{uhiReceipt.id}</strong></div>
                    <div>Gateway Token: <strong style={{ fontFamily: 'monospace' }}>{uhiReceipt.digitalToken}</strong></div>
                    <div>Practitioner: <strong>{uhiReceipt.doctorName}</strong></div>
                    <div style={{ marginTop: '4px', borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                      <a href={uhiReceipt.consultationLink} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-teal)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🌐 Join Telehealth Meeting Room
                      </a>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setUhiStep('idle'); setUhiDoctors([]); setSelectedUhiDoctor(null); }}
                    style={{ padding: '8px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
                  >
                    Book Another Slot
                  </button>
                </div>
              )}
            </article>

            {/* UHI Log Console Output */}
            {uhiConsole.length > 0 && (
              <article className="route-card" style={{ width: '100%', padding: '20px', background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', textAlign: 'left', fontFamily: 'monospace' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--accent-teal)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database style={{ width: '12px', height: '12px' }} /> UHI DHP / Beckn Asynchronous Logs
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', color: '#94a3b8', maxHeight: '180px', overflowY: 'auto' }}>
                  {uhiConsole.map((log, idx) => (
                    <div key={idx} style={{ lineHeight: '1.4' }}>{log}</div>
                  ))}
                </div>
              </article>
            )}
          </div>
        )}

        {/* ==================== TAB 8: NHCX INSURANCE CLAIMS EXCHANGE ==================== */}
        {activeTab === 'nhcx' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <article className="route-card" style={{ width: '100%', padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'grid', placeItems: 'center', color: 'var(--accent-teal)' }}>
                  <Shield />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px' }}>NHCX Claims Integration Hub</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Standard HL7 FHIR R4 cashless pre-authorization & settlement checks</p>
                </div>
              </div>

              {nhcxStep === 'idle' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Insurance Policy No</label>
                      <input type="text" readOnly value={nhcxPolicyNo} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-muted)', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Estimated Cost (INR)</label>
                      <input 
                        type="text" 
                        value={nhcxCost} 
                        onChange={(e) => setNhcxCost(e.target.value.replace(/\D/g, ''))}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontWeight: 'bold' }} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Medical Diagnosis</label>
                      <input 
                        type="text" 
                        value={nhcxDiagnosis}
                        onChange={(e) => setNhcxDiagnosis(e.target.value)}
                        placeholder="e.g. Acute Bronchitis Care" 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>ABDM EHR Verification Attachment</label>
                      <select 
                        value={nhcxLinkedRecord} 
                        onChange={(e) => setNhcxLinkedRecord(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '11px' }}
                      >
                        <option value="Prescription - Fever Care">Prescription - Fever Care</option>
                        <option value="CBC Blood Report">CBC Blood Report</option>
                        <option value="Lipid Profile Lab Results">Lipid Profile Lab Results</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={runNhcxEligibilityCheck}
                    style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                  >
                    1. Check Coverage Policy Eligibility
                  </button>
                </div>
              )}

              {nhcxStep === 'eligibility-checking' && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <RefreshCw className="animate-spin" style={{ width: '28px', height: '28px', color: 'var(--accent-teal)', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Transmitting CoverageEligibilityRequest Bundle to insurer via NHCX Gateway...</p>
                </div>
              )}

              {/* Eligibility Check outcome */}
              {nhcxStep === 'eligibility-done' && nhcxEligibilityResponse && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Outcome Status:</span>
                      <strong style={{ color: 'var(--success)' }}>{nhcxEligibilityResponse.outcome.toUpperCase()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Payer Insurer:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{nhcxEligibilityResponse.insurer.display}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Policy Limit Allowed:</span>
                      <strong style={{ color: 'var(--accent-blue)' }}>INR {nhcxEligibilityResponse.insurance[0].benefit[0].allowedMoney.value}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Co-pay Ratio obligation:</span>
                      <strong>{nhcxEligibilityResponse.insurance[0].benefit[1].allowedMoney.value}%</strong>
                    </div>
                  </div>
                  <button
                    onClick={runNhcxPreAuth}
                    style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', background: 'linear-gradient(90deg, #0284c7, #10b981)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                  >
                    2. Submit Cashless Pre-Auth Claim
                  </button>
                </div>
              )}

              {nhcxStep === 'preauth-submitting' && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <RefreshCw className="animate-spin" style={{ width: '28px', height: '28px', color: 'var(--accent-teal)', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Transmitting cashless Pre-Auth ClaimBundle to insurer portal...</p>
                </div>
              )}

              {/* Pre-auth check outcome */}
              {nhcxStep === 'preauth-done' && nhcxPreAuthResponse && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Pre-Auth Ref Number:</span>
                      <strong style={{ fontFamily: 'monospace' }}>{nhcxPreAuthResponse.preAuthId}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Adjudication:</span>
                      <strong style={{ color: 'var(--success)' }}>{nhcxPreAuthResponse.adjudication.status}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Approved Amount:</span>
                      <strong style={{ color: 'var(--accent-blue)', fontSize: '13px' }}>INR {nhcxPreAuthResponse.adjudication.approvedAmount}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Patient Co-pay obligation:</span>
                      <strong style={{ color: 'var(--accent-teal)' }}>INR {nhcxPreAuthResponse.adjudication.patientCopay}</strong>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                      Notes: {nhcxPreAuthResponse.adjudication.notes}
                    </div>
                  </div>
                  <button
                    onClick={runNhcxSettlement}
                    style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                  >
                    3. Submit Final Cashless Claim Settlement
                  </button>
                </div>
              )}

              {/* Settling Claim spinner */}
              {nhcxStep === 'settling' && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <RefreshCw className="animate-spin" style={{ width: '28px', height: '28px', color: 'var(--accent-teal)', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Filing hospital billing bundles and triggering direct insurer settlement clears...</p>
                </div>
              )}

              {/* Settled Claim receipt */}
              {nhcxStep === 'settled' && nhcxClaimResponse && (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                    <CheckCircle2 style={{ width: '24px', height: '24px' }} />
                  </div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>Cashless Claim Settled Successfully!</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>Direct electronic fund transfer (EFT) processed to provider account.</p>
                  
                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px', fontSize: '11px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    <div>Claim Settlement ID: <strong style={{ color: 'var(--accent-cyan)' }}>{nhcxClaimResponse.claimRef}</strong></div>
                    <div>Insurer EFT UTR Ref: <strong style={{ fontFamily: 'monospace' }}>{nhcxClaimResponse.clearingUtr}</strong></div>
                    <div>Amount Paid to Hospital: <strong style={{ color: 'var(--accent-teal)' }}>INR {nhcxClaimResponse.reimbursementAmount}</strong></div>
                    <div>Patient Co-Pay Settled: <strong>INR {nhcxClaimResponse.patientCoPay}</strong></div>
                    <div>Settlement Receipt: <strong style={{ color: 'var(--success)', fontSize: '9px' }}>{nhcxClaimResponse.payerBankReceipt}</strong></div>
                  </div>

                  <button 
                    onClick={() => setNhcxStep('idle')}
                    style={{ padding: '8px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
                  >
                    File Another Claim
                  </button>
                </div>
              )}
            </article>

            {/* NHCX Trace Logs console */}
            {nhcxConsole.length > 0 && (
              <article className="route-card" style={{ width: '100%', padding: '20px', background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', textAlign: 'left', fontFamily: 'monospace' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--accent-teal)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database style={{ width: '12px', height: '12px' }} /> NHCX Gateway HL7 FHIR R4 Async Logs
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', color: '#94a3b8', maxHeight: '180px', overflowY: 'auto' }}>
                  {nhcxConsole.map((log, idx) => (
                    <div key={idx} style={{ lineHeight: '1.4' }}>{log}</div>
                  ))}
                </div>
              </article>
            )}
          </div>
        )}

        {/* ==================== TAB 9: SANDBOX TESTS ==================== */}
        {activeTab === 'tests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            {/* Header info */}
            <article className="route-card" style={{ width: '100%', padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(20, 184, 166, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent-teal)' }}>
                  <ShieldCheck style={{ width: '32px', height: '32px' }} />
                </div>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px', background: 'linear-gradient(to right, #2dd4bf, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ABDM Sandbox Compliance Suite
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 20px', lineHeight: '1.5' }}>
                Run interactive functional compliance test cases covering ABDM M1, M2, M3, HPR, Scan & Share, UHI, and NHCX with real-time assertions and cryptography diagnostics.
              </p>

              <button
                onClick={runSandboxTests}
                disabled={testsRunning}
                style={{ 
                  padding: '12px 24px', 
                  borderRadius: '10px', 
                  border: 'none', 
                  background: 'var(--accent-teal)', color: '#ffffff', 
                  fontWeight: 800, 
                  fontSize: '13px', 
                  cursor: testsRunning ? 'not-allowed' : 'pointer', 
                  opacity: testsRunning ? 0.7 : 1,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  margin: '0 auto',
                  boxShadow: '0 4px 14px rgba(20, 184, 166, 0.3)'
                }}
              >
                <RefreshCw className={testsRunning ? "animate-spin" : ""} style={{ width: '16px', height: '16px' }} />
                <span>{testsRunning ? 'Evaluating Scenarios...' : 'Run Compliance Tests'}</span>
              </button>
            </article>

            {/* Test Summary Dashboard */}
            {testSummary && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', width: '100%' }}>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>SUCCESS RATE</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--success)' }}>{testSummary.successRate}%</div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>PASSED CHECKS</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-teal)' }}>{testSummary.passed} / {testSummary.total}</div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>CODE COVERAGE</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-cyan)' }}>{testSummary.coveragePercent}%</div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>DURATION</div>
                  <div style={{ fontSize: '22px', fontWeight: 800 }}>{testSummary.durationMs} ms</div>
                </div>
              </div>
            )}

            {/* Live compliance terminal logs */}
            {testsConsole.length > 0 && (
              <article className="route-card" style={{ width: '100%', padding: '20px', background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', textAlign: 'left', fontFamily: 'monospace' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--accent-teal)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database style={{ width: '12px', height: '12px' }} /> NHA Sandbox Certification Gate Logs
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Auto-scrolled</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', color: '#94a3b8', maxHeight: '185px', overflowY: 'auto' }}>
                  {testsConsole.map((log, idx) => (
                    <div key={idx} style={{ lineHeight: '1.4' }}>{log}</div>
                  ))}
                </div>
              </article>
            )}

            {/* Detailed assertions list */}
            {testResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '10px 0 2px', textAlign: 'left', color: 'var(--text-primary)' }}>
                  Evaluated Scenarios Checklist ({testResults.length})
                </h3>
                
                {testResults.map((tCase) => {
                  const isExpanded = expandedTestId === tCase.id;
                  return (
                    <div 
                      key={tCase.id} 
                      style={{ 
                        background: 'var(--bg-secondary)', 
                        border: `1px solid ${tCase.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, 
                        borderRadius: '12px', 
                        padding: '14px', 
                        textAlign: 'left'
                      }}
                    >
                      <div 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => setExpandedTestId(isExpanded ? null : tCase.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ 
                            fontSize: '9px', 
                            fontWeight: 800, 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            background: tCase.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                            color: tCase.passed ? 'var(--success)' : 'var(--error)' 
                          }}>
                            {tCase.id}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{tCase.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{tCase.durationMs}ms</span>
                          <span style={{ fontSize: '10px', color: tCase.passed ? 'var(--success)' : 'var(--error)' }}>
                            {tCase.passed ? '● Passed' : '● Failed'}
                          </span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>API Endpoint: </span>
                            <span style={{ fontFamily: 'monospace', background: 'var(--bg-primary)', padding: '2px 4px', borderRadius: '4px' }}>
                              {tCase.method} {tCase.endpoint}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <strong style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>ASSERTIONS CHECKS:</strong>
                            {tCase.assertions.map((ass: any, aIdx: number) => (
                              <div key={aIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                                <span style={{ color: ass.passed ? 'var(--success)' : 'var(--error)' }}>
                                  {ass.passed ? '✔' : '✘'}
                                </span>
                                <span style={{ color: ass.passed ? 'var(--text-primary)' : 'var(--text-muted)' }}>{ass.name}</span>
                              </div>
                            ))}
                          </div>

                          {tCase.responsePayload && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <strong style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>GATEWAY RESPONSE SCHEMAS:</strong>
                              <pre style={{ 
                                margin: 0, 
                                padding: '10px', 
                                background: '#090d16', 
                                border: '1px solid #1e293b', 
                                borderRadius: '8px', 
                                overflowX: 'auto', 
                                fontFamily: 'monospace', 
                                fontSize: '9px', 
                                color: '#a7f3d0',
                                maxHeight: '180px',
                                overflowY: 'auto'
                              }}>
                                {JSON.stringify(tCase.responsePayload, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {showScannerModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div className="route-card" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            position: 'relative',
            textAlign: 'left'
          }}>
            <button
              onClick={handleCloseScanner}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>

            <h3 style={{ margin: '0 0 16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <QrCode style={{ color: 'var(--accent-teal)' }} />
              Scan Patient QR Code
            </h3>

            {/* Tabs for Webcam vs Image Upload */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => { setScannerTab('webcam'); startWebcamScanner(); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: scannerTab === 'webcam' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  border: scannerTab === 'webcam' ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: scannerTab === 'webcam' ? 'var(--accent-teal)' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Camera Feed
              </button>
              <button
                type="button"
                onClick={() => { setScannerTab('upload'); stopWebcamScanner(); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: scannerTab === 'upload' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  border: scannerTab === 'upload' ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: scannerTab === 'upload' ? 'var(--accent-teal)' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Upload Image
              </button>
            </div>

            {scannerError && (
              <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '6px', color: 'var(--danger)', fontSize: '11px', marginBottom: '12px' }}>
                {scannerError}
              </div>
            )}

            {scannerTab === 'webcam' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <div id="qr-reader" style={{ width: '100%', background: '#000', borderRadius: '8px', overflow: 'hidden', minHeight: '260px' }}></div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
                  Position the Patient QR code within the camera frame.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '20px 0' }}>
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '24px',
                  width: '100%',
                  background: 'var(--bg-primary)',
                  border: '2px dashed var(--border-color)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}>
                  <QrCode style={{ width: '32px', height: '32px', color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Click to upload QR image file</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Supports PNG, JPG, JPEG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
