import { AnimatePresence, motion } from 'framer-motion';
import { COLORS } from '@/lib/constants';

export default function LumpsumToggle({ lumpsumEnabled, lumpsumAmount, onToggle, onAmountChange }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: COLORS.text }}>
          One-time investment today
        </span>
        <button
          role="switch"
          aria-checked={lumpsumEnabled}
          aria-label="Toggle lumpsum investment"
          onClick={onToggle}
          className="relative focus:outline-none"
          style={{
            width: 44,
            height: 24,
            borderRadius: 999,
            backgroundColor: lumpsumEnabled ? COLORS.blue : COLORS.border,
            transition: 'background-color 0.2s',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 3,
              left: lumpsumEnabled ? 23 : 3,
              width: 18,
              height: 18,
              borderRadius: '50%',
              backgroundColor: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </button>
      </div>

      <AnimatePresence>
        {lumpsumEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: COLORS.grey }}>₹</span>
              <input
                type="text"
                inputMode="numeric"
                value={lumpsumAmount}
                onChange={(e) => onAmountChange(e.target.value)}
                aria-label="Lumpsum investment amount in rupees"
                style={{
                  border: `1.5px solid ${COLORS.border}`,
                  borderRadius: 10,
                  padding: '10px 12px',
                  fontSize: 15,
                  color: COLORS.text,
                  backgroundColor: COLORS.card,
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}