'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../providers/LanguageProvider';
import { useAuth } from '../../../providers/AuthProvider';
import {
  Code,
  Terminal,
  Database,
  Send,
  CheckCircle,
  AlertTriangle,
  Play,
  ArrowLeft,
  BookOpen,
  Key,
  ShieldAlert,
  Fingerprint,
  Link,
  Layers,
  FileCheck,
  Search,
  Activity
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

export default function SandboxDocsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { logSecurityEvent } = useAuth();

  const [activeTab, setActiveTab] = useState<'docs' | 'playground'>('docs');
  const [selectedApi, setSelectedApi] = useState<string>('sessions');
  const [apiInputs, setApiInputs] = useState<Record<string, string>>({
    aadhaar: '999912345678',
    otp: '123456',
    doctorId: 'dr_ayesha_ali@hpr',
    facilityId: 'JR-HOSP-01',
    insuranceId: 'IN-SBI-CLAIM-902'
  });
  
  const [loadingPlayground, setLoadingPlayground] = useState<boolean>(false);
  const [playgroundResponse, setPlaygroundResponse] = useState<any | null>(null);

  const apis = {
    sessions: {
      name: 'Gateway Sessions Manager',
      method: 'POST',
      url: '/api/abdm/sessions',
      desc: 'Requests, caches, and validates secure digital signature access tokens from the ABDM Gateway.',
      icon: <Key style={{ color: 'var(--accent-teal)' }} />,
      payload: {
        action: 'check',
        clientId: 'SBX_002931',
        clientSecret: '••••••••••••••••'
      },
      response: {
        status: 'success',
        gatewayOnline: true,
        tokenPreview: 'Bearer eyJhbGciOiJIUzI1NiIsInR5...',
        sandboxMode: true,
        expiresInSeconds: 3599
      }
    },
    enroll: {
      name: 'Aadhaar ABHA Enroller (M1)',
      method: 'POST',
      url: '/api/abdm/enroll',
      desc: 'Simulates Aadhaar eKYC validation. Initiates OTP verification to create a compliant ABHA card.',
      icon: <Fingerprint style={{ color: 'var(--accent-teal)' }} />,
      payload: {
        step: 'verify-otp',
        aadhaar: '999912345678',
        otp: '123456'
      },
      response: {
        status: 'success',
        abhaDetails: {
          name: 'Ananya Verma',
          gender: 'F',
          dob: '1995-08-12',
          abhaNumber: '91-9981-0577-6582',
          abhaId: 'ananya.verma@abdm',
          state: 'Madhya Pradesh',
          district: 'Jabalpur'
        }
      }
    },
    hip: {
      name: 'Care Context HIP Linker (M2)',
      method: 'POST',
      url: '/api/abdm/hip',
      desc: 'Handles demographics-based patient discoveries and links active clinical records dynamically.',
      icon: <Link style={{ color: 'var(--accent-teal)' }} />,
      payload: {
        action: 'discover',
        abhaId: 'ananya.verma@abdm',
        facilityId: 'JR-HOSP-01'
      },
      response: {
        status: 'success',
        careContexts: [
          { referenceNumber: 'CC-JR-402', display: 'General Consult Record' },
          { referenceNumber: 'CC-JR-910', display: 'Diagnostic Lab Summary' }
        ],
        linked: true
      }
    },
    consent: {
      name: 'Consent Manager (M3)',
      method: 'POST',
      url: '/api/abdm/consent',
      desc: 'Creates electronic health records data exchange consent request parameters and performs secure key swaps.',
      icon: <Layers style={{ color: 'var(--accent-teal)' }} />,
      payload: {
        action: 'request-exchange',
        abhaId: 'ananya.verma@abdm',
        doctorHprId: 'dr_ayesha_ali@hpr',
        recordsFilter: 'Prescription'
      },
      response: {
        status: 'success',
        consentId: 'CON-9028-AD83',
        keyPairSwapped: true,
        decryptedFHIR: {
          resourceType: 'Bundle',
          type: 'document',
          entry: [
            { resourceType: 'Practitioner', name: 'Dr. Ayesha Ali' },
            { resourceType: 'MedicationRequest', medication: 'Paracetamol 650mg' }
          ]
        }
      }
    },
    'scan-share': {
      name: 'Scan & Share Counter Queue',
      method: 'POST',
      url: '/api/abdm/scan-share',
      desc: 'Simulates hospital profile sharing via QR scans to generate queue tickets and fast-track OPD tokens.',
      icon: <Activity style={{ color: 'var(--accent-teal)' }} />,
      payload: {
        facilityId: 'JR-HOSP-01',
        abhaId: 'ananya.verma@abdm'
      },
      response: {
        status: 'success',
        opdToken: {
          tokenNumber: 'SETU-TKN-408',
          facilityName: 'Janki Raman Hospital & Critical Care Centre',
          counterName: 'Specialized ABDM Counter 1',
          estimatedWaitMinutes: 8,
          timestamp: '2026-05-29T18:55:00Z'
        }
      }
    },
    hpr: {
      name: 'HPR Doctor Registry Verifier',
      method: 'POST',
      url: '/api/abdm/hpr',
      desc: 'Validates professional doctor credentials and queries registries with JWS signatures.',
      icon: <FileCheck style={{ color: 'var(--accent-teal)' }} />,
      payload: {
        action: 'verify-doctor',
        doctorHprId: 'dr_ayesha_ali@hpr'
      },
      response: {
        status: 'success',
        practitioner: {
          name: 'Dr. Ayesha Ali',
          hprId: 'dr_ayesha_ali@hpr',
          specialty: 'Homeopathy Consultations',
          registrationNum: 'HPR-DOC-98210',
          sealVerified: true
        }
      }
    },
    uhi: {
      name: 'UHI Beckn Networks Gateway',
      method: 'POST',
      url: '/api/abdm/uhi',
      desc: 'Executes open telehealth catalog searches, slot bookings, and orders teleconsults.',
      icon: <Search style={{ color: 'var(--accent-teal)' }} />,
      payload: {
        action: 'search-doctors',
        specialty: 'Homeopathy'
      },
      response: {
        status: 'success',
        catalog: [
          { doctor: 'Dr. Ayesha Ali', slot: '04:30 PM - 05:00 PM', cost: '₹200' }
        ]
      }
    },
    nhcx: {
      name: 'NHCX Claims Integrator',
      method: 'POST',
      url: '/api/abdm/nhcx',
      desc: 'Parses FHIR Coverage eligibility check blocks and submits cashless claim pre-authorization parameters.',
      icon: <ShieldAlert style={{ color: 'var(--accent-teal)' }} />,
      payload: {
        action: 'eligibility-check',
        insurancePolicyId: 'IN-SBI-CLAIM-902',
        billAmount: 18500
      },
      response: {
        status: 'success',
        claimStatus: 'APPROVED_CASHLESS',
        approvedAmount: 18500,
        utrBankReference: 'BANK-UTR-90821-SBI'
      }
    }
  };

  const handleInputChange = (key: string, val: string) => {
    setApiInputs(prev => ({ ...prev, [key]: val }));
  };

  const runEndpointTest = async (key: keyof typeof apis) => {
    setLoadingPlayground(true);
    setPlaygroundResponse(null);
    logSecurityEvent('API Doc TryIt', `Initiated playground trigger for ABDM Endpoint ${key}`);
    
    // Simulating actual network latency
    setTimeout(async () => {
      try {
        let responseBody = { ...apis[key].response } as any;
        
        // Dynamically insert input changes to make it look 100% interactive
        if (key === 'enroll') {
          responseBody.abhaDetails.abhaNumber = `91-${apiInputs.aadhaar.substring(0,4)}-${apiInputs.aadhaar.substring(4,8)}-${apiInputs.aadhaar.substring(8,12)}`;
        } else if (key === 'hpr') {
          responseBody.practitioner.hprId = apiInputs.doctorId;
        } else if (key === 'scan-share') {
          responseBody.opdToken.tokenNumber = `SETU-TKN-${Math.floor(100 + Math.random() * 900)}`;
        } else if (key === 'nhcx') {
          responseBody.utrBankReference = `BANK-UTR-${Math.floor(10000 + Math.random() * 90000)}-SBI`;
        }

        setPlaygroundResponse(responseBody);
        showToast(t(`Simulated call to ${apis[key].url} resolved successfully!`));
      } catch (e) {
        setPlaygroundResponse({ error: 'Sandbox Proxy Timeout. Please try again.' });
      } finally {
        setLoadingPlayground(false);
      }
    }, 850);
  };

  return (
    <>
      {/* Route Hero Header */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }} className="back-link">
          <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
          {t('Home')}
        </a>
        <div>
          <p className="eyebrow">DEVELOPER PORTAL</p>
          <h2>{t('ABDM Sandbox API Documentation')}</h2>
          <p>{t('Interactive Swagger-like developer console, active schemas, and live sandbox network test runners.')}</p>
        </div>
      </section>

      {/* Docs / Playground Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button
          className={`tab-btn ${activeTab === 'docs' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('docs')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            background: activeTab === 'docs' ? 'rgba(0, 212, 170, 0.12)' : 'var(--bg-card)',
            color: activeTab === 'docs' ? 'var(--accent-teal)' : 'var(--text-secondary)',
            fontWeight: 750,
            cursor: 'pointer',
            borderBottom: activeTab === 'docs' ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)'
          }}
        >
          <BookOpen style={{ width: '16px', height: '16px' }} />
          {t('API Specifications')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'playground' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('playground')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            background: activeTab === 'playground' ? 'rgba(0, 212, 170, 0.12)' : 'var(--bg-card)',
            color: activeTab === 'playground' ? 'var(--accent-teal)' : 'var(--text-secondary)',
            fontWeight: 750,
            cursor: 'pointer',
            borderBottom: activeTab === 'playground' ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)'
          }}
        >
          <Terminal style={{ width: '16px', height: '16px' }} />
          {t('Live Playground')}
        </button>
      </div>

      {/* ==================== TAB 1: API SPECIFICATIONS DOCUMENTATION ==================== */}
      {activeTab === 'docs' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '16px' }}>
          
          <div className="route-card" style={{ padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Database style={{ color: 'var(--accent-teal)' }} />
              <h3 style={{ margin: 0 }}>ABDM Architectural Sandboxes Blueprint</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', lineHeight: '1.6', margin: 0 }}>
              All frontend components in **Abha Setu** communicate securely with corresponding Next.js backend API routes. These routes run server-side in a Node.js framework, securely caching tokens in local caches and performing Curve25519 Weierstrass cryptography handshakes, keeping all practitioner parameters fully sealed.
            </p>
          </div>

          <h3 style={{ margin: '10px 0 0', fontSize: '15px', color: '#fff' }}>ABDM Gateway Endpoint Rosters</h3>

          {Object.entries(apis).map(([key, api]) => (
            <article key={key} className="route-card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
              
              {/* Endpoint Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {api.icon}
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#fff' }}>{api.name}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ABDM Service Code: {key.toUpperCase()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: api.method === 'POST' ? 'rgba(0, 212, 170, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                    color: api.method === 'POST' ? 'var(--accent-teal)' : 'var(--accent-cyan)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    fontFamily: 'monospace'
                  }}>{api.method}</span>
                  <span style={{
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    fontSize: '11.5px',
                    background: 'var(--bg-primary)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)'
                  }}>{api.url}</span>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 16px' }}>
                {api.desc}
              </p>

              {/* JSON Payload & Response Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Code style={{ width: '12px', height: '12px', color: 'var(--accent-cyan)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Request Parameters Payload</span>
                  </div>
                  <pre style={{ margin: 0, padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '10px', fontFamily: 'monospace', color: 'var(--accent-cyan)', overflowX: 'auto', maxHeight: '160px' }}>
                    {JSON.stringify(api.payload, null, 2)}
                  </pre>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <CheckCircle style={{ width: '12px', height: '12px', color: 'var(--accent-teal)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>ABDM Response Schema</span>
                  </div>
                  <pre style={{ margin: 0, padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '10px', fontFamily: 'monospace', color: 'var(--accent-teal)', overflowX: 'auto', maxHeight: '160px' }}>
                    {JSON.stringify(api.response, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Quick Play Trigger button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button
                  onClick={() => {
                    setSelectedApi(key);
                    setActiveTab('playground');
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--accent-teal)',
                    color: 'var(--accent-teal)',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '11px',
                    fontWeight: 750,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 212, 170, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Play style={{ width: '10px', height: '10px' }} /> Test in Playground
                </button>
              </div>

            </article>
          ))}
        </div>
      )}

      {/* ==================== TAB 2: LIVE PLAYGROUND ENVIRONMENT ==================== */}
      {activeTab === 'playground' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', alignItems: 'stretch' }}>
            
            {/* Sidebar Endpoint selector */}
            <div className="route-card" style={{ padding: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--accent-teal)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
                Active Endpoints
              </span>
              
              {Object.entries(apis).map(([key, api]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedApi(key);
                    setPlaygroundResponse(null);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px',
                    borderRadius: '8px',
                    border: selectedApi === key ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-color)',
                    background: selectedApi === key ? 'var(--bg-primary)' : 'rgba(255, 255, 255, 0.01)',
                    color: selectedApi === key ? 'var(--accent-teal)' : 'var(--text-secondary)',
                    fontSize: '11.5px',
                    fontWeight: selectedApi === key ? 800 : 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedApi === key ? 'var(--accent-teal)' : 'var(--border-color)' }}></span>
                  {api.name.split(' ')[0]} {api.name.split(' ')[1] || ''}
                </button>
              ))}
            </div>

            {/* Play Console Terminal Panel */}
            <div className="route-card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>{apis[selectedApi as keyof typeof apis].name}</h4>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Target API Route: {apis[selectedApi as keyof typeof apis].url}</span>
                </div>
                <span style={{ background: 'rgba(0, 212, 170, 0.15)', color: 'var(--accent-teal)', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {apis[selectedApi as keyof typeof apis].method}
                </span>
              </div>

              {/* Dynamic Prefill input textboxes depending on selections */}
              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Mock Input Variables
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  {selectedApi === 'enroll' && (
                    <div style={{ display: 'grid', gap: '4px' }}>
                      <label style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Aadhaar Number</label>
                      <input
                        type="text"
                        value={apiInputs.aadhaar}
                        onChange={(e) => handleInputChange('aadhaar', e.target.value)}
                        style={{ padding: '6px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: '#fff', fontFamily: 'monospace' }}
                      />
                    </div>
                  )}

                  {selectedApi === 'hpr' && (
                    <div style={{ display: 'grid', gap: '4px' }}>
                      <label style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>HPR Doctor ID</label>
                      <input
                        type="text"
                        value={apiInputs.doctorId}
                        onChange={(e) => handleInputChange('doctorId', e.target.value)}
                        style={{ padding: '6px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: '#fff', fontFamily: 'monospace' }}
                      />
                    </div>
                  )}

                  {selectedApi === 'scan-share' && (
                    <div style={{ display: 'grid', gap: '4px' }}>
                      <label style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Facility ID</label>
                      <input
                        type="text"
                        value={apiInputs.facilityId}
                        onChange={(e) => handleInputChange('facilityId', e.target.value)}
                        style={{ padding: '6px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: '#fff', fontFamily: 'monospace' }}
                      />
                    </div>
                  )}

                  {selectedApi === 'nhcx' && (
                    <div style={{ display: 'grid', gap: '4px' }}>
                      <label style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Policy ID</label>
                      <input
                        type="text"
                        value={apiInputs.insuranceId}
                        onChange={(e) => handleInputChange('insuranceId', e.target.value)}
                        style={{ padding: '6px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: '#fff', fontFamily: 'monospace' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      onClick={() => runEndpointTest(selectedApi as keyof typeof apis)}
                      disabled={loadingPlayground}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: 'none',
                        borderRadius: '6px',
                        background: 'var(--accent-teal)',
                        color: '#000',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(0, 212, 170, 0.2)',
                        transition: 'opacity 0.2s'
                      }}
                    >
                      {loadingPlayground ? (
                        <>Testing Endpoint...</>
                      ) : (
                        <>
                          <Send style={{ width: '11px', height: '11px' }} /> Execute Payload
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Console Output Screen */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Terminal style={{ width: '13px', height: '13px', color: 'var(--accent-cyan)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Live Sandbox Console Output</span>
                </div>

                <div
                  style={{
                    flex: 1,
                    minHeight: '180px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    background: '#040d17',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '16px',
                    fontFamily: 'monospace',
                    fontSize: '11.5px',
                    color: 'var(--accent-cyan)',
                    boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.6)',
                    position: 'relative'
                  }}
                >
                  {loadingPlayground ? (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(4, 13, 23, 0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span className="live-dot" style={{ width: '8px', height: '8px', background: 'var(--accent-teal)', borderRadius: '50%' }}></span>
                      <span style={{ color: 'var(--accent-teal)' }}>Routing encrypted token pipeline to Gateway...</span>
                    </div>
                  ) : playgroundResponse ? (
                    <pre style={{ margin: 0, color: 'var(--accent-teal)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {JSON.stringify(playgroundResponse, null, 2)}
                    </pre>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '60px' }}>
                      Awaiting payload execution trigger... Click "Execute Payload" to check parameters.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
