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
        className="flex shrink-0 items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold transition-colors"
        aria-label={locked ? `Unlock ${label}` : `Lock ${label}`}
        style={{
          background: locked ? '#fef3c7' : '#eef2ff',
          color: locked ? COLORS.amber : '#224c87',
          border: locked ? '1px solid #f59e0b' : '1px solid #c7d4f0',
        }}
      >
        {locked ? 'Locked' : 'Unlock'}
      </button>
    </Tooltip>
  );
}
