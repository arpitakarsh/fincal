'use client';

import { useState, useEffect, useRef } from 'react';

export default function InsightParagraph({ results, goalType, yrs, inflation, annualRet }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!results) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'insight',
            data: {
              goalType,
              cost: results.fv,
              sip: results.sip,
              yrs,
              inflation,
              annualRet,
            },
          }),
        });
        const { result } = await res.json();
        setText(result);
      } catch {
        setText('');
      } finally {
        setLoading(false);
      }
    }, 1500);

    return () => clearTimeout(debounceRef.current);
  }, [results?.sip, goalType, yrs, inflation, annualRet]);

  if (!results) return null;

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e6ed',
      borderRadius: 16,
      padding: '16px 20px',
    }}>
      <p style={{ fontSize: 11, color: '#224c87', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Your Goal Summary
      </p>

      {loading ? (
        <div>
          {[100, 80, 60].map((w, i) => (
            <div key={i} style={{
              height: 12, borderRadius: 6,
              background: '#e2e6ed',
              width: `${w}%`,
              marginBottom: 8,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 14, color: '#1a1a2e', lineHeight: 1.7 }}>
          {text || '—'}
        </p>
      )}

      <p style={{ fontSize: 11, color: '#919090', marginTop: 10 }}>
        * AI-generated summary. Illustrative only.
      </p>
    </div>
  );
}