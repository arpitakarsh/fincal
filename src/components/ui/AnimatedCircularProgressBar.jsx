'use client';

import { useMemo } from 'react';

export default function AnimatedCircularProgressBar({
  value,
  gaugePrimaryColor = '#224c87',
  gaugeSecondaryColor = 'rgba(34, 76, 135, 0.1)',
  size = 140,
  strokeWidth = 10,
}) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const offset = useMemo(
    () => circumference * (1 - safeValue / 100),
    [circumference, safeValue]
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={gaugeSecondaryColor}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={gaugePrimaryColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 600ms ease' }}
      />
    </svg>
  );
}
