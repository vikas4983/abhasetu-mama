/**
 * @file        ImageCropper.tsx
 * @description Interactive Image Cropper component with zoom, pan, and size-limit auto-compression.
 * @module      common
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-16
 * @modified    2026-06-16
 */

import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, RotateCcw, Check, X } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (base64: string, sizeKb: number) => void;
  onCancel: () => void;
  aspectRatio?: number; // width / height
  maxSizeKb?: number;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 1, // Default 1:1 square crop
  maxSizeKb = 100,  // Auto-enforce <= 100KB
}) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Initialize container dimensions
  useEffect(() => {
    if (containerRef.current) {
      setContainerSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }
  }, []);

  // Reset states when image source changes
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [imageSrc]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setOffset({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const resetTransform = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const executeCrop = () => {
    const img = imageRef.current;
    if (!img || !imageSize.width || !imageSize.height) return;

    // Create target canvas
    const canvas = document.createElement('canvas');
    
    // Standard size for cropped profile photo
    const targetSize = 400;
    canvas.width = targetSize;
    canvas.height = Math.round(targetSize / aspectRatio);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate dimensions
    const cropBoxWidth = containerSize.width * 0.75;
    const cropBoxHeight = cropBoxWidth / aspectRatio;

    // Get actual bounding boxes
    const displayedWidth = img.width;
    const displayedHeight = img.height;

    // Map displayed points to original image coordinate space
    const scaleX = imageSize.width / displayedWidth;
    const scaleY = imageSize.height / displayedHeight;

    // Center of container
    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;

    // Top-left of crop frame relative to container center
    const cropLeft = centerX - cropBoxWidth / 2;
    const cropTop = centerY - cropBoxHeight / 2;

    // Compute coordinate mapping:
    // Displayed coordinates of the photo's top-left corner relative to container center:
    // center + offset.x - (displayedWidth * zoom) / 2
    const imgLeft = centerX + offset.x - (displayedWidth * zoom) / 2;
    const imgTop = centerY + offset.y - (displayedHeight * zoom) / 2;

    // Express crop area's position relative to the scaled image
    const sourceX = (cropLeft - imgLeft) / zoom * scaleX;
    const sourceY = (cropTop - imgTop) / zoom * scaleY;
    const sourceWidth = (cropBoxWidth / zoom) * scaleX;
    const sourceHeight = (cropBoxHeight / zoom) * scaleY;

    // Draw to Canvas
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Compress with size guard limit
    let quality = 0.85;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    let size = Math.round((dataUrl.length - 'data:image/jpeg;base64,'.length) * 3 / 4);

    while (size > maxSizeKb * 1024 && quality > 0.1) {
      quality -= 0.08;
      dataUrl = canvas.toDataURL('image/jpeg', quality);
      size = Math.round((dataUrl.length - 'data:image/jpeg;base64,'.length) * 3 / 4);
    }

    const base64 = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
    onCropComplete(base64, parseFloat((size / 1024).toFixed(1)));
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '100%',
      maxWidth: '440px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: 'var(--surface-shadow)',
    }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Move style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
          <span>Crop & Position Photo</span>
        </h4>
        <button 
          onClick={onCancel} 
          style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X style={{ width: '18px', height: '18px' }} />
        </button>
      </div>

      {/* Cropper viewport container */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          background: '#090d16',
          borderRadius: '12px',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Render Image with style transformations */}
        {imageSrc && (
          <img
            ref={imageRef}
            src={imageSrc}
            onLoad={handleImageLoad}
            alt="Source to Crop"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Semi-transparent dark overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 0 9999px rgba(15, 23, 42, 0.75)',
        }} />

        {/* Highlights the cropping box */}
        <div style={{
          position: 'absolute',
          width: '75%',
          aspectRatio: aspectRatio,
          border: '2px solid var(--accent-teal)',
          borderRadius: aspectRatio === 1 ? '50%' : '8px', // Circular crop for 1:1, rounded corners for rectangular
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.1)',
          pointerEvents: 'none',
          boxSizing: 'border-box',
        }} />

        {/* Small drag helper indicator */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '9px',
          color: '#ffffff',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontWeight: 'bold',
        }}>
          <Move style={{ width: '10px', height: '10px', color: 'var(--accent-teal)' }} />
          <span>Drag to pan, slider to zoom</span>
        </div>
      </div>

      {/* Control Sliders & Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ZoomOut style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              outline: 'none',
              WebkitAppearance: 'none',
              background: 'var(--border-color)',
              cursor: 'pointer',
            }}
          />
          <ZoomIn style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
        </div>

        {/* Crop Controls Button Row */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={resetTransform}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            <RotateCcw style={{ width: '13px', height: '13px' }} />
            <span>Reset</span>
          </button>
          
          <div style={{ flex: 1 }} />

          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={executeCrop}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--accent-teal)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            <Check style={{ width: '13px', height: '13px' }} />
            <span>Crop & Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};
