import { useState } from 'react';
import { RISK_PROFILES, COLORS } from '@/lib/constants';
import Tooltip from '@/components/shared/Tooltip';

export default function RiskProfileSelector({
  profile: currentProfile,
  locked,
  onChange,
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
    if (id === 'safe') return { icon: '🟢', returns: '6-8% p.a.', desc1: 'Lower return', desc2: 'Lower volatility' };
    if (id === 'balanced') return { icon: '🟡', returns: '9-11% p.a.', desc1: 'Balanced growth', desc2: 'Moderate risk' };
    if (id === 'growth') return { icon: '🔴', returns: '11-13% p.a.', desc1: 'Higher return assumption', desc2: 'Higher volatility' };
    return { icon: '', returns: '', desc1: '', desc2: '' };
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium" style={{ color: COLORS.text }}>
        Risk Profile
      </span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                className={`flex flex-col items-start p-5 rounded-[16px] border transition-all duration-200 focus:outline-none w-full text-left hover:-translate-y-[2px] ${isSelected ? 'bg-blue-50/50' : 'bg-slate-50 hover:bg-white'}`}
                style={{
                  border: `1px solid ${isConflict ? COLORS.amber : isSelected ? COLORS.blue : '#e2e6ed'}`,
                  boxShadow: isSelected
                    ? '0 4px 20px rgba(34,76,135,0.1)'
                    : isConflict
                    ? `0 0 0 2px ${COLORS.amber}`
                    : '0 1px 2px rgba(0,0,0,0.02)',
                  outline: 'none',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{details.icon}</span>
                  <span className="font-semibold text-gray-900">
                    {isConflict ? '🔒 Locked' : profile.label}
                  </span>
                </div>
                {!isConflict && (
                  <div className="text-[11px] font-bold text-[#224c87] bg-blue-50 px-2 py-0.5 rounded ml-8 mb-2">
                    {details.returns}
                  </div>
                )}
                <div className="flex flex-col gap-1 text-[11px] ml-8" style={{ color: COLORS.grey }}>
                  <span className="flex items-center gap-1"><span>•</span> {details.desc1}</span>
                  <span className="flex items-center gap-1"><span>•</span> {details.desc2}</span>
                </div>
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