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
      background: 'radial-gradient(circle at top center, #ffffff 0%, #f4f6fa 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Premium Glass Badge */}
      <div style={{
        background: 'rgba(34, 76, 135, 0.05)',
        border: '1px solid rgba(34, 76, 135, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '8px 20px',
        borderRadius: '999px',
        marginBottom: 32,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#224c87' }} />
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#224c87',
        }}>
          HDFC Mutual Fund  FinCal
        </span>
      </div>

      <h1 style={{
        fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
        fontSize: 'clamp(40px, 8vw, 72px)',
        fontWeight: 800,
        color: '#0f172a', /* Deep slate */
        marginBottom: 8,
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
      }}>
        Goal-Based Investment
      </h1>

      <h1 style={{
        fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
        fontSize: 'clamp(32px, 6vw, 56px)',
        fontWeight: 700,
        color: '#224c87',
        marginBottom: 24,
        lineHeight: 1.2,
        minHeight: '1.3em',
        letterSpacing: '-0.01em',
      }}>
        {displayed}<span style={{ opacity: 0.4, fontWeight: 300 }}>|</span>
      </h1>

      <p style={{
        fontSize: 18,
        color: '#64748b', /* Slate 500 */
        maxWidth: 540,
        lineHeight: 1.6,
        marginBottom: 48,
        fontWeight: 500,
      }}>
        Calculate exactly how much SIP you need to reach any financial goal.
        Powered by smart assumptions, not guesswork.
      </p>

      <button
        onClick={onGetStarted}
        style={{
          padding: '20px 48px',
          background: 'linear-gradient(135deg, #224c87 0%, #2f5fa3 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 999,
          fontSize: 18,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
          boxShadow: '0 10px 30px rgba(34,76,135,0.25)',
          transform: 'translateY(0) scale(1)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={e => {
          e.target.style.transform = 'translateY(-2px) scale(1.02)';
          e.target.style.boxShadow = '0 16px 40px rgba(34,76,135,0.3)';
        }}
        onMouseLeave={e => {
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.boxShadow = '0 10px 30px rgba(34,76,135,0.25)';
        }}
      >
        Calculate My SIP <span style={{ marginLeft: 8, opacity: 0.8 }}></span>
      </button>

      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 20, fontWeight: 500 }}>
        Free. No login required. Illustrative only.
      </p>
    </div>
  );
}