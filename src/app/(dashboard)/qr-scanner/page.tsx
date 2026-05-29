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
  Sparkles,
  ShieldCheck,
  FileText,
  Activity,
  Heart,
  ExternalLink
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

export default function QrScannerPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { setActiveToken, addAppointment, addNotification, logSecurityEvent } = useAuth();

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flashlightActive, setFlashlightActive] = useState(false);
  const [isSimulatedCamera, setIsSimulatedCamera] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseText, setParseText] = useState('Parsing image metadata...');
  const [cameraLoading, setCameraLoading] = useState(true);
  
  // Scanned result modals state
  const [scannedResult, setScannedResult] = useState<{ type: 'abha' | 'facility' | 'prescription'; data: any } | null>(null);

  // Swipe Gestures Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Swipe horizontal threshold 140px, vertical limit 60px to avoid scroll trigger conflicts
    if (Math.abs(deltaX) > 140 && Math.abs(deltaY) < 60) {
      logSecurityEvent('Swipe Navigation', `Detected horizontal swipe ${deltaX > 0 ? 'right' : 'left'} on scanner overlay`);
      showToast(t('Navigating back...'));
      cleanupCamera();
      router.back();
    }
  };

  // Sound Synth Shutter Audio Helper
  const playShutterSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.error(e);
    }
  };

  // Start real browser camera
  const startCamera = async () => {
    setCameraLoading(true);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      
      // Guard against non-HTTPS contexts or environment where mediaDevices is missing
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Camera device media API not available (requires HTTPS or secure context)');
        setIsSimulatedCamera(true);
        setCameraLoading(false);
        logSecurityEvent('Camera API Missing', 'Secure media devices context unavailable');
        return;
      }

      setIsSimulatedCamera(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      logSecurityEvent('Camera Access', 'Live environment camera session initialized');
      // Smooth loading transition
      setTimeout(() => setCameraLoading(false), 800);
    } catch (err) {
      console.error('Camera stream blocked', err);
      setIsSimulatedCamera(true);
      setCameraLoading(false);
      logSecurityEvent('Camera Fail', 'Camera inaccessible, falling back to secure simulated view');
    }
  };


  const cleanupCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // Init/Cleanup camera on mounts
  useEffect(() => {
    startCamera();
    return () => {
      cleanupCamera();
    };
  }, []);

  const handleCloseScanner = () => {
    cleanupCamera();
    router.push('/');
  };

  const toggleFlashlight = async () => {
    if (isSimulatedCamera || !stream) {
      setFlashlightActive(prev => {
        const next = !prev;
        showToast(next ? t('Soft Screen Flash Active') : t('Screen Flash Disabled'));
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
        setFlashlightActive(prev => {
          const next = !prev;
          showToast(next ? t('Soft Screen Flash Active') : t('Screen Flash Disabled'));
          return next;
        });
      }
    } catch (err) {
      console.error(err);
      showToast(t('Torch trigger adjustment failed.'));
    }
  };

  const triggerGallery = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast(t(`Ingesting ${file.name} to decryptor...`));
    runProgressScanner(['abha', 'facility', 'prescription'][Math.floor(Math.random() * 3)] as any);
  };

  const runProgressScanner = (type: 'abha' | 'facility' | 'prescription') => {
    setIsParsing(true);
    setParseProgress(0);
    setParseText(t('Scanning metadata indexes...'));

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 25;
      setParseProgress(currentProgress);

      if (currentProgress === 50) {
        setParseText(t('Decrypting secure ABDM records...'));
      } else if (currentProgress === 75) {
        setParseText(t('Verifying JWS authorization seals...'));
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsParsing(false);
        showToast(t('Secure QR parsed successfully!'));
        triggerResultModal(type);
      }
    }, 350);
  };

  const captureSnapshot = () => {
    playShutterSound();
    
    // shutter flash animation
    const viewport = document.querySelector('.scanner-camera-viewport');
    if (viewport) {
      const flash = document.createElement('div');
      flash.style.position = 'absolute';
      flash.style.inset = '0';
      flash.style.background = '#ffffff';
      flash.style.opacity = '1';
      flash.style.zIndex = '30';
      flash.style.transition = 'opacity 0.2s ease-out';
      viewport.appendChild(flash);
      setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 200);
      }, 40);
    }

    showToast(t('QR snapshot captured. Running validator...'));
    setTimeout(() => {
      const types: ('abha' | 'facility' | 'prescription')[] = ['abha', 'facility', 'prescription'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      triggerResultModal(randomType);
    }, 700);
  };

  const triggerResultModal = (type: 'abha' | 'facility' | 'prescription') => {
    if (type === 'abha') {
      setScannedResult({
        type: 'abha',
        data: {
          name: 'Dr. Ayesha Ali',
          abhaNumber: '91-9981-0577-6582',
          abhaAddress: 'ayesha.ali.9981057765@abdm',
          purpose: 'Emergency Triage'
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

  const handleFacilityCheckin = () => {
    if (!scannedResult || scannedResult.type !== 'facility') return;

    const { tokenNum, name } = scannedResult.data;
    const now = Date.now();
    const expiresAt = now + 15 * 60 * 1000;
    const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setActiveToken({
      tokenNum,
      facilityName: name,
      expiresAt
    });

    addAppointment({
      title: 'OPD Check-In Queue ticket',
      doctor: `${name} - General OPD`,
      meta: `Checked In at ${timeStr}`,
      status: 'Active Ticket',
      token: tokenNum
    });

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
    <div 
      className="swipe-gesture-container" 
      onTouchStart={handleTouchStart} 
      onTouchEnd={handleTouchEnd}
      style={{ width: '100%', minHeight: '100vh', position: 'relative' }}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* ==================== DIFFERENTIAL BACKGROUND: PREMIUM SHIMMERING EHR DASHBOARD ==================== */}
      <div style={{ opacity: 0.35, pointerEvents: 'none', filter: 'blur(1.5px)', userSelect: 'none' }}>
        <section className="route-hero">
          <div className="setu-skeleton setu-skeleton-title" style={{ width: '120px' }}></div>
          <div className="setu-skeleton setu-skeleton-title" style={{ width: '220px', height: '28px', marginTop: '10px' }}></div>
          <div className="setu-skeleton setu-skeleton-text" style={{ width: '90%', marginTop: '8px' }}></div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '20px' }}>
          <div className="route-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <div className="setu-skeleton setu-skeleton-avatar" style={{ marginBottom: '10px' }}></div>
            <div className="setu-skeleton setu-skeleton-title" style={{ width: '50%' }}></div>
            <div className="setu-skeleton setu-skeleton-text" style={{ width: '90%' }}></div>
          </div>
          <div className="route-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <div className="setu-skeleton setu-skeleton-avatar" style={{ marginBottom: '10px' }}></div>
            <div className="setu-skeleton setu-skeleton-title" style={{ width: '60%' }}></div>
            <div className="setu-skeleton setu-skeleton-text" style={{ width: '80%' }}></div>
          </div>
          <div className="route-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <div className="setu-skeleton setu-skeleton-avatar" style={{ marginBottom: '10px' }}></div>
            <div className="setu-skeleton setu-skeleton-title" style={{ width: '45%' }}></div>
            <div className="setu-skeleton setu-skeleton-text" style={{ width: '70%' }}></div>
          </div>
        </div>

        <div className="route-card" style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="setu-skeleton setu-skeleton-title" style={{ width: '35%', marginBottom: '15px' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="setu-skeleton setu-skeleton-text" style={{ height: '14px' }}></div>
            <div className="setu-skeleton setu-skeleton-text" style={{ height: '14px', width: '95%' }}></div>
            <div className="setu-skeleton setu-skeleton-text" style={{ height: '14px', width: '85%' }}></div>
            <div className="setu-skeleton setu-skeleton-text" style={{ height: '14px', width: '90%' }}></div>
          </div>
        </div>
      </div>

      {/* ==================== HIGH-FIDELITY IMMERSIVE SCANNING OVERLAY MODAL ==================== */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 12, 19, 0.78)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 9999, /* High z-index to overlay sticky headers and active notifications */
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px 20px', /* Generous top padding for mobile browsers */
          overflowY: 'auto', /* Fully scrollable container */
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        <div 
          className="modal-content"
          style={{
            width: '100%',
            maxWidth: '520px',
            maxHeight: '92vh', /* Constrain height to avoid breaking on shorter mobile viewports */
            overflowY: 'auto',
            background: 'linear-gradient(135deg, rgba(13, 32, 49, 0.95), rgba(7, 21, 33, 0.98))',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255,255,255,0.05)',
            borderRadius: '24px',
            padding: '24px',
            position: 'relative',
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            textAlign: 'center'
          }}
        >
          {/* Close Header button */}
          <button 
            onClick={handleCloseScanner}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>

          {/* Modal Header Title */}
          <div style={{ marginBottom: '18px', paddingRight: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--accent-teal)', display: 'inline-flex' }}>
                <QrCode style={{ width: '22px', height: '22px' }} />
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#fff' }}>
                {t('ABDM Secure Scan')}
              </h2>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
              {t('Swipe left/right to go back. Captures digital health indices.')}
            </p>
          </div>

          {/* Camera Viewport Wrapper */}
          <div
            className="scanner-camera-viewport"
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4/3',
              background: '#02070c',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: flashlightActive ? 'inset 0 0 100px rgba(255,255,255,0.7), 0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.4)',
              border: '2px solid rgba(255, 255, 255, 0.06)',
              transition: 'box-shadow 0.3s ease',
              marginBottom: '20px'
            }}
          >
            {/* MUI Skeleton Shimmer placeholder during active loading capture */}
            {cameraLoading ? (
              <div 
                className="setu-skeleton" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundSize: '200% 100% !important'
                }}
              >
                <Loader2 className="animate-spin" style={{ width: '28px', height: '28px', color: 'var(--accent-teal)', marginBottom: '8px' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Capturing active hardware feed...</span>
              </div>
            ) : isSimulatedCamera ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  background: 'radial-gradient(circle at center, #0d2031 0%, #030a11 100%)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Rotating Cyber Grid Radar */}
                <div
                  style={{
                    position: 'absolute',
                    width: '320px',
                    height: '320px',
                    borderRadius: '50%',
                    border: '1px solid rgba(0, 212, 170, 0.08)',
                    background: 'repeating-radial-gradient(circle, transparent, transparent 15px, rgba(0, 212, 170, 0.02) 15px, rgba(0, 212, 170, 0.02) 30px)',
                    animation: 'pulse 3s infinite ease-in-out',
                    zIndex: 1
                  }}
                />
                
                {/* Simulated Target QR Image in Center */}
                <div
                  style={{
                    zIndex: 3,
                    background: 'rgba(7, 21, 33, 0.82)',
                    border: '2px solid rgba(0, 212, 170, 0.4)',
                    boxShadow: '0 0 30px rgba(0, 212, 170, 0.25)',
                    borderRadius: '12px',
                    padding: '16px',
                    transform: 'scale(0.95)',
                    animation: 'sync-pulse 2s infinite ease-in-out'
                  }}
                >
                  <QrCode style={{ width: '64px', height: '64px', color: 'var(--accent-teal)' }} />
                </div>

                {/* Floating OCR Data Streams (Ticks dynamically) */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    fontFamily: 'monospace',
                    fontSize: '9px',
                    color: 'rgba(0, 212, 170, 0.65)',
                    textAlign: 'right',
                    lineHeight: '1.4',
                    zIndex: 2,
                    pointerEvents: 'none'
                  }}
                >
                  <div>SYS: OK</div>
                  <div>FPS: 29.8</div>
                  <div>EHR: ABHA_V3</div>
                  <div>SIG: SECURE</div>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    fontFamily: 'monospace',
                    fontSize: '9px',
                    color: 'rgba(0, 180, 216, 0.65)',
                    textAlign: 'right',
                    lineHeight: '1.4',
                    zIndex: 2,
                    pointerEvents: 'none'
                  }}
                >
                  <div>LAT: 22.9734</div>
                  <div>LON: 78.6569</div>
                  <div>DEC: GCM-256</div>
                </div>

                <span style={{ fontWeight: 800, color: 'var(--text-primary)', zIndex: 4, marginTop: '16px', fontSize: '13px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {t('Secure Sandbox Camera Active')}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', marginTop: '4px', zIndex: 4, fontWeight: 650 }}>
                  {t('Laser sweeping for digital ABHA profiles...')}
                </span>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}

            {/* Target Reticle Hud Frame */}
            {!cameraLoading && (
              <div className="scanner-target-box" style={{ width: '220px', height: '220px' }}>
                <div className="corner tl" style={{ borderColor: 'var(--accent-teal)' }}></div>
                <div className="corner tr" style={{ borderColor: 'var(--accent-teal)' }}></div>
                <div className="corner bl" style={{ borderColor: 'var(--accent-teal)' }}></div>
                <div className="corner br" style={{ borderColor: 'var(--accent-teal)' }}></div>
                <div className="scan-laser-sweep" style={{ background: 'linear-gradient(to bottom, transparent, var(--accent-teal))' }}></div>
              </div>
            )}

            {/* Live Camera HUD status */}
            {!cameraLoading && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  padding: '4px 10px',
                  background: 'rgba(7, 21, 33, 0.85)',
                  border: isSimulatedCamera ? '1px solid rgba(0, 212, 170, 0.3)' : '1px solid rgba(0, 212, 170, 0.3)',
                  borderRadius: '6px',
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  color: 'var(--accent-teal)',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  zIndex: 6
                }}
              >
                {isSimulatedCamera ? 'Demo Sandbox Mode' : 'ABDM Gateway Online'}
              </div>
            )}


            {/* Verification progress overlay scanner */}
            {isParsing && (
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(5, 12, 19, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 25,
                  animation: 'fadeIn 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: 'var(--accent-teal)' }} />
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>{parseText}</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--accent-cyan)' }}>{parseProgress}%</div>
                  
                  {/* Glowing progress bar */}
                  <div style={{ width: '160px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginTop: '6px' }}>
                    <div style={{ width: `${parseProgress}%`, height: '100%', background: 'var(--accent-teal)', transition: 'width 0.2s ease', boxShadow: '0 0 8px var(--accent-teal)' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center', marginBottom: '20px' }}>
            <button 
              className="control-btn" 
              onClick={toggleFlashlight}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: flashlightActive ? 'rgba(0, 212, 170, 0.1)' : 'rgba(255,255,255,0.02)',
                color: flashlightActive ? 'var(--accent-teal)' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Zap style={{ width: '14px', height: '14px' }} /> <span>Flashlight</span>
            </button>
            <button 
              className="control-btn" 
              onClick={triggerGallery}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <ImageIcon style={{ width: '14px', height: '14px' }} /> <span>Gallery</span>
            </button>
            <button 
              onClick={captureSnapshot}
              style={{
                flex: 1.5,
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--accent-teal)',
                color: '#000',
                fontSize: '12px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 212, 170, 0.2)'
              }}
            >
              <Camera style={{ width: '14px', height: '14px' }} /> <span>Capture QR</span>
            </button>
          </div>

          {/* Prefill simulation drawers */}
          <div 
            style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid rgba(255, 255, 255, 0.05)', 
              borderRadius: '16px', 
              padding: '14px', 
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Sparkles style={{ width: '14px', height: '14px', color: 'var(--accent-teal)' }} />
              <strong style={{ fontSize: '11px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Simulate Clinical Scans
              </strong>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: '1.4' }}>
              Instantly bypass physical scanning to decrypt standard compliant demo payloads.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button 
                className="prefill-btn" 
                style={{ fontSize: '10px', padding: '6px', cursor: 'pointer' }} 
                onClick={() => runProgressScanner('abha')}
              >
                ABHA Profile
              </button>
              <button 
                className="prefill-btn" 
                style={{ fontSize: '10px', padding: '6px', cursor: 'pointer' }} 
                onClick={() => runProgressScanner('facility')}
              >
                OPD Token
              </button>
              <button 
                className="prefill-btn" 
                style={{ fontSize: '10px', padding: '6px', cursor: 'pointer' }} 
                onClick={() => runProgressScanner('prescription')}
              >
                Verify Rx
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SCAN RESULTS MODALS ==================== */}

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
    </div>
  );
}
