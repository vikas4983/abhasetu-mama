'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowLeft,
  Moon,
  Thermometer,
  Wind,
  Heart,
  TrendingUp
} from 'lucide-react';
import EcgCanvas from '../../../components/features/ecg-visualizer/EcgCanvas';
import { showToast } from '../../../utils/toast';

export default function HealthPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { logSecurityEvent } = useAuth();

  const [iconStyle, setIconStyle] = useState<'glassmorphic' | '3d-gradient' | 'minimalist'>('glassmorphic');

  useEffect(() => {
    const checkState = () => {
      try {
        const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
        if (state.iconStyle) {
          setIconStyle(state.iconStyle);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkState();
    window.addEventListener('storage', checkState);
    window.addEventListener('setu_state_update', checkState);
    return () => {
      window.removeEventListener('storage', checkState);
      window.removeEventListener('setu_state_update', checkState);
    };
  }, []);

  const getIconConfig = (style: string, color3d: string, shadow3d: string) => {
    if (style === '3d-gradient') {
      return {
        className: 'quick-icon-3d',
        style: {
          background: color3d,
          boxShadow: shadow3d
        }
      };
    } else if (style === 'minimalist') {
      return {
        className: 'quick-icon-minimal',
        style: {}
      };
    } else {
      return {
        className: 'quick-icon-glass',
        style: {}
      };
    }
  };

  // Water intake state
  const [water, setWater] = useState(1200);
  const targetWater = 2500;

  // Cardiovascular Risk Calculator state
  const [age, setAge] = useState('young');
  const [bp, setBp] = useState('normal');
  const [smoker, setSmoker] = useState('no');
  const [diabetes, setDiabetes] = useState('no');
  const [riskResult, setRiskResult] = useState<{ score: number; text: string; color: string } | null>(null);

  // Health Calculators state
  const [calcTab, setCalcTab] = useState<'bmi' | 'bmr' | 'calorie' | 'bodyfat'>('bmi');
  const [weightInput, setWeightInput] = useState(70);
  const [heightInput, setHeightInput] = useState(175);
  const [ageInput, setAgeInput] = useState(30);
  const [genderInput, setGenderInput] = useState<'male' | 'female'>('male');
  const [activityInput, setActivityInput] = useState('moderate');
  const [waistInput, setWaistInput] = useState(85);
  const [neckInput, setNeckInput] = useState(38);
  const [hipInput, setHipInput] = useState(95);

  const [bmiResult, setBmiResult] = useState<{ value: number; category: string; color: string } | null>(null);
  const [bmrResult, setBmrResult] = useState<number | null>(null);
  const [calorieResult, setCalorieResult] = useState<{ maintenance: number; loss: number; gain: number } | null>(null);
  const [bodyFatResult, setBodyFatResult] = useState<{ value: number; category: string; color: string } | null>(null);

  useEffect(() => {
    // 1. BMI Calculation
    const bmiVal = weightInput / Math.pow(heightInput / 100, 2);
    let bmiCat = 'Normal Weight';
    let bmiColor = 'var(--accent-teal)';
    if (bmiVal < 18.5) {
      bmiCat = 'Underweight';
      bmiColor = 'var(--accent-cyan)';
    } else if (bmiVal >= 25 && bmiVal < 30) {
      bmiCat = 'Overweight';
      bmiColor = '#fa7a19';
    } else if (bmiVal >= 30) {
      bmiCat = 'Obese';
      bmiColor = 'var(--danger)';
    }
    setBmiResult({ value: Number(bmiVal.toFixed(1)), category: bmiCat, color: bmiColor });

    // 2. BMR Calculation (Harris-Benedict Equation)
    let bmrVal = 0;
    if (genderInput === 'male') {
      bmrVal = 88.362 + (13.397 * weightInput) + (4.799 * heightInput) - (5.677 * ageInput);
    } else {
      bmrVal = 447.593 + (9.247 * weightInput) + (3.098 * heightInput) - (4.330 * ageInput);
    }
    setBmrResult(Math.round(bmrVal));

    // 3. Daily Calories (TDEE) Calculation
    let multiplier = 1.55;
    if (activityInput === 'sedentary') multiplier = 1.2;
    else if (activityInput === 'light') multiplier = 1.375;
    else if (activityInput === 'moderate') multiplier = 1.55;
    else if (activityInput === 'active') multiplier = 1.725;
    else if (activityInput === 'extra') multiplier = 1.9;

    const maintenance = Math.round(bmrVal * multiplier);
    setCalorieResult({
      maintenance,
      loss: Math.max(1200, maintenance - 500),
      gain: maintenance + 500
    });

    // 4. Body Fat Percentage (US Navy Circumference formula)
    try {
      let bfVal = 0;
      if (genderInput === 'male') {
        const diff = waistInput - neckInput;
        if (diff > 0 && heightInput > 0) {
          bfVal = 86.010 * Math.log10(diff) - 70.041 * Math.log10(heightInput) + 36.76;
        }
      } else {
        const sum = waistInput + hipInput - neckInput;
        if (sum > 0 && heightInput > 0) {
          bfVal = 163.205 * Math.log10(sum) - 97.684 * Math.log10(heightInput) - 78.387;
        }
      }

      if (bfVal > 2 && bfVal < 60) {
        let bfCat = 'Average';
        let bfColor = 'var(--accent-teal)';
        
        if (genderInput === 'male') {
          if (bfVal < 6) { bfCat = 'Essential Fat'; bfColor = 'var(--accent-cyan)'; }
          else if (bfVal < 14) { bfCat = 'Athletes'; bfColor = 'var(--accent-teal)'; }
          else if (bfVal < 18) { bfCat = 'Fitness'; bfColor = 'var(--accent-teal)'; }
          else if (bfVal < 25) { bfCat = 'Average'; bfColor = '#fa7a19'; }
          else { bfCat = 'Obese'; bfColor = 'var(--danger)'; }
        } else {
          if (bfVal < 14) { bfCat = 'Essential Fat'; bfColor = 'var(--accent-cyan)'; }
          else if (bfVal < 21) { bfCat = 'Athletes'; bfColor = 'var(--accent-teal)'; }
          else if (bfVal < 25) { bfCat = 'Fitness'; bfColor = 'var(--accent-teal)'; }
          else if (bfVal < 32) { bfCat = 'Average'; bfColor = '#fa7a19'; }
          else { bfCat = 'Obese'; bfColor = 'var(--danger)'; }
        }
        
        setBodyFatResult({ value: Number(bfVal.toFixed(1)), category: bfCat, color: bfColor });
      } else {
        setBodyFatResult(null);
      }
    } catch (e) {
      setBodyFatResult(null);
    }
  }, [weightInput, heightInput, ageInput, genderInput, activityInput, waistInput, neckInput, hipInput]);

  // Active trend chart variables
  const [activeTrend, setActiveTrend] = useState<'hr' | 'spo2' | 'glucose' | 'bp'>('hr');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const trendData: Record<string, { label: string; values: number[]; dates: string[]; unit: string; color: string; min: number; max: number }> = {
    hr: {
      label: 'Heart Rate',
      values: [68, 72, 75, 70, 74, 71, 72],
      dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      unit: 'BPM',
      color: '#ef4444',
      min: 60,
      max: 85
    },
    spo2: {
      label: 'SpO2 Level',
      values: [97, 98, 98, 97, 99, 98, 98],
      dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      unit: '%',
      color: 'var(--accent-teal)',
      min: 94,
      max: 100
    },
    glucose: {
      label: 'Blood Glucose',
      values: [92, 96, 105, 94, 98, 95, 96],
      dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      unit: 'mg/dL',
      color: 'var(--accent-cyan)',
      min: 80,
      max: 120
    },
    bp: {
      label: 'Systolic BP',
      values: [116, 120, 124, 118, 121, 120, 119],
      dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      unit: 'mmHg',
      color: '#fa7a19',
      min: 110,
      max: 130
    }
  };

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

  // SVG dimensions for trend chart
  const width = 500;
  const height = 200;
  const paddingX = 45;
  const paddingY = 30;

  const currentTrend = trendData[activeTrend];
  
  // Project data points to SVG coordinate systems
  const points = currentTrend.values.map((val, idx) => {
    const x = paddingX + (idx / (currentTrend.values.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((val - currentTrend.min) / (currentTrend.max - currentTrend.min)) * (height - 2 * paddingY);
    return { x, y, value: val, date: currentTrend.dates[idx] };
  });

  // Construct SVG Bezier Curve path string for smooth visual transition
  const pathD = points.reduce((acc, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    const prev = points[idx - 1];
    // Smooth control points
    const cpX1 = prev.x + 25;
    const cpY1 = prev.y;
    const cpX2 = p.x - 25;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, '');

  // Fill path beneath trend line for glowing linear backdrop
  const fillD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

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

      <section className="route-grid metrics-grid" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '12px' }}>
        <article className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTrend('bp')}>
          <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)', '0 4px 14px rgba(0, 180, 216, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)', '0 4px 14px rgba(0, 180, 216, 0.4)').style}>
            <Activity />
          </div>
          <span>Blood Pressure</span>
          <strong>120/80</strong>
          <small>mmHg - Stable</small>
        </article>
        <article className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTrend('spo2')}>
          <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #ff4d6d 0%, #c9184a 100%)', '0 4px 14px rgba(255, 77, 109, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #ff4d6d 0%, #c9184a 100%)', '0 4px 14px rgba(255, 77, 109, 0.4)').style}>
            <HeartPulse />
          </div>
          <span>SpO2 (Pulse)</span>
          <strong>98%</strong>
          <small>Normal range</small>
        </article>
        <article className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTrend('glucose')}>
          <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #f77f00 0%, #d62828 100%)', '0 4px 14px rgba(247, 127, 0, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #f77f00 0%, #d62828 100%)', '0 4px 14px rgba(247, 127, 0, 0.4)').style}>
            <Droplet />
          </div>
          <span>Blood Glucose</span>
          <strong>96</strong>
          <small>mg/dL - Fasting</small>
        </article>
        <article className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTrend('hr')}>
          <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #ef233c 0%, #d90429 100%)', '0 4px 14px rgba(239, 35, 60, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #ef233c 0%, #d90429 100%)', '0 4px 14px rgba(239, 35, 60, 0.4)').style}>
            <Heart />
          </div>
          <span>Heart Rate</span>
          <strong>72</strong>
          <small>BPM - Normal</small>
        </article>
        
        {/* NEW VITAL: Sleep Cycle */}
        <article className="metric-card">
          <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #8338ec 0%, #3a0ca3 100%)', '0 4px 14px rgba(131, 56, 236, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #8338ec 0%, #3a0ca3 100%)', '0 4px 14px rgba(131, 56, 236, 0.4)').style}>
            <Moon />
          </div>
          <span>Sleep Cycle</span>
          <strong>7.8 hrs</strong>
          <small>Deep: 2.2 hrs</small>
        </article>

        {/* NEW VITAL: Body Temperature */}
        <article className="metric-card">
          <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #fa7a19 0%, #d66025 100%)', '0 4px 14px rgba(250, 122, 25, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #fa7a19 0%, #d66025 100%)', '0 4px 14px rgba(250, 122, 25, 0.4)').style}>
            <Thermometer />
          </div>
          <span>Body Temp</span>
          <strong>98.4 °F</strong>
          <small>Stable / Normal</small>
        </article>

        {/* NEW VITAL: Respiratory Rate */}
        <article className="metric-card">
          <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #00d4aa 0%, #009688 100%)', '0 4px 14px color-mix(in srgb, var(--accent-teal) 40%, transparent)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #00d4aa 0%, #009688 100%)', '0 4px 14px color-mix(in srgb, var(--accent-teal) 40%, transparent)').style}>
            <Wind />
          </div>
          <span>Respiration</span>
          <strong>16 /min</strong>
          <small>Breaths - Normal</small>
        </article>

        {/* NEW VITAL: Heart Rate Variability */}
        <article className="metric-card">
          <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #ff70a6 0%, #ff9770 100%)', '0 4px 14px rgba(255, 112, 166, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #ff70a6 0%, #ff9770 100%)', '0 4px 14px rgba(255, 112, 166, 0.4)').style}>
            <Award />
          </div>
          <span>HRV index</span>
          <strong>58 ms</strong>
          <small>Excellent / Active</small>
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

      {/* ==================== HIGH-FIDELITY ANIMATED VITAL TRENDS CHART ==================== */}
      <article className="route-card wide-card" style={{ marginTop: '16px', padding: '20px' }}>
        <div className="card-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp style={{ color: 'var(--accent-teal)' }} />
            <h3 style={{ margin: 0 }}>Interactive Vital Trends & Historical Analytics</h3>
          </div>
          
          {/* Trend tab toggles */}
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '4px' }}>
            {(['hr', 'spo2', 'glucose', 'bp'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTrend(tab);
                  setHoveredIdx(null);
                  logSecurityEvent('Vital Chart Toggled', `Switched telemetry analytics trend chart to ${trendData[tab].label}`);
                }}
                className={`chart-tab-btn ${activeTrend === tab ? 'active' : ''}`}
                style={{
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 750,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {trendData[tab].label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '0 0 20px', lineHeight: '1.5' }}>
          Track live telemetry indices from synced smart wearables and Health ATM checks. Hover over data nodes to query clinical values.
        </p>

        {/* Responsive Custom SVG Canvas Chart */}
        <div style={{ position: 'relative', width: '100%', overflowX: 'auto', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px' }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: '100%', minWidth: '450px', height: 'auto', display: 'block', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={currentTrend.color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={currentTrend.color} stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Coordinate Grid Lines */}
            {[0, 1, 2, 3, 4].map((i) => {
              const y = paddingY + (i / 4) * (height - 2 * paddingY);
              const gridVal = currentTrend.max - (i / 4) * (currentTrend.max - currentTrend.min);
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="var(--border-color)"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    opacity="0.15"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 3}
                    textAnchor="end"
                    fill="var(--text-secondary)"
                    fontSize="9.5"
                    fontWeight="600"
                    fontFamily="monospace"
                    opacity="0.9"
                  >
                    {Math.round(gridVal)}
                  </text>
                </g>
              );
            })}

            {/* Glowing fill region under the line */}
            <path
              d={fillD}
              fill="url(#chartGrad)"
              style={{ transition: 'd 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />

            {/* Glowing active trend line */}
            <path
              d={pathD}
              fill="none"
              stroke={currentTrend.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: 'd 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                filter: `drop-shadow(0 4px 6px ${currentTrend.color})`
              }}
            />

            {/* Active Vertical Guideline Tracker */}
            {hoveredIdx !== null && points[hoveredIdx] && (
              <line
                x1={points[hoveredIdx].x}
                y1={paddingY}
                x2={points[hoveredIdx].x}
                y2={height - paddingY}
                stroke={currentTrend.color}
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.7"
              />
            )}

            {/* Interactive Data Circle Points */}
            {points.map((p, idx) => (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Large transparent hit target for easy mobile touch */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="14"
                  fill="transparent"
                />
                
                {/* Glow ring */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIdx === idx ? "8" : "5"}
                  fill={currentTrend.color}
                  opacity={hoveredIdx === idx ? "0.4" : "0.15"}
                  style={{ transition: 'all 0.15s ease' }}
                />

                {/* Core point */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIdx === idx ? "4.5" : "3.5"}
                  fill="var(--text-primary)"
                  stroke={currentTrend.color}
                  strokeWidth="2"
                  style={{ transition: 'all 0.15s ease' }}
                />

                {/* X axis dates */}
                <text
                  x={p.x}
                  y={height - 8}
                  textAnchor="middle"
                  fill={hoveredIdx === idx ? "var(--accent-teal)" : "var(--text-muted)"}
                  fontSize="9.5"
                  fontWeight={hoveredIdx === idx ? "800" : "normal"}
                  style={{ transition: 'all 0.15s ease' }}
                >
                  {p.date}
                </text>
              </g>
            ))}
          </svg>

          {/* Glowing dynamic floating tooltip box */}
          {hoveredIdx !== null && points[hoveredIdx] && (
            <div
              style={{
                position: 'absolute',
                top: points[hoveredIdx].y < 65 ? `${points[hoveredIdx].y + 15}px` : `${points[hoveredIdx].y - 55}px`,
                left: `${Math.min(Math.max(points[hoveredIdx].x - 60, 10), width - 130)}px`,
                background: 'var(--bg-card)',
                border: `1.5px solid ${currentTrend.color}`,
                borderRadius: '8px',
                padding: '6px 10px',
                boxShadow: 'var(--surface-shadow)',
                fontSize: '11px',
                zIndex: 10,
                pointerEvents: 'none',
                animation: 'scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase' }}>{points[hoveredIdx].date} status</div>
              <div style={{ fontWeight: 850, color: 'var(--text-primary)', marginTop: '2px' }}>
                {points[hoveredIdx].value} <span style={{ color: currentTrend.color, fontSize: '10px' }}>{currentTrend.unit}</span>
              </div>
            </div>
          )}
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
                  background: 'color-mix(in srgb, var(--accent-teal) 25%, transparent)',
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

      {/* ==================== INTERACTIVE HEALTH CALCULATORS SECTION ==================== */}
      <article className="route-card wide-card" style={{ marginTop: '16px', padding: '20px' }}>
        <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Activity style={{ color: 'var(--accent-teal)' }} />
          <h3 style={{ margin: 0 }}>Interactive Health & Vital Calculators</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '20px', marginTop: 0 }}>
          Calculate core health indices instantly. All metrics are processed locally under ABDM data privacy guidelines.
        </p>

        {/* Tab Buttons for Calculators */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {(['bmi', 'bmr', 'calorie', 'bodyfat'] as const).map((tab) => {
            let label = 'BMI Calculator';
            if (tab === 'bmr') label = 'BMR Calculator';
            if (tab === 'calorie') label = 'Daily Calories';
            if (tab === 'bodyfat') label = 'Body Fat %';

            return (
              <button
                key={tab}
                onClick={() => setCalcTab(tab)}
                className={`chart-tab-btn ${calcTab === tab ? 'active' : ''}`}
                style={{
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 750,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: '1 1 auto',
                  textAlign: 'center'
                }}
              >
                {t(label)}
              </button>
            );
          })}
        </div>

        {/* Dynamic Calculator Content */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', alignItems: 'start' }}>
          {/* LEFT COLUMN: INPUTS */}
          <div style={{ display: 'grid', gap: '16px', padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 800 }}>Biometric Inputs</h4>
            
            {/* Common Inputs: Weight, Height */}
            <div style={{ display: 'grid', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <label htmlFor="weight-input">Weight (भार)</label>
                <strong>{weightInput} kg</strong>
              </div>
              <input
                id="weight-input"
                type="range"
                min="30"
                max="180"
                value={weightInput}
                onChange={(e) => setWeightInput(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-teal)' }}
                aria-label="Weight in kilograms"
                aria-valuemin={30}
                aria-valuemax={180}
                aria-valuenow={weightInput}
              />
            </div>

            <div style={{ display: 'grid', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <label htmlFor="height-input">Height (ऊंचाई)</label>
                <strong>{heightInput} cm</strong>
              </div>
              <input
                id="height-input"
                type="range"
                min="100"
                max="230"
                value={heightInput}
                onChange={(e) => setHeightInput(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-teal)' }}
                aria-label="Height in centimeters"
                aria-valuemin={100}
                aria-valuemax={230}
                aria-valuenow={heightInput}
              />
            </div>

            {/* BMR, Calorie, and Body Fat inputs: Age and Gender */}
            {(calcTab === 'bmr' || calcTab === 'calorie' || calcTab === 'bodyfat') && (
              <>
                <div style={{ display: 'grid', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <label>Age (आयु)</label>
                    <strong>{ageInput} years</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={ageInput}
                    onChange={(e) => setAgeInput(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-teal)' }}
                  />
                </div>

                <div style={{ display: 'grid', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Gender (लिंग)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className={`prefill-btn ${genderInput === 'male' ? 'selected-card' : ''}`}
                      onClick={() => setGenderInput('male')}
                      style={{ flex: 1, padding: '8px 10px', fontSize: '11px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                    >
                      Male
                    </button>
                    <button
                      className={`prefill-btn ${genderInput === 'female' ? 'selected-card' : ''}`}
                      onClick={() => setGenderInput('female')}
                      style={{ flex: 1, padding: '8px 10px', fontSize: '11px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                    >
                      Female
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Calorie activity level input */}
            {calcTab === 'calorie' && (
              <div style={{ display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Daily Activity Level</label>
                <select
                  value={activityInput}
                  onChange={(e) => setActivityInput(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12px' }}
                >
                  <option value="sedentary">Sedentary (No exercise)</option>
                  <option value="light">Lightly Active (1-3 days/week)</option>
                  <option value="moderate">Moderately Active (3-5 days/week)</option>
                  <option value="active">Very Active (6-7 days/week)</option>
                  <option value="extra">Extra Active (Athlete/Physical job)</option>
                </select>
              </div>
            )}

            {/* Body Fat specific circumference inputs */}
            {calcTab === 'bodyfat' && (
              <>
                <div style={{ display: 'grid', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <label>Waist Circumference (कमर)</label>
                    <strong>{waistInput} cm</strong>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="160"
                    value={waistInput}
                    onChange={(e) => setWaistInput(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-teal)' }}
                  />
                </div>

                <div style={{ display: 'grid', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <label>Neck Circumference (गर्दन)</label>
                    <strong>{neckInput} cm</strong>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="60"
                    value={neckInput}
                    onChange={(e) => setNeckInput(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-teal)' }}
                  />
                </div>

                {genderInput === 'female' && (
                  <div style={{ display: 'grid', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <label>Hip Circumference (कूल्हा)</label>
                      <strong>{hipInput} cm</strong>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="160"
                      value={hipInput}
                      onChange={(e) => setHipInput(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-teal)' }}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT COLUMN: DESCRIPTION & RESULTS */}
          <div style={{ padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '260px' }}>
            {/* BMI RESULT DISPLAY */}
            {calcTab === 'bmi' && bmiResult && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 800 }}>Body Mass Index (BMI)</h4>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    BMI is a standard health proxy calculating tissue mass (muscle, fat, and bone) based on height and weight. It categories overall body mass distributions to indicate potential underweight or overweight risks.
                  </p>
                </div>
                <div style={{ margin: '20px 0', textAlign: 'center', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1.5px dashed var(--border-color)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Calculated BMI Value</div>
                  <strong style={{ fontSize: '32px', display: 'block', margin: '4px 0', color: bmiResult.color }}>{bmiResult.value}</strong>
                  <span style={{ fontSize: '12px', fontWeight: 850, padding: '4px 10px', borderRadius: '20px', background: 'color-mix(in srgb, ' + bmiResult.color + ' 10%, transparent)', color: bmiResult.color }}>
                    {bmiResult.category}
                  </span>
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                  <span>Healthy Range: 18.5 - 24.9</span>
                </div>
              </div>
            )}

            {/* BMR RESULT DISPLAY */}
            {calcTab === 'bmr' && bmrResult !== null && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 800 }}>Basal Metabolic Rate (BMR)</h4>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    BMR estimates the basal energy quantity (expressed in Calories) needed by your internal vital organs to sustain somatic functions at absolute rest. It serves as the baseline energy expenditure calculation.
                  </p>
                </div>
                <div style={{ margin: '20px 0', textAlign: 'center', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1.5px dashed var(--border-color)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Basal Resting Metabolism</div>
                  <strong style={{ fontSize: '32px', display: 'block', margin: '4px 0', color: 'var(--accent-teal)' }}>{bmrResult} <span style={{ fontSize: '16px', fontWeight: 500 }}>kcal/day</span></strong>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>Minimum baseline required for basic survival</span>
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  *Computed via the clinically validated Harris-Benedict Equation.
                </div>
              </div>
            )}

            {/* CALORIE RESULT DISPLAY */}
            {calcTab === 'calorie' && calorieResult && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 800 }}>Daily Calorie Intake Targets</h4>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    This metric represents your Total Daily Energy Expenditure (TDEE). It calculates your calorie requirements based on your basal metabolic rate adjusted for your physical activity profile.
                  </p>
                </div>
                
                <div style={{ margin: '14px 0', display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3.5px solid var(--accent-teal)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 650 }}>Weight Maintenance</span>
                    <strong style={{ color: 'var(--accent-teal)' }}>{calorieResult.maintenance} kcal</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3.5px solid var(--accent-cyan)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 650 }}>Weight Loss (-500 kcal)</span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{calorieResult.loss} kcal</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3.5px solid #fa7a19' }}>
                    <span style={{ fontSize: '11px', fontWeight: 650 }}>Weight Gain (+500 kcal)</span>
                    <strong style={{ color: '#fa7a19' }}>{calorieResult.gain} kcal</strong>
                  </div>
                </div>
                
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  A safe caloric deficit is ~500 kcal. Never consume below your BMR without direct medical supervision.
                </div>
              </div>
            )}

            {/* BODY FAT RESULT DISPLAY */}
            {calcTab === 'bodyfat' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 800 }}>Body Fat Percentage (BF%)</h4>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Body fat percentage calculates total adipose tissue mass relative to total weight. Using the US Navy Circumference Method, it calculates body composition indicators without requiring expensive bio-impedance scales.
                  </p>
                </div>
                
                {bodyFatResult ? (
                  <div style={{ margin: '20px 0', textAlign: 'center', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1.5px dashed var(--border-color)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Navy Formula Estimate</div>
                    <strong style={{ fontSize: '32px', display: 'block', margin: '4px 0', color: bodyFatResult.color }}>{bodyFatResult.value}%</strong>
                    <span style={{ fontSize: '12px', fontWeight: 850, padding: '4px 10px', borderRadius: '20px', background: 'color-mix(in srgb, ' + bodyFatResult.color + ' 10%, transparent)', color: bodyFatResult.color }}>
                      {bodyFatResult.category}
                    </span>
                  </div>
                ) : (
                  <div style={{ margin: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11.5px', padding: '20px' }}>
                    Adjust Waist/Neck sliders. Neck circumference must be smaller than Waist.
                  </div>
                )}

                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  Fitness Range: Male 14-17%, Female 21-24%.
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
