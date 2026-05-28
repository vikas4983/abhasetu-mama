'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import {
  Activity,
  HeartPulse,
  Droplet,
  Award,
  ClipboardCheck,
  BrainCircuit,
  ArrowLeft
} from 'lucide-react';
import EcgCanvas from '../../../components/features/ecg-visualizer/EcgCanvas';
import { showToast } from '../../../utils/toast';

export default function HealthPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { logSecurityEvent } = useAuth();

  // Water intake state
  const [water, setWater] = useState(1200);
  const targetWater = 2500;

  // Cardiovascular Risk Calculator state
  const [age, setAge] = useState('young');
  const [bp, setBp] = useState('normal');
  const [smoker, setSmoker] = useState('no');
  const [diabetes, setDiabetes] = useState('no');
  const [riskResult, setRiskResult] = useState<{ score: number; text: string; color: string } | null>(null);

  const logWaterIntake = (amount: number) => {
    setWater((prev) => {
      const next = Math.min(prev + amount, targetWater);
      logSecurityEvent('Water Logged', `Logged ${amount}ml water intake (Total: ${next}ml)`);
      showToast(t(`Logged ${amount}ml of water intake! Vitals stabilized.`));
      return next;
    });
  };

  const calculateRisk = () => {
    let riskScore = 5;
    if (age === 'middle') riskScore += 10;
    else if (age === 'senior') riskScore += 25;

    if (bp === 'pre') riskScore += 8;
    else if (bp === 'high') riskScore += 18;

    if (smoker === 'yes') riskScore += 15;
    if (diabetes === 'yes') riskScore += 12;

    let riskText = 'Low Risk';
    let riskColor = 'var(--accent-teal)';

    if (riskScore > 35) {
      riskText = 'HIGH RISK (Consult Specialist)';
      riskColor = 'var(--danger)';
    } else if (riskScore > 15) {
      riskText = 'Moderate Risk (Regular Checkups)';
      riskColor = '#f59e0b';
    }

    setRiskResult({ score: riskScore, text: riskText, color: riskColor });
    logSecurityEvent('Risk Calculation', `Calculated Ayushman Bharat Cardiovascular risk percentage as ${riskScore}%`);
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
          <p className="eyebrow">ABHA SETU</p>
          <h2>{t('Health Dashboard')}</h2>
          <p>{t('Monitor your live vital telemetry and clinical signals.')}</p>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="route-grid metrics-grid" style={{ marginTop: '20px' }}>
        <article className="metric-card">
          <Activity className="card-icon" style={{ color: 'var(--accent-teal)' }} />
          <span>Blood Pressure</span>
          <strong>120/80</strong>
          <small>mmHg - Stable</small>
        </article>
        <article className="metric-card">
          <HeartPulse className="card-icon" style={{ color: 'var(--danger)' }} />
          <span>SpO2 (Pulse)</span>
          <strong>98%</strong>
          <small>Normal range</small>
        </article>
        <article className="metric-card">
          <Droplet className="card-icon" style={{ color: 'var(--accent-cyan)' }} />
          <span>Blood Glucose</span>
          <strong>96</strong>
          <small>mg/dL - Fasting</small>
        </article>
        <article className="metric-card">
          <Award className="card-icon" style={{ color: '#f59e0b' }} />
          <span>Wellness Score</span>
          <strong>84/100</strong>
          <small>Highly active</small>
        </article>
      </section>

      {/* Real-time animated ECG */}
      <article className="route-card wide-card" style={{ marginTop: '16px', padding: '16px' }}>
        <div className="card-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HeartPulse style={{ color: 'var(--danger)' }} />
            <h3 style={{ margin: 0 }}>Live Electrocardiogram (ECG) Signals</h3>
          </div>
          <span className="live-badge"><span className="live-dot"></span> Active Link</span>
        </div>
        <div style={{ height: '60px', borderRadius: '8px', marginTop: '12px', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
          <EcgCanvas />
        </div>
      </article>

      {/* Vitals Progress & Hydration Logger */}
      <section className="route-grid two-col" style={{ marginTop: '16px', gap: '20px' }}>
        <article className="route-card">
          <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ClipboardCheck style={{ color: 'var(--accent-teal)' }} />
            <h3 style={{ margin: 0 }}>Interactive Vitals Tracker</h3>
          </div>
          {/* Steps */}
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
              <span>Daily Steps Progress</span>
              <strong>6,420 / 10,000 steps</strong>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '64.2%', height: '100%', background: 'var(--accent-teal)' }}></div>
            </div>
          </div>
          {/* Calories */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
              <span>Active Calories</span>
              <strong>420 / 600 kcal</strong>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '70%', height: '100%', background: '#f59e0b' }}></div>
            </div>
          </div>
          {/* Water Logger */}
          <div className="water-logger-container" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '10px', background: 'var(--bg-secondary)' }}>
            <div className="water-tank" style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--accent-teal)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                className="water-wave"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${(water / targetWater) * 100}%`,
                  background: 'rgba(0, 212, 170, 0.25)',
                  transition: 'height 0.5s ease',
                  width: '100%',
                }}
              ></div>
              <div className="water-text" style={{ zIndex: 10, fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{water}ml</div>
            </div>
            <div>
              <h4 style={{ fontSize: '13px', margin: '0 0 2px' }}>Hydration Logger</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '3px 0 8px' }}>Target: 2500ml (Vitals stabilization nudge)</p>
              <button className="prefill-btn" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => logWaterIntake(250)}>+ 250ml Water</button>
            </div>
          </div>
        </article>

        {/* AI Health Alerts */}
        <article className="route-card">
          <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <BrainCircuit style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ margin: 0 }}>AI Health Alerts & Nudges</h3>
          </div>
          <ul style={{ paddingLeft: '20px', fontSize: '12px', lineHeight: '1.8', color: 'var(--text-secondary)', margin: 0 }}>
            <li>Vitals sync verified: 4/4 connected devices synced perfectly.</li>
            <li>Sleep regularity is stable for 7 consecutive days.</li>
            <li>Alert: Hydration lower than week median. Nudge sent.</li>
          </ul>
        </article>
      </section>

      {/* Cardiovascular Risk Calculator */}
      <article className="route-card wide-card" style={{ marginTop: '16px' }}>
        <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <HeartPulse style={{ color: 'var(--accent-teal)' }} />
          <h3 style={{ margin: 0 }}>Ayushman Bharat AI Cardiovascular Risk Calculator</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px', marginTop: 0 }}>
          Assess cardiovascular risk using simulated biometric variables and lifestyle indicators under ABDM clinical guidelines.
        </p>
        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div style={{ display: 'grid', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Age Group</label>
            <select
              value={age}
              onChange={(e) => setAge(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px' }}
            >
              <option value="young">18 - 39 years</option>
              <option value="middle">40 - 59 years</option>
              <option value="senior">60+ years</option>
            </select>
          </div>
          <div style={{ display: 'grid', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Systolic BP</label>
            <select
              value={bp}
              onChange={(e) => setBp(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px' }}
            >
              <option value="normal">Normal (&lt; 120 mmHg)</option>
              <option value="pre">Prehypertension (120-139)</option>
              <option value="high">Hypertension (140+)</option>
            </select>
          </div>
          <div style={{ display: 'grid', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Lifestyle / Smoker Status</label>
            <select
              value={smoker}
              onChange={(e) => setSmoker(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px' }}
            >
              <option value="no">Non-smoker</option>
              <option value="yes">Active Smoker</option>
            </select>
          </div>
          <div style={{ display: 'grid', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Diabetes Status</label>
            <select
              value={diabetes}
              onChange={(e) => setDiabetes(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px' }}
            >
              <option value="no">Non-Diabetic</option>
              <option value="yes">Diabetic</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button className="join-btn" onClick={calculateRisk} style={{ marginTop: 0 }}>Run AI Risk Analysis</button>
          {riskResult && (
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
              Cardiovascular Risk Score:{' '}
              <span style={{ color: riskResult.color }}>
                {riskResult.score}% - {t(riskResult.text)}
              </span>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
