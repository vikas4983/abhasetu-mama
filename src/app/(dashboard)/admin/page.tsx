'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../providers/LanguageProvider';
import { useAuth } from '../../../providers/AuthProvider';
import {
  Settings,
  Activity,
  Database,
  Shield,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertTriangle,
  Play,
  X,
  FileText,
  Sparkles,
  ChevronRight,
  BookOpen,
  LogOut,
  Key,
  User,
  Star,
  CreditCard
} from 'lucide-react';
import { showToast } from '../../../utils/toast';
import OtpInput from '../../../components/common/OtpInput';

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

interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  form: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  image: string;
  description: string;
  salt?: string;
}

interface Policy {
  id: string;
  name: string;
  provider: string;
  monthlyPremium: number;
  csr: string;
  networkHospitals: number;
  coverageAmount: string;
  copay: string;
  features: string[];
}

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

interface LogEntry {
  id: string;
  timestamp: string;
  event: string;
  status: string;
  details: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { currentUser, logout } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<'config' | 'health' | 'products' | 'policies' | 'labPackages' | 'logs' | 'doctors' | 'transactions'>('config');

  // Authorization token
  const [token, setToken] = useState<string>('');

  // ABDM Sandbox Config State
  const [config, setConfig] = useState({
    ABDM_CLIENT_ID: '',
    ABDM_CLIENT_SECRET: '',
    ABDM_GATEWAY_URL: '',
    ABDM_CM_ID: '',
    ABDM_HIU_ID: '',
    ABDM_HIP_ID: '',
    ABDM_PUBLIC_KEY: '',
    ABDM_MODE: 'simulated',
    sandboxMode: true
  });

  // Key Sync State
  const [isSyncingKey, setIsSyncingKey] = useState(false);

  // Live Gateway API Playground State
  const [playgroundLogs, setPlaygroundLogs] = useState<{ timestamp: string; type: 'info' | 'success' | 'error' | 'request' | 'response'; message: string; details?: any }[]>([]);
  const [playgroundAadhaar, setPlaygroundAadhaar] = useState('');
  const [playgroundMobile, setPlaygroundMobile] = useState('');
  const [playgroundOtp, setPlaygroundOtp] = useState('');
  const [playgroundTxnId, setPlaygroundTxnId] = useState('');
  const [playgroundStep, setPlaygroundStep] = useState<'idle' | 'aadhaar-otp-sent' | 'mobile-otp-sent' | 'mobile-verified'>('idle');
  const [isCallingGateway, setIsCallingGateway] = useState(false);
  const [playgroundDemoForm, setPlaygroundDemoForm] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'M',
    address: '',
    state: '',
    district: '',
    pinCode: ''
  });

  const logToPlayground = (type: 'info' | 'success' | 'error' | 'request' | 'response', message: string, details?: any) => {
    setPlaygroundLogs(prev => [
      {
        timestamp: new Date().toLocaleTimeString(),
        type,
        message,
        details
      },
      ...prev
    ]);
  };

  const handleManualGenerateSession = async () => {
    setIsCallingGateway(true);
    logToPlayground('request', 'POST /api/abdm/admin/session/generate', { mode: config.ABDM_MODE });
    try {
      const res = await fetch('/api/abdm/admin/session/generate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        logToPlayground('response', `Session Generated Successfully (${data.mode} mode)`, data);
        showToast(t('Gateway session synced and cached!'));
      } else {
        logToPlayground('error', 'Session Generation Failed', data);
        showToast(data.message || t('Gateway session sync failed.'));
      }
    } catch (err: any) {
      logToPlayground('error', 'Network/Request error during session sync', { message: err.message });
      showToast(t('Error calling gateway session endpoint.'));
    } finally {
      setIsCallingGateway(false);
    }
  };

  const handlePlaygroundAadhaarOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playgroundAadhaar) return;
    setIsCallingGateway(true);
    logToPlayground('request', 'POST /api/abdm/v3/enrollment/request/otp (Aadhaar)', { loginHint: 'aadhaar', loginId: '************' });
    try {
      const res = await fetch('/api/abdm/v3/enrollment/request/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginHint: 'aadhaar', loginId: playgroundAadhaar })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setPlaygroundTxnId(data.txnId);
        setPlaygroundStep('aadhaar-otp-sent');
        logToPlayground('response', 'Aadhaar OTP request succeeded', data);
        showToast(t('Aadhaar OTP sent!'));
      } else {
        logToPlayground('error', 'Aadhaar OTP request failed', data);
        showToast(data.message || t('Failed to request Aadhaar OTP.'));
      }
    } catch (err: any) {
      logToPlayground('error', 'Network error requesting Aadhaar OTP', { message: err.message });
    } finally {
      setIsCallingGateway(false);
    }
  };

  const handlePlaygroundMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playgroundMobile) return;
    setIsCallingGateway(true);
    logToPlayground('request', 'POST /api/abdm/v3/enrollment/request/otp (Mobile)', { loginHint: 'mobile', loginId: '************' });
    try {
      const res = await fetch('/api/abdm/v3/enrollment/request/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginHint: 'mobile', loginId: playgroundMobile })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setPlaygroundTxnId(data.txnId);
        setPlaygroundStep('mobile-otp-sent');
        logToPlayground('response', 'Mobile OTP request succeeded', data);
        showToast(t('Mobile OTP sent!'));
      } else {
        logToPlayground('error', 'Mobile OTP request failed', data);
        showToast(data.message || t('Failed to request Mobile OTP.'));
      }
    } catch (err: any) {
      logToPlayground('error', 'Network error requesting Mobile OTP', { message: err.message });
    } finally {
      setIsCallingGateway(false);
    }
  };

  const handlePlaygroundVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playgroundOtp || !playgroundTxnId) return;
    setIsCallingGateway(true);

    const isAadhaar = playgroundStep === 'aadhaar-otp-sent';
    const url = isAadhaar ? '/api/abdm/v3/enrollment/enrol/byAadhaar' : '/api/abdm/v3/enrollment/auth/byAbdm';
    const payload = {
      txnId: playgroundTxnId,
      scope: isAadhaar ? ['abha-enrol'] : ['abha-enrol', 'mobile-verify'],
      authData: {
        authMethods: ['otp'],
        otp: {
          txnId: playgroundTxnId,
          otpValue: playgroundOtp
        }
      },
      consent: {
        code: 'abha-enrollment',
        version: '1.4'
      }
    };

    logToPlayground('request', `POST ${url}`, { ...payload, authData: { ...payload.authData, otp: { ...payload.authData.otp, otpValue: '******' } } });
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        logToPlayground('response', 'OTP verified successfully!', data);
        showToast(t('OTP verified successfully!'));
        if (isAadhaar) {
          setPlaygroundStep('idle');
          setPlaygroundOtp('');
          setPlaygroundTxnId('');
          setPlaygroundAadhaar('');
        } else {
          setPlaygroundStep('mobile-verified');
          setPlaygroundOtp('');
          // Update transaction context ID from verify step
          if (data.txnId) {
            setPlaygroundTxnId(data.txnId);
          }
        }
      } else {
        logToPlayground('error', 'OTP verification failed', data);
        showToast(data.message || t('OTP verification failed.'));
      }
    } catch (err: any) {
      logToPlayground('error', 'Network error during OTP verification', { message: err.message });
    } finally {
      setIsCallingGateway(false);
    }
  };

  const handlePlaygroundDemoEnrol = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCallingGateway(true);
    
    const payload = {
      txnId: playgroundTxnId,
      scope: ['dl-flow'],
      authData: {
        authMethods: ['dl'],
        document: {
          documentType: 'DRIVING_LICENSE',
          documentId: `DL-${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
          firstName: playgroundDemoForm.firstName,
          lastName: playgroundDemoForm.lastName,
          dob: playgroundDemoForm.dob,
          gender: playgroundDemoForm.gender,
          address: playgroundDemoForm.address,
          state: playgroundDemoForm.state,
          district: playgroundDemoForm.district,
          pinCode: playgroundDemoForm.pinCode,
          mobile: playgroundMobile
        }
      },
      consent: {
        code: 'abha-enrollment',
        version: '1.4'
      }
    };

    logToPlayground('request', 'POST /api/abdm/v3/enrollment/enrol/byDocument', {
      ...payload,
      authData: {
        ...payload.authData,
        document: {
          ...payload.authData.document,
          documentId: '********'
        }
      }
    });

    try {
      const res = await fetch('/api/abdm/v3/enrollment/enrol/byDocument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        logToPlayground('response', 'ABHA Enrolment Completed via Document!', data);
        showToast(t('ABHA successfully generated!'));
        setPlaygroundStep('idle');
        setPlaygroundTxnId('');
        setPlaygroundMobile('');
      } else {
        logToPlayground('error', 'Enrolment by Document failed', data);
        showToast(data.message || t('Enrolment failed.'));
      }
    } catch (err: any) {
      logToPlayground('error', 'Network error during demographic enrolment', { message: err.message });
    } finally {
      setIsCallingGateway(false);
    }
  };


  // Health Test Runner State
  const [testSuiteResults, setTestSuiteResults] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Pharmacy CRUD State
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'prescription',
    brand: '',
    form: 'Tablets',
    price: '',
    originalPrice: '',
    discount: '',
    rating: '4.5',
    image: '',
    description: '',
    salt: ''
  });

  // Policies CRUD State
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [policyForm, setPolicyForm] = useState({
    name: '',
    provider: '',
    monthlyPremium: '',
    csr: '95.0%',
    networkHospitals: '5000',
    coverageAmount: '10 Lakhs',
    copay: 'No Copay',
    features: ''
  });

  // Lab Packages CRUD State
  const [labPackages, setLabPackages] = useState<LabPackage[]>([]);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<LabPackage | null>(null);
  const [labForm, setLabForm] = useState({
    name: '',
    parameters: '10',
    provider: '',
    price: '',
    originalPrice: '',
    discount: '0',
    reportHours: '24',
    sampleType: 'Blood',
    description: '',
    image: ''
  });

  // Doctors CRUD State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    medicalSystem: 'Allopathy',
    speciality: 'General Medicine',
    specialistRole: 'General Physician',
    degree: '',
    experience: '',
    fee: '',
    rating: '4.8',
    description: '',
    photo: '',
    hospitalName: '',
    hfrId: '',
    certificateId: ''
  });

  // Logs state
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsSearch, setLogsSearch] = useState('');
  const [logsStatusFilter, setLogsStatusFilter] = useState('ALL');
  const [logsSortOrder, setLogsSortOrder] = useState('DESC');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Transactions state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsSearch, setTransactionsSearch] = useState('');

  // Authentication shield and loading on mount
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }

    setToken(adminToken);
    loadConfig(adminToken);
    loadProducts();
    loadPolicies();
    loadLabPackages();
    loadDoctors();
    loadLogs(adminToken);
    loadTransactions(adminToken);
  }, [currentUser]);

  const loadConfig = (activeToken: string) => {
    fetch('/api/abdm/admin/config', {
      headers: { 'Authorization': `Bearer ${activeToken}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        if (data.status === 'success') {
          setConfig(data.config);
        }
      })
      .catch(err => {
        console.error('Error loading config:', err);
        router.push('/admin/login');
      });
  };

  const loadProducts = () => {
    fetch('/api/abdm/pharmacy/products')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setProducts(data.products);
        }
      })
      .catch(err => console.error('Error loading products:', err));
  };

  const loadPolicies = () => {
    fetch('/api/abdm/insurance/policies')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setPolicies(data.policies);
        }
      })
      .catch(err => console.error('Error loading policies:', err));
  };

  const loadLabPackages = () => {
    fetch('/api/abdm/lab-tests/packages')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setLabPackages(data.labPackages);
        }
      })
      .catch(err => console.error('Error loading lab packages:', err));
  };

  const loadDoctors = () => {
    fetch('/api/abdm/doctor-consultation/doctors')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setDoctors(data.doctors);
        }
      })
      .catch(err => console.error('Error loading doctors:', err));
  };

  const loadLogs = (activeToken: string) => {
    fetch('/api/abdm/admin/logs', {
      headers: { 'Authorization': `Bearer ${activeToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setLogs(data.logs);
        }
      })
      .catch(err => console.error('Error loading logs:', err));
  };

  const loadTransactions = (activeToken: string) => {
    fetch('/api/abdm/admin/transactions', {
      headers: { 'Authorization': `Bearer ${activeToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setTransactions(data.transactions);
        }
      })
      .catch(err => console.error('Error loading transactions:', err));
  };

  // Config Update
  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/abdm/admin/config', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(t('ABDM credentials updated successfully!'));
        
        // Log config change
        await fetch('/api/abdm/admin/logs', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            event: 'ABDM Credentials Updated',
            status: 'SUCCESS',
            details: `Admin changed Client ID to ${config.ABDM_CLIENT_ID} and updated sandbox configurations.`
          })
        });
        loadLogs(token);
      } else {
        showToast(data.message);
      }
    } catch (err) {
      showToast(t('Failed to update config.'));
    }
  };

  // ABDM Public Key Gateway Synchronization
  const handleSyncPublicKey = async () => {
    setIsSyncingKey(true);
    showToast(t('Querying ABDM certificate...'));
    try {
      const res = await fetch('/api/abdm/admin/fetch-public-key', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(t('ABDM Public Key Synchronized successfully!'));
        loadConfig(token);
        loadLogs(token);
      } else {
        showToast(data.message || t('Public key sync failed. Check gateway credentials.'));
      }
    } catch (err: any) {
      showToast(t('Error syncing public key.'));
    } finally {
      setIsSyncingKey(false);
    }
  };

  // Run ABDM Unit Health Tests
  const runHealthTests = async () => {
    setIsRunningTests(true);
    showToast(t('Running 14 ABDM validation test cases...'));
    try {
      const res = await fetch('/api/abdm/tests');
      const data = await res.json();
      if (data.status === 'success') {
        setTestSuiteResults(data);
        showToast(t('Sandbox health test completed successfully!'));
        
        // Log health check
        await fetch('/api/abdm/admin/logs', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            event: 'System Health Check Run',
            status: data.summary.failed === 0 ? 'SUCCESS' : 'WARNING',
            details: `Admin executed validation suites. Success rate: ${data.summary.successRate}%. Passed: ${data.summary.passed}/${data.summary.total}`
          })
        });
        loadLogs(token);
      } else {
        showToast('Test runner failed.');
      }
    } catch (err) {
      showToast(t('Error executing test suite.'));
    } finally {
      setIsRunningTests(false);
    }
  };

  // Open product form modal for add
  const handleAddProductClick = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'prescription',
      brand: '',
      form: 'Tablets',
      price: '',
      originalPrice: '',
      discount: '0',
      rating: '4.5',
      image: '',
      description: '',
      salt: ''
    });
    setIsProductModalOpen(true);
  };

  // Open product form modal for edit
  const handleEditProductClick = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      brand: prod.brand,
      form: prod.form,
      price: String(prod.price),
      originalPrice: String(prod.originalPrice),
      discount: String(prod.discount),
      rating: String(prod.rating),
      image: prod.image,
      description: prod.description,
      salt: prod.salt || ''
    });
    setIsProductModalOpen(true);
  };

  // Save Product (Create or Update)
  const handleProductFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceNum = Number(productForm.price);
    const origPriceNum = Number(productForm.originalPrice || productForm.price);
    const discountNum = Math.round(((origPriceNum - priceNum) / origPriceNum) * 100);

    const payload = {
      ...productForm,
      price: priceNum,
      originalPrice: origPriceNum,
      discount: discountNum > 0 ? discountNum : 0,
      rating: Number(productForm.rating)
    };

    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const body = editingProduct ? { ...payload, id: editingProduct.id } : payload;
      
      const res = await fetch('/api/abdm/pharmacy/products', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(editingProduct ? t('Medicine updated successfully!') : t('Medicine added to store!'));
        setIsProductModalOpen(false);
        loadProducts();
        
        // Log product edit
        await fetch('/api/abdm/admin/logs', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            event: editingProduct ? 'Product Catalogue Edited' : 'Product Added',
            status: 'SUCCESS',
            details: `${editingProduct ? 'Updated details' : 'Created new item'} for: "${payload.name}"`
          })
        });
        loadLogs(token);
      } else {
        showToast(data.message);
      }
    } catch (err) {
      showToast(t('Error saving medicine details.'));
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(t('Are you sure you want to delete this medicine?'))) return;
    try {
      const res = await fetch(`/api/abdm/pharmacy/products?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(t('Medicine removed from catalog.'));
        loadProducts();

        // Log deletion
        await fetch('/api/abdm/admin/logs', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            event: 'Product Catalogue Deleted',
            status: 'SUCCESS',
            details: `Removed medicine "${name}" (ID: ${id})`
          })
        });
        loadLogs(token);
      } else {
        showToast(data.message);
      }
    } catch (err) {
      showToast(t('Failed to delete product.'));
    }
  };

  // --- POLICIES CRUD HANDLERS ---
  const handleAddPolicyClick = () => {
    setEditingPolicy(null);
    setPolicyForm({
      name: '',
      provider: '',
      monthlyPremium: '',
      csr: '96.0%',
      networkHospitals: '8000',
      coverageAmount: '10 Lakhs',
      copay: 'No Copay',
      features: ''
    });
    setIsPolicyModalOpen(true);
  };

  const handleEditPolicyClick = (pol: Policy) => {
    setEditingPolicy(pol);
    setPolicyForm({
      name: pol.name,
      provider: pol.provider,
      monthlyPremium: String(pol.monthlyPremium),
      csr: pol.csr,
      networkHospitals: String(pol.networkHospitals),
      coverageAmount: pol.coverageAmount,
      copay: pol.copay,
      features: pol.features.join('\n')
    });
    setIsPolicyModalOpen(true);
  };

  const handlePolicyFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: policyForm.name,
      provider: policyForm.provider,
      monthlyPremium: Number(policyForm.monthlyPremium),
      csr: policyForm.csr,
      networkHospitals: Number(policyForm.networkHospitals),
      coverageAmount: policyForm.coverageAmount,
      copay: policyForm.copay,
      features: policyForm.features.split('\n').map(f => f.trim()).filter(Boolean)
    };

    try {
      const method = editingPolicy ? 'PUT' : 'POST';
      const body = editingPolicy ? { ...payload, id: editingPolicy.id } : payload;
      
      const res = await fetch('/api/abdm/insurance/policies', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(editingPolicy ? t('Policy updated successfully!') : t('Policy added to catalog!'));
        setIsPolicyModalOpen(false);
        loadPolicies();
        loadLogs(token);
      } else {
        showToast(data.message);
      }
    } catch (err) {
      showToast(t('Error saving policy details.'));
    }
  };

  const handleDeletePolicy = async (id: string, name: string) => {
    if (!confirm(t('Are you sure you want to delete this policy?'))) return;
    try {
      const res = await fetch(`/api/abdm/insurance/policies?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(t('Policy removed.'));
        loadPolicies();
        loadLogs(token);
      } else {
        showToast(data.message);
      }
    } catch (err) {
      showToast(t('Failed to delete policy.'));
    }
  };

  // --- LAB PACKAGES CRUD HANDLERS ---
  const handleAddLabClick = () => {
    setEditingLab(null);
    setLabForm({
      name: '',
      parameters: '45',
      provider: '',
      price: '',
      originalPrice: '',
      discount: '0',
      reportHours: '24',
      sampleType: 'Blood & Urine',
      description: '',
      image: ''
    });
    setIsLabModalOpen(true);
  };

  const handleEditLabClick = (lab: LabPackage) => {
    setEditingLab(lab);
    setLabForm({
      name: lab.name,
      parameters: String(lab.parameters),
      provider: lab.provider,
      price: String(lab.price),
      originalPrice: String(lab.originalPrice),
      discount: String(lab.discount),
      reportHours: String(lab.reportHours),
      sampleType: lab.sampleType,
      description: lab.description,
      image: lab.image
    });
    setIsLabModalOpen(true);
  };

  const handleLabFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(labForm.price);
    const origPriceNum = Number(labForm.originalPrice || labForm.price);
    const discountNum = Math.round(((origPriceNum - priceNum) / origPriceNum) * 100);

    const payload = {
      name: labForm.name,
      parameters: Number(labForm.parameters),
      provider: labForm.provider,
      price: priceNum,
      originalPrice: origPriceNum,
      discount: discountNum > 0 ? discountNum : 0,
      reportHours: Number(labForm.reportHours),
      sampleType: labForm.sampleType,
      description: labForm.description,
      image: labForm.image || 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=300'
    };

    try {
      const method = editingLab ? 'PUT' : 'POST';
      const body = editingLab ? { ...payload, id: editingLab.id } : payload;
      
      const res = await fetch('/api/abdm/lab-tests/packages', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(editingLab ? t('Lab test package updated!') : t('Lab test package added!'));
        setIsLabModalOpen(false);
        loadLabPackages();
        loadLogs(token);
      } else {
        showToast(data.message);
      }
    } catch (err) {
      showToast(t('Error saving lab package.'));
    }
  };

  const handleDeleteLab = async (id: string, name: string) => {
    if (!confirm(t('Are you sure you want to delete this lab package?'))) return;
    try {
      const res = await fetch(`/api/abdm/lab-tests/packages?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(t('Lab package removed.'));
        loadLabPackages();
        loadLogs(token);
      } else {
        showToast(data.message);
      }
    } catch (err) {
      showToast(t('Failed to delete lab package.'));
    }
  };

  // --- DOCTOR CRUD HANDLERS ---
  const handleAddDoctorClick = () => {
    setEditingDoctor(null);
    setDoctorForm({
      name: '',
      medicalSystem: 'Allopathy',
      speciality: 'General Medicine',
      specialistRole: 'General Physician',
      degree: '',
      experience: '',
      fee: '',
      rating: '4.8',
      description: '',
      photo: '',
      hospitalName: '',
      hfrId: '',
      certificateId: ''
    });
    setIsDoctorModalOpen(true);
  };

  const handleEditDoctorClick = (doc: Doctor) => {
    setEditingDoctor(doc);
    setDoctorForm({
      name: doc.name,
      medicalSystem: doc.medicalSystem,
      speciality: doc.speciality,
      specialistRole: doc.specialistRole,
      degree: doc.degree,
      experience: doc.experience,
      fee: String(doc.fee).replace('Rs ', ''),
      rating: String(doc.rating),
      description: doc.description,
      photo: doc.photo,
      hospitalName: doc.hospitalName,
      hfrId: doc.hfrId,
      certificateId: doc.certificateId
    });
    setIsDoctorModalOpen(true);
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    const feeNum = Number(doctorForm.fee) || 0;
    const payload = {
      ...doctorForm,
      fee: feeNum,
      rating: Number(doctorForm.rating) || 4.8
    };

    try {
      const body = editingDoctor ? { ...payload, id: editingDoctor.id } : payload;
      
      const res = await fetch('/api/abdm/doctor-consultation/doctors', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(editingDoctor ? t('Doctor registry updated!') : t('New doctor registered successfully!'));
        setIsDoctorModalOpen(false);
        loadDoctors();
        
        await fetch('/api/abdm/admin/logs', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            event: editingDoctor ? 'Doctor Registry Edited' : 'Doctor Registered',
            status: 'SUCCESS',
            details: `${editingDoctor ? 'Updated details' : 'Registered new practitioner'} for: "${payload.name}"`
          })
        });
        loadLogs(token);
      } else {
        showToast(data.message);
      }
    } catch (err) {
      showToast(t('Error saving doctor details.'));
    }
  };

  const handleDeleteDoctor = async (id: number, name: string) => {
    if (!confirm(t('Are you sure you want to delete this doctor?'))) return;
    try {
      const res = await fetch(`/api/abdm/doctor-consultation/doctors?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(t('Doctor practitioner deleted from registry.'));
        loadDoctors();

        await fetch('/api/abdm/admin/logs', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            event: 'Doctor Registry Deleted',
            status: 'SUCCESS',
            details: `Removed practitioner "${name}" (ID: ${id})`
          })
        });
        loadLogs(token);
      } else {
        showToast(data.message);
      }
    } catch (err) {
      showToast(t('Error deleting doctor.'));
    }
  };

  const triggerLogout = () => {
    logout();
    showToast(t('Admin session terminated successfully.'));
  };

  return (
    <>
      {/* Route Hero Header */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/settings'); }} className="back-link">
          Settings
        </a>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p className="eyebrow">ABHA SETU ADMINISTRATIVE CONSOLE</p>
            <h2>{t('Admin Control Panel')}</h2>
            <p>{t('Manage ABDM Sandbox configurations, audit security logs, run unit tests, and edit pharmacy catalog products.')}</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Logged in admin badge */}
            {currentUser && (
              <div style={{ fontSize: '11px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '30px', padding: '6px 14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: currentUser.role === 'master_admin' ? '#eb5e28' : 'var(--accent-teal)' }} />
                <span>{currentUser.name} ({currentUser.role === 'master_admin' ? 'Master Admin' : 'Admin'})</span>
              </div>
            )}

            <button 
              onClick={triggerLogout}
              style={{
                background: 'transparent',
                color: 'var(--danger)',
                border: '1.5px solid var(--danger)',
                borderRadius: '30px',
                padding: '8px 16px',
                fontSize: '11px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <LogOut style={{ width: '13px', height: '13px' }} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tabs selectors */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginTop: '20px', scrollbarWidth: 'none' }}>
        {[
          { id: 'config', label: 'ABDM Settings', icon: Settings },
          { id: 'health', label: 'ABDM Health Tests', icon: Activity },
          { id: 'doctors', label: 'Doctors Manager', icon: User },
          { id: 'products', label: 'Products Manager', icon: Database },
          { id: 'policies', label: 'Policies Manager', icon: FileText },
          { id: 'labPackages', label: 'Lab Tests Manager', icon: Activity },
          { id: 'logs', label: 'Security Logs', icon: Shield },
          { id: 'transactions', label: 'Transaction Logs', icon: CreditCard }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`prefill-btn ${isActive ? 'selected-card' : ''}`}
              style={{
                padding: '8px 16px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isActive ? 'color-mix(in srgb, var(--accent-teal) 8%, transparent)' : 'transparent',
                border: isActive ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)',
                borderRadius: '30px',
                cursor: 'pointer'
              }}
            >
              <Icon style={{ width: '13px', height: '13px' }} />
              {t(tab.label)}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: '20px' }}>
        
        {/* ================= CONFIG TAB ================= */}
        {activeTab === 'config' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '680px' }}>
            
            {/* Gateway settings form */}
            <article className="route-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Settings style={{ color: 'var(--accent-teal)' }} />
                <h3 style={{ margin: 0 }}>Gateway Sandbox Credentials</h3>
              </div>
              
              <form onSubmit={handleConfigSubmit} style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    ABDM Client ID
                    <input type="text" value={config.ABDM_CLIENT_ID} onChange={(e) => setConfig({ ...config, ABDM_CLIENT_ID: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    ABDM Client Secret
                    <input type="password" value={config.ABDM_CLIENT_SECRET} onChange={(e) => setConfig({ ...config, ABDM_CLIENT_SECRET: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace' }} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', gridColumn: 'span 2' }}>
                    ABDM Gateway URL
                    <input type="text" value={config.ABDM_GATEWAY_URL} onChange={(e) => setConfig({ ...config, ABDM_GATEWAY_URL: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    ABDM Consent Manager (CM) ID
                    <input type="text" value={config.ABDM_CM_ID} onChange={(e) => setConfig({ ...config, ABDM_CM_ID: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Facility HIU ID
                    <input type="text" value={config.ABDM_HIU_ID} onChange={(e) => setConfig({ ...config, ABDM_HIU_ID: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Facility HIP ID
                    <input type="text" value={config.ABDM_HIP_ID} onChange={(e) => setConfig({ ...config, ABDM_HIP_ID: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </div>



                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--accent-teal)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Save ABDM Configuration
                </button>
              </form>
            </article>

            {/* Public Key Certificate Control */}
            <article className="route-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key style={{ color: 'var(--accent-teal)', width: '20px', height: '20px' }} />
                  <h3 style={{ margin: 0 }}>ABDM Encryption Public Key</h3>
                </div>

                <button
                  onClick={handleSyncPublicKey}
                  disabled={isSyncingKey || !config.ABDM_CLIENT_ID || !config.ABDM_CLIENT_SECRET}
                  style={{
                    padding: '6px 14px',
                    background: isSyncingKey ? 'transparent' : 'var(--accent-cyan)',
                    color: isSyncingKey ? 'var(--text-muted)' : '#000',
                    border: isSyncingKey ? '1px solid var(--border-color)' : 'none',
                    borderRadius: '30px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: isSyncingKey ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isSyncingKey ? 'Syncing...' : 'Sync Key from Gateway'}
                </button>
              </div>

              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 12px' }}>
                Sensitive Aadhaar demographics and validation OTP requests are encrypted using this public key before transmission. Syncing caches the key in our database for 3 months to avoid API threshold rate limits.
              </p>

              <div style={{ background: '#050c14', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold' }}>Active Public Key Certificate (Base64)</span>
                <textarea
                  readOnly
                  value={config.ABDM_PUBLIC_KEY || 'No active key cached. Run "Sync Key from Gateway" to query ABDM sandbox.'}
                  style={{
                    width: '100%',
                    height: '80px',
                    background: 'transparent',
                    border: 'none',
                    color: config.ABDM_PUBLIC_KEY ? 'var(--accent-teal)' : 'var(--text-muted)',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    resize: 'none',
                    outline: 'none',
                    lineHeight: '1.4'
                  }}
                />
              </div>
            </article>

            {/* Live Gateway API Playground */}
            <article className="route-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Play style={{ color: 'var(--accent-teal)', width: '20px', height: '20px' }} />
                  <h3 style={{ margin: 0 }}>Live Gateway API Playground</h3>
                </div>
                <button
                  type="button"
                  onClick={handleManualGenerateSession}
                  disabled={isCallingGateway}
                  className="prefill-btn"
                  style={{
                    padding: '6px 14px',
                    fontSize: '11px',
                    borderColor: 'var(--accent-teal)',
                    color: 'var(--accent-teal)',
                    cursor: 'pointer'
                  }}
                >
                  Generate Session Token
                </button>
              </div>

              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
                Perform manual end-to-end tests of the ABDM Milestone 1 flows. Inspect live request & response JSON payloads directly in the console below.
              </p>

              {/* Playground Forms Grid */}
              <div style={{ display: 'grid', gap: '16px', margin: '0 0 20px' }}>
                {playgroundStep === 'idle' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    
                    {/* Aadhaar OTP Request Form */}
                    <form onSubmit={handlePlaygroundAadhaarOtp} style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>Aadhaar Onboarding Test</span>
                      <label style={{ display: 'grid', gap: '4px', fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                        Aadhaar Number (12 digits)
                        <input
                          type="text"
                          maxLength={12}
                          placeholder="e.g. 123456789012"
                          value={playgroundAadhaar}
                          onChange={(e) => setPlaygroundAadhaar(e.target.value.replace(/\D/g, ''))}
                          style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace' }}
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={isCallingGateway || playgroundAadhaar.length !== 12}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: playgroundAadhaar.length === 12 && !isCallingGateway ? 'var(--accent-teal)' : 'var(--border-color)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: playgroundAadhaar.length === 12 && !isCallingGateway ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Request Aadhaar OTP
                      </button>
                    </form>

                    {/* Mobile OTP Request Form */}
                    <form onSubmit={handlePlaygroundMobileOtp} style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>Mobile Onboarding Test</span>
                      <label style={{ display: 'grid', gap: '4px', fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                        Mobile Number (10 digits)
                        <input
                          type="text"
                          maxLength={10}
                          placeholder="e.g. 9876543210"
                          value={playgroundMobile}
                          onChange={(e) => setPlaygroundMobile(e.target.value.replace(/\D/g, ''))}
                          style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace' }}
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={isCallingGateway || playgroundMobile.length !== 10}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: playgroundMobile.length === 10 && !isCallingGateway ? 'var(--accent-teal)' : 'var(--border-color)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: playgroundMobile.length === 10 && !isCallingGateway ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Request Mobile OTP
                      </button>
                    </form>

                  </div>
                )}

                {/* OTP Verification Form */}
                {(playgroundStep === 'aadhaar-otp-sent' || playgroundStep === 'mobile-otp-sent') && (
                  <form onSubmit={handlePlaygroundVerifyOtp} style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--accent-teal)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-teal)', textTransform: 'uppercase' }}>
                        Verify {playgroundStep === 'aadhaar-otp-sent' ? 'Aadhaar' : 'Mobile'} OTP
                      </span>
                      <button
                        type="button"
                        onClick={() => { setPlaygroundStep('idle'); setPlaygroundOtp(''); setPlaygroundTxnId(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                      Transaction ID: <code style={{ color: 'var(--accent-cyan)' }}>{playgroundTxnId}</code>
                    </p>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                      Enter 6-digit OTP
                      <OtpInput
                        value={playgroundOtp}
                        onChange={setPlaygroundOtp}
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={isCallingGateway || playgroundOtp.length !== 6}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: playgroundOtp.length === 6 && !isCallingGateway ? 'var(--accent-teal)' : 'var(--border-color)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: playgroundOtp.length === 6 && !isCallingGateway ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Verify OTP
                    </button>
                  </form>
                )}

                {/* Demographic Enrolment Form */}
                {playgroundStep === 'mobile-verified' && (
                  <form onSubmit={handlePlaygroundDemoEnrol} style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--accent-cyan)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>Demographics Enrolment</span>
                      <button
                        type="button"
                        onClick={() => { setPlaygroundStep('idle'); setPlaygroundTxnId(''); setPlaygroundMobile(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      <label style={{ display: 'grid', gap: '2px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                        First Name
                        <input type="text" required value={playgroundDemoForm.firstName} onChange={(e) => setPlaygroundDemoForm({ ...playgroundDemoForm, firstName: e.target.value })} style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '11px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                      </label>
                      <label style={{ display: 'grid', gap: '2px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                        Last Name
                        <input type="text" required value={playgroundDemoForm.lastName} onChange={(e) => setPlaygroundDemoForm({ ...playgroundDemoForm, lastName: e.target.value })} style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '11px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      <label style={{ display: 'grid', gap: '2px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                        DOB (DD-MM-YYYY)
                        <input type="text" required placeholder="e.g. 12-04-1994" value={playgroundDemoForm.dob} onChange={(e) => setPlaygroundDemoForm({ ...playgroundDemoForm, dob: e.target.value })} style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '11px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                      </label>
                      <label style={{ display: 'grid', gap: '2px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                        Gender (M / F / O)
                        <select value={playgroundDemoForm.gender} onChange={(e) => setPlaygroundDemoForm({ ...playgroundDemoForm, gender: e.target.value })} style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '11px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      <label style={{ display: 'grid', gap: '2px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                        State
                        <input type="text" value={playgroundDemoForm.state} onChange={(e) => setPlaygroundDemoForm({ ...playgroundDemoForm, state: e.target.value })} style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '11px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                      </label>
                      <label style={{ display: 'grid', gap: '2px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                        District
                        <input type="text" value={playgroundDemoForm.district} onChange={(e) => setPlaygroundDemoForm({ ...playgroundDemoForm, district: e.target.value })} style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '11px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                      </label>
                      <label style={{ display: 'grid', gap: '2px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                        Pincode
                        <input type="text" value={playgroundDemoForm.pinCode} onChange={(e) => setPlaygroundDemoForm({ ...playgroundDemoForm, pinCode: e.target.value })} style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '11px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                      </label>
                    </div>

                    <label style={{ display: 'grid', gap: '2px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                      Address
                      <input type="text" value={playgroundDemoForm.address} onChange={(e) => setPlaygroundDemoForm({ ...playgroundDemoForm, address: e.target.value })} style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '11px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </label>

                    <button
                      type="submit"
                      disabled={isCallingGateway}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: 'var(--accent-teal)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Enrol and Generate ABHA
                    </button>
                  </form>
                )}
              </div>

              {/* Console logs box */}
              <div style={{ background: '#03080e', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Live Console Logger</span>
                  {playgroundLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPlaygroundLogs([])}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '10px', cursor: 'pointer' }}
                    >
                      Clear Logs
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', fontFamily: 'monospace' }}>
                  {playgroundLogs.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                      No activity logs yet. Trigger actions above to start.
                    </div>
                  ) : (
                    playgroundLogs.map((log, index) => (
                      <details key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                        <summary style={{ cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>[{log.timestamp}]</span>
                          <span style={{
                            color: log.type === 'error' ? 'var(--danger)' :
                                   log.type === 'success' ? 'var(--success)' :
                                   log.type === 'request' ? '#ffb703' :
                                   log.type === 'response' ? 'var(--accent-teal)' : 'var(--text-primary)',
                            fontWeight: 'bold',
                            flexShrink: 0
                          }}>
                            {log.type.toUpperCase()}:
                          </span>
                          <span style={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.message}</span>
                        </summary>
                        {log.details && (
                          <pre style={{
                            background: 'rgba(0,0,0,0.5)',
                            padding: '8px',
                            borderRadius: '4px',
                            marginTop: '4px',
                            color: 'var(--text-secondary)',
                            fontSize: '10px',
                            overflowX: 'auto'
                          }}>
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </details>
                    ))
                  )}
                </div>
              </div>
            </article>

          </div>
        )}

        {/* ================= HEALTH TESTS TAB ================= */}
        {activeTab === 'health' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Control Panel */}
            <article className="route-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '15px' }}>Gateway Integration Test Suite</h3>
                <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-secondary)' }}>Run the full suite of M1, M2, M3, HPR, NHCX, and UHI sandbox test cases.</p>
              </div>
              
              <button
                onClick={runHealthTests}
                disabled={isRunningTests}
                style={{
                  background: 'var(--accent-teal)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '10px 24px',
                  fontSize: '11.5px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isRunningTests ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 20px color-mix(in srgb, var(--accent-teal) 20%, transparent)'
                }}
              >
                <Play style={{ width: '12px', height: '12px', fill: 'currentColor' }} />
                {isRunningTests ? 'Running Checks...' : 'Execute Suite'}
              </button>
            </article>

            {/* Test Results Summary Grid */}
            {testSuiteResults && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                
                <div className="route-card" style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Passed / Total</span>
                  <strong style={{ fontSize: '24px', color: 'var(--success)', display: 'block', margin: '4px 0' }}>
                    {testSuiteResults.summary.passed} / {testSuiteResults.summary.total}
                  </strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>All core modules verified</span>
                </div>

                <div className="route-card" style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Success Rate</span>
                  <strong style={{ fontSize: '24px', color: testSuiteResults.summary.successRate === 100 ? 'var(--success)' : 'var(--accent-cyan)', display: 'block', margin: '4px 0' }}>
                    {testSuiteResults.summary.successRate}%
                  </strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Threshold is 100% passed</span>
                </div>

                <div className="route-card" style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Code Coverage</span>
                  <strong style={{ fontSize: '24px', color: 'var(--accent-teal)', display: 'block', margin: '4px 0' }}>
                    {testSuiteResults.summary.coveragePercent}%
                  </strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>FHIR schemas covered</span>
                </div>

              </div>
            )}

            {/* Individual Cases List */}
            {testSuiteResults && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {testSuiteResults.results.map((test: any) => (
                  <details 
                    key={test.id} 
                    className="route-card" 
                    style={{ 
                      border: test.passed ? '1px solid var(--border-color)' : '1px solid var(--danger)',
                      background: 'var(--bg-card)'
                    }}
                  >
                    <summary style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {test.passed ? (
                          <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--success)' }} />
                        ) : (
                          <AlertTriangle style={{ width: '16px', height: '16px', color: 'var(--danger)' }} />
                        )}
                        <span style={{ fontSize: '10px', fontWeight: 'bold', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                          {test.module}
                        </span>
                        <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{test.id}: {test.name}</strong>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{test.durationMs}ms</span>
                    </summary>

                    {/* Test details */}
                    <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
                      <div style={{ fontSize: '11px', display: 'grid', gap: '8px' }}>
                        <div>
                          <strong>Target Endpoint:</strong> <code>{test.method} {test.endpoint}</code>
                        </div>
                        
                        {/* Assertions */}
                        <div>
                          <strong>Assertions:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                            {test.assertions.map((a: any, idx: number) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: a.passed ? 'var(--text-secondary)' : 'var(--danger)' }}>
                                {a.passed ? '✓' : '✗'} <span>{a.name} (Expected: {JSON.stringify(a.expected)} | Got: {JSON.stringify(a.got)})</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payload */}
                        {test.responsePayload && (
                          <div style={{ marginTop: '8px' }}>
                            <strong>Callback Payload Mock:</strong>
                            <pre style={{ background: '#050c14', color: 'var(--accent-teal)', padding: '10px', borderRadius: '6px', overflowX: 'auto', fontSize: '10.5px', marginTop: '4px', border: '1px solid var(--border-color)' }}>
                              {JSON.stringify(test.responsePayload, null, 2)}
                            </pre>
                          </div>
                        )}

                      </div>
                    </div>
                  </details>
                ))}
              </div>
            )}

            {!testSuiteResults && (
              <article className="route-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Activity style={{ width: '36px', height: '36px', margin: '0 auto 10px', opacity: 0.5 }} />
                <p style={{ fontSize: '12.5px' }}>Click "Execute Suite" above to run live sandbox verification checks.</p>
              </article>
            )}

          </div>
        )}

        {/* ================= PHARMACY PRODUCTS TAB ================= */}
        {activeTab === 'products' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <strong style={{ fontSize: '14px' }}>Medicines Catalog ({products.length} Items)</strong>
              
              <button
                onClick={handleAddProductClick}
                style={{
                  background: 'var(--accent-teal)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Plus style={{ width: '13px', height: '13px' }} />
                Add Medicine
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {products.map(prod => (
                <div key={prod.id} className="route-card" style={{ padding: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={prod.image} alt={prod.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ fontSize: '12px', margin: '0 0 2px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name}</h5>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-teal)' }}>₹{prod.price}</span>
                      {prod.discount > 0 && <span style={{ fontSize: '9.5px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{prod.originalPrice}</span>}
                      <span style={{ fontSize: '9px', background: 'var(--bg-secondary)', color: 'var(--text-muted)', padding: '1px 4px', borderRadius: '3px' }}>{prod.category}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={() => handleEditProductClick(prod)}
                      style={{ background: 'none', border: 'none', padding: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      title="Edit"
                    >
                      <Edit style={{ width: '14px', height: '14px' }} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                      style={{ background: 'none', border: 'none', padding: '6px', color: 'var(--danger)', cursor: 'pointer' }}
                      title="Delete"
                    >
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= POLICIES TAB ================= */}
        {activeTab === 'policies' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <strong style={{ fontSize: '14px' }}>Insurance Policies ({policies.length} Items)</strong>
              
              <button
                onClick={handleAddPolicyClick}
                style={{
                  background: 'var(--accent-teal)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Plus style={{ width: '13px', height: '13px' }} />
                Add Policy
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
              {policies.map(pol => (
                <div key={pol.id} className="route-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h5 style={{ fontSize: '13px', margin: 0, fontWeight: 'bold' }}>{pol.name}</h5>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{pol.provider}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        onClick={() => handleEditPolicyClick(pol)}
                        style={{ background: 'none', border: 'none', padding: '4px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      >
                        <Edit style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button 
                        onClick={() => handleDeletePolicy(pol.id, pol.name)}
                        style={{ background: 'none', border: 'none', padding: '4px', color: 'var(--danger)', cursor: 'pointer' }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: 'rgba(0,0,0,0.1)', padding: '8px', borderRadius: '6px', fontSize: '11px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase' }}>Premium</span>
                      <strong>₹{pol.monthlyPremium}/mo</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase' }}>CSR Ratio</span>
                      <strong>{pol.csr}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase' }}>Hospitals</span>
                      <strong>{pol.networkHospitals}</strong>
                    </div>
                  </div>

                  <div style={{ fontSize: '11px' }}>
                    <strong style={{ fontSize: '9.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Key Features:</strong>
                    <ul style={{ paddingLeft: '16px', margin: '4px 0 0', display: 'grid', gap: '2px', color: 'var(--text-secondary)' }}>
                      {pol.features.slice(0, 3).map((f, idx) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= DOCTORS REGISTRY TAB ================= */}
        {activeTab === 'doctors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <strong style={{ fontSize: '14px' }}>{t('Registered Practitioners')} ({doctors.length} {t('Doctors')})</strong>
              
              <button
                onClick={handleAddDoctorClick}
                style={{
                  background: 'var(--accent-teal)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Plus style={{ width: '13px', height: '13px' }} />
                {t('Register Doctor')}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
              {doctors.map(doc => (
                <div key={doc.id} className="route-card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1.5px solid var(--accent-teal)', overflow: 'hidden', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {doc.photo ? (
                      <img src={doc.photo} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User style={{ width: '22px', height: '22px', color: 'var(--text-muted)' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ fontSize: '12.5px', margin: '0 0 2px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</h5>
                    <p style={{ margin: '0 0 4px', fontSize: '10.5px', color: 'var(--accent-teal)', fontWeight: 'bold' }}>{t(doc.specialistRole)} ({t(doc.medicalSystem)})</p>
                    <p style={{ margin: '0 0 6px', fontSize: '10.5px', color: 'var(--text-muted)' }}>{t(doc.hospitalName)}</p>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '10px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{doc.fee}</span>
                      <span style={{ color: 'var(--border-color)' }}>|</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--text-secondary)' }}>
                        <Star style={{ width: '10px', height: '10px', fill: 'var(--accent-teal)', color: 'var(--accent-teal)' }} /> {doc.rating}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button 
                      onClick={() => handleEditDoctorClick(doc)}
                      style={{ background: 'none', border: 'none', padding: '4px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      <Edit style={{ width: '14px', height: '14px' }} />
                    </button>
                    <button 
                      onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                      style={{ background: 'none', border: 'none', padding: '4px', color: 'var(--danger)', cursor: 'pointer' }}
                    >
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= LAB TESTS TAB ================= */}
        {activeTab === 'labPackages' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <strong style={{ fontSize: '14px' }}>Lab Test Packages ({labPackages.length} Items)</strong>
              
              <button
                onClick={handleAddLabClick}
                style={{
                  background: 'var(--accent-teal)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Plus style={{ width: '13px', height: '13px' }} />
                Add Lab Package
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
              {labPackages.map(lab => (
                <div key={lab.id} className="route-card" style={{ padding: '14px', display: 'flex', gap: '12px' }}>
                  <img src={lab.image} alt={lab.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ fontSize: '12px', margin: '0 0 2px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lab.name}</h5>
                    <p style={{ margin: '0 0 6px', fontSize: '10.5px', color: 'var(--text-muted)' }}>{lab.provider}</p>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-teal)' }}>₹{lab.price}</span>
                      {lab.discount > 0 && <span style={{ fontSize: '9.5px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{lab.originalPrice}</span>}
                      <span style={{ fontSize: '9px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '1px 5px', borderRadius: '3px' }}>{lab.parameters} Params</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button 
                        onClick={() => handleEditLabClick(lab)}
                        style={{ background: 'none', border: 'none', padding: '4px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      >
                        <Edit style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button 
                        onClick={() => handleDeleteLab(lab.id, lab.name)}
                        style={{ background: 'none', border: 'none', padding: '4px', color: 'var(--danger)', cursor: 'pointer' }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                    <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>{lab.reportHours} Hrs Report</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= AUDIT LOGS TAB ================= */}
        {activeTab === 'logs' && (() => {
          const filteredLogs = logs
            .filter(log => {
              if (logsSearch) {
                const query = logsSearch.trim().toLowerCase();
                let maskedQuery = query;
                if (/^\d{10}$/.test(query)) {
                  maskedQuery = query.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2');
                } else if (/^\d{12}$/.test(query)) {
                  maskedQuery = query.replace(/(\d{2})\d{8}(\d{2})/, '$1********$2');
                }
                const matchesId = log.id?.toLowerCase().includes(query);
                const matchesEvent = log.event?.toLowerCase().includes(query);
                const matchesDetails = log.details?.toLowerCase().includes(query) || log.details?.toLowerCase().includes(maskedQuery);
                const matchesTimestamp = log.timestamp?.toLowerCase().includes(query);
                return matchesId || matchesEvent || matchesDetails || matchesTimestamp;
              }
              return true;
            })
            .filter(log => {
              if (logsStatusFilter !== 'ALL') {
                return log.status === logsStatusFilter;
              }
              return true;
            })
            .sort((a, b) => {
              const timeA = new Date(a.timestamp).getTime();
              const timeB = new Date(b.timestamp).getTime();
              return logsSortOrder === 'DESC' ? timeB - timeA : timeA - timeB;
            });

          return (
            <article className="route-card" style={{ padding: '20px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield style={{ width: '14px', height: '14px', color: 'var(--accent-teal)' }} />
                    Decrypted Audit Log Trail
                  </span>
                  <button onClick={() => loadLogs(token)} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Refresh Trail
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <input
                    type="text"
                    placeholder="Search by Mobile, Aadhaar, ABHA, event or detail..."
                    value={logsSearch}
                    onChange={(e) => setLogsSearch(e.target.value)}
                    style={{
                      flex: '1 1 250px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      fontSize: '11.5px',
                    }}
                  />
                  <select
                    value={logsStatusFilter}
                    onChange={(e) => setLogsStatusFilter(e.target.value)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="ERROR">ERROR</option>
                    <option value="APPROVED">APPROVED</option>
                  </select>
                  <select
                    value={logsSortOrder}
                    onChange={(e) => setLogsSortOrder(e.target.value)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="DESC">Newest First</option>
                    <option value="ASC">Oldest First</option>
                  </select>
                </div>
              </div>

              {filteredLogs.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No matching logs found.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 8px' }}>Timestamp</th>
                      <th style={{ padding: '10px 8px' }}>Event Name</th>
                      <th style={{ padding: '10px 8px' }}>Status</th>
                      <th style={{ padding: '10px 8px' }}>Details / Metadata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, idx) => {
                      let parsedDetails: any = null;
                      let displayMessage = log.details;
                      try {
                        if (log.details && log.details.startsWith('{') && log.details.endsWith('}')) {
                          parsedDetails = JSON.parse(log.details);
                          displayMessage = parsedDetails.message || displayMessage;
                        }
                      } catch (e) {
                        // ignore
                      }

                      const isExpanded = expandedLogId === log.id;

                      return (
                        <React.Fragment key={log.id || idx}>
                          <tr 
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            style={{ 
                              borderBottom: '1px solid var(--border-color)', 
                              cursor: 'pointer',
                              background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                              transition: 'background-color 0.2s ease'
                            }}
                          >
                            <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                              {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                            <td style={{ padding: '10px 8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{log.event}</td>
                            <td style={{ padding: '10px 8px' }}>
                              <span 
                                style={{ 
                                  fontSize: '9px', 
                                  fontWeight: 'bold', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px',
                                  background: log.status === 'SUCCESS' ? 'rgba(34,197,94,0.15)' : log.status === 'APPROVED' ? 'rgba(0,180,216,0.15)' : 'rgba(239,68,68,0.15)',
                                  color: log.status === 'SUCCESS' ? 'var(--success)' : log.status === 'APPROVED' ? 'var(--accent-cyan)' : 'var(--danger)'
                                }}
                              >
                                {log.status}
                              </span>
                            </td>
                            <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '350px' }}>
                                  {displayMessage}
                                </span>
                                <span style={{ fontSize: '10px', color: 'var(--accent-teal)', fontWeight: 'bold' }}>
                                  {isExpanded ? 'Collapse ▲' : 'Expand Details ▼'}
                                </span>
                              </div>
                            </td>
                          </tr>
                          
                          {isExpanded && (
                            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                              <td colSpan={4} style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '11px' }}>
                                    {parsedDetails?.aadhaar && (
                                      <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>Aadhaar Number</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{parsedDetails.aadhaar}</strong>
                                      </div>
                                    )}
                                    {parsedDetails?.mobile && (
                                      <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>Mobile Number</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{parsedDetails.mobile}</strong>
                                      </div>
                                    )}
                                    {parsedDetails?.abhaId && (
                                      <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>ABHA Address</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{parsedDetails.abhaId}</strong>
                                      </div>
                                    )}
                                    {parsedDetails?.abhaNumber && (
                                      <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>ABHA Number</span>
                                        <strong style={{ color: 'var(--text-primary)' }}>{parsedDetails.abhaNumber}</strong>
                                      </div>
                                    )}
                                    <div>
                                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>Session Mode</span>
                                      <strong style={{ color: 'var(--accent-teal)' }}>LIVE GATEWAY</strong>
                                    </div>
                                    {parsedDetails?.clientId && (
                                       <div>
                                         <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>ABDM Client ID</span>
                                         <strong style={{ color: 'var(--text-primary)' }}>{parsedDetails.clientId}</strong>
                                       </div>
                                     )}
                                     {parsedDetails?.clientIp && (
                                       <div>
                                         <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>Client IP Address</span>
                                         <strong style={{ color: 'var(--text-primary)' }}>{parsedDetails.clientIp}</strong>
                                       </div>
                                     )}
                                     {parsedDetails?.userAgent && (
                                       <div style={{ gridColumn: 'span 2' }}>
                                         <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>Client User-Agent</span>
                                         <strong style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{parsedDetails.userAgent}</strong>
                                       </div>
                                     )}
                                  </div>

                                  {parsedDetails?.request && (
                                    <div style={{ display: 'grid', gap: '4px' }}>
                                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Request Parameters</span>
                                      <pre style={{
                                        margin: 0,
                                        padding: '8px 12px',
                                        background: '#05111b',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '6px',
                                        color: '#06d6a0',
                                        fontFamily: 'monospace',
                                        fontSize: '10px',
                                        overflowX: 'auto',
                                        maxHeight: '120px'
                                      }}>
                                        {JSON.stringify(parsedDetails.request, null, 2)}
                                      </pre>
                                    </div>
                                  )}

                                  {parsedDetails?.response && (
                                    <div style={{ display: 'grid', gap: '4px' }}>
                                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Response / Error payload</span>
                                      <pre style={{
                                        margin: 0,
                                        padding: '8px 12px',
                                        background: '#05111b',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '6px',
                                        color: log.status === 'ERROR' ? '#ef476f' : '#ffd166',
                                        fontFamily: 'monospace',
                                        fontSize: '10px',
                                        overflowX: 'auto',
                                        maxHeight: '180px'
                                      }}>
                                        {JSON.stringify(parsedDetails.response, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </article>
          );
        })()}

        {/* ================= TRANSACTION LOGS TAB ================= */}
        {activeTab === 'transactions' && (() => {
          const filteredTransactions = transactions
            .filter(tRow => {
              if (transactionsSearch) {
                const query = transactionsSearch.trim().toLowerCase();
                return (
                  tRow.id?.toLowerCase().includes(query) ||
                  tRow.doctor_name?.toLowerCase().includes(query) ||
                  tRow.hospital_name?.toLowerCase().includes(query) ||
                  tRow.user_mobile_masked?.toLowerCase().includes(query) ||
                  tRow.user_aadhaar_masked?.toLowerCase().includes(query) ||
                  tRow.user_abha_masked?.toLowerCase().includes(query) ||
                  tRow.appointment_type?.toLowerCase().includes(query)
                );
              }
              return true;
            });

          return (
            <article className="route-card" style={{ padding: '20px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CreditCard style={{ width: '14px', height: '14px', color: 'var(--accent-teal)' }} />
                    Revenue & Transactions Ledger
                  </span>
                  <button onClick={() => loadTransactions(token)} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Refresh Transactions
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <input
                    type="text"
                    placeholder="Search transactions by doctor, hospital, patient, type..."
                    value={transactionsSearch}
                    onChange={(e) => setTransactionsSearch(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      fontSize: '11.5px',
                    }}
                  />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '800px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 8px' }}>Timestamp</th>
                      <th style={{ padding: '10px 8px' }}>Transaction ID</th>
                      <th style={{ padding: '10px 8px' }}>Type</th>
                      <th style={{ padding: '10px 8px' }}>Doctor Name</th>
                      <th style={{ padding: '10px 8px' }}>Hospital Name</th>
                      <th style={{ padding: '10px 8px' }}>Masked Mobile</th>
                      <th style={{ padding: '10px 8px' }}>Masked Aadhaar</th>
                      <th style={{ padding: '10px 8px' }}>Masked ABHA</th>
                      <th style={{ padding: '10px 8px' }}>Consult Fee</th>
                      <th style={{ padding: '10px 8px' }}>Platform Fee</th>
                      <th style={{ padding: '10px 8px' }}>Total Fee</th>
                      <th style={{ padding: '10px 8px' }}>Payment Method</th>
                      <th style={{ padding: '10px 8px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={13} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tRow: any) => (
                        <tr key={tRow.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{new Date(tRow.timestamp).toLocaleString()}</td>
                          <td style={{ padding: '10px 8px', fontFamily: 'monospace' }}>{tRow.id}</td>
                          <td style={{ padding: '10px 8px' }}>{tRow.appointment_type}</td>
                          <td style={{ padding: '10px 8px', fontWeight: 'bold' }}>{tRow.doctor_name}</td>
                          <td style={{ padding: '10px 8px' }}>{tRow.hospital_name}</td>
                          <td style={{ padding: '10px 8px' }}>{tRow.user_mobile_masked}</td>
                          <td style={{ padding: '10px 8px' }}>{tRow.user_aadhaar_masked}</td>
                          <td style={{ padding: '10px 8px' }}>{tRow.user_abha_masked}</td>
                          <td style={{ padding: '10px 8px' }}>Rs. {tRow.fee}</td>
                          <td style={{ padding: '10px 8px' }}>Rs. {tRow.platform_fee}</td>
                          <td style={{ padding: '10px 8px', fontWeight: 'bold', color: 'var(--accent-teal)' }}>Rs. {tRow.total_fee}</td>
                          <td style={{ padding: '10px 8px', textTransform: 'uppercase' }}>{tRow.payment_method}</td>
                          <td style={{ padding: '10px 8px' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              background: tRow.status === 'SUCCESS' ? 'color-mix(in srgb, var(--success) 12%, transparent)' : 'color-mix(in srgb, var(--danger) 12%, transparent)',
                              color: tRow.status === 'SUCCESS' ? 'var(--success)' : 'var(--danger)'
                            }}>
                              {tRow.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          );
        })()}

      </div>

      {/* ==================== PRODUCT CRUD FORM MODAL ================= */}
      {isProductModalOpen && (
        <div className="checkout-modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div className="checkout-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles style={{ width: '15px', height: '15px' }} />
                {editingProduct ? 'Edit Catalog Product' : 'Add Product to Store'}
              </span>
              <button className="modal-close" onClick={() => setIsProductModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <form onSubmit={handleProductFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Medicine Name
                  <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Paracetamol 650mg IP" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Category
                    <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                      <option value="prescription">Prescription Drugs</option>
                      <option value="wellness">Health & Wellness</option>
                      <option value="homeopathy">Homeopathy Dilutions</option>
                      <option value="ayurvedic">Ayurvedic Herbal</option>
                      <option value="personal">Personal & Baby Care</option>
                    </select>
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Dosage Form
                    <select value={productForm.form} onChange={(e) => setProductForm({ ...productForm, form: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                      <option value="Tablets">Tablets</option>
                      <option value="Capsules">Capsules</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Liquid">Liquid</option>
                      <option value="Cream">Cream</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Brand
                    <input type="text" required value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} placeholder="Setu Labs" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Active Salt
                    <input type="text" value={productForm.salt} onChange={(e) => setProductForm({ ...productForm, salt: e.target.value })} placeholder="Paracetamol IP 650mg" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Selling Price (₹)
                    <input type="number" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Original Price (₹)
                    <input type="number" required value={productForm.originalPrice} onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Rating (★)
                    <input type="number" step="0.1" min="1" max="5" required value={productForm.rating} onChange={(e) => setProductForm({ ...productForm, rating: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </div>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Image URL
                  <input type="text" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} placeholder="https://..." style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </label>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Description
                  <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', height: '70px', resize: 'none' }} />
                </label>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 20px', display: 'flex', gap: '10px', background: 'var(--bg-secondary)' }}>
                <button type="button" onClick={() => setIsProductModalOpen(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 2, padding: '10px', background: 'var(--accent-teal)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ==================== POLICY CRUD FORM MODAL ================= */}
      {isPolicyModalOpen && (
        <div className="checkout-modal-overlay" onClick={() => setIsPolicyModalOpen(false)}>
          <div className="checkout-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles style={{ width: '15px', height: '15px' }} />
                {editingPolicy ? 'Edit Insurance Policy' : 'Create Insurance Policy'}
              </span>
              <button className="modal-close" onClick={() => setIsPolicyModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <form onSubmit={handlePolicyFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Policy Name
                  <input type="text" required value={policyForm.name} onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })} placeholder="ReAssure 2.0 Titanium" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </label>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Provider / Insurer Company
                  <input type="text" required value={policyForm.provider} onChange={(e) => setPolicyForm({ ...policyForm, provider: e.target.value })} placeholder="Niva Bupa Health Insurance" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Premium (₹/mo)
                    <input type="number" required value={policyForm.monthlyPremium} onChange={(e) => setPolicyForm({ ...policyForm, monthlyPremium: e.target.value })} placeholder="650" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Settlement (CSR)
                    <input type="text" required value={policyForm.csr} onChange={(e) => setPolicyForm({ ...policyForm, csr: e.target.value })} placeholder="96.0%" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Hospitals
                    <input type="number" required value={policyForm.networkHospitals} onChange={(e) => setPolicyForm({ ...policyForm, networkHospitals: e.target.value })} placeholder="8400" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Max Coverage
                    <input type="text" required value={policyForm.coverageAmount} onChange={(e) => setPolicyForm({ ...policyForm, coverageAmount: e.target.value })} placeholder="10 Lakhs" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Copay Terms
                    <input type="text" required value={policyForm.copay} onChange={(e) => setPolicyForm({ ...policyForm, copay: e.target.value })} placeholder="No Copay" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </div>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Policy Features (One per line)
                  <textarea required value={policyForm.features} onChange={(e) => setPolicyForm({ ...policyForm, features: e.target.value })} placeholder="Unlimited Restore Benefit&#10;Free Health Checkup&#10;No Room Rent Capping" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', height: '100px', resize: 'none' }} />
                </label>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 20px', display: 'flex', gap: '10px', background: 'var(--bg-secondary)' }}>
                <button type="button" onClick={() => setIsPolicyModalOpen(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 2, padding: '10px', background: 'var(--accent-teal)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {editingPolicy ? 'Save Policy Changes' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== LAB TEST CRUD FORM MODAL ================= */}
      {isLabModalOpen && (
        <div className="checkout-modal-overlay" onClick={() => setIsLabModalOpen(false)}>
          <div className="checkout-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles style={{ width: '15px', height: '15px' }} />
                {editingLab ? 'Edit Lab Test Package' : 'Create Lab Test Package'}
              </span>
              <button className="modal-close" onClick={() => setIsLabModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <form onSubmit={handleLabFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Lab Package Name
                  <input type="text" required value={labForm.name} onChange={(e) => setLabForm({ ...labForm, name: e.target.value })} placeholder="Active Full Body Health Checkup" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Parameters Count
                    <input type="number" required value={labForm.parameters} onChange={(e) => setLabForm({ ...labForm, parameters: e.target.value })} placeholder="54" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Sample Type Required
                    <input type="text" required value={labForm.sampleType} onChange={(e) => setLabForm({ ...labForm, sampleType: e.target.value })} placeholder="Blood & Urine" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Lab Provider / Facility
                    <input type="text" required value={labForm.provider} onChange={(e) => setLabForm({ ...labForm, provider: e.target.value })} placeholder="Janki Raman Diagnostic Lab" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Report Turnaround (Hours)
                    <input type="number" required value={labForm.reportHours} onChange={(e) => setLabForm({ ...labForm, reportHours: e.target.value })} placeholder="24" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Price (₹)
                    <input type="number" required value={labForm.price} onChange={(e) => setLabForm({ ...labForm, price: e.target.value })} placeholder="890" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Original Price (₹)
                    <input type="number" required value={labForm.originalPrice} onChange={(e) => setLabForm({ ...labForm, originalPrice: e.target.value })} placeholder="1990" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </div>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Image URL
                  <input type="text" value={labForm.image} onChange={(e) => setLabForm({ ...labForm, image: e.target.value })} placeholder="https://..." style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </label>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Package Description
                  <textarea required value={labForm.description} onChange={(e) => setLabForm({ ...labForm, description: e.target.value })} placeholder="Complete lipid profile, thyroid screening..." style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', height: '70px', resize: 'none' }} />
                </label>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 20px', display: 'flex', gap: '10px', background: 'var(--bg-secondary)' }}>
                <button type="button" onClick={() => setIsLabModalOpen(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 2, padding: '10px', background: 'var(--accent-teal)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {editingLab ? 'Save Changes' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DOCTOR CRUD FORM MODAL ================= */}
      {isDoctorModalOpen && (
        <div className="checkout-modal-overlay" onClick={() => setIsDoctorModalOpen(false)}>
          <div className="checkout-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles style={{ width: '15px', height: '15px' }} />
                {editingDoctor ? t('Edit Doctor Registration') : t('Register New Doctor')}
              </span>
              <button className="modal-close" onClick={() => setIsDoctorModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {t('Doctor Name')}
                    <input type="text" required value={doctorForm.name} onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })} placeholder="Dr. Rajesh Sharma" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {t('Medical System')}
                    <select value={doctorForm.medicalSystem} onChange={(e) => setDoctorForm({ ...doctorForm, medicalSystem: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                      <option value="Allopathy">{t('Allopathy')}</option>
                      <option value="Dental Care">{t('Dental Care')}</option>
                      <option value="Dentist">{t('Dentist')}</option>
                      <option value="Homeopathy">{t('Homeopathy')}</option>
                      <option value="Ayurveda">{t('Ayurveda')}</option>
                      <option value="Unani">{t('Unani')}</option>
                      <option value="Physiotherapy">{t('Physiotherapy')}</option>
                      <option value="Mental Health & Psychology">{t('Mental Health & Psychology')}</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {t('Speciality Category')}
                    <input type="text" required value={doctorForm.speciality} onChange={(e) => setDoctorForm({ ...doctorForm, speciality: e.target.value })} placeholder="General Medicine" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {t('Specialist Role / Title')}
                    <input type="text" required value={doctorForm.specialistRole} onChange={(e) => setDoctorForm({ ...doctorForm, specialistRole: e.target.value })} placeholder="General Physician" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {t('Degrees / Qualifications')}
                    <input type="text" required value={doctorForm.degree} onChange={(e) => setDoctorForm({ ...doctorForm, degree: e.target.value })} placeholder="MBBS, MD (Medicine)" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {t('Experience Text')}
                    <input type="text" required value={doctorForm.experience} onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })} placeholder="15 Years experience" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {t('Consultation Fee (₹)')}
                    <input type="number" required value={doctorForm.fee} onChange={(e) => setDoctorForm({ ...doctorForm, fee: e.target.value })} placeholder="500" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {t('Default Rating (1-5)')}
                    <input type="number" step="0.1" required value={doctorForm.rating} onChange={(e) => setDoctorForm({ ...doctorForm, rating: e.target.value })} placeholder="4.8" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {t('Hospital / Clinic Name')}
                    <input type="text" required value={doctorForm.hospitalName} onChange={(e) => setDoctorForm({ ...doctorForm, hospitalName: e.target.value })} placeholder="Janki Raman Hospital" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {t('Hospital HFR Node ID')}
                    <input type="text" required value={doctorForm.hfrId} onChange={(e) => setDoctorForm({ ...doctorForm, hfrId: e.target.value })} placeholder="IN-HFR-100789" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {t('License / HPR Certificate ID')}
                    <input type="text" required value={doctorForm.certificateId} onChange={(e) => setDoctorForm({ ...doctorForm, certificateId: e.target.value })} placeholder="MCI-4207198" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {t('Practitioner Photo URL (Optional)')}
                    <input type="text" value={doctorForm.photo} onChange={(e) => setDoctorForm({ ...doctorForm, photo: e.target.value })} placeholder="https://..." style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </div>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {t('Practitioner Biography / Description')}
                  <textarea required value={doctorForm.description} onChange={(e) => setDoctorForm({ ...doctorForm, description: e.target.value })} placeholder="Experienced physician providing comprehensive primary healthcare..." style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', height: '60px', resize: 'none' }} />
                </label>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 20px', display: 'flex', gap: '10px', background: 'var(--bg-secondary)' }}>
                <button type="button" onClick={() => setIsDoctorModalOpen(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  {t('Cancel')}
                </button>
                <button type="submit" style={{ flex: 2, padding: '10px', background: 'var(--accent-teal)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {editingDoctor ? t('Save Changes') : t('Register Doctor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
