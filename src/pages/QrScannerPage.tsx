import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, RefreshCw, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@components/ui/PageHeader';
import { Seo } from '@components/seo/Seo';
import { qrFlowCards } from '@/constants/enterpriseData';

export default function QrScannerPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState('Tap start scanner on mobile or tablet to request camera access.');
  const isTouchDevice = useMemo(() => window.matchMedia('(pointer: coarse)').matches, []);

  const stop = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  const start = async () => {
    try {
      const camera = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      setStream(camera);
      if (videoRef.current) videoRef.current.srcObject = camera;
      setStatus('Scanner active. Align the ABDM facility QR inside the secure frame.');
    } catch {
      setStatus('Camera permission was denied or unavailable. Check browser permissions and retry.');
    }
  };

  useEffect(() => stop, [stream]);

  return (
    <>
      <Seo title="QR Scanner" description="Mobile-optimized ABDM QR scanner flow with camera permissions and retry handling." />
      <PageHeader title="QR Scanner" subtitle="A secure mobile-first flow for ABDM facility QR scanning, ABHA onboarding, and retry-safe verification." />
      <section className="scanner-layout">
        <div className="scanner-panel">
          <div className="scanner-frame">
            {stream ? <video ref={videoRef} autoPlay playsInline muted /> : <Camera aria-hidden="true" />}
            <span />
          </div>
          <p role="status">{status}</p>
          <div className="doctor-actions">
            <button className="primary-action scanner-cta" type="button" onClick={() => void start()} disabled={!isTouchDevice && Boolean(stream)}>
              <Camera className="small-icon" /> {stream ? 'Scanner Running' : 'Start Scanner'}
            </button>
            <button className="back-link" type="button" onClick={stop}>
              <RefreshCw className="small-icon" /> Retry
            </button>
          </div>
        </div>
        <div className="facility-grid compact">
          {qrFlowCards.map((card) => {
            const Icon = card.icon;
            return (
              <article className="facility-card" key={card.title}>
                <div className="facility-icon"><Icon /></div>
                <h4>{card.title}</h4>
                <p>{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>
      <p className="secure-status"><ShieldCheck className="small-icon" /> QR payloads should be verified by backend services before any ABDM transaction.</p>
    </>
  );
}
