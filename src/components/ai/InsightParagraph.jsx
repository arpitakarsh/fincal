'use client';

import { useState, useEffect, useRef } from 'react';

export default function InsightParagraph({ results, goalType, yrs, inflation, annualRet }) {
  const [text, setText] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'insight',
          data: { goalType, cost: results.fv, sip: results.sip, yrs, inflation, annualRet },
        }),
      });
      const { result } = await res.json();
      setText(result);
    } catch {
      setText('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!results) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const timer = setTimeout(() => {
      generateInsight();
    }, 1500);
    debounceRef.current = timer;
    return () => clearTimeout(timer);
  }, [results, goalType, yrs, inflation, annualRet]);

  useEffect(() => {
    if (!text || loading) {
      setDisplayedText('');
      return;
    }
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(intervalId);
      }
    }, 20);
    return () => clearInterval(intervalId);
  }, [text, loading]);

  if (!results) return null;

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, boxShadow: '0 8px 32px rgba(34,76,135,0.12)', padding: 20 }}>
      <p style={{ fontSize: 11, color: '#224c87', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
        Your Goal Summary
      </p>

      {(loading || (!text && results)) ? (
        <div>
          {[100, 80, 60].map((w, i) => (
            <div key={i} style={{
              height: 12,
              borderRadius: 6,
              width: `${w}%`,
              marginBottom: 8,
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }} />
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 14, color: '#1a1a2e', lineHeight: 1.7, minHeight: 60 }}>
          {displayedText || text}
        </p>
      )}

      <p style={{ fontSize: 11, color: '#919090', marginTop: 10 }}>
        * AI-generated summary. Illustrative only.
      </p>
    </div>
  );
}
