'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface LogoLoaderProps {
  isLoading: boolean;
  type?: 'login' | 'register' | 'onboard';
}

export default function LogoLoader({ isLoading, type = 'login' }: LogoLoaderProps) {
  const [selectedLogo, setSelectedLogo] = useState<string>('default');
  const [stageIndex, setStageIndex] = useState(0);

  // Synchronize brand logo selection from local cache
  useEffect(() => {
    if (!isLoading) return;
    try {
      const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
      if (state.selectedLogo) {
        setSelectedLogo(state.selectedLogo);
      } else {
        setSelectedLogo('default');
      }
    } catch (e) {
      console.error(e);
    }
  }, [isLoading]);

  // Messages depending on onboarding action
  const stages = {
    login: [
      'Establishing secure handshake...',
      'Syncing authorized profile tokens...',
      'Validating session digital signatures...',
      'Opening digital health bridge...'
    ],
    register: [
      'Initializing ecosystem enrollment...',
      'Creating secure keypairs...',
      'Creating digital health locker...',
      'Finalizing credentials and authorization...'
    ],
    onboard: [
      'Decrypting secure Aadhaar payload...',
      'Awaiting gateway callback confirmation...',
      'Parsing identity registry records...',
      'Generating digital ABHA Card...'
    ]
  };

  const activeStages = stages[type] || stages.login;

  // Cycle messages
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % activeStages.length);
    }, 450);
    return () => clearInterval(interval);
  }, [isLoading, activeStages.length]);

  if (!isLoading) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 10, 15, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'setu-fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      {/* Cinematic HUD Scanner Container */}
      <div
        style={{
          position: 'relative',
          width: '260px',
          height: '260px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '28px',
        }}
      >
        {/* Dynamic Glowing Radial Backlight */}
        <div
          style={{
            position: 'absolute',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-teal) 0%, transparent 70%)',
            opacity: 0.22,
            filter: 'blur(24px)',
            animation: 'logo-cinematic-glow 2s ease-in-out infinite alternate',
          }}
        />

        {/* Scanning Laser Grid Overlay (Futuristic) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '1px solid color-mix(in srgb, var(--accent-teal) 8%, transparent)',
            background: 'linear-gradient(color-mix(in srgb, var(--accent-teal) 3%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--accent-teal) 3%, transparent) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            opacity: 0.8,
            overflow: 'hidden',
          }}
        >
          {/* Laser Sweeper Line */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, var(--accent-teal), transparent)',
              boxShadow: '0 0 12px var(--accent-teal), 0 0 20px var(--accent-teal)',
              top: 0,
              animation: 'scan-laser-sweep 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            }}
          />
        </div>

        {/* Rotating Outer Radar Rings (SVG) */}
        <svg
          style={{
            position: 'absolute',
            width: '240px',
            height: '240px',
            transform: 'rotate(-45deg)',
            animation: 'scan-radar-rotate 10s linear infinite',
          }}
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="var(--accent-teal)"
            strokeWidth="0.8"
            strokeDasharray="20 40 10 10 30 10"
            opacity="0.5"
          />
        </svg>

        {/* Opposite Rotating Inner Ring (SVG) */}
        <svg
          style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            animation: 'scan-radar-rotate-reverse 6s linear infinite',
          }}
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="1.2"
            strokeDasharray="40 10 20 30"
            opacity="0.6"
          />
        </svg>

        {/* Glassmorphic Logo Core Container */}
        <div
          style={{
            position: 'relative',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            animation: 'logo-cinematic-pulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            padding: selectedLogo !== 'default' && selectedLogo.includes('logo6') ? '6px' : '0'
          }}
        >
          {selectedLogo === 'default' ? (
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-cyan))',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 0 20px color-mix(in srgb, var(--accent-teal) 40%, transparent)',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '30px', height: '30px', color: '#ffffff' }}>
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
          ) : (
            <img
              src={selectedLogo}
              alt="Loader Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          )}
        </div>
      </div>

      {/* Futuristic Telemetry Information Text */}
      <div style={{ textAlign: 'center', maxWidth: '320px', padding: '0 20px' }}>
        <h3
          style={{
            margin: '0 0 6px 0',
            fontSize: '15px',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            animation: 'holographic-flicker 4s infinite',
          }}
        >
          ABHA SETU
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '11px',
            fontFamily: 'monospace',
            color: 'var(--accent-teal)',
            letterSpacing: '1px',
            height: '18px',
            opacity: 0.85,
          }}
        >
          {activeStages[stageIndex]}
        </p>

        {/* Loading Progress Bar Grid */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            justifyContent: 'center',
            marginTop: '16px',
            width: '180px',
            marginInline: 'auto',
          }}
        >
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              style={{
                height: '3px',
                flex: 1,
                borderRadius: '1px',
                backgroundColor: idx <= stageIndex ? 'var(--accent-teal)' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: idx <= stageIndex ? '0 0 8px var(--accent-teal)' : 'none',
                transition: 'all 0.2s ease-in-out',
              }}
            />
          ))}
        </div>
      </div>

      {/* Embedded CSS Animations */}
      <style jsx global>{`
        @keyframes logo-cinematic-glow {
          0% {
            transform: scale(0.9);
            opacity: 0.18;
          }
          100% {
            transform: scale(1.15);
            opacity: 0.28;
          }
        }
        @keyframes logo-cinematic-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3), 0 0 0 0px color-mix(in srgb, var(--accent-teal) 10%, transparent);
          }
          50% {
            transform: scale(1.03);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 0 16px 4px color-mix(in srgb, var(--accent-teal) 20%, transparent);
          }
        }
        @keyframes scan-radar-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes scan-radar-rotate-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes scan-laser-sweep {
          0% {
            top: 0%;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0%;
          }
        }
        @keyframes holographic-flicker {
          0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
            opacity: 0.99;
            filter: hue-rotate(0deg);
          }
          20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
            opacity: 0.4;
            filter: hue-rotate(90deg);
          }
        }
        @keyframes setu-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
