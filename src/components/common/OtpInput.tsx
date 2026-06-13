/**
 * @file        OtpInput.tsx
 * @description Reusable 6-digit segmented OTP input component.
 * @module      components/common
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-11
 * @modified    2026-06-11
 */

'use client';

import React, { useRef } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

/**
 * @description OtpInput component renders 6 individual numeric inputs for entering verification codes.
 * Supports auto-focusing subsequent inputs, backspacing to delete/focus previous inputs, and clipboard paste events.
 */
export default function OtpInput({ value, onChange, error, disabled }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (!disabled) {
      const t = setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 50);
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
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '12px 0' }}>
      {otpArray.map((digit, idx) => (
        <input
          key={idx}
          type="text"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          ref={(el) => { inputsRef.current[idx] = el; }}
          style={{
            width: '42px',
            height: '46px',
            borderRadius: '8px',
            border: error ? '2px solid var(--danger)' : '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'auto',
          }}
          aria-label={`Digit ${idx + 1}`}
        />
      ))}
    </div>
  );
}
