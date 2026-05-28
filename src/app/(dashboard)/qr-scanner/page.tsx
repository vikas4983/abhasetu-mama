'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import {
  QrCode,
  Zap,
  Image as ImageIcon,
  Camera,
  X,
  UserCheck,
  Building,
  FileCheck,
  ArrowLeft,
  Loader2,
  Sparkles
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

export default function QrScannerPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { setActiveToken, addAppointment, addNotification, logSecurityEvent } = useAuth();

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flashlightActive, setFlashlightActive] = useState(false);
  const [isSimulatedCamera, setIsSimulatedCamera] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseText, setParseText] = useState('Parsing image metadata...');
  
  // Scanned result modals state
  const [scannedResult, setScannedResult] = useState<{ type: 'abha' | 'facility' | 'prescription'; data: any } | null>(null);

  // Sound Synth Shutter Audio Helper
  const playShutterSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.error(e);
    }
  };

  // Start real browser camera
  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsSimulatedCamera(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      logSecurityEvent('Camera Stream', 'Started live video capture for ABDM scanner');
    } catch (err) {
      console.error('Camera stream error', err);
      setIsSimulatedCamera(true);
      showToast(t('Camera blocked or unavailable. Simulation active.'));
      logSecurityEvent('Camera Simulated', 'Camera unavailable, fallback to simulated viewport');
    }
  };

  // Stop camera on unmount
  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleFlashlight = async () => {
    if (isSimulatedCamera || !stream) {
      // Glow fallback
      setFlashlightActive(prev => {
        const next = !prev;
        showToast(next ? t('Torch unsupported. Soft Screen Flash active.') : t('Screen Flash disabled.'));
        return next;
      });
      return;
    }

    const track = stream.getVideoTracks()[0];
    if (!track) return;

    try {
      const capabilities = (track as any).getCapabilities ? (track as any).getCapabilities() : {};
      if (capabilities.torch) {
        const nextFlash = !flashlightActive;
        setFlashlightActive(nextFlash);
        await track.applyConstraints({
          advanced: [{ torch: nextFlash } as any]
        });
        showToast(nextFlash ? t('Flashlight Enabled') : t('Flashlight Disabled'));
      } else {
        // Viewport glow fallback
        setFlashlightActive(prev => {
          const next = !prev;
          showToast(next ? t('Torch unsupported. Soft Screen Flash active.') : t('Screen Flash disabled.'));
          return next;
        });
      }
    } catch (err) {
      console.error(err);
      showToast(t('Camera controller torch adjustment failed.'));
    }
  };

  // Trigger hidden file uploader
  const triggerGallery = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast(t(`Uploading ${file.name} to parser...`));
    runProgressScanner(['abha', 'facility', 'prescription'][Math.floor(Math.random() * 3)] as any);
  };

  // Run verification progress loader
  const runProgressScanner = (type: 'abha' | 'facility' | 'prescription') => {
    setIsParsing(true);
    setParseProgress(0);
    setParseText(t('Parsing QR metadata...'));

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 25;
      setParseProgress(currentProgress);

      if (currentProgress === 50) {
        setParseText(t('Decrypting ABDM secure credentials...'));
      } else if (currentProgress === 75) {
        setParseText(t('Verifying digital signature...'));
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsParsing(false);
        showToast(t('QR Code decoded successfully!'));
        triggerResultModal(type);
      }
    }, 400);
  };

  // Camera snapshot shutter trigger
  const captureSnapshot = () => {
    playShutterSound();
    
    // Animate custom shutter flash
    const viewport = document.querySelector('.scanner-camera-viewport');
    if (viewport) {
      const flash = document.createElement('div');
      flash.style.position = 'absolute';
      flash.style.inset = '0';
      flash.style.background = '#fff';
      flash.style.opacity = '1';
      flash.style.zIndex = '20';
      flash.style.transition = 'opacity 0.25s ease';
      viewport.appendChild(flash);
      setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 250);
      }, 40);
    }

    showToast(t('Captured snapshot! Scanning...'));
    setTimeout(() => {
      const types: ('abha' | 'facility' | 'prescription')[] = ['abha', 'facility', 'prescription'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      triggerResultModal(randomType);
    }, 800);
  };

  // Trigger result modals
  const triggerResultModal = (type: 'abha' | 'facility' | 'prescription') => {
    if (type === 'abha') {
      setScannedResult({
        type: 'abha',
        data: {
          name: 'Dr. Ayesha Ali',
          abhaNumber: '91-9981-0577-6582',
          abhaAddress: 'ayesha.ali.9981057765@abdm',
          purpose: 'Care Triage'
        }
      });
    } else if (type === 'facility') {
      const facilities = [
        'Janki Raman Hospital & Critical Care Centre, Jabalpur',
        'DR AYESHAH HOMEO HEALTH MALL, Bhopal'
      ];
      setScannedResult({
        type: 'facility',
        data: {
          name: facilities[Math.floor(Math.random() * facilities.length)],
          tokenNum: `SETU-OPD-${Math.floor(100 + Math.random() * 900)}`
        }
      });
    } else {
      setScannedResult({
        type: 'prescription',
        data: {
          doctor: 'Dr. Ayesha Ali',
          medicines: [
            'Paracetamol 650mg - 10 tabs',
            'ORS sachets - 4 packs'
          ]
        }
      });
    }
  };

  // Share & Check-in callback
  const handleFacilityCheckin = () => {
    if (!scannedResult || scannedResult.type !== 'facility') return;

    const { tokenNum, name } = scannedResult.data;
    const now = Date.now();
    const expiresAt = now + 15 * 60 * 1000;
    const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Set active token
    setActiveToken({
      tokenNum,
      facilityName: name,
      expiresAt
    });

    // Add appointment queue ticket
    addAppointment({
      title: 'OPD Check-In Queue ticket',
      doctor: `${name} - General OPD`,
      meta: `Checked In at ${timeStr}`,
      status: 'Active Ticket',
      token: tokenNum
    });

    // Add ABDM notification
    addNotification(
      'OPD Ticket Created',
      `Successfully checked in at ${name}. Queue Token: ${tokenNum}`,
      'abdm'
    );

    logSecurityEvent('OPD Checked-In', `Facility Scan Share check-in ticket: ${tokenNum} at ${name}`);
    setScannedResult(null);
    showToast(t('OPD Ticket Active! View Ticket in appointments.'));
    router.push('/appointments');
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
          <h2>{t('ABDM QR Scanner')}</h2>
          <p>{t('Scan patient cards, healthcare facilities, and check-in tickets.')}</p>
        </div>
      </section>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div className="qr-scanner-container" style={{ width: '100%', marginTop: '16px' }}>
        <div className="scanner-console-grid" style={{ display: 'grid', gap: '20px' }}>
          {/* Main Viewport */}
          <div
            className="scanner-camera-viewport"
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4/3',
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
              background: '#000000',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: flashlightActive ? 'inset 0 0 100px rgba(255,255,255,0.7)' : '0 8px 30px rgba(0,0,0,0.3)',
              border: '2px solid var(--border-color)',
              transition: 'box-shadow 0.3s ease'
            }}
          >
            {isSimulatedCamera ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  background: 'radial-gradient(circle, #0c1c2b 0%, #050d15 100%)',
                }}
              >
                <QrCode style={{ width: '64px', height: '64px', marginBottom: '12px', color: 'var(--accent-teal)' }} />
                <span>Simulated Camera Viewport</span>
              </div>
            ) : (
              <video
                ref={videoRef}
                id="scanner-video"
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}

            {/* Target Reticle Hud */}
            <div className="scanner-target-box">
              <div className="corner tl"></div>
              <div className="corner tr"></div>
              <div className="corner bl"></div>
              <div className="corner br"></div>
              <div className="scan-laser-sweep"></div>
            </div>

            {/* Live Camera HUD status */}
            <div
              className="camera-status-hud"
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                padding: '4px 10px',
                background: 'rgba(7, 21, 33, 0.75)',
                border: isSimulatedCamera ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--accent-teal)',
                borderRadius: '4px',
                fontSize: '10px',
                textTransform: 'uppercase',
                color: isSimulatedCamera ? 'var(--danger)' : 'var(--accent-teal)',
                fontWeight: 'bold',
              }}
            >
              {isSimulatedCamera ? 'Camera Simulation Mode' : 'Live Gateway Active'}
            </div>

            {/* Progress overlay scanner decrypter */}
            {isParsing && (
              <div className="scan-progress-overlay">
                <div className="scan-progress-box">
                  <Loader2 className="scan-spinner animate-spin" style={{ width: '28px', height: '28px', color: 'var(--accent-teal)' }} />
                  <div className="scan-status-text">{parseText}</div>
                  <div className="scan-percentage">{parseProgress}%</div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="control-btn" onClick={toggleFlashlight}>
              <Zap className="small-icon" style={{ marginRight: '6px' }} /> Flashlight
            </button>
            <button className="control-btn" onClick={triggerGallery}>
              <ImageIcon className="small-icon" style={{ marginRight: '6px' }} /> Gallery
            </button>
            <button className="join-btn" style={{ marginTop: 0 }} onClick={captureSnapshot}>
              <Camera className="small-icon" style={{ marginRight: '6px' }} /> Capture QR
            </button>
          </div>

          {/* Quick Simulation Row */}
          <article className="route-card" style={{ maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
            <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles style={{ color: 'var(--accent-teal)' }} />
              <h3 style={{ margin: 0 }}>Simulated Clinical QR Decrypters</h3>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px', marginTop: 0 }}>
              Instantly simulate multi-phase decryptions for health profiles or clinic OPD checks without permissions.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button className="prefill-btn" style={{ fontSize: '10px', padding: '6px' }} onClick={() => runProgressScanner('abha')}>ABHA Card</button>
              <button className="prefill-btn" style={{ fontSize: '10px', padding: '6px' }} onClick={() => runProgressScanner('facility')}>OPD Checkin</button>
              <button className="prefill-btn" style={{ fontSize: '10px', padding: '6px' }} onClick={() => runProgressScanner('prescription')}>Verify Rx</button>
            </div>
          </article>
        </div>
      </div>

      {/* Scanned ABHA Card Modal */}
      {scannedResult && scannedResult.type === 'abha' && (
        <div className="modal-overlay" id="qr-result-modal" onClick={() => setScannedResult(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>ABHA Card Scanned</h3>
              <button className="modal-close" onClick={() => setScannedResult(null)}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                <UserCheck style={{ width: '24px', height: '24px' }} />
              </div>
              <h4>Patient Profile Verified</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '6px 0 16px', lineHeight: '1.4' }}>
                ABDM identity data extracted successfully from decrypted secure QR payload.
              </p>
              <table style={{ width: '100%', textAlign: 'left', fontSize: '12px', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Name</td>
                    <td style={{ fontWeight: 700 }}>{scannedResult.data.name}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>ABHA ID</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{scannedResult.data.abhaNumber}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Address</td>
                    <td style={{ fontWeight: 700 }}>{scannedResult.data.abhaAddress}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Consent Type</td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>Purpose: {scannedResult.data.purpose}</td>
                  </tr>
                </tbody>
              </table>
              <button
                className="join-btn"
                style={{ width: '100%', margin: 0 }}
                onClick={() => {
                  setScannedResult(null);
                  showToast(t('Patient added to OPD Desk Triage'));
                }}
              >
                Link Patient Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scanned Facility Hospital QR Modal */}
      {scannedResult && scannedResult.type === 'facility' && (
        <div className="modal-overlay" id="qr-result-modal" onClick={() => setScannedResult(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Facility QR Scanned</h3>
              <button className="modal-close" onClick={() => setScannedResult(null)}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 180, 216, 0.1)', color: 'var(--accent-cyan)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                <Building style={{ width: '24px', height: '24px' }} />
              </div>
              <h4>Hospital Queue Handoff</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '6px 0 16px', lineHeight: '1.5' }}>
                Do you consent to share your ABHA identity credentials with <strong>{scannedResult.data.name}</strong>?
              </p>
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', fontSize: '11px', textAlign: 'left', marginBottom: '20px', lineHeight: '1.4' }}>
                • Shared data: Name, Age, Gender, ABHA address.<br />
                • Purpose: OPD counter check-in and queue token generation.
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="prefill-btn" style={{ flex: 1 }} onClick={() => setScannedResult(null)}>Reject</button>
                <button className="join-btn" style={{ flex: 2, margin: 0 }} onClick={handleFacilityCheckin}>Share & Check-In</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanned Signed Prescription QR Modal */}
      {scannedResult && scannedResult.type === 'prescription' && (
        <div className="modal-overlay" id="qr-result-modal" onClick={() => setScannedResult(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Pharmacy Prescription Scanned</h3>
              <button className="modal-close" onClick={() => setScannedResult(null)}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                <FileCheck style={{ width: '24px', height: '24px' }} />
              </div>
              <h4>Smart Rx Token Validated</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '6px 0 16px', lineHeight: '1.4' }}>
                Digital Prescription signed by <strong>{scannedResult.data.doctor}</strong> is valid.
              </p>
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', fontSize: '12px', textAlign: 'left', marginBottom: '20px', lineHeight: '1.6' }}>
                {scannedResult.data.medicines.map((med: string, i: number) => (
                  <div key={i}>• {med}</div>
                ))}
                <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '10px', marginTop: '6px', display: 'block' }}>
                  ✔ Digitally Signed by ABDM Gateway
                </span>
              </div>
              <button
                className="join-btn"
                style={{ width: '100%', margin: 0 }}
                onClick={() => {
                  setScannedResult(null);
                  showToast(t('Prescription added to Pharmacy Cart'));
                }}
              >
                Refill medicines
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
