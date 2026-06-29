/**
 * @file        AccountActionWizardModal.tsx
 * @description Mobile-first modal wizard for ABHA delete / deactivate (real API only)
 * @module      abha-account-lifecycle/shared
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ChevronRight, ShieldAlert, X } from 'lucide-react';
import OtpInput from '@/components/common/OtpInput';
import { requestPatientAbhaLogout } from '@/features/patient-logout';
import {
  ABHA_AUTH_CHANNELS,
  ABHA_DEACTIVATION_SURVEY_OPTIONS,
  ABHA_OTP_EXPIRY_SECONDS,
  ABHA_OTP_RESEND_SECONDS,
  type AbhaAuthChannel,
} from '../constants/account-action.constants';
import type {
  AccountActionGatewayResponse,
  AccountActionWizardConfig,
  AccountActionWizardStep,
} from '../types/account-action.types';
import { buildSurveyReasons } from '../utils/build-reasons';
import AccountActionResponseCard from './AccountActionResponseCard';

export interface AccountActionWizardModalProps {
  open: boolean;
  onClose: () => void;
  config: AccountActionWizardConfig;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * @description Modal phased flow — warnings → survey → auth → send OTP → verify → logout
 */
export default function AccountActionWizardModal({
  open,
  onClose,
  config,
}: AccountActionWizardModalProps) {
  const [step, setStep] = useState<AccountActionWizardStep>('warnings');
  const [surveyOptionId, setSurveyOptionId] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [authChannel, setAuthChannel] = useState<AbhaAuthChannel | null>(null);
  const [txnId, setTxnId] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [response, setResponse] = useState<AccountActionGatewayResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpExpiryTimer, setOtpExpiryTimer] = useState(0);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const resetState = useCallback(() => {
    setStep('warnings');
    setSurveyOptionId('');
    setOtherReason('');
    setAuthChannel(null);
    setTxnId('');
    setOtp('');
    setPassword('');
    setOtpMessage('');
    setResponse(null);
    setError('');
    setLoading(false);
    setShake(false);
    setResendTimer(0);
    setOtpExpiryTimer(0);
  }, []);

  useEffect(() => {
    if (!open) resetState();
  }, [open, resetState]);

  useEffect(() => {
    if (open && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
  }, [open, step]);

  useEffect(() => {
    if (!open || resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [open, resendTimer]);

  useEffect(() => {
    if (!open || otpExpiryTimer <= 0) return;
    const t = setInterval(() => setOtpExpiryTimer((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [open, otpExpiryTimer]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const reasons = buildSurveyReasons(surveyOptionId, otherReason);

  const handlePostSuccessLogout = useCallback(
    async (successMessage: string) => {
      setStep('loading');
      setLoading(true);
      const logoutRes = await requestPatientAbhaLogout();
      const finalMessage =
        logoutRes.status === 'success'
          ? logoutRes.message || successMessage
          : successMessage;
      config.onComplete?.(finalMessage);
    },
    [config],
  );

  const handleRequestOtp = useCallback(async () => {
    if (!authChannel || authChannel === 'password') return;
    setLoading(true);
    setError('');
    const otpSystem = authChannel === 'aadhaar-otp' ? 'aadhaar' : 'abdm';
    try {
      const data = await config.requestOtp({ otpSystem });
      if (data.status === 'success' && data.txnId) {
        setTxnId(data.txnId);
        setOtpMessage(data.message || '');
        setResendTimer(ABHA_OTP_RESEND_SECONDS);
        setOtpExpiryTimer(ABHA_OTP_EXPIRY_SECONDS);
        setOtp('');
        setStep('otp');
      } else {
        setResponse(data);
        setError(data.message || 'Failed to send OTP');
        triggerShake();
        setStep('result');
      }
    } catch {
      setError('Network error while requesting OTP.');
      triggerShake();
      setStep('send-otp');
    } finally {
      setLoading(false);
    }
  }, [authChannel, config]);

  const handleVerifyOtp = useCallback(async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP.');
      triggerShake();
      return;
    }
    if (otpExpiryTimer === 0) {
      setError('OTP has expired. Please request a new one.');
      triggerShake();
      return;
    }
    setLoading(true);
    setError('');
    setStep('loading');
    try {
      const data = await config.verifyOtp({ txnId, otp, reasons });
      if (data.status === 'success') {
        await handlePostSuccessLogout(data.message || 'Action completed successfully.');
      } else {
        setResponse(data);
        setError(data.message || 'OTP verification failed');
        triggerShake();
        setStep('otp');
      }
    } catch {
      setError('Network error during OTP verification.');
      triggerShake();
      setStep('otp');
    } finally {
      setLoading(false);
    }
  }, [config, otp, otpExpiryTimer, reasons, txnId, handlePostSuccessLogout]);

  const handleVerifyPassword = useCallback(async () => {
    if (!password.trim()) {
      setError('Please enter your ABHA password.');
      triggerShake();
      return;
    }
    setLoading(true);
    setError('');
    setStep('loading');
    try {
      const data = await config.verifyPassword({ password, reasons });
      if (data.status === 'success') {
        await handlePostSuccessLogout(data.message || 'Action completed successfully.');
      } else {
        setResponse(data);
        setError(data.message || 'Password verification failed');
        triggerShake();
        setStep('password');
      }
    } catch {
      setError('Network error during password verification.');
      triggerShake();
      setStep('password');
    } finally {
      setLoading(false);
    }
  }, [config, password, reasons, handlePostSuccessLogout]);

  const canContinueSurvey =
    surveyOptionId !== '' && (surveyOptionId !== 'other' || otherReason.trim().length > 0);

  if (!open) return null;

  const stepTitle: Record<AccountActionWizardStep, string> = {
    warnings: config.title,
    survey: 'Help us improve?',
    'auth-method': 'Choose verification method',
    'send-otp': 'Send OTP',
    otp: 'Enter OTP',
    password: 'Enter ABHA password',
    loading: 'Processing…',
    result: 'Response',
  };

  return (
    <div
      className="account-action-modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && step === 'warnings') onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'grid',
        placeItems: 'end center',
        padding: '0',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-action-modal-title"
        aria-busy={loading}
        className={shake ? 'shake-modal' : ''}
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: 'min(92dvh, 720px)',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px 20px 0 0',
          padding: 'clamp(16px, 4vw, 24px)',
          boxShadow: 'var(--surface-shadow)',
          textAlign: 'left',
          animation: shake ? 'otp-shake 0.4s ease' : 'none',
        }}
      >
        <style>{`
          @media (min-width: 640px) {
            .account-action-modal-overlay {
              place-items: center !important;
              padding: 20px !important;
            }
            .account-action-modal-overlay > [role="dialog"] {
              border-radius: 24px !important;
            }
          }
        `}</style>

        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '16px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px',
          }}
        >
          <h2
            id="account-action-modal-title"
            style={{
              margin: 0,
              fontSize: 'clamp(15px, 4vw, 17px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShieldAlert
              style={{ width: '18px', height: '18px', color: 'var(--danger)', flexShrink: 0 }}
              aria-hidden
            />
            {stepTitle[step]}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              minWidth: '44px',
              minHeight: '44px',
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </header>

        {step === 'warnings' && (
          <>
            <div
              role="alert"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '12px',
                padding: 'clamp(12px, 3vw, 16px)',
                marginBottom: '16px',
              }}
            >
              <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '13px', color: '#dc2626' }}>
                <AlertTriangle
                  style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px' }}
                  aria-hidden
                />
                Please read carefully
              </p>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '18px',
                  fontSize: 'clamp(12px, 3.2vw, 13px)',
                  lineHeight: 1.65,
                  color: 'var(--text-primary)',
                }}
              >
                {config.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
            <button type="button" onClick={() => setStep('survey')} style={primaryBtnFull}>
              I understand, continue <ChevronRight style={{ width: '14px' }} aria-hidden />
            </button>
          </>
        )}

        {step === 'survey' && (
          <>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              {config.surveyTitle}
            </p>
            <div
              role="radiogroup"
              aria-label="Reason for this action"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}
            >
              {ABHA_DEACTIVATION_SURVEY_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: `1px solid ${surveyOptionId === opt.id ? 'var(--accent-teal)' : 'var(--border-color)'}`,
                    background:
                      surveyOptionId === opt.id ? 'rgba(20,184,166,0.06)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: 'clamp(11px, 3vw, 12px)',
                    minHeight: '44px',
                    alignItems: 'flex-start',
                  }}
                >
                  <input
                    type="radio"
                    name="survey"
                    checked={surveyOptionId === opt.id}
                    onChange={() => {
                      setSurveyOptionId(opt.id);
                      setError('');
                    }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {surveyOptionId === 'other' && (
              <textarea
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Describe your reason…"
                rows={3}
                aria-label="Other reason"
                style={textareaStyle}
              />
            )}
            <div style={btnRow}>
              <button type="button" onClick={() => setStep('warnings')} style={secondaryBtn}>
                Back
              </button>
              <button
                type="button"
                disabled={!canContinueSurvey}
                onClick={() => setStep('auth-method')}
                style={{ ...primaryBtn, opacity: canContinueSurvey ? 1 : 0.5, flex: 1 }}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 'auth-method' && (
          <>
            <p style={{ fontSize: '13px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
              Choose how you want to verify this action:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {ABHA_AUTH_CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setAuthChannel(ch.id);
                    setError('');
                  }}
                  aria-pressed={authChannel === ch.id}
                  style={{
                    textAlign: 'left',
                    padding: '12px',
                    borderRadius: '10px',
                    minHeight: '48px',
                    border: `1px solid ${authChannel === ch.id ? 'var(--accent-teal)' : 'var(--border-color)'}`,
                    background:
                      authChannel === ch.id ? 'rgba(20,184,166,0.06)' : 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  <strong style={{ fontSize: '12.5px', display: 'block' }}>{ch.label}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ch.description}</span>
                </button>
              ))}
            </div>
            <div style={btnRow}>
              <button type="button" onClick={() => setStep('survey')} style={secondaryBtn}>
                Back
              </button>
              <button
                type="button"
                disabled={!authChannel}
                onClick={() => {
                  if (authChannel === 'password') setStep('password');
                  else setStep('send-otp');
                }}
                style={{ ...primaryBtn, opacity: authChannel ? 1 : 0.5, flex: 1 }}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 'send-otp' && (
          <>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              We will send a one-time password to verify your identity. Tap below to receive the OTP
              on your registered mobile.
            </p>
            {otpMessage && (
              <p
                role="status"
                style={{ fontSize: '12px', color: 'var(--accent-teal)', marginBottom: '12px' }}
              >
                {otpMessage}
              </p>
            )}
            {error && (
              <p role="alert" style={errorStyle}>
                {error}
              </p>
            )}
            <div style={btnRow}>
              <button type="button" onClick={() => setStep('auth-method')} style={secondaryBtn}>
                Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => void handleRequestOtp()}
                style={{ ...primaryBtn, flex: 1, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Sending OTP…' : 'Send OTP'}
              </button>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            {otpMessage && (
              <p
                role="status"
                style={{
                  fontSize: '12px',
                  color: 'var(--accent-teal)',
                  marginBottom: '12px',
                  lineHeight: 1.5,
                }}
              >
                {otpMessage}
              </p>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginBottom: '4px',
              }}
            >
              <span>
                Expires in{' '}
                <strong style={{ color: otpExpiryTimer === 0 ? 'var(--danger)' : 'inherit' }}>
                  {otpExpiryTimer === 0 ? 'Expired' : formatCountdown(otpExpiryTimer)}
                </strong>
              </span>
              {resendTimer > 0 ? (
                <span>Resend in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleRequestOtp()}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-teal)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '11px',
                    padding: '4px',
                  }}
                >
                  Resend OTP
                </button>
              )}
            </div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Enter 6-digit OTP
            </label>
            <OtpInput
              value={otp}
              onChange={(val) => {
                setError('');
                setOtp(val);
              }}
              error={!!error}
              disabled={loading || otpExpiryTimer === 0}
              shake={shake}
              onEnter={() => {
                if (!loading && otp.length === 6) void handleVerifyOtp();
              }}
            />
            {error && (
              <p role="alert" style={errorStyle}>
                {error}
              </p>
            )}
            <div style={{ ...btnRow, marginTop: '12px' }}>
              <button type="button" onClick={() => setStep('send-otp')} style={secondaryBtn}>
                Back
              </button>
              <button
                type="button"
                onClick={() => void handleVerifyOtp()}
                disabled={loading || otp.length !== 6 || otpExpiryTimer === 0}
                style={{
                  ...dangerBtn,
                  flex: 1,
                  opacity: loading || otp.length !== 6 || otpExpiryTimer === 0 ? 0.6 : 1,
                }}
              >
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>
            </div>
          </>
        )}

        {step === 'password' && (
          <>
            <label htmlFor="account-action-password" style={{ fontSize: '12px', fontWeight: 600 }}>
              ABHA password
            </label>
            <input
              id="account-action-password"
              type="password"
              value={password}
              onChange={(e) => {
                setError('');
                setPassword(e.target.value);
              }}
              style={{
                ...textareaStyle,
                letterSpacing: 'normal',
                marginTop: '8px',
                marginBottom: '8px',
              }}
              autoComplete="current-password"
            />
            {error && (
              <p role="alert" style={errorStyle}>
                {error}
              </p>
            )}
            <div style={btnRow}>
              <button type="button" onClick={() => setStep('auth-method')} style={secondaryBtn}>
                Back
              </button>
              <button
                type="button"
                onClick={() => void handleVerifyPassword()}
                disabled={loading || !password.trim()}
                style={{ ...dangerBtn, flex: 1, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Verifying…' : 'Verify & submit'}
              </button>
            </div>
          </>
        )}

        {step === 'loading' && (
          <p
            role="status"
            aria-live="polite"
            style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', padding: '24px 0' }}
          >
            {loading ? 'Please wait…' : 'Processing your request…'}
          </p>
        )}

        {step === 'result' && response && (
          <>
            <AccountActionResponseCard
              response={response}
              successTitle={config.kind === 'delete' ? 'ABHA deleted' : 'ABHA deactivated'}
              errorTitle="Action could not be completed"
            />
            <button type="button" onClick={() => setStep('auth-method')} style={{ ...secondaryBtn, width: '100%' }}>
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '12px 16px',
  minHeight: '44px',
  borderRadius: '10px',
  border: 'none',
  background: 'var(--accent-teal)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '13px',
  cursor: 'pointer',
};

const primaryBtnFull: React.CSSProperties = { ...primaryBtn, width: '100%' };

const secondaryBtn: React.CSSProperties = {
  padding: '12px 16px',
  minHeight: '44px',
  borderRadius: '10px',
  border: '1px solid var(--border-color)',
  background: 'transparent',
  color: 'var(--text-primary)',
  fontWeight: 600,
  fontSize: '13px',
  cursor: 'pointer',
};

const dangerBtn: React.CSSProperties = { ...primaryBtn, background: 'var(--danger)' };

const btnRow: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  marginBottom: '12px',
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  fontSize: '13px',
  boxSizing: 'border-box',
};

const errorStyle: React.CSSProperties = {
  color: 'var(--danger)',
  fontSize: '12px',
  marginTop: '8px',
};
