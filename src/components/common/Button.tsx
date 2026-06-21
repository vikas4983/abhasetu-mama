/**
 * @file        Button.tsx
 * @description Reusable, theme-aware action button supporting primary, secondary, outline, and back variants.
 * @module      components/common
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-21
 * @modified    2026-06-21
 */

'use client';

import React from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'back';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The text content or elements to render inside the button */
  children: React.ReactNode;
  /** Visual theme variant */
  variant?: ButtonVariant;
  /** Shows a loading spinner and disables interaction */
  isLoading?: boolean;
  /** Optional icon to render inside the button (on the left side, or right for non-back variants) */
  icon?: React.ReactNode;
  /** Places the icon on the right instead of the left */
  iconPosition?: 'left' | 'right';
  /** Extra inline styles */
  style?: React.CSSProperties;
  /** Extra class names */
  className?: string;
}

/**
 * @description Button component supporting consistent layouts, hover, loading states, and automatic ArrowLeft icon integration for 'back' variant.
 */
export default function Button({
  children,
  variant = 'primary',
  isLoading = false,
  icon,
  iconPosition = 'left',
  disabled,
  style,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  // Base styles for the button
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    minHeight: '42px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    outline: 'none',
    border: '1px solid transparent',
    width: 'auto',
    opacity: isDisabled ? 0.6 : 1,
    userSelect: 'none',
    ...style,
  };

  // Variant specific styling overrides using CSS variables
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'back':
        return {
          background: 'rgba(20, 184, 166, 0.05)',
          border: '1px solid rgba(20, 184, 166, 0.35)',
          color: 'var(--accent-teal, #14b8a6)',
        };
      case 'outline':
        return {
          background: 'transparent',
          border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
          color: 'var(--text-primary)',
        };
      case 'secondary':
        return {
          background: 'rgba(20, 184, 166, 0.1)',
          border: '1px solid rgba(20, 184, 166, 0.2)',
          color: 'var(--accent-teal, #14b8a6)',
        };
      case 'primary':
      default:
        return {
          background: 'var(--accent-blue, #6366f1)',
          border: '1px solid var(--accent-blue, #6366f1)',
          color: '#ffffff',
        };
    }
  };

  const variantStyles = getVariantStyles();

  // Combine inline styles
  const combinedStyles: React.CSSProperties = {
    ...baseStyle,
    ...variantStyles,
  };

  // Hover animations/effects are handled via inline hover state wrapper or simple active scale transitions
  return (
    <button
      type={type}
      disabled={isDisabled}
      style={combinedStyles}
      className={`setu-button ${variant === 'primary' ? 'join-btn' : ''} ${className}`}
      onMouseDown={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'scale(0.97)';
        }
      }}
      onMouseUp={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'none';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'none';
        }
      }}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" style={{ width: '14px', height: '14px', flexShrink: 0 }} />
      ) : variant === 'back' ? (
        <ArrowLeft style={{ width: '14px', height: '14px', flexShrink: 0 }} />
      ) : icon && iconPosition === 'left' ? (
        <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>
      ) : null}

      <span>{children}</span>

      {!isLoading && variant !== 'back' && icon && iconPosition === 'right' && (
        <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>
      )}
    </button>
  );
}
