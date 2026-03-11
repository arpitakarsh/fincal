'use client';

import { useState, useEffect } from 'react';

const TAGLINES = [
  'Plan your house. Start your SIP.',
  'Fund your child\'s education. Today.',
  'Your dream wedding. Financially ready.',
  'Retire rich. Start now.',
];

export default function HeroSection({ onGetStarted }) {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const current = TAGLINES[taglineIndex];
    if (charIndex < current.length) {
      const t = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex + 1));
        setCharIndex(c => c + 1);
      }, 40);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setTaglineIndex(i => (i + 1) % TAGLINES.length);
        setDisplayed('');
        setCharIndex(0);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [charIndex, taglineIndex]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fb',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 24px',
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: '#224c87',
        marginBottom: 16,
      }}>
        HDFC Mutual Fund × FinCal
      </p>

      <h1 style={{
        fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
        fontSize: 'clamp(28px, 6vw, 56px)',
        fontWeight: 700,
        color: '#1a1a2e',
        marginBottom: 8,
        lineHeight: 1.2,
      }}>
        Goal-Based Investment
      </h1>

      <h1 style={{
        fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
        fontSize: 'clamp(28px, 6vw, 56px)',
        fontWeight: 700,
        color: '#224c87',
        marginBottom: 24,
        lineHeight: 1.2,
        minHeight: '1.3em',
      }}>
        {displayed}<span style={{ opacity: 0.4 }}>|</span>
      </h1>

      <p style={{
        fontSize: 16,
        color: '#919090',
        maxWidth: 480,
        lineHeight: 1.7,
        marginBottom: 40,
      }}>
        Calculate exactly how much SIP you need to reach any financial goal.
        Powered by smart assumptions, not guesswork.
      </p>

      <button
        onClick={onGetStarted}
        style={{
          padding: '16px 40px',
          background: '#224c87',
          color: '#fff',
          border: 'none',
          borderRadius: 999,
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
          boxShadow: '0 4px 24px rgba(34,76,135,0.25)',
          transform: 'scale(1)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => {
          e.target.style.transform = 'scale(1.04)';
          e.target.style.boxShadow = '0 8px 32px rgba(34,76,135,0.35)';
        }}
        onMouseLeave={e => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 24px rgba(34,76,135,0.25)';
        }}
      >
        Calculate My SIP →
      </button>

      <p style={{ fontSize: 11, color: '#919090', marginTop: 16 }}>
        Free. No login required. Illustrative only.
      </p>
    </div>
  );
}