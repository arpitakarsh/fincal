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
    <div style={{ marginBottom: 16, width: '100%', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          background: '#ffffff',
          border: '2px solid #e2e6ed',
          borderRadius: 999,
          padding: '4px 6px 4px 16px',
          height: 48,
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
        className="focus-within:!border-[#224c87] focus-within:shadow-[0_0_0_3px_rgba(34,76,135,0.1)]"
      >
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleParse()}
          placeholder='e.g. "Buy a house in 10 years for 50 lakhs"'
          inputMode="text"
          aria-label="Describe your goal in plain English"
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            border: 'none',
            outline: 'none',
            fontSize: 14,
            color: '#1a1a2e',
            background: 'transparent',
          }}
          className="placeholder:text-[#9ca3af]"
        />
        <button
          onClick={handleParse}
          disabled={loading || !text.trim()}
          aria-label="Parse goal"
          style={{
            padding: '0 16px',
            borderRadius: 999,
            background: '#224c87',
            color: '#fff',
            border: 'none',
            fontSize: 14,
            fontWeight: 600,
            flexShrink: 0,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading || !text.trim() ? 0.7 : 1,
            transition: 'background 0.15s ease, opacity 0.15s ease, transform 0.15s ease',
            height: 40,
            minWidth: 56,
          }}
          className="hover:!bg-[#1a3d6e] active:scale-[0.97]"
          onMouseEnter={(e) => {
            if (!loading && text.trim()) e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
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
