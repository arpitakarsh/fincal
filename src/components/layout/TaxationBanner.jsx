import { useState } from 'react';

export default function TaxationBanner({ onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    window.setTimeout(() => onClose?.(), 300);
  };

  return (
    <div
      className="mx-auto max-w-2xl rounded-[12px] border border-[#ffe082] bg-[#fff8e1] text-center text-[13px] text-gray-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
      style={{
        padding: isClosing ? '0 16px' : '8px 16px',
        marginTop: 0,
        opacity: isClosing ? 0 : 1,
        transform: isClosing ? 'translateY(-8px)' : 'translateY(0)',
        maxHeight: isClosing ? 0 : 120,
        overflow: 'hidden',
        transition: 'opacity 300ms ease, transform 300ms ease, max-height 300ms ease, padding 300ms ease',
      }}
    >
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <span>!</span>
          <span className="font-bold text-[#b45309]">Pre-tax estimation:</span>
          <span className="font-medium text-[#b45309]">
            Calculations do not account for Long Term Capital Gains (LTCG).
          </span>
        </div>
        <button
          onClick={handleClose}
          aria-label="Dismiss taxation banner"
          className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#ffe082] text-[#b45309] transition hover:bg-[#ffe082]"
        >
          x
        </button>
      </div>
    </div>
  );
}
