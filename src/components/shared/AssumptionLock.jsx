import Tooltip from './Tooltip';
import { COLORS } from '../../lib/constants';

export default function AssumptionLock({ locked, onToggle, label = 'Assumption' }) {
  const safeLabel = label || 'Assumption';
  const tooltipContent = locked 
    ? `${safeLabel} is locked. It will not be overridden by goal or profile changes.` 
    : `Lock this ${safeLabel.toLowerCase()} to prevent it from changing automatically.`;

  return (
    <Tooltip content={tooltipContent}>
      <button
        onClick={onToggle}
        className="flex shrink-0 items-center justify-center rounded-md p-1.5 transition-colors hover:bg-gray-100"
        aria-label={locked ? `Unlock ${label}` : `Lock ${label}`}
      >
        <svg 
          width="16" height="16" viewBox="0 0 24 24" 
          fill="none" 
          stroke={locked ? COLORS.amber : COLORS.grey} 
          strokeWidth="2" 
          strokeLinecap="round" strokeLinejoin="round"
        >
          {locked ? (
            <>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </>
          ) : (
            <>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </>
          )}
        </svg>
      </button>
    </Tooltip>
  );
}
