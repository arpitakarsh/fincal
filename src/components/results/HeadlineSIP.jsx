'use client';

import { useEffect, useRef } from 'react';
import CountUp from 'react-countup';

export default function HeadlineSIP({ results, fv, yrs, inflation }) {
  if (!results) return null;

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '24px',
      border: '1px solid #e2e6ed',
    }}>
      <p style={{ color: '#919090', fontSize: 14, marginBottom: 8 }}>
        Monthly SIP Required
      </p>

      <h1 style={{
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 700,
        fontSize: 'clamp(28px, 5vw, 42px)',
        color: '#224c87',
        marginBottom: 4,
      }}>
        ₹<CountUp end={results.sip} duration={1} separator="," decimals={0} />
      </h1>

      <p style={{ color: '#919090', fontSize: 13, marginTop: 8 }}>
        Goal value in {yrs}y at {inflation}% inflation ={' '}
        <span style={{ color: '#1a1a2e', fontWeight: 600 }}>
          ₹<CountUp end={fv} duration={1} separator="," decimals={0} />
        </span>
      </p>

      <p style={{ fontSize: 12, color: '#919090', marginTop: 6 }}>
        * Estimated value. Illustrative only.
      </p>
    </div>
  );
}