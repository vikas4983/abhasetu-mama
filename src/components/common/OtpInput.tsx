/**
 * @file        OtpInput.tsx
 * @description Reusable 6-digit segmented OTP input component with auto-focus on mount.
 * @module      components/common
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-11
 * @modified    2026-06-14
 */

'use client';

import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  shake?: boolean;
  onEnter?: () => void;
}

/**
 * @description OtpInput component renders 6 individual numeric inputs for entering verification codes.
 * Supports auto-focusing on mount, auto-advancing on digit entry, backspace to delete/focus prev,
 * clipboard paste events, and active border highlighting.
 */
export default function OtpInput({ value, onChange, error, disabled, shake, onEnter }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus the first digit box when the component mounts or becomes enabled
  useEffect(() => {
    if (!disabled) {
      const t = setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [disabled]);

  // Split value into an array of 6 characters, padded with empty strings
  const otpArray = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (disabled) return;
    const val = e.target.value.replace(/\D/g, ''); // Extract only digits
    if (val === '') {
      const newOtp = [...otpArray];
      newOtp[index] = '';
      onChange(newOtp.join(''));
      return;
    }

    const digit = val.slice(-1); // Only take the last character typed
    const newOtp = [...otpArray];
    newOtp[index] = digit;
    onChange(newOtp.join(''));

    // Auto-focus next input if a digit is typed
    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (disabled) return;
    if (e.key === 'Backspace') {
      if (otpArray[index] === '') {
        // If current box is empty, delete previous and move focus back
        if (index > 0) {
          const newOtp = [...otpArray];
          newOtp[index - 1] = '';
          onChange(newOtp.join(''));
          inputsRef.current[index - 1]?.focus();
        }
      } else {
        // If current box has a digit, delete it but keep focus here
        const newOtp = [...otpArray];
        newOtp[index] = '';
        onChange(newOtp.join(''));
      }
      e.preventDefault(); // Prevent default browser backspace behavior
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      if (value.length === 6 && onEnter) {
        onEnter();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const digits = pastedText.replace(/\D/g, '').slice(0, 6);
    if (digits.length > 0) {
      onChange(digits);
      // Focus the appropriate input after paste
      const targetIndex = Math.min(digits.length - 1, 5);
      inputsRef.current[targetIndex]?.focus();
    }
  };

  return (
    <div
      className="otp-input-row"
      style={{
        display: 'flex',
        gap: 'clamp(4px, 2vw, 8px)',
        justifyContent: 'center',
        margin: '12px 0',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      <style>{`
        .otp-input-row input {
          width: clamp(36px, 12vw, 48px) !important;
          height: clamp(44px, 14vw, 54px) !important;
          font-size: clamp(18px, 5vw, 22px) !important;
        }
      `}</style>
      {otpArray.map((digit, idx) => (
        <input
          key={idx}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          ref={(el) => { inputsRef.current[idx] = el; }}
          style={{
            width: '48px',
            height: '54px',
            borderRadius: '10px',
            border: error
              ? '2px solid var(--danger)'
              : digit
                ? '2px solid var(--accent-teal)'
                : '2px solid var(--border-color)',
            background: error
              ? 'rgba(239,68,68,0.06)'
              : digit ? 'rgba(20,184,166,0.06)' : 'var(--bg-primary)',
            color: error ? 'var(--danger)' : 'var(--text-primary)',
            fontSize: '22px',
            fontWeight: 'bold',
            textAlign: 'center',
            outline: 'none',
            transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease',
            boxShadow: error
              ? '0 0 0 3px rgba(239,68,68,0.15)'
              : digit ? '0 0 0 3px rgba(20,184,166,0.12)' : 'none',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'auto',
            caretColor: 'transparent',
            animation: (shake && error) ? 'otp-shake 0.4s ease' : 'none',
            transform: digit ? 'scale(1.02)' : 'scale(1)',
          }}
          aria-label={`Digit ${idx + 1} of 6`}
        />
      ))}
    </div>
  );
}

