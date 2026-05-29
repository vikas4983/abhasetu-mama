'use client';

import React, { useEffect, useRef } from 'react';

export default function EcgCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle High-DPI screen scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    let points: { x: number; y: number }[] = [];
    const maxPoints = 280;
    let x = 0;

    // High-fidelity clinical ECG wave pattern (P-Q-R-S-T)
    const ecgPattern = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // Baseline
      0.04, 0.08, 0.12, 0.15, 0.12, 0.08, 0.04, 0, // P wave (atrial depolarization)
      0, 0, 0, 0, 0, // Baseline
      -0.08, // Q wave
      0.75, // R wave peak (ventricular depolarization)
      -0.22, // S wave drop
      0, 0, 0, 0, 0, // Baseline
      0.08, 0.16, 0.22, 0.25, 0.22, 0.16, 0.08, 0, // T wave (ventricular repolarization)
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 // Baseline
    ];

    let patternIdx = 0;
    let animationFrameId: number;

    function drawGrid() {
      if (!ctx) return;
      ctx.strokeStyle = 'color-mix(in srgb, var(--accent-teal) 4%, transparent)';
      ctx.lineWidth = 1;

      // Vertical grid
      for (let i = 0; i < width; i += 24) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      // Horizontal grid
      for (let i = 0; i < height; i += 15) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
    }

    function animate() {
      if (!ctx) return;
      let targetVal = 0;

      // Trigger heartbeat wave
      if (Math.random() < 0.05 && patternIdx === 0) {
        patternIdx = 1;
      }

      if (patternIdx > 0) {
        targetVal = ecgPattern[patternIdx - 1];
        patternIdx++;
        if (patternIdx > ecgPattern.length) {
          patternIdx = 0;
        }
      }

      const centerY = height / 2;
      const yVal = centerY - (targetVal * (height * 0.42));

      points.push({ x: x, y: yVal });
      if (points.length > maxPoints) {
        points.shift();
        points.forEach((pt) => (pt.x -= 1.6));
      } else {
        x += 1.6;
      }

      ctx.clearRect(0, 0, width, height);
      drawGrid();

      // Neon glow line style
      ctx.strokeStyle = 'var(--accent-teal, #00d4aa)';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'color-mix(in srgb, var(--accent-teal) 60%, transparent)';

      ctx.beginPath();
      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
      }
      ctx.stroke();

      // Glowing lead sensor dot
      ctx.shadowBlur = 0;
      if (points.length > 0) {
        const lead = points[points.length - 1];
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(lead.x, lead.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '60px', display: 'block', borderRadius: '8px' }}
    />
  );
}
