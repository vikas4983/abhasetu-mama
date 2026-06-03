'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../providers/LanguageProvider';
import { useAuth } from '../../../providers/AuthProvider';
import {
  ArrowLeft,
  ShieldCheck,
  Building,
  CheckCircle,
  Clock,
  Sparkles,
  Info,
  DollarSign,
  ChevronRight,
  FileCheck,
  Zap,
  Lock,
  Plus,
  CreditCard
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

interface InsurancePlan {
  id: string;
  name: string;
  provider: string;
  monthlyPremium: number;
  csr: string; // Claim Settlement Ratio
  networkHospitals: number;
  coverageAmount: string;
  copay: string;
  features: string[];
}

const INSURANCE_PLANS_DATABASE: InsurancePlan[] = [
  {
    id: 'i1',
    name: 'ReAssure 2.0 Titanium',
    provider: 'Niva Bupa Health Insurance',
    monthlyPremium: 654,
    csr: '96.0%',
    networkHospitals: 8400,
    coverageAmount: '₹10 Lakhs',
    copay: 'No Copay',
    features: ['Unlimited Restore Benefit', 'Free Health Checkup', 'No Room Rent Capping']
  },
  {
    id: 'i2',
    name: 'Care Health Supreme Active',
    provider: 'Care Health Insurance',
    monthlyPremium: 712,
    csr: '95.2%',
    networkHospitals: 9200,
    coverageAmount: '₹10 Lakhs',
    copay: 'No Copay',
    features: ['Opd Consult Cover', 'Global Health coverage', 'Maternity Cover included']
  },
  {
    id: 'i3',
    name: 'Star Health Assure Premium',
    provider: 'Star Health Allied Insurance',
    monthlyPremium: 585,
    csr: '98.0%',
    networkHospitals: 14000,
    coverageAmount: '₹10 Lakhs',
    copay: '10% Copay',
    features: ['Largest Cashless Network', 'Auto Renewal Benefits', 'Ayurvedic treatments covered']
  },
  {
    id: 'i4',
    name: 'Optima Secure Platinum',
    provider: 'HDFC ERGO Health Insurance',
    monthlyPremium: 820,
    csr: '99.1%',
    networkHospitals: 12000,
    coverageAmount: '₹10 Lakhs',
    copay: 'No Copay',
    features: ['Double Coverage from Day 1', 'No Claim Bonus up to 100%', 'Zero Deductibles']
  }
];

export default function InsurancePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { addRecord, logSecurityEvent } = useAuth();

  // Quote input states
  const [coverageTargets, setCoverageTargets] = useState<string[]>(['self']);
  const [oldestMemberAge, setOldestMemberAge] = useState<number>(30);
  const [pinCode, setPinCode] = useState<string>('482001');
  const [preExisting, setPreExisting] = useState<string>('none');
  
  // Portal Flow States
  const [flowState, setFlowState] = useState<'inputs' | 'comparison' | 'checkout' | 'success'>('inputs');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Payment states
  const [paymentOption, setPaymentOption] = useState<'monthly' | 'annual'>('monthly');
  const [upiId, setUpiId] = useState('ananya.verma@okaxis');
  const [isPaying, setIsPaying] = useState(false);

  // Generated policy card information
  const [issuedPolicy, setIssuedPolicy] = useState<any>(null);

  const handleToggleTarget = (target: string) => {
    setCoverageTargets(prev =>
      prev.includes(target) ? prev.filter(t => t !== target) : [...prev, target]
    );
  };

  const handleGenerateQuotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (coverageTargets.length === 0) {
      showToast(t('Please select at least one member.'));
      return;
    }
    if (pinCode.length < 6) {
      showToast(t('Please enter a valid 6-digit Pin Code.'));
      return;
    }

    setFlowState('comparison');
    logSecurityEvent('Insurance Quote Query', `Searched health insurance quotes for age ${oldestMemberAge} in pin code ${pinCode}`);
    showToast(t('Fetching Cashless Networks Quotes...'));
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setFlowState('checkout');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);
    
    // Simulate gateway checkout processing
    setTimeout(() => {
      setIsPaying(false);
      const plan = INSURANCE_PLANS_DATABASE.find(p => p.id === selectedPlanId);
      if (!plan) return;

      const policyNum = `ABHA-INS-${Math.floor(1000000 + Math.random() * 9000000)}`;
      const cardInfo = {
        policyNumber: policyNum,
        planName: plan.name,
        company: plan.provider,
        coverage: plan.coverageAmount,
        membersCount: coverageTargets.length,
        networkHospitals: plan.networkHospitals,
        issueDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      };

      setIssuedPolicy(cardInfo);
      setFlowState('success');
      showToast(t('Cashless policy issued successfully!'));
    }, 1500);
  };

  const handleSyncToLocker = () => {
    if (!issuedPolicy) return;

    addRecord({
      name: `${issuedPolicy.company.split(' ')[0]}_HealthPolicy_${issuedPolicy.policyNumber.substring(9)}.pdf`,
      type: 'DiagnosticReport',
      date: issuedPolicy.issueDate,
      source: issuedPolicy.company
    });

    logSecurityEvent('Insurance Locker Sync', `Linked health policy ${issuedPolicy.policyNumber} from ${issuedPolicy.company} to ABHA Health Locker`);
    showToast(t('Policy Card Synced to Health Locker!'));
  };

  // Billing Math
  const activePlan = INSURANCE_PLANS_DATABASE.find(p => p.id === selectedPlanId);
  const premiumBase = activePlan ? activePlan.monthlyPremium : 0;
  
  // Multiple members modifier: add 50% premium per additional target
  const multiplier = 1 + (coverageTargets.length - 1) * 0.5;
  const rawPremium = Math.round(premiumBase * multiplier);
  
  const paymentAmount = paymentOption === 'monthly' ? rawPremium : rawPremium * 12;
  const gstAmount = Math.round(paymentAmount * 0.18); // 18% GST on insurance premiums
  const totalAmount = paymentAmount + gstAmount;

  return (
    <>
      {/* Route Hero Header */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/more'); }} className="back-link">
          <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
          {t('More Services')}
        </a>
        <div>
          <p className="eyebrow">CASHLESS INSURANCE EXCHANGE</p>
          <h2>{t('Health Insurance Comparison')}</h2>
          <p>{t('Compare NHA compliance policies, search cashless network hospitals, and download policy cards instantly.')}</p>
        </div>
      </section>

      {/* Main Flow Container */}
      <div style={{ marginTop: '20px' }}>
        
        {/* ================= FLOW STEP 1: INITIAL QUOTES FORM ================= */}
        {flowState === 'inputs' && (
          <article className="route-card" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
            <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ShieldCheck style={{ color: 'var(--accent-teal)' }} />
              <h3 style={{ margin: 0 }}>Get Cashless Quotes Instantly</h3>
            </div>

            <form onSubmit={handleGenerateQuotes} style={{ display: 'grid', gap: '16px' }}>
              
              {/* Coverage targets checkboxes */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Select Members to Cover</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
                  {[
                    { id: 'self', label: 'Self' },
                    { id: 'spouse', label: 'Spouse' },
                    { id: 'kids', label: 'Kids' },
                    { id: 'parents', label: 'Parents' }
                  ].map(target => (
                    <label
                      key={target.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        borderRadius: '8px',
                        border: coverageTargets.includes(target.id) ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-color)',
                        background: coverageTargets.includes(target.id) ? 'color-mix(in srgb, var(--accent-teal) 8%, transparent)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      <input type="checkbox" checked={coverageTargets.includes(target.id)} onChange={() => handleToggleTarget(target.id)} />
                      <span>{target.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Age Slider */}
              <div style={{ display: 'grid', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                  <span>Oldest Member Age</span>
                  <span style={{ color: 'var(--accent-teal)' }}>{oldestMemberAge} Years Old</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="75"
                  value={oldestMemberAge}
                  onChange={(e) => setOldestMemberAge(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-teal)' }}
                />
              </div>

              {/* Location Pin code */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '12px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Residential Pincode
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="482001"
                    style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace' }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Pre-existing Illnesses
                  <select value={preExisting} onChange={(e) => setPreExisting(e.target.value)} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    <option value="none">None of these</option>
                    <option value="diabetes">Diabetes or Hypertension</option>
                    <option value="asthma">Asthma or Respiratory</option>
                    <option value="thyroid">Thyroid disorders</option>
                  </select>
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
                  fontSize: '12.5px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '10px'
                }}
              >
                <span>Find Premium Cashless Quotes</span>
                <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>

            </form>
          </article>
        )}

        {/* ================= FLOW STEP 2: COMPARISON MATRIX ================= */}
        {flowState === 'comparison' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Back Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setFlowState('inputs')}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft style={{ width: '12px', height: '12px' }} />
                Edit Parameters
              </button>

              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Covering: <strong>{coverageTargets.join(' + ').toUpperCase()}</strong> | Age: <strong>{oldestMemberAge}</strong>
              </span>
            </div>

            {/* Matrix comparison cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {INSURANCE_PLANS_DATABASE.map(plan => {
                const adjustedMonthly = Math.round(plan.monthlyPremium * multiplier);
                return (
                  <article
                    key={plan.id}
                    className="route-card"
                    style={{
                      padding: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '20px'
                    }}
                  >
                    
                    {/* Policy details */}
                    <div style={{ flex: 2, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', background: 'color-mix(in srgb, var(--accent-teal) 15%, transparent)', color: 'var(--accent-teal)', padding: '2px 8px', borderRadius: '4px' }}>
                          CSR: {plan.csr}
                        </span>
                        <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
                          Sum Insured: {plan.coverageAmount}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '15px', margin: 0, fontWeight: 750, color: 'var(--text-primary)' }}>
                        {plan.name}
                      </h4>
                      
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building style={{ width: '13px', height: '13px' }} />
                        {plan.provider}
                      </span>

                      {/* Key features checklist */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                        {plan.features.map((feat, i) => (
                          <span key={i} style={{ fontSize: '9px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '30px' }}>
                            ✔ {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Matrix comparison stats (hospitals & copay) */}
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }} id="matrix-stats-panel">
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '8.5px', color: 'var(--text-muted)' }}>CASHLESS NETWORK</span>
                        <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{plan.networkHospitals}+</strong>
                        <span style={{ fontSize: '8px', color: 'var(--accent-teal)' }}>Hospitals Map</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '8.5px', color: 'var(--text-muted)' }}>COPAY RATIO</span>
                        <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{plan.copay}</strong>
                      </div>
                    </div>

                    {/* Premium cost / Buy button */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '130px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', justifyContent: 'flex-end' }}>
                          <strong style={{ fontSize: '20px', color: 'var(--accent-teal)' }}>₹{adjustedMonthly}</strong>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/mo</span>
                        </div>
                        <span style={{ fontSize: '8.5px', color: 'var(--text-muted)' }}>Plus 18% GST (ABDM ready)</span>
                      </div>

                      <button
                        onClick={() => handleSelectPlan(plan.id)}
                        style={{
                          background: 'var(--accent-teal)',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 18px',
                          borderRadius: '30px',
                          fontSize: '11.5px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          width: '130px',
                          textAlign: 'center'
                        }}
                      >
                        Buy Policy
                      </button>
                    </div>

                  </article>
                );
              })}
            </div>

          </div>
        )}

        {/* ================= FLOW STEP 3: PAYMENT CHECKOUT ================= */}
        {flowState === 'checkout' && activePlan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px', margin: '0 auto' }}>
            
            {/* Back to comparison */}
            <button
              onClick={() => setFlowState('comparison')}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                width: 'fit-content'
              }}
            >
              <ArrowLeft style={{ width: '12px', height: '12px' }} />
              Back to Comparison
            </button>

            <article className="route-card" style={{ padding: '24px' }}>
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <CreditCard style={{ color: 'var(--accent-teal)' }} />
                <h3 style={{ margin: 0 }}>Cashless Premium Settlement</h3>
              </div>

              {/* Policy summary box */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SELECTED POLICY TARGET</span>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{activePlan.name}</strong>
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Company: {activePlan.provider}</span>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>Sum Insured: <strong>{activePlan.coverageAmount}</strong></span>
                  <span>•</span>
                  <span>Oldest Member: <strong>{oldestMemberAge} Yrs</strong></span>
                </div>
              </div>

              {/* Choose Payment Term */}
              <form onSubmit={handlePaymentSubmit} style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Choose Premium Schedule</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-primary)', border: paymentOption === 'monthly' ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input type="radio" checked={paymentOption === 'monthly'} onChange={() => setPaymentOption('monthly')} />
                      <div>
                        <strong style={{ fontSize: '12px', display: 'block' }}>Monthly Plan</strong>
                        <span style={{ fontSize: '10px', color: 'var(--accent-teal)' }}>₹{rawPremium} / month</span>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-primary)', border: paymentOption === 'annual' ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input type="radio" checked={paymentOption === 'annual'} onChange={() => setPaymentOption('annual')} />
                      <div>
                        <strong style={{ fontSize: '12px', display: 'block' }}>Annual Plan (Save 5%)</strong>
                        <span style={{ fontSize: '10px', color: 'var(--accent-teal)' }}>₹{rawPremium * 12} / year</span>
                      </div>
                    </label>

                  </div>
                </div>

                {/* Instant UPI Address form */}
                <label style={{ display: 'grid', gap: '4px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  Pay via secure UPI ID
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace' }}
                  />
                </label>

                {/* Billing Summary cost box */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Insurance Term Cost ({paymentOption.toUpperCase()})</span>
                    <span>₹{paymentAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Healthcare GST (18%)</span>
                    <span>₹{gstAmount}</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '13.5px' }}>
                    <span>Settlement Total</span>
                    <span style={{ color: 'var(--accent-teal)' }}>₹{totalAmount}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPaying}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--accent-teal)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: isPaying ? 0.7 : 1
                  }}
                >
                  <Lock style={{ width: '13px', height: '13px' }} />
                  <span>{isPaying ? 'Processing Secure Sandbox payment...' : `Authorize Cashless Premium payment (₹${totalAmount})`}</span>
                </button>

              </form>
            </article>
          </div>
        )}

        {/* ================= FLOW STEP 4: SUCCESS HEALTH CARD DETAILS ================= */}
        {flowState === 'success' && issuedPolicy && (
          <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'color-mix(in srgb, var(--accent-teal) 15%, transparent)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                <CheckCircle style={{ width: '28px', height: '28px' }} />
              </div>
              <h3 style={{ fontSize: '18px', margin: '0 0 4px' }}>Cashless Policy Issued!</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Your national digital health insurance policy has been linked to your ABHA profile card.
              </p>
            </div>

            {/* AESTHETIC GLASSMORPHIC POLICY CARD (PolicyBazaar styled) */}
            <div 
              style={{
                background: 'linear-gradient(135deg, #0f1c3f 0%, #03081e 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '1.5px solid rgba(255,255,255,0.08)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              
              {/* Card Watermark */}
              <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '140px', fontWeight: 'bold', color: 'rgba(255,255,255,0.02)', pointerEvents: 'none', userSelect: 'none', fontFamily: 'monospace' }}>
                NHA
              </div>

              {/* Top Row: Provider & Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '13.5px', margin: 0, fontWeight: '800', color: '#00ffcc' }}>{issuedPolicy.company}</h4>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)' }}>NHA Smart Registry Partner</span>
                </div>
                
                <span style={{ fontSize: '8px', background: 'rgba(0, 255, 204, 0.12)', color: '#00ffcc', border: '1px solid #00ffcc', borderRadius: '4px', padding: '3px 8px', fontWeight: 'bold' }}>
                  CASHLESS ACTIVE
                </span>
              </div>

              {/* Middle Row: Policy Number & Cover */}
              <div style={{ marginTop: '4px' }}>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Secure Policy Identifier</span>
                <div style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff', margin: '2px 0', letterSpacing: '1px' }}>
                  {issuedPolicy.policyNumber}
                </div>
              </div>

              {/* Bottom details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', marginTop: '4px' }}>
                <div>
                  <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Sum Insured Cover</span>
                  <strong style={{ fontSize: '13px', display: 'block', color: '#ffffff' }}>{issuedPolicy.coverage}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Insured Members</span>
                  <strong style={{ fontSize: '13px', display: 'block', color: '#ffffff' }}>{issuedPolicy.membersCount} Covered</strong>
                </div>
                <div>
                  <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Issued Date</span>
                  <span style={{ fontSize: '11.5px', display: 'block', color: 'rgba(255,255,255,0.85)' }}>{issuedPolicy.issueDate}</span>
                </div>
                <div>
                  <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Cashless Hospitals</span>
                  <span style={{ fontSize: '11.5px', display: 'block', color: 'rgba(255,255,255,0.85)' }}>{issuedPolicy.networkHospitals}+ Clinics</span>
                </div>
              </div>

            </div>

            {/* Action buttons (Sync to locker / return) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleSyncToLocker}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--accent-teal)',
                  color: 'var(--accent-teal)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <FileCheck style={{ width: '14px', height: '14px' }} />
                <span>Link Card to ABHA Health Locker</span>
              </button>

              <button
                onClick={() => {
                  setFlowState('inputs');
                  setSelectedPlanId(null);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--accent-teal)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>

          </div>
        )}

      </div>
    </>
  );
}
