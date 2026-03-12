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
    <div className="flex flex-col sm:flex-row gap-3 w-full">
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
              background: '#fff',
              border: `2px solid ${isActive ? meta.color : '#e2e6ed'}`,
              borderRadius: 16,
              padding: '16px',
            }}
          >
            <div className="flex flex-row justify-between items-center sm:flex-col sm:justify-center text-left sm:text-center w-full">
              <div>
                <p style={{ fontSize: 12, color: meta.color, fontWeight: 600, marginBottom: 2 }}>
                  {s.label}
                </p>
                <p style={{ fontSize: 11, color: '#919090' }}>
                  {s.ret}% p.a.
                </p>
              </div>
              <div className="flex flex-col items-end sm:items-center mt-0 sm:mt-2">
                <p style={{
                  fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: 20,
                  color: '#1a1a2e',
                }}>
                  {s.sip > 0 ? (
                    <CountUp
                      end={s.sip}
                      duration={1}
                      separator=","
                      decimals={0}
                      prefix="₹"
                    />
                  ) : (
                    '—'
                  )}
                </p>
                <p style={{ fontSize: 11, color: '#919090', marginTop: 2 }}>
                  /month
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}