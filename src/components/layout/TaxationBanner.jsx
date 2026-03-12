import { COLORS } from '../../lib/constants';

export default function TaxationBanner() {
  return (
    <div className="mx-auto mt-6 max-w-2xl rounded-[12px] border border-[#ffe082] bg-[#fff8e1] px-4 py-3 text-center text-[13px] text-gray-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
        <span>⚠️</span>
        <span className="font-bold text-[#b45309]">Pre-tax estimation:</span>
        <span className="font-medium text-[#b45309]">
          Calculations do not account for Long Term Capital Gains (LTCG).
        </span>
      </div>
    </div>
  );
}
