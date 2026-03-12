'use client';

import { useState, useEffect } from 'react';
import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GoalValidator({ results, goalType, cost, inflation, annualRet, yrs }) {
  const [flags, setFlags] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const prevInputs = useRef({});

  useEffect(() => {
    if (!results) return;

    const curr = { goalType, cost, inflation, annualRet, yrs };
    const prev = prevInputs.current;

    const changed = Object.keys(curr).some(k => {
      if (typeof curr[k] === 'number') return Math.abs(curr[k] - (prev[k] ?? 0)) / (prev[k] || 1) > 0.1;
      return curr[k] !== prev[k];
    });

    if (changed) {
      setDismissed([]);
      prevInputs.current = curr;
    }

    const run = async () => {
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'validator',
            data: { goalType, cost, inflation, annualRet, yrs },
          }),
        });
        const { result } = await res.json();
        setFlags(result ?? []);
      } catch {
        setFlags([]);
      }
    };

    run();
  }, [results?.sip]);

  const visible = flags.filter(f => !dismissed.includes(f.field));

  if (!visible.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <AnimatePresence>
        {visible.map(f => (
          <motion.div
            key={f.field}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            style={{
              background: '#f8fafe',
              border: '1px solid #e2e6ed',
              borderLeft: '4px solid #224c87',
              borderRadius: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <p style={{ fontSize: 13, color: '#1a1a2e', lineHeight: 1.5 }}>
              ℹ️ {f.msg}
            </p>
            <button
              onClick={() => setDismissed(prev => [...prev, f.field])}
              aria-label="Dismiss"
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', color: '#919090',
                fontSize: 16, minWidth: 44, minHeight: 44,
              }}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}