'use client';

import CountUp from 'react-countup';
import { motion } from 'framer-motion';

const SCENARIOS = [
  { id: 'conservative', label: 'Conservative', color: '#64748b' },
  { id: 'moderate',     label: 'Moderate',     color: '#224c87' },
  { id: 'aggressive',  label: 'Aggressive',   color: '#059669' },
];

export default function ScenarioCards({ scenarios, activeProfile }) {
  if (!scenarios?.length) return null;

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {scenarios.map((s, i) => {
        const meta = SCENARIOS.find(sc => sc.id === s.id);
        const isActive = s.id === 'moderate' || activeProfile === s.id;

        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: isActive ? [1, 1.02, 1] : 1, // Pulse effect on load/active
            }}
            transition={{ 
              delay: i * 0.1,
              scale: { duration: 0.4, ease: "easeInOut" }
            }}
            style={{
              flex: '1 1 140px',
              background: '#fff',
              border: `2px solid ${isActive ? meta.color : '#e2e6ed'}`,
              borderRadius: 16,
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 12, color: meta.color, fontWeight: 600, marginBottom: 6 }}>
              {s.label}
            </p>
            <p style={{ fontSize: 11, color: '#919090', marginBottom: 8 }}>
              {s.ret}% p.a.
            </p>
            <p style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: 20,
              color: '#1a1a2e',
            }}>
              ₹<CountUp end={s.sip} duration={1} separator="," decimals={0} />
            </p>
            <p style={{ fontSize: 11, color: '#919090', marginTop: 4 }}>
              /month
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}