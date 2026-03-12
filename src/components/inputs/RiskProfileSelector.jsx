import { useState } from 'react';
import { RISK_PROFILES, COLORS } from '@/lib/constants';
import Tooltip from '@/components/shared/Tooltip';

export default function RiskProfileSelector({
  profile: currentProfile,
  locked,
  onChange,
  stacked = false,
}) {
  const [conflictField, setConflictField] = useState(null);

  const handleClick = (profile) => {
    if (locked) {
      setConflictField(profile.id);
      setTimeout(() => setConflictField(null), 2000);
      return;
    }
    onChange(profile.id);
  };

  const getProfileDetails = (id) => {
    if (id == 'safe') return { dot: '#22c55e', returns: '6 - 8% p.a.' };
    if (id == 'balanced') return { dot: '#f59e0b', returns: '9 - 11% p.a.' };
    if (id == 'growth') return { dot: '#ef4444', returns: '11 - 13% p.a.' };
    return { dot: '#e2e6ed', returns: '' };
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium" style={{ color: COLORS.text }}>
        Risk Profile
      </span>
      <div className={`${stacked ? 'flex flex-col' : 'flex flex-row'} gap-2`}>
        {RISK_PROFILES.map((profile) => {
          const isSelected = currentProfile === profile.id;
          const isConflict = conflictField === profile.id;
          const details = getProfileDetails(profile.id);

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
                className="flex flex-col items-center justify-center text-center p-4 rounded-[16px] border transition-all duration-200 focus:outline-none w-full flex-1 min-w-0 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(34,76,135,0.1)]"
                style={{
                  border: `${isSelected ? 2 : 1}px solid ${isConflict ? COLORS.amber : isSelected ? COLORS.blue : '#e2e6ed'}`,
                  background: isSelected ? '#e8eef7' : '#ffffff',
                  outline: 'none',
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span
                    aria-hidden="true"
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: details.dot,
                    }}
                  />
                  <span
                    className="font-semibold"
                    style={{ color: isConflict ? COLORS.amber : COLORS.text }}
                  >
                    {isConflict ? 'Locked' : profile.label}
                  </span>
                </div>
                {!isConflict && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: '4px 8px',
                      borderRadius: 999,
                      background: '#e8eef7',
                      color: '#224c87',
                      fontSize: 10,
                      fontWeight: 600,
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                  >
                    {details.returns}
                  </div>
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>
      {currentProfile === 'custom' && (
        <p className="text-xs mt-1" style={{ color: COLORS.grey }}>
          Custom return selected — no baseline profile highlighted.
        </p>
      )}
    </div>
  );
}
