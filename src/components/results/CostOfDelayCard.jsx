import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { calculateDelay } from '../../engine/delay';
import { COLORS, ANIMATION } from '../../lib/constants';
import { formatCurrency, formatLakh } from '../../lib/utils';

export default function CostOfDelayCard({ cost, inflation, annualRet, yrs }) {
  const [expanded, setExpanded] = useState(false);

  // If time is too short or cost invalid, return null
  if (!cost || yrs < 2 || !annualRet) return null;

  const delays = calculateDelay({
    presentCost: cost,
    inflation,
    annualReturn: annualRet,
    years: yrs,
  }).filter((d) => d.newSIP > 0);

  if (delays.length === 0) return null;

  const topDelay = delays[0];

  return (
    <div className="mb-4 rounded-[16px] border border-[#fde68a] bg-white p-6 shadow-[0_8px_32px_rgba(34,76,135,0.12)] hover:-translate-y-[2px] transition-all duration-200" style={{ borderLeft: '4px solid #f59e0b' }}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏰</span>
          <h3 className="text-[13px] font-bold text-red-600 uppercase tracking-wide">
            Cost of Delay
          </h3>
        </div>
        
        <p className="text-lg font-montserrat text-gray-800 leading-snug">
          If you delay by <span className="font-extrabold">1 year</span>, you must invest <br className="hidden sm:block" />
          <span className="font-black text-[#da3832] text-2xl sm:text-[32px] mt-2 inline-block">{formatLakh(topDelay.extraSIP)} more</span> <span className="text-base font-semibold text-red-500">/ month.</span>
        </p>
      </div>

      {delays.length > 1 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between text-xs font-medium text-gray-500 hover:text-gray-800"
          >
            {expanded ? 'Hide other delays' : 'See impact of waiting longer'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                {delays.slice(1).map((d, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md bg-gray-50 p-2 text-sm">
                    <span className="font-medium text-gray-600">Wait {d.delayYears} {d.delayYears === 1 ? 'Year' : 'Years'}</span>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatLakh(d.newSIP)}/mo</div>
                      <div className="text-xs text-gray-500">+{Math.round((d.extraSIP / (d.newSIP - d.extraSIP)) * 100)}% jump</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
