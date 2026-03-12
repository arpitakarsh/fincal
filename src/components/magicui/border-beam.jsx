'use client';

import React from 'react';

export function BorderBeam({
  duration = 6,
  size = 150,
  colorFrom = '#93c5fd',
  colorTo = '#ffffff',
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        pointerEvents: 'none',
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'xor',
        WebkitMaskComposite: 'xor',
        padding: 1,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -1,
          borderRadius: 'inherit',
          background: `conic-gradient(from 0deg, transparent 0deg, ${colorFrom} 90deg, ${colorTo} 180deg, transparent 270deg)`,
          filter: 'blur(6px)',
          opacity: 0.9,
          animation: `border-beam-spin ${duration}s linear infinite`,
          transformOrigin: 'center',
        }}
      />
      <style jsx>{`
        @keyframes border-beam-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          div {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default BorderBeam;
