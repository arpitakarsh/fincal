import AssumptionLock from '@/components/shared/AssumptionLock';
import ErrorMessage from '@/components/shared/ErrorMessage';
import AmberWarning from '@/components/shared/AmberWarning';
import { COLORS } from '@/lib/constants';

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
    border: `1.5px solid ${COLORS.border}`,
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.card,
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s',
  };

  const errorStyle = { borderColor: COLORS.red };

  return (
    <div className="flex flex-col gap-5">

      <div className="flex flex-col gap-1">
        <label htmlFor="presentCost" className="text-sm font-medium" style={{ color: COLORS.text }}>
          Present Cost
        </label>
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
          Time Horizon
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
            Inflation Rate
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
      </div>

    </div>
  );
}