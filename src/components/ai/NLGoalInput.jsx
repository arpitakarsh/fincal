'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NLGoalInput({ onApply }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleParse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setPreview(null);
    setError('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'parser', data: { text } }),
      });
      const { result } = await res.json();
      if (!result.goalType && !result.cost && !result.yrs) {
        setError('Could not understand. Try: "House in 10 years for 50 lakhs"');
      } else {
        setPreview(result);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    onApply(preview);
    setPreview(null);
    setText('');
  };

  const handleEdit = () => {
    setPreview(null);
    inputRef.current?.focus();
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleParse()}
          placeholder='e.g. "Buy a house in 10 years for 50 lakhs"'
          inputMode="text"
          aria-label="Describe your goal in plain English"
          style={{
            width: '100%',
            padding: '14px 16px',
            paddingRight: '64px',
            borderRadius: 12,
            border: '1px solid #e2e6ed',
            fontSize: 14,
            color: '#1a1a2e',
            outline: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        />
        <button
          onClick={handleParse}
          disabled={loading || !text.trim()}
          aria-label="Parse goal"
          style={{
            position: 'absolute',
            right: 6,
            top: 6,
            bottom: 6,
            padding: '0 18px',
            borderRadius: 8,
            background: '#224c87',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading || !text.trim() ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? '...' : 'Go'}
        </button>
      </div>

      {error && (
        <p style={{ color: '#da3832', fontSize: 12, marginTop: 6 }}>{error}</p>
      )}

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              marginTop: 10,
              padding: '14px 16px',
              background: '#e8eef7',
              borderRadius: 10,
              border: '1px solid #224c87',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#224c87', fontWeight: 700, marginBottom: 2 }}>
                  Goal Detected
                </p>
                <p style={{ fontSize: 18, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a1a2e', textTransform: 'capitalize' }}>
                  {preview.goalType ?? 'General'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 20, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#224c87' }}>
                  ₹{preview.cost?.toLocaleString('en-IN') ?? '—'}
                </p>
                <p style={{ fontSize: 11, color: '#919090' }}>
                  {preview.yrs ? `${preview.yrs} Years Horizon` : '— Years'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleApply}
                style={{
                  padding: '8px 20px', borderRadius: 999,
                  background: '#224c87', color: '#fff',
                  border: 'none', fontWeight: 600, cursor: 'pointer',
                  minHeight: 44,
                }}
              >
                Apply
              </button>
              <button
                onClick={handleEdit}
                style={{
                  padding: '8px 20px', borderRadius: 999,
                  background: '#fff', color: '#224c87',
                  border: '1px solid #224c87', fontWeight: 600, cursor: 'pointer',
                  minHeight: 44,
                }}
              >
                Edit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}