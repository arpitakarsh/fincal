import { useState } from 'react';

export default function AssumptionTransparency() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[#919090] rounded-xl overflow-hidden mt-6 bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#224c87]"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-700">How we calculated this (Formulas)</span>
        <span 
          className={`text-gray-500 text-[10px] transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        >
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div className="p-5 border-t border-[#919090] text-sm text-gray-600 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">1. Future Value (Inflated Cost)</h4>
            <div className="bg-gray-50 p-3 rounded font-mono text-xs text-gray-800">
              FV = Present Cost × (1 + Inflation Rate/100) ^ Years
            </div>
            <p className="mt-1 text-xs">Calculates how much your goal will cost in the future due to inflation.</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-1">2. Monthly SIP Required</h4>
            <div className="bg-gray-50 p-3 rounded font-mono text-xs text-gray-800 overflow-x-auto">
              PMT = (FV × r) / (((1 + r) ^ n - 1) × (1 + r))
            </div>
            <p className="mt-1 text-xs">
              Where <strong className="font-mono">r</strong> = (Annual Return/100)/12, and <strong className="font-mono">n</strong> = Years × 12.<br/>
              Assumes investments are made at the beginning of each month.
            </p>
          </div>
          
          <p className="text-xs text-gray-500 italic mt-4">
            Note: All formulas are standard financial industry calculations. Taxes, exit loads, and market volatility are not factored into these illustrative numbers.
          </p>
        </div>
      )}
    </div>
  );
}
