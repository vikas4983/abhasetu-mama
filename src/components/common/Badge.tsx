/**
 * @file        Badge.tsx
 * @description Reusable theme-aware status badge component for visual indicators.
 * @module      components/common
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-21
 * @modified    2026-06-21
 */

'use client';

import React from 'react';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'active';

interface BadgeProps {
  /** The text content or element to render inside the badge */
  children: React.ReactNode;
  /** Visual variant affecting the background and text colors */
  variant?: BadgeVariant;
  /** Optional icon to render inside the badge */
  icon?: React.ReactNode;
  /** Optional inline custom styles */
  style?: React.CSSProperties;
  /** Optional HTML attributes and class names */
  className?: string;
  /** Optional description for accessibility / screen readers */
  title?: string;
}

/**
 * @description Renders a status badge indicator with color combinations that adjust to light/dark themes.
 */
export default function Badge({
  children,
  variant = 'primary',
  icon,
  style,
  className = '',
  title,
}: BadgeProps) {
  // Styles for different badge variants mapping to CSS variables
  const getColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'rgba(16, 185, 129, 0.12)', // var(--success) translucent
          color: 'var(--success, #10b981)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        };
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.12)', // var(--warning) translucent
          color: 'var(--warning, #f59e0b)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        };
      case 'danger':
        return {
          bg: 'rgba(239, 68, 68, 0.12)', // var(--danger) translucent
          color: 'var(--danger, #ef4444)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        };
      case 'info':
        return {
          bg: 'rgba(59, 130, 246, 0.12)', // blue translucent
          color: '#3b82f6',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        };
      case 'active':
      case 'primary':
      default:
        return {
          bg: 'rgba(20, 184, 166, 0.12)', // var(--accent-teal) translucent
          color: 'var(--accent-teal, #14b8a6)',
          border: '1.5px solid rgba(20, 184, 166, 0.35)',
        };
    }
  };

  const colors = getColors();

  return (
    <span
      className={`setu-badge ${className}`}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '9px',
        fontWeight: 800,
        backgroundColor: colors.bg,
        color: colors.color,
        border: colors.border,
        padding: '2px 8px',
        borderRadius: '12px',
        lineHeight: 1.2,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {icon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
