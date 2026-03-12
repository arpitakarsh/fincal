import AssumptionLock from '@/components/shared/AssumptionLock';
import ErrorMessage from '@/components/shared/ErrorMessage';
import AmberWarning from '@/components/shared/AmberWarning';
import { COLORS } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';

export default function GoalInputForm({
  presentCost,
  years,
  inflation,
  assumptionLocks,
  hardErrors,
  softWarnings,
  onPresentCostChange,
  onYearsChange,
  onInflationChange,
  onLockToggle,
}) {
  const getError = (field) => hardErrors?.find((e) => e.field === field)?.message;
  const getWarning = (field) => softWarnings?.find((w) => w.field === field)?.message;

  const inputBase = {
    border: `1px solid #e2e6ed`,
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    outline: 'none',
    width: '100%',
    transition: 'all 0.2s',
  };

  const errorStyle = { borderColor: COLORS.red, backgroundColor: '#fff0f0' };
  const focusStyle = { borderColor: '#224c87', backgroundColor: '#ffffff', boxShadow: `0 0 0 3px rgba(34,76,135,0.1)` };

  const parsedCost = parseFloat(presentCost) || 0;
  const parsedYrs = parseFloat(years) || 0;
  const parsedInf = parseFloat(inflation) || 0;
  const inflatedCost = parsedCost * Math.pow(1 + parsedInf / 100, parsedYrs);

  return (
    <div className="flex flex-col gap-5">

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label htmlFor="presentCost" className="text-sm font-medium" style={{ color: COLORS.text }}>
            How much does it cost today?
          </label>
          <AnimatePresence mode="wait">
            {inflatedCost > 0 && parsedYrs > 0 && parsedInf > 0 && (
              <motion.div
                key={inflatedCost}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-xs font-semibold px-2 py-1 rounded bg-[#f1f5f9] text-[#64748b] flex gap-1 items-center"
              >
                <span>Cost in {parsedYrs} yrs:</span>
                <span className="text-[#334155]">
                  ₹<CountUp end={inflatedCost} duration={0.8} separator="," decimals={0} />
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: COLORS.grey }}>₹</span>
          <input
            id="presentCost"
            type="text"
            inputMode="numeric"
            value={presentCost}
            onChange={(e) => onPresentCostChange(e.target.value)}
            aria-label="Present cost of goal in rupees"
            aria-invalid={!!getError('presentCost')}
            onFocus={(e) => Object.assign(e.target.style, getError('presentCost') ? errorStyle : focusStyle)}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = getError('presentCost') ? COLORS.red : COLORS.border;
            }}
            style={{ ...inputBase, ...(getError('presentCost') ? errorStyle : {}) }}
          />
        </div>
        {getError('presentCost') && <ErrorMessage message={getError('presentCost')} />}
        {!getError('presentCost') && getWarning('presentCost') && (
          <AmberWarning message={getWarning('presentCost')} />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="years" className="text-sm font-medium" style={{ color: COLORS.text }}>
          When do you need the money?
        </label>
        <div className="flex items-center gap-2">
          <input
            id="years"
            type="text"
            inputMode="numeric"
            value={years}
            onChange={(e) => onYearsChange(e.target.value)}
            aria-label="Investment time horizon in years"
            aria-invalid={!!getError('years')}
            onFocus={(e) => Object.assign(e.target.style, getError('years') ? errorStyle : focusStyle)}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = getError('years') ? COLORS.red : COLORS.border;
            }}
            style={{ ...inputBase, ...(getError('years') ? errorStyle : {}) }}
          />
          <span className="text-sm" style={{ color: COLORS.grey }}>yrs</span>
        </div>
        {getError('years') && <ErrorMessage message={getError('years')} />}
        {!getError('years') && getWarning('years') && (
          <AmberWarning message={getWarning('years')} />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label htmlFor="inflation" className="text-sm font-medium" style={{ color: COLORS.text }}>
            Expected Rise in Prices (Inflation)
          </label>
          <AssumptionLock
            locked={assumptionLocks?.inflation}
            onToggle={() => onLockToggle('inflation')}
            field="inflation"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="inflation"
            type="text"
            inputMode="numeric"
            value={inflation}
            onChange={(e) => onInflationChange(e.target.value)}
            disabled={assumptionLocks?.inflation}
            aria-label="Expected inflation rate percentage"
            aria-invalid={!!getError('inflation')}
            onFocus={(e) => {
              if (!assumptionLocks?.inflation) Object.assign(e.target.style, getError('inflation') ? errorStyle : focusStyle);
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = getError('inflation') ? COLORS.red : COLORS.border;
            }}
            style={{
              ...inputBase,
              ...(getError('inflation') ? errorStyle : {}),
              ...(assumptionLocks?.inflation ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
            }}
          />
          <span className="text-sm" style={{ color: COLORS.grey }}>%</span>
        </div>
        {getError('inflation') && <ErrorMessage message={getError('inflation')} />}
        {!getError('inflation') && getWarning('inflation') && (
          <AmberWarning message={getWarning('inflation')} />
        )}
        
        {/* Arpit — Added context for UX Hackathon Issue 3 */}
        {!getError('inflation') && !getWarning('inflation') && parseFloat(inflation) >= 5 && parseFloat(inflation) <= 8 && (
          <div className="mt-1 flex items-start gap-2 rounded bg-blue-50 px-3 py-2 text-xs text-blue-800 border border-blue-100">
            <span>ℹ️</span>
            <span>Typical long-term inflation in India is 5-7%. Default rates vary by goal (e.g., Education is usually higher).</span>
          </div>
        )}
      </div>

    </div>
  );
}