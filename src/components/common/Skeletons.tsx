'use client';

import React from 'react';

// Common shimmer base class
const Shimmer = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`setu-skeleton ${className}`} style={style} />
);

export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <article key={i} className="route-card" style={{ padding: '20px', minHeight: '140px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Shimmer className="setu-skeleton-avatar" style={{ width: '40px', height: '40px' }} />
            <div style={{ flex: 1 }}>
              <Shimmer className="setu-skeleton-title" style={{ width: '60%', height: '14px', marginBottom: '6px' }} />
              <Shimmer className="setu-skeleton-text" style={{ width: '35%', height: '10px' }} />
            </div>
          </div>
          <Shimmer className="setu-skeleton-text" style={{ width: '90%', height: '10px', marginBottom: '8px' }} />
          <Shimmer className="setu-skeleton-text" style={{ width: '80%', height: '10px', marginBottom: '14px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Shimmer className="setu-skeleton-button" style={{ width: '80px', height: '24px', borderRadius: '4px' }} />
            <Shimmer className="setu-skeleton-text" style={{ width: '60px', height: '12px' }} />
          </div>
        </article>
      ))}
    </>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
          }}
        >
          <Shimmer className="setu-skeleton-avatar" style={{ width: '34px', height: '34px', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Shimmer className="setu-skeleton-title" style={{ width: '40%', height: '12px', marginBottom: '6px' }} />
            <Shimmer className="setu-skeleton-text" style={{ width: '75%', height: '10px' }} />
          </div>
          <Shimmer className="setu-skeleton-text" style={{ width: '50px', height: '8px', flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 4, cols = 3 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)' }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px', padding: '14px 18px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Shimmer key={i} className="setu-skeleton-title" style={{ width: '50%', height: '12px' }} />
        ))}
      </div>
      {/* Body Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px', padding: '14px 18px', borderBottom: r === rows - 1 ? 'none' : '1px solid var(--border-color)' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Shimmer key={c} className="setu-skeleton-text" style={{ width: c === 0 ? '70%' : '50%', height: '10px' }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div style={{ display: 'grid', gap: '16px', padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
      <Shimmer className="setu-skeleton-title" style={{ width: '30%', height: '14px', marginBottom: '4px' }} />
      <div style={{ display: 'grid', gap: '6px' }}>
        <Shimmer className="setu-skeleton-text" style={{ width: '120px', height: '10px' }} />
        <Shimmer className="setu-skeleton-button" style={{ height: '42px' }} />
      </div>
      <div style={{ display: 'grid', gap: '6px' }}>
        <Shimmer className="setu-skeleton-text" style={{ width: '100px', height: '10px' }} />
        <Shimmer className="setu-skeleton-button" style={{ height: '42px' }} />
      </div>
      <Shimmer className="setu-skeleton-button" style={{ height: '44px', width: '150px', marginTop: '10px', justifySelf: 'start' }} />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
      <Shimmer className="setu-skeleton-avatar" style={{ width: '80px', height: '80px', marginBottom: '16px' }} />
      <Shimmer className="setu-skeleton-title" style={{ width: '40%', height: '16px', marginBottom: '8px' }} />
      <Shimmer className="setu-skeleton-text" style={{ width: '60%', height: '11px', marginBottom: '20px' }} />
      <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
        <Shimmer className="setu-skeleton-button" style={{ width: '90px', height: '32px' }} />
        <Shimmer className="setu-skeleton-button" style={{ width: '90px', height: '32px' }} />
      </div>
    </div>
  );
}

export function WidgetSkeleton() {
  return (
    <div className="health-card" style={{ minHeight: '120px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <Shimmer className="setu-skeleton-text" style={{ width: '25%', height: '10px' }} />
        <Shimmer className="setu-skeleton-text" style={{ width: '15%', height: '10px' }} />
      </div>
      <Shimmer className="setu-skeleton-title" style={{ width: '60%', height: '26px', marginBottom: '8px' }} />
      <Shimmer className="setu-skeleton-image" style={{ height: '30px' }} />
    </div>
  );
}
