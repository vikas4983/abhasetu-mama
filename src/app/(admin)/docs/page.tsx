'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../providers/LanguageProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { 
  ArrowLeft, 
  Send, 
  Terminal, 
  Code, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Cpu, 
  Database,
  Lock,
  ShieldAlert,
  KeyRound
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

interface SandboxEndpoint {
  name: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  defaultBody?: string;
}

export default function AdminApiDocsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { logSecurityEvent } = useAuth();

  // Authorization state check
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Check auth on component mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      logSecurityEvent('Admin Page Blocked', 'Attempted unauthorized access to protected /admin/docs sandbox route.');
    }
  }, [logSecurityEvent]);

  // Navigation Tab: 'docs' | 'sandbox' | 'regex'
  const [activeTab, setActiveTab] = useState<'docs' | 'sandbox' | 'regex'>('sandbox');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  // --- API SANDBOX STATES ---
  const endpoints: SandboxEndpoint[] = [
    {
      name: 'System Root Status Check',
      method: 'GET',
      path: '/api/v1',
      description: 'Checks backend connection state, operational database metrics, and active ABDM milestone modules.'
    },
    {
      name: 'Get NHA Public Key Certificate',
      method: 'GET',
      path: '/api/v1/abha/v3/auth/cert',
      description: 'Fetches the uncompressed 2048-bit RSA public key cert used for client-side field encryption.'
    },
    {
      name: 'Generate Aadhaar OTP Handshake (M1)',
      method: 'POST',
      path: '/api/v1/abha/otp/generate',
      description: 'Encrypts the Aadhaar number using RSA version 3 standards and triggers OTP generation.',
      defaultBody: JSON.stringify({ aadhaar: '998105776582' }, null, 2)
    },
    {
      name: 'Verify Aadhaar OTP Handshake (M1)',
      method: 'POST',
      path: '/api/v1/abha/otp/verify',
      description: 'Validates NHA OTP and returns standard prefilled demographic profile details.',
      defaultBody: JSON.stringify({
        transactionId: 'd3b07384-d113-4c07-b2e3-54cdffeb20d4',
        otp: '123456'
      }, null, 2)
    },
    {
      name: 'Create ABDM Health Account Profile (M1)',
      method: 'POST',
      path: '/api/v1/abha/profile/create',
      description: 'Registers the customized ABHA address (@abdm) and persists a secure login password.',
      defaultBody: JSON.stringify({
        abhaNumber: '91-9981-0577-6582',
        abhaAddress: 'ayesha.ali',
        fullName: 'Dr. Ayesha Ali',
        gender: 'Female',
        dateOfBirth: '1980-08-15',
        mobile: '9981057765',
        password: 'SecurePassword1!',
        email: 'ayesha.ali@gmail.com',
        drivingLicense: 'DL-14201100682'
      }, null, 2)
    },
    {
      name: 'Retrieve Active Registry Profile (M1)',
      method: 'GET',
      path: '/api/v1/abha/profile/ayesha.ali',
      description: 'Retrieves current verification, mobile, status, and health locker record parameters.'
    },
    {
      name: 'Initialize Gateway Consent Request (M2)',
      method: 'POST',
      path: '/api/v1/abha/consent/request',
      description: 'Simulates consent request pushed to gateway, registering context bounds.',
      defaultBody: JSON.stringify({
        abhaAddress: 'ayesha.ali@abdm',
        purposeCode: 'TELECONSULTATION',
        hiTypes: ['Prescription', 'OPConsultation']
      }, null, 2)
    },
    {
      name: 'List Active Consent Authorizations (M2)',
      method: 'GET',
      path: '/api/v1/abha/consent/list',
      description: 'Fetches granted consent artifacts, validity scopes, and purpose parameters.'
    },
    {
      name: 'Execute Secure HIE Transfer (M3 - Fidelius)',
      method: 'POST',
      path: '/api/v1/abha/hie/transfer',
      description: 'Generates live Weierstrass Curve25519 ephemeral keys, extracts HKDF-SHA256 session keys, and AES-256-GCM packages HL7 FHIR payloads.',
      defaultBody: JSON.stringify({
        consentId: 'abdm-consent-8812-99a0',
        clinicalPayload: JSON.stringify({
          resourceType: 'Bundle',
          type: 'document',
          entry: [
            {
              resourceType: 'Prescription',
              id: 'rx-2026-9901',
              status: 'active',
              medicationCodeableConcept: { text: 'Amoxicillin 500mg TDS' },
              authoredOn: new Date().toISOString()
            }
          ]
        }, null, 2)
      }, null, 2)
    }
  ];

  const [selectedEndpoint, setSelectedEndpoint] = useState<SandboxEndpoint>(endpoints[0]);
  const [requestBody, setRequestBody] = useState<string>(endpoints[0].defaultBody || '');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<string>('');
  const [apiLoading, setApiLoading] = useState(false);

  // --- REGEX TESTING STATES ---
  const [testAadhaar, setTestAadhaar] = useState('998105776582');
  const [testMobile, setTestMobile] = useState('9981057765');
  const [testDob, setTestDob] = useState('1980-08-15');
  const [testAbhaNum, setTestAbhaNum] = useState('91-9981-0577-6582');
  const [testPassword, setTestPassword] = useState('SecurePassword1!');

  // --- HANDLERS ---
  const handleEndpointSelect = (ep: SandboxEndpoint) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.defaultBody || '');
    setResponseBody('');
    setResponseStatus(null);
    setResponseHeaders({});
  };

  const handleSendRequest = async () => {
    setApiLoading(true);
    setResponseBody('');
    setResponseStatus(null);
    setResponseHeaders({});
    showToast(t('Dispatching sandbox request to NestJS backend...'));

    const baseUrl = 'http://localhost:4000';
    const finalUrl = `${baseUrl}${selectedEndpoint.path}`;

    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (selectedEndpoint.method === 'POST' && requestBody) {
        try {
          JSON.parse(requestBody);
          options.body = requestBody;
        } catch (e) {
          setResponseStatus(400);
          setResponseBody(JSON.stringify({ error: 'Client-Side Invalid Request Body JSON Syntax' }, null, 2));
          setApiLoading(false);
          return;
        }
      }

      const startTime = performance.now();
      const res = await fetch(finalUrl, options);
      const endTime = performance.now();

      setResponseStatus(res.status);
      
      const headersMap: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        headersMap[key] = val;
      });
      setResponseHeaders(headersMap);

      const data = await res.json();
      setResponseBody(JSON.stringify(data, null, 2));

      logSecurityEvent(
        'Sandbox Test Executed',
        `Dispatched ${selectedEndpoint.method} ${selectedEndpoint.path} | Status: ${res.status} | Execution Time: ${Math.round(endTime - startTime)}ms`
      );
    } catch (err: any) {
      setResponseStatus(500);
      setResponseBody(JSON.stringify({
        error: 'Connection Refused by Backend',
        message: 'Ensure the NestJS application is running at http://localhost:4000 by executing "npm run start:dev" inside the backend directory.',
        detailedMessage: err.message
      }, null, 2));
    } finally {
      setApiLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(label);
    showToast(t('Copied payload schema to clipboard'));
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const checkRegex = (value: string, pattern: RegExp) => {
    return pattern.test(value);
  };

  const regexRules = {
    aadhaar: { pattern: /^\d{12}$/, message: 'Must be exactly 12 numeric digits.' },
    mobile: { pattern: /^(\+91|0)?[1-9][0-9]{9}$/, message: 'Must start with +91, 0, or directly with standard 10 digits starting 1-9.' },
    dob: { pattern: /^\d{4}-(0[0-9]|1[012])-(0[0-9]|[12][0-9]|3[01])$/, message: 'Must follow strict ISO YYYY-MM-DD standard.' },
    abhaNum: { pattern: /^\d{2}-\d{4}-\d{4}-\d{4}$/, message: 'Must follow double digit prefix structure: XX-XXXX-XXXX-XXXX' },
    password: { pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*-])[A-Za-z\d!@#$%^&*-]{8,}$/, message: 'Requires 8+ chars, 1 uppercase letter, 1 digit, and 1 special symbol (!@#$%^&*-).' }
  };

  // 1. Loading Authentication State
  if (isAuthorized === null) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
          <div className="pulse-dot" style={{ width: '12px', height: '12px', background: 'var(--accent-teal)' }}></div>
          <span>Verifying administrator permissions...</span>
        </div>
      </div>
    );
  }

  // 2. Access Blocked - Gated UI
  if (isAuthorized === false) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '65vh', width: '100%' }}>
        <article className="route-card" style={{ width: '100%', maxWidth: '440px', padding: '32px', border: '1px solid rgba(239, 68, 68, 0.2)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', background: 'rgba(6, 10, 18, 0.65)', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'grid', placeItems: 'center', margin: '0 auto 16px', boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)' }}>
            <ShieldAlert style={{ width: '22px', height: '22px' }} />
          </div>
          
          <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>Authorization Required</h2>
          <p style={{ margin: '0 0 24px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Access denied to interactive Developer API references. Secure sandbox testing tools require a verified Master Administrator session scope.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => router.push('/admin/login')}
              className="join-btn animate-glow"
              style={{ width: '100%', minHeight: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0 }}
            >
              <KeyRound style={{ width: '14px', height: '14px' }} />
              <span>Log In as Master Admin</span>
            </button>
            <button
              onClick={() => router.push('/')}
              className="join-btn"
              style={{ width: '100%', minHeight: '42px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', margin: 0 }}
            >
              Back to Patient Portal
            </button>
          </div>
        </article>
      </div>
    );
  }

  // 3. Authorized View - Full Interactive Sandbox & Docs Console
  return (
    <>
      <section className="route-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <p className="eyebrow">ABHA SETU MASTER DEV SANDBOX</p>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck style={{ color: 'var(--accent-teal)', width: '22px', height: '22px' }} />
            {t('Interactive API Sandbox & Docs')}
          </h2>
          <p>{t('Perform secure live gateway executions, validate payloads, and inspect NestJS responses.')}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveTab('sandbox')}
            className="join-btn" 
            style={{ margin: 0, padding: '6px 12px', fontSize: '11px', background: activeTab === 'sandbox' ? 'var(--accent-teal)' : 'transparent', border: 'none', color: activeTab === 'sandbox' ? '#000' : 'var(--text-primary)' }}
          >
            <Terminal style={{ width: '12px', height: '12px', marginRight: '4px', display: 'inline' }} />
            API Sandbox
          </button>
          <button 
            onClick={() => setActiveTab('regex')}
            className="join-btn" 
            style={{ margin: 0, padding: '6px 12px', fontSize: '11px', background: activeTab === 'regex' ? 'var(--accent-teal)' : 'transparent', border: 'none', color: activeTab === 'regex' ? '#000' : 'var(--text-primary)' }}
          >
            <ShieldCheck style={{ width: '12px', height: '12px', marginRight: '4px', display: 'inline' }} />
            Regex Checker
          </button>
          <button 
            onClick={() => setActiveTab('docs')}
            className="join-btn" 
            style={{ margin: 0, padding: '6px 12px', fontSize: '11px', background: activeTab === 'docs' ? 'var(--accent-teal)' : 'transparent', border: 'none', color: activeTab === 'docs' ? '#000' : 'var(--text-primary)' }}
          >
            <BookOpen style={{ width: '12px', height: '12px', marginRight: '4px', display: 'inline' }} />
            API References
          </button>
        </div>
      </section>

      <div style={{ width: '100%', maxWidth: '1200px', margin: '20px auto', display: 'grid', gap: '20px' }}>
        
        {/* ==========================================
            TAB 1: LIVE API SANDBOX
            ========================================== */}
        {activeTab === 'sandbox' && (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'stretch' }}>
            {/* Endpoint Selector Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Milestone 1 API List</h4>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>Select an endpoint below to load it into the playground console.</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {endpoints.map((ep) => (
                  <button
                    key={ep.name}
                    onClick={() => handleEndpointSelect(ep)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: selectedEndpoint.name === ep.name ? 'var(--accent-teal)' : 'var(--border-color)',
                      background: selectedEndpoint.name === ep.name ? 'rgba(0, 212, 170, 0.05)' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ 
                        fontSize: '9px', 
                        fontWeight: 'bold', 
                        padding: '2px 4px', 
                        borderRadius: '4px',
                        background: ep.method === 'GET' ? 'rgba(0, 212, 170, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: ep.method === 'GET' ? 'var(--accent-teal)' : '#3b82f6',
                        fontFamily: 'monospace'
                      }}>
                        {ep.method}
                      </span>
                      <strong style={{ fontSize: '12px' }}>{ep.name}</strong>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{ep.description}</span>
                  </button>
                ))}
              </div>
            </aside>

            {/* Sandbox Console Panel */}
            <main style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <article className="route-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center' }}>
                      <Terminal style={{ width: '16px', height: '16px' }} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px' }}>{selectedEndpoint.name}</h3>
                      <code style={{ fontSize: '11px', color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.05)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', display: 'inline-block', marginTop: '4px' }}>
                        {selectedEndpoint.method} http://localhost:4000{selectedEndpoint.path}
                      </code>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleSendRequest} 
                    disabled={apiLoading}
                    className="join-btn animate-glow" 
                    style={{ margin: 0, minHeight: '38px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 18px' }}
                  >
                    {apiLoading ? (
                      <span>Executing...</span>
                    ) : (
                      <>
                        <Send style={{ width: '12px', height: '12px' }} />
                        <span>Send Live Request</span>
                      </>
                    )}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: selectedEndpoint.method === 'POST' ? '1fr 1fr' : '1fr', gap: '20px' }}>
                  {/* POST Payload Editor */}
                  {selectedEndpoint.method === 'POST' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>JSON Request Payload Editor</span>
                        <button 
                          onClick={() => copyToClipboard(requestBody, 'req')} 
                          style={{ background: 'none', border: 'none', color: 'var(--accent-teal)', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          {copiedPath === 'req' ? <Check style={{ width: '10px', height: '10px' }} /> : <Copy style={{ width: '10px', height: '10px' }} />}
                          Copy Payload
                        </button>
                      </div>
                      <textarea
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        placeholder="Enter raw JSON request body..."
                        style={{
                          width: '100%',
                          minHeight: '260px',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          background: '#0a0a0c',
                          color: '#00ffaa',
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          lineHeight: '1.6',
                          resize: 'vertical',
                          outline: 'none'
                        }}
                      />
                    </div>
                  )}

                  {/* API Response Panel */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Response Inspector Console</span>
                      {responseStatus !== null && (
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 'bold', 
                          padding: '2px 8px', 
                          borderRadius: '4px',
                          background: responseStatus >= 200 && responseStatus < 300 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: responseStatus >= 200 && responseStatus < 300 ? '#10b981' : '#ef4444',
                        }}>
                          HTTP Status: {responseStatus} {responseStatus >= 200 && responseStatus < 300 ? 'OK' : 'Error'}
                        </span>
                      )}
                    </div>
                    
                    <div style={{
                      width: '100%',
                      minHeight: '260px',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: '#0e1117',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      textAlign: 'left'
                    }}>
                      {apiLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', gap: '10px', color: 'var(--text-secondary)' }}>
                          <div className="pulse-dot" style={{ width: '12px', height: '12px', background: 'var(--accent-teal)' }}></div>
                          <span>Awaiting secure server callback...</span>
                        </div>
                      ) : responseBody ? (
                        <pre style={{ margin: 0, color: responseStatus && responseStatus >= 200 && responseStatus < 300 ? '#e2e8f0' : '#ff5555' }}>
                          {responseBody}
                        </pre>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                          <Code style={{ width: '20px', height: '20px', opacity: 0.5 }} />
                          <span>Console is idle. Press "Send Request" to fetch active endpoints.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </main>
          </div>
        )}

        {/* ==========================================
            TAB 2: REGEX TESTING SANDBOX
            ========================================== */}
        {activeTab === 'regex' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
            {/* Input Testing Form */}
            <article className="route-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <ShieldCheck style={{ color: 'var(--accent-teal)' }} />
                <h3 style={{ margin: 0, fontSize: '15px' }}>NHA Regex Validation Sandbox</h3>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                ABDM Sandbox endpoints strictly enforce standard Regular Expressions. Test custom parameters below to immediately verify if they comply with NHA sandboxing schemas.
              </p>

              <div style={{ display: 'grid', gap: '14px' }}>
                <label style={{ display: 'grid', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Aadhaar Number (12 numeric digits)
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={testAadhaar}
                      onChange={(e) => setTestAadhaar(e.target.value)}
                      placeholder="998105776582"
                      style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace' }}
                    />
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: 'bold',
                      color: checkRegex(testAadhaar, regexRules.aadhaar.pattern) ? '#10b981' : '#ef4444' 
                    }}>
                      {checkRegex(testAadhaar, regexRules.aadhaar.pattern) ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  {!checkRegex(testAadhaar, regexRules.aadhaar.pattern) && <span style={{ fontSize: '9px', color: '#ef4444' }}>{regexRules.aadhaar.message}</span>}
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Mobile Number (Indian Standard)
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={testMobile}
                      onChange={(e) => setTestMobile(e.target.value)}
                      placeholder="9981057765"
                      style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace' }}
                    />
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: 'bold',
                      color: checkRegex(testMobile, regexRules.mobile.pattern) ? '#10b981' : '#ef4444' 
                    }}>
                      {checkRegex(testMobile, regexRules.mobile.pattern) ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  {!checkRegex(testMobile, regexRules.mobile.pattern) && <span style={{ fontSize: '9px', color: '#ef4444' }}>{regexRules.mobile.message}</span>}
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Date of Birth (YYYY-MM-DD ISO)
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={testDob}
                      onChange={(e) => setTestDob(e.target.value)}
                      placeholder="1980-08-15"
                      style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace' }}
                    />
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: 'bold',
                      color: checkRegex(testDob, regexRules.dob.pattern) ? '#10b981' : '#ef4444' 
                    }}>
                      {checkRegex(testDob, regexRules.dob.pattern) ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  {!checkRegex(testDob, regexRules.dob.pattern) && <span style={{ fontSize: '9px', color: '#ef4444' }}>{regexRules.dob.message}</span>}
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  ABHA ID Number (XX-XXXX-XXXX-XXXX)
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={testAbhaNum}
                      onChange={(e) => setTestAbhaNum(e.target.value)}
                      placeholder="91-9981-0577-6582"
                      style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace' }}
                    />
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: 'bold',
                      color: checkRegex(testAbhaNum, regexRules.abhaNum.pattern) ? '#10b981' : '#ef4444' 
                    }}>
                      {checkRegex(testAbhaNum, regexRules.abhaNum.pattern) ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  {!checkRegex(testAbhaNum, regexRules.abhaNum.pattern) && <span style={{ fontSize: '9px', color: '#ef4444' }}>{regexRules.abhaNum.message}</span>}
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Secure Account Password (ABDM Rules)
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="password"
                      value={testPassword}
                      onChange={(e) => setTestPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace' }}
                    />
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: 'bold',
                      color: checkRegex(testPassword, regexRules.password.pattern) ? '#10b981' : '#ef4444' 
                    }}>
                      {checkRegex(testPassword, regexRules.password.pattern) ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  {!checkRegex(testPassword, regexRules.password.pattern) && <span style={{ fontSize: '9px', color: '#ef4444' }}>{regexRules.password.message}</span>}
                </label>
              </div>
            </article>

            {/* Regex Patterns Reference Sheet */}
            <article className="route-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <Cpu style={{ color: 'var(--accent-teal)' }} />
                <h3 style={{ margin: 0, fontSize: '15px' }}>Dynamic NHA Regex Schema Definitions</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '6px', borderLeft: '3px solid var(--accent-teal)' }}>
                  <strong>Aadhaar RegExp:</strong>
                  <code style={{ display: 'block', background: '#0a0a0c', color: '#00ffaa', padding: '6px', borderRadius: '4px', marginTop: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
                    /^\d{"{12}"}$/
                  </code>
                </div>

                <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '6px', borderLeft: '3px solid var(--accent-teal)' }}>
                  <strong>Mobile Prefix RegExp:</strong>
                  <code style={{ display: 'block', background: '#0a0a0c', color: '#00ffaa', padding: '6px', borderRadius: '4px', marginTop: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
                    /^(\+91|0)?[1-9][0-9]{"{"}9{"}"}$/
                  </code>
                </div>

                <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '6px', borderLeft: '3px solid var(--accent-teal)' }}>
                  <strong>DOB ISO standard RegExp:</strong>
                  <code style={{ display: 'block', background: '#0a0a0c', color: '#00ffaa', padding: '6px', borderRadius: '4px', marginTop: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
                    /^\d{"{4}"}-(0[0-9]|1[012])-(0[0-9]|[12][0-9]|3[01])$/
                  </code>
                </div>

                <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '6px', borderLeft: '3px solid var(--accent-teal)' }}>
                  <strong>ABHA Card Number RegExp:</strong>
                  <code style={{ display: 'block', background: '#0a0a0c', color: '#00ffaa', padding: '6px', borderRadius: '4px', marginTop: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
                    /^\d{"{2}"}-\d{"{4}"}-\d{"{4}"}-\d{"{4}"}$/
                  </code>
                </div>

                <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '6px', borderLeft: '3px solid var(--accent-teal)' }}>
                  <strong>Password Complexity RegExp:</strong>
                  <code style={{ display: 'block', background: '#0a0a0c', color: '#00ffaa', padding: '6px', borderRadius: '4px', marginTop: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
                    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*-])[A-Za-z\d!@#$%^&*-]{"{"}8,{"}"}$/
                  </code>
                </div>
              </div>
            </article>
          </div>
        )}

        {/* ==========================================
            TAB 3: COMPLETE API REFERENCES
            ========================================== */}
        {activeTab === 'docs' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <article className="route-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <BookOpen style={{ color: 'var(--accent-teal)' }} />
                <h3 style={{ margin: 0, fontSize: '15px' }}>Ayushman Bharat Digital Mission (ABDM) Endpoint Ledger</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* EP 1 */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>POST</span>
                      <strong style={{ fontSize: '12px', fontFamily: 'monospace' }}>/api/v1/abha/otp/generate</strong>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Generate Aadhaar OTP</span>
                  </div>
                  <div style={{ padding: '14px', fontSize: '12px', color: 'var(--text-secondary)', display: 'grid', gap: '10px' }}>
                    <span>Triggers an Aadhaar mobile verification sequence. In compliance with ABDM sandbox Version 3 specs, the payload Aadhaar parameter is encrypted using the pulled RSA public key.</span>
                    
                    <strong>JSON Schema:</strong>
                    <pre style={{ background: '#0e1117', color: '#e2e8f0', padding: '10px', borderRadius: '6px', fontSize: '11px', margin: 0 }}>
{`{
  "aadhaar": "998105776582" // 12-digit string representing Aadhaar number
}`}
                    </pre>

                    <strong>Standard Successful Response (201 Created):</strong>
                    <pre style={{ background: '#0e1117', color: '#00ffaa', padding: '10px', borderRadius: '6px', fontSize: '11px', margin: 0 }}>
{`{
  "transactionId": "d3b07384-d113-4c07-b2e3-54cdffeb20d4",
  "status": "SUCCESS",
  "message": "Secure OTP successfully pushed to registered mobile number via NHA gateway"
}`}
                    </pre>
                  </div>
                </div>

                {/* EP 2 */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>POST</span>
                      <strong style={{ fontSize: '12px', fontFamily: 'monospace' }}>/api/v1/abha/otp/verify</strong>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verify OTP Code</span>
                  </div>
                  <div style={{ padding: '14px', fontSize: '12px', color: 'var(--text-secondary)', display: 'grid', gap: '10px' }}>
                    <span>Verifies the 6-digit OTP code received on the patient's registered mobile device. The OTP field is fully encrypted prior to gateway transmission.</span>
                    
                    <strong>JSON Schema:</strong>
                    <pre style={{ background: '#0e1117', color: '#e2e8f0', padding: '10px', borderRadius: '6px', fontSize: '11px', margin: 0 }}>
{`{
  "transactionId": "d3b07384-d113-4c07-b2e3-54cdffeb20d4", // Valid UUID returned by generate OTP
  "otp": "123456" // 6-digit numeric OTP string
}`}
                    </pre>

                    <strong>Standard Successful Response (201 Created):</strong>
                    <pre style={{ background: '#0e1117', color: '#00ffaa', padding: '10px', borderRadius: '6px', fontSize: '11px', margin: 0 }}>
{`{
  "status": "VERIFIED",
  "abhaNumber": "91-9981-0577-6582",
  "abhaAddress": "ayesha.ali.9981057765@abdm",
  "profile": {
    "fullName": "Dr. Ayesha Ali",
    "gender": "Female",
    "dateOfBirth": "1980-08-15",
    "mobile": "9981057765",
    "photo": "/assets/doctors/dr-ayesha-ali.jpeg"
  }
}`}
                    </pre>
                  </div>
                </div>

                {/* EP 3 */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>POST</span>
                      <strong style={{ fontSize: '12px', fontFamily: 'monospace' }}>/api/v1/abha/profile/create</strong>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Register ABHA Account Profile</span>
                  </div>
                  <div style={{ padding: '14px', fontSize: '12px', color: 'var(--text-secondary)', display: 'grid', gap: '10px' }}>
                    <span>Commits and persists a verified patient demographic profile onto the national ABHA registry, and links a custom login password.</span>
                    
                    <strong>JSON Schema:</strong>
                    <pre style={{ background: '#0e1117', color: '#e2e8f0', padding: '10px', borderRadius: '6px', fontSize: '11px', margin: 0 }}>
{`{
  "abhaNumber": "91-9981-0577-6582", // Verified ABHA card number
  "abhaAddress": "ayesha.ali", // Prefix string mapping to unique address
  "fullName": "Dr. Ayesha Ali",
  "gender": "Female",
  "dateOfBirth": "1980-08-15",
  "mobile": "9981057765",
  "password": "SecurePassword1!", // Must conform to password complexity regex
  "email": "ayesha.ali@gmail.com",
  "drivingLicense": "DL-14201100682"
}`}
                    </pre>

                    <strong>Standard Successful Response (201 Created):</strong>
                    <pre style={{ background: '#0e1117', color: '#00ffaa', padding: '10px', borderRadius: '6px', fontSize: '11px', margin: 0 }}>
{`{
  "status": "CREATED",
  "abhaNumber": "91-9981-0577-6582",
  "abhaAddress": "ayesha.ali",
  "message": "ABHA Profile successfully created and registered on national health registry."
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </article>

            {/* Cryptographic reference info */}
            <article className="route-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <Lock style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
                <h3 style={{ margin: 0, fontSize: '15px' }}>Security & Cryptographic Standards</h3>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.7', display: 'grid', gap: '12px' }}>
                <p>
                  To secure Patient Identifiable Information (PII) under the **DPDP Act 2023** and **HIPAA directives**, Abha Setu enforces robust cryptographic boundaries:
                </p>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>1. Client-Side RSA Certificate Pull:</strong>
                  <p style={{ margin: '4px 0 0' }}>
                    Prior to dispatching sensitive parameters (Aadhaar, mobile, passwords), clients pull the public uncompressed cert using `GET /abha/v3/auth/cert`. Sensitive parameters are then wrapped securely via **RSA/ECB/PKCS1Padding** before transmission.
                  </p>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>2. Weierstrass Curve25519 Payload Exchange:</strong>
                  <p style={{ margin: '4px 0 0' }}>
                    Clinical records (FHIR payloads) shared between facilities utilize Elliptic Curve Diffie-Hellman (ECDH) key exchanges on Weierstrass Short Curve equations:
                    <code style={{ display: 'block', background: '#0a0a0c', color: '#00ffaa', padding: '4px 8px', borderRadius: '4px', marginTop: '6px', fontFamily: 'monospace', fontSize: '11px', textAlign: 'center' }}>
                      y² = x³ + ax + b (mod p)
                    </code>
                    This ensures absolute integrity and confidentiality for all Health Information Exchange (HIE) payloads.
                  </p>
                </div>
              </div>
            </article>
          </div>
        )}
      </div>
    </>
  );
}
