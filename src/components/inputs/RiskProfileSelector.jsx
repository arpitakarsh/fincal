import { useState } from 'react';
import { RISK_PROFILES, COLORS } from '@/lib/constants';
import Tooltip from '@/components/shared/Tooltip';

export default function RiskProfileSelector({
  riskProfile,
  assumptionLocks,
  onProfileChange,
}) {
  const [conflictField, setConflictField] = useState(null);

  const handleClick = (profile) => {
    if (assumptionLocks?.annualReturn) {
      setConflictField(profile.id);
      setTimeout(() => setConflictField(null), 2000);
      return;
    }
    onProfileChange(profile.id);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium" style={{ color: COLORS.text }}>
        Risk Profile
      </span>
      <div className="flex gap-2">
        {RISK_PROFILES.map((profile) => {
          const isSelected = riskProfile === profile.id;
          const isConflict = conflictField === profile.id;

          return (
            <Tooltip
              key={profile.id}
              content={
                isConflict
                  ? 'Return is locked. Unlock it to change the risk profile.'
                  : `${profile.label} — ${profile.return}% expected return`
              }
            >
              <button
                onClick={() => handleClick(profile)}
                aria-label={`Select ${profile.label} risk profile`}
                aria-pressed={isSelected}
                className="flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none min-h-[44px]"
                style={{
                  backgroundColor: isSelected ? COLORS.blue : COLORS.card,
                  color: isSelected ? '#ffffff' : COLORS.text,
                  border: `1.5px solid ${isConflict ? COLORS.amber : isSelected ? COLORS.blue : COLORS.border}`,
                  boxShadow: isSelected
                    ? '0 2px 8px rgba(34,76,135,0.15)'
                    : isConflict
                    ? `0 0 0 2px ${COLORS.amber}`
                    : 'none',
                  outline: 'none',
                }}
              >
                {isConflict ? '🔒' : profile.label}
              </button>
            </Tooltip>
          );
        })}
      </div>
      {riskProfile === 'custom' && (
        <p className="text-xs" style={{ color: COLORS.grey }}>
          Custom return selected — no profile highlighted.
        </p>
      )}
    </div>
  );
}