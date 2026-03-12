import { COLORS } from '../../lib/constants';
import { formatCurrency, formatLakh } from '../../lib/utils';
import Tooltip from '../shared/Tooltip';

export default function GoalRealityIndicator({ results, goalType }) {
  if (!results || !results.sip) return null;

  // Monthly capacity assumptions based on typical rules of thumb (20% of income = SIP).
  // E.g., rule: if SIP > 1L, they need income > 5L/mo.
  // We'll create a generic scale out of 100 for the indicator bar.
  
  // Safe limit: let's assume a generic safe limit is SIP < 50,000 for standard goals, 
  // or SIP < 20% of 1Cr/year (1.6L/mo).
  
  // Let's make an active visual range based on cost vs SIP.
  // The 'reality' indicator shows how aggressive the savings rate must be.
  const isHighBurden = results.sip > 100000;
  const isExtremeBurden = results.sip > 300000;
  
  // Calculate a visual score 0 to 100
  // 0 = extremely easy, 100 = impossible
  let score = (results.sip / 200000) * 100; 
  score = Math.min(Math.max(score, 5), 95); // clamp for visual padding

  let statusText = "🟢 Achievable";
  let statusColor = COLORS.green;
  let statusMsg = "This monthly target is reasonable for most middle-to-high income professionals.";

  if (isExtremeBurden) {
    statusText = "🔴 Difficult goal";
    statusColor = COLORS.red;
    statusMsg = "This SIP is very high. Consider extending your timeline or reducing the goal cost.";
  } else if (isHighBurden) {
    statusText = "🟡 Slight stretch";
    statusColor = COLORS.amber;
    statusMsg = "You'll need significant surplus income. Review your current monthly savings capacity.";
  }

  return (
    <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 tracking-wide uppercase">🎯 Confidence Meter</h3>
        <Tooltip content="Indicates how realistic this monthly SIP stands relative to standard income brackets.">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.grey} strokeWidth="2" className="cursor-help">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
        </Tooltip>
      </div>

      <div className="flex items-center justify-between mt-4 mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Reality check
        </span>
        <span className="text-[12px] text-gray-800 font-bold bg-gray-100 px-3 py-1 rounded-full ring-1 ring-gray-200">
          {Math.round(100 - score)}% confident
        </span>
      </div>

      <div className="relative mb-2 h-4 w-full rounded-full bg-gray-100 overflow-hidden">
        {/* Gradients to show zones */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(to right, ${COLORS.green}33 0%, ${COLORS.amber}33 50%, ${COLORS.red}33 90%)`,
        }}/>
        <div className="absolute inset-0" style={{
          background: `linear-gradient(to right, ${COLORS.green}88 0%, ${COLORS.amber}88 50%, ${COLORS.red}88 90%)`,
          maskImage: `linear-gradient(to right, black ${score - 5}%, transparent ${score}%)`,
          WebkitMaskImage: `linear-gradient(to right, black ${score - 5}%, transparent ${score}%)`,
        }}/>
        
        {/* The active marker line */}
        <div 
          className="absolute top-0 bottom-0 w-2 rounded-full bg-gray-900 shadow-sm transition-all duration-500 ease-out"
          style={{ left: `${score}%`, transform: 'translateX(-50%)' }}
        />
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-lg bg-gray-50 p-3">
        <div className="mt-0.5" style={{ color: statusColor }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {isExtremeBurden ? (
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            ) : isHighBurden ? (
              <circle cx="12" cy="12" r="10" />
            ) : (
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            )}
            {!isExtremeBurden && <path d="M22 4L12 14.01l-3-3" />}
          </svg>
        </div>
        <div>
          <div className="text-base font-extrabold text-gray-900">{statusText}</div>
          <div className="text-xs leading-relaxed text-gray-600 mt-1.5">{statusMsg}</div>
        </div>
      </div>
      
      <div className="mt-4 text-[10px] font-medium text-gray-400 text-right uppercase tracking-wider">
        Based on assumed income band
      </div>
    </div>
  );
}
