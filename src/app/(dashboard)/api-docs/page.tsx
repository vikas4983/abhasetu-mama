'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../providers/LanguageProvider';
import { useAuth } from '../../../providers/AuthProvider';
import {
  Code,
  Terminal,
  Play,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Info,
  Lock
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  url: string;
  description: string;
  parametersDescription: string;
  defaultPayload: string;
}

const API_ENDPOINTS: APIEndpoint[] = [
  {
    id: 'sessions',
    name: 'Establish Gateway Handshake',
    method: 'GET',
    url: '/api/abdm/sessions',
    description: 'Generates access tokens for gateway security checks and verifies live sandbox credentials status.',
    parametersDescription: 'None (GET request)',
    defaultPayload: '{}'
  },
  {
    id: 'enroll-otp',
    name: 'Aadhaar Onboarding: Request OTP',
    method: 'POST',
    url: '/api/abdm/enroll',
    description: 'Requests an authentication OTP sent to the patient\'s Aadhaar-linked mobile number for ABHA card creation.',
    parametersDescription: 'action: "request-otp", aadhaar: "12-digit number"',
    defaultPayload: JSON.stringify({ action: 'request-otp', aadhaar: '998105776582' }, null, 2)
  },
  {
    id: 'enroll-verify',
    name: 'Aadhaar Onboarding: Verify OTP & Issue ABHA',
    method: 'POST',
    url: '/api/abdm/enroll',
    description: 'Verifies the Aadhaar OTP code and issues a newly generated ABHA ID, ABHA Address (@sbx) and demographic profile.',
    parametersDescription: 'action: "verify-otp", otp: "6-digit code", txnId: "transaction ID"',
    defaultPayload: JSON.stringify({ action: 'verify-otp', otp: '123456', txnId: 'simulated-txn-uuid' }, null, 2)
  },
  {
    id: 'hip-discover',
    name: 'HIP Patient Discovery',
    method: 'POST',
    url: '/api/abdm/hip',
    description: 'Called by ABDM gateway to discover matching patient demographics and care contexts (Prescriptions, Diagnostics) in the hospital\'s database.',
    parametersDescription: 'action: "discover-link", abhaAddress: "address@abdm", patientName: "full name", contextType: "Prescription", detail: "Care Context Description"',
    defaultPayload: JSON.stringify({
      action: 'discover-link',
      abhaAddress: 'ayesha.ali.9981057765@abdm',
      patientName: 'Dr. Ayesha Ali',
      contextType: 'Prescription',
      detail: 'Chronic Fever Care'
    }, null, 2)
  },
  {
    id: 'hip-link',
    name: 'HIP Confirm Linking',
    method: 'POST',
    url: '/api/abdm/hip',
    description: 'Completes care context linking after patient inputs the SMS-linked authentication OTP.',
    parametersDescription: 'action: "confirm-link", otp: "6-digit OTP", txnId: "transaction ID"',
    defaultPayload: JSON.stringify({ action: 'confirm-link', otp: '123456', txnId: 'simulated-txn-uuid' }, null, 2)
  },
  {
    id: 'consent-request',
    name: 'Consent Manager: Initiate Consent',
    method: 'POST',
    url: '/api/abdm/consent',
    description: 'Initiates a digital consent artifact request to the patient\'s PHR app to request access to clinical records.',
    parametersDescription: 'action: "request-consent", abhaAddress: "address@abdm", purpose: "Medical referral/consultation purpose"',
    defaultPayload: JSON.stringify({ action: 'request-consent', abhaAddress: 'ayesha.ali.9981057765@abdm', purpose: 'Clinical Referral' }, null, 2)
  },
  {
    id: 'consent-fetch',
    name: 'Consent Manager: Decrypt Health Records',
    method: 'POST',
    url: '/api/abdm/consent',
    description: 'Consumes an approved consent artifact, requesting clinical data bundles and decrypting them locally using ECDH Curve25519 and AES-256-GCM (Fidelius compliant).',
    parametersDescription: 'action: "fetch-records", consentId: "approved consent ID"',
    defaultPayload: JSON.stringify({ action: 'fetch-records', consentId: 'AR-990812' }, null, 2)
  },
  {
    id: 'hpr-search',
    name: 'HPR Practitioner Registry Search',
    method: 'POST',
    url: '/api/abdm/hpr',
    description: 'Looks up medical professionals by HPR ID, retrieving NMC registration status and verified credentials.',
    parametersDescription: 'action: "search", hprId: "doctor_id@hpr"',
    defaultPayload: JSON.stringify({ action: 'search', hprId: 'ayesha.ali@hpr' }, null, 2)
  },
  {
    id: 'scan-share',
    name: 'Scan & Share: Demographic Share',
    method: 'POST',
    url: '/api/abdm/scan-share',
    description: 'Fast-tracks OPD check-in. Shares patient profile with a hospital facility code and returns an OPD queue token number.',
    parametersDescription: 'action: "share-profile", abhaAddress: "address@abdm", patientProfile: { name, mobile }, facilityCode: "hospital code"',
    defaultPayload: JSON.stringify({
      action: 'share-profile',
      abhaAddress: 'ayesha.ali.9981057765@abdm',
      patientProfile: { name: 'Dr. Ayesha Ali', mobile: '9981057765' },
      facilityCode: 'IN-HFR-100456'
    }, null, 2)
  },
  {
    id: 'scan-pay',
    name: 'Scan & Share: Process Payment',
    method: 'POST',
    url: '/api/abdm/scan-share',
    description: 'Processes diagnostic or pharmacy billing settlements over the NHA Health UPI network, checking copay eligibility.',
    parametersDescription: 'action: "process-payment", billId: "bill reference ID", paymentAmount: numeric_amount',
    defaultPayload: JSON.stringify({ action: 'process-payment', billId: 'BILL-4091', paymentAmount: 899 }, null, 2)
  },
  {
    id: 'uhi-search',
    name: 'UHI Open Beckn Discovery Search',
    method: 'POST',
    url: '/api/abdm/uhi',
    description: 'Broadcasts a /search call to doctor/facility registries to discover doctors and consultation fees matching search queries.',
    parametersDescription: 'action: "search", searchQuery: "specialty/doctor name"',
    defaultPayload: JSON.stringify({ action: 'search', searchQuery: 'Homeopathy' }, null, 2)
  },
  {
    id: 'uhi-confirm',
    name: 'UHI Open Beckn Confirm Booking',
    method: 'POST',
    url: '/api/abdm/uhi',
    description: 'Confirms a consultation slot, generating a secure telemedicine video meeting link.',
    parametersDescription: 'action: "confirm", bookingContextId: "draft ID", patientDetails: { name }',
    defaultPayload: JSON.stringify({
      action: 'confirm',
      bookingContextId: 'simulated-txn-uuid',
      patientDetails: { name: 'Dr. Ayesha Ali' }
    }, null, 2)
  },
  {
    id: 'nhcx-eligibility',
    name: 'NHCX Coverage Eligibility Check',
    method: 'POST',
    url: '/api/abdm/nhcx',
    description: 'Queries insurance providers via FHIR CoverageEligibilityRequest to verify policy benefits and active status.',
    parametersDescription: 'action: "eligibility-check", abhaAddress: "patient@abdm", policyNumber: "policy reference"',
    defaultPayload: JSON.stringify({
      action: 'eligibility-check',
      abhaAddress: 'ayesha.ali.9981057765@abdm',
      policyNumber: 'STAR-ABHA-77862'
    }, null, 2)
  },
  {
    id: 'nhcx-preauth',
    name: 'NHCX Preauthorization Submit',
    method: 'POST',
    url: '/api/abdm/nhcx',
    description: 'Submits a cashless pre-auth request for hospital procedures. Star Health or other insurers return cashless approvals in real-time.',
    parametersDescription: 'action: "preauth-submit", policyNumber: "policy ID", estimateCost: "numeric_amount", recordsLinked: "clinical evidence"',
    defaultPayload: JSON.stringify({
      action: 'preauth-submit',
      policyNumber: 'STAR-ABHA-77862',
      estimateCost: '20000',
      recordsLinked: 'Prescription - Follow up Fever Care'
    }, null, 2)
  }
];

export default function APIDocsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  
  const [isPageLoading, setIsPageLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const [expandedId, setExpandedId] = useState<string | null>('sessions');
  const [payloads, setPayloads] = useState<Record<string, string>>(
    API_ENDPOINTS.reduce((acc, ep) => ({ ...acc, [ep.id]: ep.defaultPayload }), {})
  );
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const handlePayloadChange = (id: string, value: string) => {
    setPayloads(prev => ({ ...prev, [id]: value }));
  };

  const executeCall = async (ep: APIEndpoint) => {
    setLoadingMap(prev => ({ ...prev, [ep.id]: true }));
    showToast(t('Sending payload to sandbox...'));
    
    try {
      const options: RequestInit = {
        method: ep.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (ep.method === 'POST') {
        // Validate JSON
        try {
          JSON.parse(payloads[ep.id]);
        } catch (e) {
          throw new Error('Invalid JSON format in Request Body editor.');
        }
        options.body = payloads[ep.id];
      }

      const res = await fetch(ep.url, options);
      const data = await res.json();
      
      setResponses(prev => ({ ...prev, [ep.id]: { status: res.status, data } }));
      showToast(t('Response received successfully!'));

      // Log this action to our Audit Logs API
      await fetch('/api/abdm/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: `API Documentation Call: ${ep.name}`,
          status: res.status === 200 ? 'SUCCESS' : 'ERROR',
          details: `Called ${ep.url} with method ${ep.method}. Status: ${res.status}`
        })
      });

    } catch (error: any) {
      console.error(error);
      setResponses(prev => ({ ...prev, [ep.id]: { status: 'ERROR', data: { error: error.message || 'Network request failed' } } }));
      showToast(error.message || t('Request failed. Check credentials.'));
    } finally {
      setLoadingMap(prev => ({ ...prev, [ep.id]: false }));
    }
  };

  if (isPageLoading) {
    return (
      <>
        <section className="route-hero">
          <div className="setu-skeleton setu-skeleton-text" style={{ width: '80px', height: '14px', marginBottom: '8px' }}></div>
          <div className="setu-skeleton setu-skeleton-title" style={{ width: '180px', height: '24px', marginBottom: '8px' }}></div>
          <div className="setu-skeleton setu-skeleton-text" style={{ width: '320px', height: '14px' }}></div>
        </section>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '20px' }}>
          <div className="route-card" style={{ padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div className="setu-skeleton setu-skeleton-title" style={{ width: '150px', height: '18px', marginBottom: '12px' }}></div>
            <div className="setu-skeleton" style={{ width: '100%', height: '80px', borderRadius: '8px' }}></div>
          </div>
        </div>
      </>
    );
  }

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'master_admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '24px' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
          <Lock style={{ width: '48px', height: '48px', color: 'var(--danger)' }} />
        </div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>{t('Access Denied')}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', marginBottom: '24px' }}>
          {t('This section is restricted to Administrator and Super Admin roles. You do not have permissions to access Sandbox API documentation.')}
        </p>
        <button className="prefill-btn active" onClick={() => router.push('/')} style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '12px' }}>
          {t('Back to Dashboard')}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Route Hero Header */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/admin'); }} className="back-link">
          <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
          Admin Panel
        </a>
        <div>
          <p className="eyebrow">DEVELOPER GATEWAY PLAYGROUND</p>
          <h2>{t('ABDM Interactive API Documentation')}</h2>
          <p>{t('Explore endpoints, edit request payloads, and test live calls against the ABDM Milestones sandbox.')}</p>
        </div>
      </section>

      {/* Main Layout */}
      <div className="api-docs-container" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Intro Card */}
        <article className="route-card" style={{ padding: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <Info style={{ width: '22px', height: '22px', color: 'var(--accent-teal)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12.5px', lineHeight: '1.6' }}>
            <strong>ABDM Sandbox Compliance Testing Console</strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              These endpoints execute FHIR-compliant schema checks, Beckn protocol handshakes, and Fidelius encryption routines. All responses simulate the official National Health Authority (NHA) gateway callback behavior. Edit payloads below to review strict schema validations.
            </p>
          </div>
        </article>

        {/* Endpoints Loop */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {API_ENDPOINTS.map(ep => {
            const isOpen = expandedId === ep.id;
            const isLoading = loadingMap[ep.id] || false;
            const res = responses[ep.id];

            return (
              <div 
                key={ep.id} 
                className="route-card" 
                style={{ 
                  overflow: 'hidden', 
                  border: isOpen ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)',
                  boxShadow: isOpen ? 'var(--surface-shadow)' : 'none'
                }}
              >
                {/* Header Row */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : ep.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '16px 20px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span 
                      style={{ 
                        fontSize: '9.5px', 
                        fontWeight: 'bold', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        background: ep.method === 'GET' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(0, 180, 216, 0.15)',
                        color: ep.method === 'GET' ? 'var(--success)' : 'var(--accent-cyan)'
                      }}
                    >
                      {ep.method}
                    </span>
                    <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{ep.name}</strong>
                    <code style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{ep.url}</code>
                  </div>
                  {isOpen ? <ChevronDown style={{ color: 'var(--text-secondary)' }} /> : <ChevronRight style={{ color: 'var(--text-secondary)' }} />}
                </button>

                {/* Expanded Section */}
                {isOpen && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
                    
                    {/* Description */}
                    <div style={{ margin: '16px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {ep.description}
                      <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)' }}>
                        <strong>Payload Parameters:</strong> <code>{ep.parametersDescription}</code>
                      </div>
                    </div>

                    {/* Editor & Response Columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start' }}>
                      
                      {/* Left: Request Body Editor */}
                      {ep.method === 'POST' && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Code style={{ width: '12px', height: '12px' }} />
                              REQUEST BODY (JSON)
                            </span>
                          </div>
                          <textarea
                            value={payloads[ep.id]}
                            onChange={(e) => handlePayloadChange(ep.id, e.target.value)}
                            style={{
                              width: '100%',
                              height: '180px',
                              fontFamily: 'monospace',
                              fontSize: '11.5px',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-primary)',
                              resize: 'vertical',
                              outline: 'none'
                            }}
                          />
                        </div>
                      )}

                      {/* Right: Response Panel */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Terminal style={{ width: '12px', height: '12px' }} />
                            RESPONSE PAYLOAD
                          </span>
                          {res && (
                            <span 
                              style={{ 
                                fontSize: '10px', 
                                fontWeight: 'bold', 
                                color: res.status === 200 ? 'var(--success)' : 'var(--danger)'
                              }}
                            >
                              STATUS: {res.status}
                            </span>
                          )}
                        </div>
                        
                        <div 
                          style={{ 
                            width: '100%', 
                            height: ep.method === 'POST' ? '180px' : '220px', 
                            overflow: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: '#040d16',
                            color: 'var(--accent-teal)',
                          }}
                        >
                          {res ? (
                            <pre style={{ margin: 0 }}>{JSON.stringify(res.data, null, 2)}</pre>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Click "Send Request" to invoke API endpoint...</span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Action Execution Button */}
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => executeCall(ep)}
                        disabled={isLoading}
                        style={{
                          background: isLoading ? 'var(--border-color)' : 'var(--accent-teal)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '10px 20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          boxShadow: '0 8px 20px color-mix(in srgb, var(--accent-teal) 20%, transparent)'
                        }}
                      >
                        <Play style={{ width: '12px', height: '12px', fill: 'currentColor' }} />
                        {isLoading ? 'Executing...' : 'Send Request'}
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </>
  );
}
